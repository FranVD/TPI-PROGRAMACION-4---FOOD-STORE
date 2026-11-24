from fastapi import APIRouter, Depends, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session

from app.core.config import settings
from app.core.deps import get_current_active_user, get_session
from app.modules.auth.schemas import MensajeSimple
from app.modules.auth.service import AuthService
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic

router = APIRouter(prefix="/auth", tags=["auth"])

COOKIE_NAME = "access_token"


def get_auth_service(session: Session = Depends(get_session)) -> AuthService:
    return AuthService(session)


@router.post("/register", response_model=UserPublic, status_code=201)
def registrar(datos: UserCreate, service: AuthService = Depends(get_auth_service)) -> UserPublic:
    return service.registrar(datos)


@router.post("/token", response_model=MensajeSimple)
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service),
) -> MensajeSimple:
    token = service.autenticar(form_data.username, form_data.password)
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    return MensajeSimple(message="Login exitoso")


@router.post("/logout", response_model=MensajeSimple)
def logout(response: Response) -> MensajeSimple:
    response.delete_cookie(COOKIE_NAME)
    return MensajeSimple(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def me(usuario: Usuario = Depends(get_current_active_user)) -> UserPublic:
    return UserPublic.model_validate(usuario)
