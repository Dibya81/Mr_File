from pydantic import BaseModel, EmailStr, Field
from typing import Optional
import re


class UserSignup(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    username: str = Field(..., min_length=3, max_length=30)
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str = Field(..., min_length=8, max_length=128)

    def validate_username_chars(self) -> bool:
        return bool(re.match(r"^[a-zA-Z0-9_-]+$", self.username))

    def validate_username_not_equals_name(self) -> bool:
        return self.username.lower() != self.name.lower()


class UserLogin(BaseModel):
    identifier: str = Field(..., description="Email or username")
    password: str = Field(..., min_length=1)


class UserResponse(BaseModel):
    id: str
    username: str
    name: str
    email: str
    role: str
    created_at: str
    updated_at: str


class UsernameCheck(BaseModel):
    username: str
