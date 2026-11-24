from pydantic import BaseModel


class MensajeSimple(BaseModel):
    message: str
