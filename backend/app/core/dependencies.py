from fastapi import Depends, HTTPException, status, Request
from app.core.security import get_current_user


async def get_current_user_id(request: Request) -> dict:
    user = await get_current_user(request)
    if not user.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    return user


async def require_admin(request: Request) -> dict:
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user
