import os
from typing import TypedDict, Annotated, List
from dotenv import load_dotenv

from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph, START
from langgraph.graph.message import add_messages
from langgraph.types import interrupt, Command
from langchain_core.messages import SystemMessage
from langchain_core.tools import tool
from langchain_groq import ChatGroq

load_dotenv()

# Persistent memory per visitor thread_id (their corporate_email!)
memory = MemorySaver()


class SupportAgentState(TypedDict):
    messages: Annotated[List, add_messages]


# ----------------- Tools for the PNM Support Agent ----------------- #

@tool
def get_pnm_services_info(topic: str) -> str:
    """
    Fetches official information about People Network Management LLP (PNM) services,
    including Payroll & Compliance, Recruitment, HR Advisory, and HRMS Technology.

    Args:
        topic (str): The service topic (e.g., 'payroll', 'compliance', 'recruitment', 'hrms', 'pricing', 'contact').
    """
    kb = {
        "payroll": "PNM delivers 99.8% payroll precision across Pan-India with automated tax, payslip, and multi-state workforce management.",
        "compliance": "100% Statutory Compliance with Zero Compliance Penalty (PF, ESIC, PT, LWF, TDS assured) and labour-law audits.",
        "recruitment": "End-to-end Talent Hunt, Leadership Hiring, and Technical Staffing across IT, Manufacturing, BFSI, and Startups.",
        "hrms": "18+ HRMS Cloud Modules covering attendance, leave, onboarding, expense claims, and employee self-service.",
        "contact": "You can reach PNM at +91 (0) 80 4123 4567 or email contact@pnmllp.com. Office operates Pan-India."
    }
    t = topic.lower()
    for key, val in kb.items():
        if key in t:
            return val
    return (
        "PNM (People Network Management LLP) offers 3-in-1 integrated solutions: "
        "1) End-to-End Payroll & Statutory Compliance (PF, ESIC, PT, TDS), "
        "2) Talent Acquisition & Leadership Hiring, and "
        "3) 18+ Cloud HRMS Modules. Contact: contact@pnmllp.com."
    )


@tool
def escalate_to_human_admin(reason: str) -> str:
    """
    Triggers a Human-in-the-Loop escalation to transfer the visitor to a live human Admin.
    Call this tool WHEN:
    1. The user explicitly demands or asks to talk to a real human, admin, support person, or executive.
    2. The user is frustrated, arguing, or dissatisfied with your answers.
    3. The user asks for custom enterprise pricing negotiations or complex legal advice you cannot answer.

    Args:
        reason (str): Brief summary of why the user wants to speak with a human admin.
    """
    # Pause LangGraph execution and ask the user for confirmation via buttons!
    decision = interrupt(
        f"Would you like me to connect you directly with a live PNM Support Admin? (Reason: {reason})"
    )

    if str(decision).strip().lower() == "yes":
        return f"ESCALATED_SUCCESS::{reason}"
    else:
        return "ESCALATION_CANCELLED: The user chose to continue chatting with the AI assistant."


tools = [get_pnm_services_info, escalate_to_human_admin]


GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")
llm = ChatGroq(model=GROQ_MODEL, temperature=0.3).bind_tools(tools=tools)


# ----------------- Agent Node ----------------- #

def support_agent_node(state: SupportAgentState) -> SupportAgentState:
    system_prompt = SystemMessage(content="""
    You are the official AI Support Assistant for People Network Management LLP (PNM) — India's premier HR, Payroll, Statutory Compliance, and People Technology partner.
    
    Rules:
    1. Be warm, concise, and helpful. Use `get_pnm_services_info` when asked about PNM's services, payroll, compliance, HRMS, or contact details.
    2. If the user asks to talk to a human, admin, real person, or support team, OR if the user is frustrated/arguing with you, IMMEDIATELY call the `escalate_to_human_admin` tool!
    3. Keep answers under 3-4 short sentences so they fit nicely in a floating chat widget.
    """)
    response = llm.invoke([system_prompt] + state["messages"])
    return {"messages": [response]}


# ----------------- Graph Building ----------------- #

graph = StateGraph(SupportAgentState)
graph.add_node("agent", support_agent_node)
graph.add_node("tools", ToolNode(tools=tools))

graph.add_edge(START, "agent")
graph.add_conditional_edges("agent", tools_condition)
graph.add_edge("tools", "agent")

pnm_support_graph = graph.compile(checkpointer=memory)
