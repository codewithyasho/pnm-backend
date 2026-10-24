from pathlib import Path
from dotenv import load_dotenv
from fastapi import Header, HTTPException
import os

env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path, encoding="utf-8")
else:
    try:
        load_dotenv(encoding="utf-8")
    except Exception:
        pass

ADMIN_KEY = os.getenv("ADMIN_KEY", "123")


def verify_api_key(
    x_api_key: str = Header()
):
    if x_api_key != ADMIN_KEY:
        raise HTTPException(
            status_code=401,
            detail="Invalid API Key"
        )

    return x_api_key
