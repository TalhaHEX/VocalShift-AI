from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from src.database import get_db
from sqlalchemy import select
from sqlalchemy.orm import Session
from src import models
import jwt

router = APIRouter()
SECRET_KEY = "TALHA_ZUNAIR_SECRET_KEY"

security = HTTPBearer()


class UserSchema(BaseModel):
    username: str
    password: str

@router.post("/register")
def register(user: UserSchema,db:Session=Depends(get_db)):
    query = select(models.User).where(models.User.username == user.username)
    existing_user = db.scalar(query)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    new_user = models.User(username=user.username,password=user.password)
    db.add(new_user)
    db.commit()
    return {"message": "User successfully created"}

@router.post("/login")
def login(user: UserSchema,db:Session = Depends(get_db)):
    query = select(models.User).where(models.User.username==user.username)
    db_user = db.scalar(query)
    if not db_user or db_user.password != user.password:
        raise HTTPException(status_code=400, detail="Invalid username or password")

    token = jwt.encode(
        {"username": db_user.username},
        SECRET_KEY,
        algorithm="HS256"
    )
    return {
        "access_token": token,
        "token_type": "bearer"
    }

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return data["username"]
    except Exception:
        raise HTTPException(status_code=401, detail="Token is invalid or expired")

@router.get("/profile")
def profile(current_user: str = Depends(get_current_user)):
    return {"message": f"Welcome {current_user}! You are successfully authenticated."}
