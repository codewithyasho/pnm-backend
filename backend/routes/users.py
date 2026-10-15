from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from src.database import get_session
from src.auth import verify_api_key
from models.user import UserTable, UserRequestModel, UserResponseModel, ListUsers


router = APIRouter(prefix="/users", tags=["Admin Dashboard"])


@router.post(
    "/",
    response_model=UserResponseModel,
    tags=["User Form Submission"]
)
def submit_form(
    user_data: UserRequestModel,
    session: Session = Depends(get_session)
):

    new_user = UserTable.model_validate(user_data)

    session.add(new_user)
    session.commit()
    session.add(new_user)

    return {
        "message": f"""Thank you, {new_user.full_name}! Your request for '{new_user.primary_interest}' has been received. Our HR Advisory specialist will contact you shortly."""
    }


# list all users
@router.get(
    "/",
    response_model=ListUsers,
    description="List all users.",
    response_description="Returns a list of all users.",
)
def list_users(session: Session = Depends(get_session), admin_key: str = Depends(verify_api_key)):
    users = session.exec(select(UserTable)).all()
    return {
        "status": "success",
        "count": len(users),
        "users": users
    }
