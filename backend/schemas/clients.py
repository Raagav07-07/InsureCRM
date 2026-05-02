from pydantic import BaseModel

class ClientCreate(BaseModel):
    name: str
    phone: str = None
    email: str = None
    notes: str = None