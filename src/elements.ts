const usernameInput = document.getElementById("username") as HTMLInputElement;
const emailInput = document.getElementById("email") as HTMLInputElement;
const registerBtn = document.getElementById("register") as HTMLButtonElement;
const authenticateBtn = document.getElementById(
  "authenticate"
) as HTMLButtonElement;
const idTokenPre = document.getElementById("id-token") as HTMLPreElement;
const accessTokenPre = document.getElementById(
  "access-token"
) as HTMLPreElement;
const refreshTokenPre = document.getElementById(
  "refresh-token"
) as HTMLPreElement;

export const elements = () => ({
  registerBtn,
  authenticateBtn,
  idTokenPre,
  accessTokenPre,
  refreshTokenPre,
});

export const getValues = () => ({
  username: usernameInput.value,
  email: emailInput.value,
});
