//These will need to be changed from a call to an API (API Gateway Lambda) and stored in local storage
//For now just provide static values for dev
import dotenv from "dotenv";

dotenv.config();

export const COGNITO_USER_POOL_ID =
  process.env.REACT_COGNITO_USER_POOL_ID || "";
export const COGNITO_CLIENT_ID = process.env.REACT_COGNITO_CLIENT_ID || "";
export const CREDENTIALS_BASE_URL =
  process.env.REACT_CREDENTIALS_BASE_URL || "";
