import os
import re
from dotenv import load_dotenv

load_dotenv()

LOGINID_BASE_URL = os.getenv("LOGINID_BASE_URL") or ""
LOGINID_CLIENT_ID = os.getenv("LOGINID_CLIENT_ID") or ""
PRIVATE_KEY = re.sub(
    r"\\n",
    r"\n",
    os.getenv("PRIVATE_KEY") or ""
)
COGNITO_USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID") or ""
COGNITO_CLIENT_ID = os.getenv("COGNITO_CLIENT_ID") or ""

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(ROOT_DIR, "..", "dist")
