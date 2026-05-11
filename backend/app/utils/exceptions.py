from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class WashGoError(Exception):
    """Base application error."""

    status_code: int = status.HTTP_400_BAD_REQUEST
    code: str = "washgo_error"

    def __init__(self, message: str, *, code: str | None = None) -> None:
        self.message = message
        if code:
            self.code = code
        super().__init__(message)


class NotFoundError(WashGoError):
    status_code = status.HTTP_404_NOT_FOUND
    code = "not_found"


class ConflictError(WashGoError):
    status_code = status.HTTP_409_CONFLICT
    code = "conflict"


class ValidationError(WashGoError):
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    code = "validation_error"


class ForbiddenError(WashGoError):
    status_code = status.HTTP_403_FORBIDDEN
    code = "forbidden"


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(WashGoError)
    async def washgo_error_handler(_: Request, exc: WashGoError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.message, "code": exc.code},
        )

    @app.exception_handler(RequestValidationError)
    async def request_validation_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": exc.errors(), "code": "request_validation_error"},
        )
