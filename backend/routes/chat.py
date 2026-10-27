import os
import asyncio
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from pydantic import ValidationError
from sqlmodel import Session, select, or_
from langgraph.types import Command

from src.database import engine, get_session
from src.auth import verify_api_key, ADMIN_KEY
from src.ws_chat import chat_manager
from src.ai_agent import pnm_support_graph
from models.user import (
    ChatSession,
    ChatMessage,
    IncomingChatPayload,
    SenderRole,
)

chat_router = APIRouter(prefix="/admin", tags=["Live Support Chat"])


def is_thread_interrupted(email: str) -> tuple[bool, str | None]:
    """Checks if the visitor's LangGraph thread is currently paused at an HITL interrupt."""
    try:
        config = {"configurable": {"thread_id": email}}
        state = pnm_support_graph.get_state(config)
        if state and state.next:
            for task in getattr(state, "tasks", []):
                if getattr(task, "interrupts", None):
                    return True, str(task.interrupts[0].value)
            return True, "Would you like to connect with a live PNM Support Admin?"
    except Exception:
        pass
    return False, None


# =====================================================================
# ACTIVE ENDPOINTS (V2: AI Assistant + LangGraph HITL + Live Admin WS)
# =====================================================================

# --- 1. VISITOR REST ENDPOINT: Verify Session & Load Chat History ---
@chat_router.get("/chat/user/history")
def get_user_chat_history(
    email: str = Query(..., description="Visitor's corporate email"),
    name: str = Query(..., description="Visitor's full name"),
    session_token: str = Query(...,
                               description="Visitor's localStorage UUID token"),
    session: Session = Depends(get_session),
):
    email = email.strip().lower()
    chat_sess = session.exec(
        select(ChatSession).where(ChatSession.corporate_email == email)
    ).first()

    if not chat_sess:
        chat_sess = ChatSession(
            corporate_email=email,
            full_name=name.strip(),
            session_token=session_token,
            is_escalated=False,
        )
        session.add(chat_sess)
        session.commit()
        session.refresh(chat_sess)
        print(f"[NEW USER] New user registered: {email}")
    else:
        if chat_sess.session_token != session_token:
            raise HTTPException(
                status_code=403,
                detail="This email is already registered in an active chat session on another device.",
            )

    messages = session.exec(
        select(ChatMessage)
        .where(
            or_(
                ChatMessage.user_email == email,
                ChatMessage.is_broadcast == True,
            )
        )
        .order_by(ChatMessage.created_at.asc())
    ).all()

    has_interrupt, interrupt_prompt = is_thread_interrupted(email)

    return {
        "status": "success",
        "email": chat_sess.corporate_email,
        "full_name": chat_sess.full_name,
        "is_escalated": chat_sess.is_escalated,
        "escalation_reason": chat_sess.escalation_reason,
        "has_pending_interrupt": has_interrupt,
        "interrupt_prompt": interrupt_prompt,
        "messages": messages,
    }


# --- 2. ADMIN REST ENDPOINT: Get All Threads & Messages ---
@chat_router.get("/chat/conversations")
def get_all_conversations(
    session: Session = Depends(get_session),
    admin_key: str = Depends(verify_api_key),
):
    sessions = session.exec(
        select(ChatSession).order_by(ChatSession.last_active_at.desc())
    ).all()
    all_messages = session.exec(
        select(ChatMessage).order_by(ChatMessage.created_at.asc())
    ).all()

    threads = []
    for s in sessions:
        user_msgs = [
            m for m in all_messages
            if m.user_email == s.corporate_email or m.is_broadcast
        ]
        unread_count = sum(
            1 for m in user_msgs
            if m.user_email == s.corporate_email
            and m.sender_role == SenderRole.USER
            and not m.is_read_by_admin
        )
        threads.append({
            "corporate_email": s.corporate_email,
            "full_name": s.full_name,
            "is_online": chat_manager.is_user_online(s.corporate_email),
            "is_escalated": s.is_escalated,
            "escalation_reason": s.escalation_reason,
            "last_active_at": s.last_active_at,
            "unread_count": unread_count,
            "messages": user_msgs,
        })

    return {
        "status": "success",
        "online_users": chat_manager.get_online_users(),
        "threads": threads,
    }


# --- 3. ADMIN REST ENDPOINT: Mark User Thread as Read ---
@chat_router.patch("/chat/read/{email}")
def mark_messages_read(
    email: str,
    session: Session = Depends(get_session),
    admin_key: str = Depends(verify_api_key),
):
    email = email.strip().lower()
    unread_msgs = session.exec(
        select(ChatMessage).where(
            ChatMessage.user_email == email,
            ChatMessage.is_read_by_admin == False,
        )
    ).all()

    for m in unread_msgs:
        m.is_read_by_admin = True
        session.add(m)
    session.commit()

    return {"status": "success", "marked_read": len(unread_msgs)}


# --- 4. ADMIN REST ENDPOINT: Return Escalated User Back to AI Bot ---
@chat_router.patch("/chat/handback/{email}")
async def return_thread_to_ai(
    email: str,
    session: Session = Depends(get_session),
    admin_key: str = Depends(verify_api_key),
):
    email = email.strip().lower()
    chat_sess = session.exec(
        select(ChatSession).where(ChatSession.corporate_email == email)
    ).first()
    if not chat_sess:
        raise HTTPException(status_code=404, detail="Chat session not found.")

    chat_sess.is_escalated = False
    chat_sess.escalation_reason = None
    session.add(chat_sess)

    handback_msg = ChatMessage(
        user_email=email,
        user_name=chat_sess.full_name,
        sender_role=SenderRole.AI,
        message="🤖 The Admin has resolved your support ticket and handed this chat back to the PNM AI Assistant. Feel free to ask me anything else!",
        is_broadcast=False,
        is_read_by_admin=True,
    )
    session.add(handback_msg)
    session.commit()
    session.refresh(handback_msg)
    msg_dict = handback_msg.model_dump(mode="json")

    mode_payload = {
        "event": "session_mode_changed",
        "user_email": email,
        "is_escalated": False,
        "escalation_reason": None,
    }
    msg_payload = {"event": "chat_message", "data": msg_dict}

    await chat_manager.send_to_user(email, mode_payload)
    await chat_manager.send_to_user(email, msg_payload)
    await chat_manager.send_to_admins(mode_payload)
    await chat_manager.send_to_admins(msg_payload)

    return {"status": "success", "message": f"{email} returned to AI Assistant mode."}


# --- 5. VISITOR WEBSOCKET ENDPOINT (AI + HITL + Live Admin Routing) ---
@chat_router.websocket("/ws/user")
async def user_websocket_endpoint(
    websocket: WebSocket,
    email: str = Query(...),
    name: str = Query(...),
    session_token: str = Query(...),
):
    email = email.strip().lower()
    name = name.strip()

    with Session(engine) as db:
        chat_sess = db.exec(
            select(ChatSession).where(ChatSession.corporate_email == email)
        ).first()

        if not chat_sess:
            chat_sess = ChatSession(
                corporate_email=email,
                full_name=name,
                session_token=session_token,
                is_escalated=False,
            )
            db.add(chat_sess)
            db.commit()
        elif chat_sess.session_token != session_token:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

    await chat_manager.connect_user(email, websocket)
    config = {"configurable": {"thread_id": email}}

    try:
        while True:
            raw_data = await websocket.receive_json()

            try:
                valid_msg = IncomingChatPayload.model_validate(raw_data)
            except ValidationError:
                await websocket.send_json({
                    "event": "error",
                    "message": "Invalid message payload.",
                })
                continue

            # CASE A: Visitor clicked [✅ Yes] or [❌ No] on the HITL Confirmation UI
            if valid_msg.hitl_decision:
                decision = valid_msg.hitl_decision.strip().lower()

                try:
                    response = await asyncio.to_thread(
                        pnm_support_graph.invoke,
                        Command(resume=decision),
                        config,
                    )
                except Exception as e:
                    await websocket.send_json({
                        "event": "error",
                        "message": f"AI Resume Error: {e}",
                    })
                    continue

                if decision == "yes":
                    reason = "Requested live human support"
                    for m in reversed(response.get("messages", [])):
                        content_str = str(getattr(m, "content", ""))
                        if "ESCALATED_SUCCESS::" in content_str:
                            reason = content_str.split(
                                "ESCALATED_SUCCESS::", 1)[1].strip()
                            break

                    with Session(engine) as db:
                        sess = db.exec(
                            select(ChatSession).where(
                                ChatSession.corporate_email == email)
                        ).first()
                        if sess:
                            sess.is_escalated = True
                            sess.escalation_reason = reason
                            sess.last_active_at = datetime.now(timezone.utc)
                            db.add(sess)

                        confirm_msg = ChatMessage(
                            user_email=email,
                            user_name=name,
                            sender_role=SenderRole.AI,
                            message="✅ You are now connected to Live Human Support! Our Admin team has been notified and will reply here shortly.",
                            is_broadcast=False,
                            is_read_by_admin=False,
                        )
                        db.add(confirm_msg)
                        db.commit()
                        db.refresh(confirm_msg)
                        msg_dict = confirm_msg.model_dump(mode="json")

                    mode_payload = {
                        "event": "session_mode_changed",
                        "user_email": email,
                        "user_name": name,
                        "is_escalated": True,
                        "escalation_reason": reason,
                    }
                    msg_payload = {"event": "chat_message", "data": msg_dict}

                    await chat_manager.send_to_user(email, mode_payload)
                    await chat_manager.send_to_user(email, msg_payload)
                    await chat_manager.send_to_admins(mode_payload)
                    await chat_manager.send_to_admins(msg_payload)

                else:
                    ai_text = (
                        response["messages"][-1].content
                        if response.get("messages")
                        else "No problem! I'm still here to help. What else would you like to know?"
                    )
                    with Session(engine) as db:
                        cancel_msg = ChatMessage(
                            user_email=email,
                            user_name=name,
                            sender_role=SenderRole.AI,
                            message=str(ai_text),
                            is_broadcast=False,
                            is_read_by_admin=True,
                        )
                        db.add(cancel_msg)
                        db.commit()
                        db.refresh(cancel_msg)
                        msg_dict = cancel_msg.model_dump(mode="json")

                    msg_payload = {"event": "chat_message", "data": msg_dict}
                    await chat_manager.send_to_user(email, msg_payload)
                    await chat_manager.send_to_admins(msg_payload)

                continue

            # CASE B: Normal Text Message from Visitor
            if not valid_msg.message or not valid_msg.message.strip():
                await websocket.send_json({
                    "event": "error",
                    "message": "Message cannot be empty.",
                })
                continue

            user_text = valid_msg.message.strip()

            with Session(engine) as db:
                chat_sess = db.exec(
                    select(ChatSession).where(
                        ChatSession.corporate_email == email)
                ).first()
                is_escalated = chat_sess.is_escalated if chat_sess else False
                if chat_sess:
                    chat_sess.last_active_at = datetime.now(timezone.utc)
                    db.add(chat_sess)

                new_msg = ChatMessage(
                    user_email=email,
                    user_name=name,
                    sender_role=SenderRole.USER,
                    message=user_text,
                    is_broadcast=False,
                    is_read_by_admin=(not is_escalated),
                )
                db.add(new_msg)
                db.commit()
                db.refresh(new_msg)
                user_msg_dict = new_msg.model_dump(mode="json")

            user_event = {"event": "chat_message", "data": user_msg_dict}
            await chat_manager.send_to_user(email, user_event)
            await chat_manager.send_to_admins(user_event)

            # If already escalated to Human Admin -> Stop here! Admin will reply manually.
            if is_escalated:
                continue

            # Otherwise -> Route to LangGraph AI Assistant!
            await chat_manager.send_to_user(email, {"event": "ai_typing", "is_typing": True})

            try:
                has_int, _ = is_thread_interrupted(email)
                if has_int:
                    await asyncio.to_thread(pnm_support_graph.invoke, Command(resume="no"), config)

                response = await asyncio.to_thread(
                    pnm_support_graph.invoke,
                    {"messages": [{"role": "user", "content": user_text}]},
                    config,
                )
            except Exception as e:
                await chat_manager.send_to_user(email, {"event": "ai_typing", "is_typing": False})
                await websocket.send_json({
                    "event": "error",
                    "message": f"AI Assistant temporarily unavailable: {e}",
                })
                continue

            await chat_manager.send_to_user(email, {"event": "ai_typing", "is_typing": False})

            interrupts = response.get("__interrupt__")
            if interrupts:
                interrupt_prompt = str(interrupts[0].value)
                await chat_manager.send_to_user(email, {
                    "event": "hitl_interrupt",
                    "prompt": interrupt_prompt,
                })
                continue

            ai_reply_text = str(response["messages"][-1].content).strip()
            if ai_reply_text:
                with Session(engine) as db:
                    ai_msg = ChatMessage(
                        user_email=email,
                        user_name=name,
                        sender_role=SenderRole.AI,
                        message=ai_reply_text,
                        is_broadcast=False,
                        is_read_by_admin=True,
                    )
                    db.add(ai_msg)
                    db.commit()
                    db.refresh(ai_msg)
                    ai_msg_dict = ai_msg.model_dump(mode="json")

                ai_event = {"event": "chat_message", "data": ai_msg_dict}
                await chat_manager.send_to_user(email, ai_event)
                await chat_manager.send_to_admins(ai_event)

    except WebSocketDisconnect:
        await chat_manager.disconnect_user(email, websocket)


# --- 6. ADMIN WEBSOCKET ENDPOINT ---
@chat_router.websocket("/ws/admin")
async def admin_websocket_endpoint(
    websocket: WebSocket,
    token: str | None = Query(default=None),
):
    header_key = websocket.headers.get("x-api-key")
    key = header_key or token
    if key != ADMIN_KEY:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await chat_manager.connect_admin(websocket)

    try:
        while True:
            raw_data = await websocket.receive_json()

            try:
                valid_msg = IncomingChatPayload.model_validate(raw_data)
            except ValidationError:
                await websocket.send_json({
                    "event": "error",
                    "message": "Invalid message payload.",
                })
                continue

            if not valid_msg.message or not valid_msg.message.strip():
                continue

            target_email = valid_msg.to_email.strip().lower() if valid_msg.to_email else None
            is_broadcast = target_email is None

            target_name = "All Visitors"
            with Session(engine) as db:
                if target_email:
                    sess = db.exec(
                        select(ChatSession).where(
                            ChatSession.corporate_email == target_email)
                    ).first()
                    target_name = sess.full_name if sess else target_email
                    if sess and not sess.is_escalated:
                        sess.is_escalated = True
                        sess.escalation_reason = "Admin initiated live takeover"
                        db.add(sess)

                new_msg = ChatMessage(
                    user_email=target_email if target_email else "ALL",
                    user_name=target_name,
                    sender_role=SenderRole.ADMIN,
                    message=valid_msg.message.strip(),
                    is_broadcast=is_broadcast,
                    is_read_by_admin=True,
                )
                db.add(new_msg)
                db.commit()
                db.refresh(new_msg)
                msg_dict = new_msg.model_dump(mode="json")

            event_payload = {
                "event": "chat_message",
                "data": msg_dict,
            }

            if is_broadcast:
                await chat_manager.broadcast_to_all_users(event_payload)
            else:
                await chat_manager.send_to_user(target_email, event_payload)
                await chat_manager.send_to_user(target_email, {
                    "event": "session_mode_changed",
                    "user_email": target_email,
                    "is_escalated": True,
                    "escalation_reason": "Admin joined the chat",
                })
                await chat_manager.send_to_admins({
                    "event": "session_mode_changed",
                    "user_email": target_email,
                    "is_escalated": True,
                    "escalation_reason": "Admin joined the chat",
                })

            await chat_manager.send_to_admins(event_payload)

    except WebSocketDisconnect:
        chat_manager.disconnect_admin(websocket)


# --- 7. ADMIN REST ENDPOINT: Delete/Clear Entire Visitor Thread & Session ---
@chat_router.delete("/chat/thread/{email}")
def delete_chat_thread(
    email: str,
    session: Session = Depends(get_session),
    admin_key: str = Depends(verify_api_key),
):
    email = email.strip().lower()

    messages = session.exec(
        select(ChatMessage).where(ChatMessage.user_email == email)
    ).all()
    for m in messages:
        session.delete(m)

    chat_sess = session.exec(
        select(ChatSession).where(ChatSession.corporate_email == email)
    ).first()
    if chat_sess:
        session.delete(chat_sess)

    session.commit()

    return {
        "status": "success",
        "message": f"Thread and history for {email} have been completely removed.",
    }


# --- 8. ADMIN REST ENDPOINT: Delete a Specific Broadcast Message ---
@chat_router.delete("/chat/broadcast/{message_id}")
def delete_broadcast_message(
    message_id: int,
    session: Session = Depends(get_session),
    admin_key: str = Depends(verify_api_key),
):
    msg = session.get(ChatMessage, message_id)

    if not msg or not msg.is_broadcast:
        raise HTTPException(
            status_code=404, detail="Broadcast message not found."
        )

    session.delete(msg)
    session.commit()

    return {
        "status": "success",
        "message": f"Broadcast message #{message_id} deleted successfully.",
    }


# =====================================================================
# DEPRECATED V1 ENDPOINTS (Direct WS without AI Layer — Kept for Reference)
# =====================================================================

@chat_router.get("/v1/chat/user/history", deprecated=True)
def get_user_chat_history_v1(
    email: str = Query(..., description="Visitor's corporate email"),
    name: str = Query(..., description="Visitor's full name"),
    session_token: str = Query(...,
                               description="Visitor's localStorage UUID token"),
    session: Session = Depends(get_session),
):
    email = email.strip().lower()
    chat_sess = session.exec(
        select(ChatSession).where(ChatSession.corporate_email == email)
    ).first()

    if not chat_sess:
        chat_sess = ChatSession(
            corporate_email=email,
            full_name=name.strip(),
            session_token=session_token,
        )
        session.add(chat_sess)
        session.commit()
        session.refresh(chat_sess)
        print(f"[NEW USER] New user registered: {email}")
    else:
        if chat_sess.session_token != session_token:
            raise HTTPException(
                status_code=403,
                detail="This email is already registered in an active chat session on another device.",
            )

    messages = session.exec(
        select(ChatMessage)
        .where(
            or_(
                ChatMessage.user_email == email,
                ChatMessage.is_broadcast == True,
            )
        )
        .order_by(ChatMessage.created_at.asc())
    ).all()

    return {
        "status": "success",
        "email": chat_sess.corporate_email,
        "full_name": chat_sess.full_name,
        "messages": messages,
    }


@chat_router.get("/v1/chat/conversations", deprecated=True)
def get_all_conversations_v1(
    session: Session = Depends(get_session),
    admin_key: str = Depends(verify_api_key),
):
    sessions = session.exec(
        select(ChatSession).order_by(ChatSession.last_active_at.desc())
    ).all()
    all_messages = session.exec(
        select(ChatMessage).order_by(ChatMessage.created_at.asc())
    ).all()

    threads = []
    for s in sessions:
        user_msgs = [
            m for m in all_messages
            if m.user_email == s.corporate_email or m.is_broadcast
        ]
        unread_count = sum(
            1 for m in user_msgs
            if m.user_email == s.corporate_email
            and m.sender_role == SenderRole.USER
            and not m.is_read_by_admin
        )
        threads.append({
            "corporate_email": s.corporate_email,
            "full_name": s.full_name,
            "is_online": chat_manager.is_user_online(s.corporate_email),
            "last_active_at": s.last_active_at,
            "unread_count": unread_count,
            "messages": user_msgs,
        })

    return {
        "status": "success",
        "online_users": chat_manager.get_online_users(),
        "threads": threads,
    }


@chat_router.websocket("/v1/ws/user")
async def user_websocket_endpoint_v1(
    websocket: WebSocket,
    email: str = Query(...),
    name: str = Query(...),
    session_token: str = Query(...),
):
    """DEPRECATED V1: Direct user-to-admin WebSocket without LangGraph AI layer."""
    email = email.strip().lower()
    name = name.strip()

    with Session(engine) as db:
        chat_sess = db.exec(
            select(ChatSession).where(ChatSession.corporate_email == email)
        ).first()

        if not chat_sess:
            chat_sess = ChatSession(
                corporate_email=email,
                full_name=name,
                session_token=session_token,
            )
            db.add(chat_sess)
            db.commit()
        elif chat_sess.session_token != session_token:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

    await chat_manager.connect_user(email, websocket)

    try:
        while True:
            raw_data = await websocket.receive_json()

            try:
                valid_msg = IncomingChatPayload.model_validate(raw_data)
            except ValidationError:
                await websocket.send_json({
                    "event": "error",
                    "message": "Message cannot be empty (1-2000 characters).",
                })
                continue

            if not valid_msg.message:
                continue

            with Session(engine) as db:
                new_msg = ChatMessage(
                    user_email=email,
                    user_name=name,
                    sender_role=SenderRole.USER,
                    message=valid_msg.message,
                    is_broadcast=False,
                    is_read_by_admin=False,
                )
                db.add(new_msg)
                db.commit()
                db.refresh(new_msg)
                msg_dict = new_msg.model_dump(mode="json")

            event_payload = {
                "event": "chat_message",
                "data": msg_dict,
            }

            await chat_manager.send_to_user(email, event_payload)
            await chat_manager.send_to_admins(event_payload)

    except WebSocketDisconnect:
        await chat_manager.disconnect_user(email, websocket)
