from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic

# auth usa el modelo Usuario directamente (no tiene Unit of Work propio) y
# admite lanzar HTTPException desde el Service, como el proyecto de
# seguridad de la materia del que parte este módulo (ver notas del PDF).


class AuthService:
    def __init__(self, session: Session):
        self.session = session

    def registrar(self, datos: UserCreate) -> UserPublic:
        existe_username = self.session.exec(
            select(Usuario).where(Usuario.username == datos.username)
        ).first()
        existe_email = self.session.exec(select(Usuario).where(Usuario.email == datos.email)).first()
        if existe_username is not None or existe_email is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El username o el email ya están registrados",
            )

        usuario = Usuario(
            username=datos.username,
            full_name=datos.full_name,
            email=datos.email,
            hashed_password=hash_password(datos.password),
            role="user",
        )
        self.session.add(usuario)
        self.session.commit()
        self.session.refresh(usuario)
        return UserPublic.model_validate(usuario)

    def autenticar(self, username: str, password: str) -> str:
        """Verifica credenciales y devuelve el JWT a guardar en la cookie."""
        usuario = self.session.exec(select(Usuario).where(Usuario.username == username)).first()
        if usuario is None or not verify_password(password, usuario.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales incorrectas")
        if usuario.disabled:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cuenta de usuario desactivada")
        return create_access_token(subject=usuario.username)
