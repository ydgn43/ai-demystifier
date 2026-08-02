from fastapi import Header, HTTPException

from app.config import settings


def require_cron_secret(x_cron_secret: str = Header(default="")) -> None:
    if x_cron_secret != settings.cron_secret:
        raise HTTPException(status_code=401, detail="invalid or missing X-Cron-Secret header")
