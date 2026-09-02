from app.database.supabase_client import get_supabase
from app.core.security import hash_password, verify_password, create_access_token
from app.core.exceptions import ConflictError, UnauthorizedError, NotFoundError, ValidationError
import re
import uuid
from datetime import datetime, timezone


class UserObj:
    """Lightweight user object mirroring the SQLAlchemy User model interface."""
    def __init__(self, data: dict):
        self.id = uuid.UUID(data["id"]) if isinstance(data["id"], str) else data["id"]
        self.username = data["username"]
        self.name = data["name"]
        self.email = data["email"]
        self.password_hash = data["password_hash"]
        self.role = data["role"]
        raw_ts = data.get("created_at", "")
        if raw_ts:
            self.created_at = datetime.fromisoformat(raw_ts.replace("Z", "+00:00"))
        else:
            self.created_at = datetime.now(timezone.utc)


class AuthService:
    def __init__(self, db=None):
        # db param kept for backwards compat with route signatures
        self.sb = get_supabase()

    def signup(self, name: str, username: str, email: str, password: str, confirm_password: str) -> dict:
        if password != confirm_password:
            raise ValidationError("Passwords do not match")

        if not re.match(r"^[a-zA-Z0-9_-]+$", username):
            raise ValidationError("Username can only contain letters, numbers, underscores, and hyphens")

        # Check for existing username or email
        existing = self.sb.table("users").select("id,username,email").or_(
            f"username.ilike.{username},email.ilike.{email}"
        ).execute()

        if existing.data:
            for u in existing.data:
                if u["username"].lower() == username.lower():
                    raise ConflictError("Username already taken")
            raise ConflictError("Email already registered")

        new_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        result = self.sb.table("users").insert({
            "id": new_id,
            "username": username,
            "name": name,
            "email": email.lower(),
            "password_hash": hash_password(password),
            "role": "user",
            "created_at": now,
            "updated_at": now,
        }).execute()

        if not result.data:
            raise Exception("Failed to create user")

        user = UserObj(result.data[0])
        token = create_access_token(str(user.id), user.role)
        return {"token": token, "user": user}

    def login(self, identifier: str, password: str) -> dict:
        result = self.sb.table("users").select("*").or_(
            f"username.ilike.{identifier},email.ilike.{identifier}"
        ).execute()

        if not result.data:
            raise UnauthorizedError("Invalid credentials")

        user_data = result.data[0]
        if not verify_password(password, user_data["password_hash"]):
            raise UnauthorizedError("Invalid credentials")

        user = UserObj(user_data)
        token = create_access_token(str(user.id), user.role)
        return {"token": token, "user": user}

    def get_user_by_id(self, user_id: str) -> UserObj:
        result = self.sb.table("users").select("*").eq("id", user_id).execute()
        if not result.data:
            raise NotFoundError("User")
        return UserObj(result.data[0])

    def check_username_availability(self, username: str) -> dict:
        result = self.sb.table("users").select("id").ilike("username", username).execute()
        return {"available": len(result.data) == 0, "username": username}
