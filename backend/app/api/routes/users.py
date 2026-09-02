from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user_id
from app.services.auth_service import AuthService
from app.database.connection import get_db
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/check-username")
async def check_username(username: str, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    result = auth_service.check_username_availability(username)
    return {"success": True, "data": result}
