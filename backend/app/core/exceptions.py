from fastapi import HTTPException, status


class AppException(HTTPException):
    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        super().__init__(status_code=status_code, detail=message)


class NotFoundError(AppException):
    def __init__(self, resource: str = "Resource"):
        super().__init__(
            code="NOT_FOUND",
            message=f"{resource} not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )


class UnauthorizedError(AppException):
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(
            code="UNAUTHORIZED",
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


class ForbiddenError(AppException):
    def __init__(self, message: str = "Forbidden"):
        super().__init__(
            code="FORBIDDEN",
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
        )


class ConflictError(AppException):
    def __init__(self, message: str = "Resource already exists"):
        super().__init__(
            code="CONFLICT",
            message=message,
            status_code=status.HTTP_409_CONFLICT,
        )


class ValidationError(AppException):
    def __init__(self, message: str = "Validation failed"):
        super().__init__(
            code="VALIDATION_ERROR",
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )


class FileProcessingError(AppException):
    def __init__(self, message: str = "File processing failed"):
        super().__init__(
            code="PROCESSING_ERROR",
            message=message,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
