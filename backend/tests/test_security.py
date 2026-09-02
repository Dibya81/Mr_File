import pytest
import os
import tempfile
from app.core.security import hash_password, verify_password, create_access_token, decode_token


class TestPasswordHashing:
    def test_hash_password(self):
        hashed = hash_password("testpassword")
        assert hashed != "testpassword"
        assert len(hashed) > 0

    def test_verify_correct_password(self):
        hashed = hash_password("mypassword")
        assert verify_password("mypassword", hashed) is True

    def test_verify_incorrect_password(self):
        hashed = hash_password("mypassword")
        assert verify_password("wrongpassword", hashed) is False

    def test_different_hashes(self):
        h1 = hash_password("samepassword")
        h2 = hash_password("samepassword")
        assert h1 != h2


class TestJWT:
    def test_create_and_decode_token(self):
        token = create_access_token("user-123", "user")
        decoded = decode_token(token)
        assert decoded is not None
        assert decoded["sub"] == "user-123"
        assert decoded["role"] == "user"

    def test_decode_invalid_token(self):
        decoded = decode_token("invalid.token.here")
        assert decoded is None

    def test_admin_role_in_token(self):
        token = create_access_token("admin-123", "admin")
        decoded = decode_token(token)
        assert decoded["role"] == "admin"
