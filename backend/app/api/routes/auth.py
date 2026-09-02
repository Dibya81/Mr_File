from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.core.dependencies import get_current_user_id
from app.services.auth_service import AuthService
from app.core.security import set_auth_cookie, clear_auth_cookie
from app.core.exceptions import ValidationError

router = APIRouter()


@router.post("/signup")
async def signup(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    name = body.get("name", "").strip()
    username = body.get("username", "").strip()
    email = body.get("email", "").strip()
    password = body.get("password", "")
    confirm_password = body.get("confirm_password", "")

    if not all([name, username, email, password, confirm_password]):
        raise ValidationError("All fields are required")

    if len(password) < 8:
        raise ValidationError("Password must be at least 8 characters")

    auth_service = AuthService(db)
    result = auth_service.signup(name, username, email, password, confirm_password)

    from fastapi.responses import JSONResponse
    response = JSONResponse(content={
        "success": True,
        "data": {
            "id": str(result["user"].id),
            "username": result["user"].username,
            "name": result["user"].name,
            "email": result["user"].email,
            "role": result["user"].role,
            "created_at": result["user"].created_at.isoformat() if result["user"].created_at else "",
            "token": result["token"],
        },
        "message": "Account created",
    })
    set_auth_cookie(response, result["token"])
    return response


@router.post("/login")
async def login(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    identifier = body.get("identifier", "").strip()
    password = body.get("password", "")

    if not identifier or not password:
        raise ValidationError("Email/username and password are required")

    auth_service = AuthService(db)
    result = auth_service.login(identifier, password)

    from fastapi.responses import JSONResponse
    response = JSONResponse(content={
        "success": True,
        "data": {
            "id": str(result["user"].id),
            "username": result["user"].username,
            "name": result["user"].name,
            "email": result["user"].email,
            "role": result["user"].role,
            "created_at": result["user"].created_at.isoformat() if result["user"].created_at else "",
            "token": result["token"],
        },
        "message": "Logged in",
    })
    set_auth_cookie(response, result["token"])
    return response


@router.post("/logout")
async def logout():
    from fastapi.responses import JSONResponse
    response = JSONResponse(content={"success": True, "message": "Logged out"})
    clear_auth_cookie(response)
    return response


@router.get("/me")
async def get_me(user: dict = Depends(get_current_user_id), db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    user_obj = auth_service.get_user_by_id(user["sub"])

    return {
        "success": True,
        "data": {
            "id": str(user_obj.id),
            "username": user_obj.username,
            "name": user_obj.name,
            "email": user_obj.email,
            "role": user_obj.role,
            "created_at": user_obj.created_at.isoformat() if user_obj.created_at else "",
        },
    }
