import os
import time
import requests
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from jose import jwt, jwk
from jose.utils import base64url_decode

security = HTTPBearer()

SUPABASE_URL = "https://paokmcwpjojhgqbkjomx.supabase.co"
JWKS_URL = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
EXPECTED_ISSUER = f"{SUPABASE_URL}/auth/v1"
EXPECTED_AUDIENCE = os.getenv("SUPABASE_AUDIENCE", "authenticated")

jwks = requests.get(JWKS_URL).json()


def get_current_user(token=Depends(security)):
    try:
        # Get header
        unverified_header = jwt.get_unverified_header(token.credentials)
        kid = unverified_header["kid"]

        # Find matching key
        key_data = next(k for k in jwks["keys"] if k["kid"] == kid)

        # Construct public key
        public_key = jwk.construct(key_data)

        # Split token
        message, encoded_signature = token.credentials.rsplit(".", 1)

        # Decode signature
        decoded_signature = base64url_decode(encoded_signature.encode())

        # Verify signature
        if not public_key.verify(message.encode(), decoded_signature):
            raise HTTPException(status_code=401, detail="Invalid signature")

        # Get payload
        payload = jwt.get_unverified_claims(token.credentials)

        expires_at = payload.get("exp")
        if not expires_at or int(expires_at) <= int(time.time()):
            raise HTTPException(status_code=401, detail="Token expired")

        issuer = payload.get("iss")
        if issuer != EXPECTED_ISSUER:
            raise HTTPException(status_code=401, detail="Invalid token issuer")

        audience = payload.get("aud")
        if audience != EXPECTED_AUDIENCE:
            raise HTTPException(status_code=401, detail="Invalid token audience")

        print("PAYLOAD:", payload)
        return {"id": payload.get("sub"), "email": payload.get("email")}

    except Exception as e:
        print("JWT ERROR:", str(e))
        raise HTTPException(status_code=401, detail="Invalid token")
