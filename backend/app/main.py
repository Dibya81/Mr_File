import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.exceptions import AppException
from app.api.routes import auth, documents, folders, shares, processing, admin, health, users, community

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="DocumentVault API",
    description="Secure Multi-User Document Management & Processing Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.parsed_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message,
            },
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
            },
        },
    )


app.include_router(health.router, tags=["Health"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(folders.router, prefix="/api/folders", tags=["Folders"])
app.include_router(shares.router, prefix="/api", tags=["Sharing"])
app.include_router(processing.router, prefix="/api/documents", tags=["Processing"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(community.router, prefix="/api/community", tags=["Community"])


@app.get("/")
async def root():
    return {"message": "DocumentVault API", "docs": "/docs"}
