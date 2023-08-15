//These will need to be changed from a call to an API (API Gateway Lambda) and stored in local storage
//For now just provide static values for dev
import dotenv from "dotenv";

dotenv.config();

export const PAGE_BACKGROUND_COLOR = "";
export const PAGE_BACKGROUND_IMAGE = "";
export const BACKGROUND_COLOR = "";
//export const BACKGROUND_IMAGE = new URL(
//  "../images/autumn.jpg",
//  import.meta.url
//).toString();
//export const BUTTONS_COLOR = process.env.REACT_APP_BUTTONS_COLOR || "#228BE6";
export const BUTTONS_COLOR = process.env.REACT_APP_BUTTONS_COLOR || "#228BE6";
export const BACKGROUND_IMAGE = "black";
export const LOGIN_LOGO = new URL(
  "../images/loginid.svg",
  import.meta.url
).toString();

export const COGNITO_USER_POOL_ID =
  process.env.REACT_COGNITO_USER_POOL_ID || "";
export const COGNITO_CLIENT_ID = process.env.REACT_COGNITO_CLIENT_ID || "";
