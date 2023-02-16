const usernameInput = document.getElementById("username") as HTMLInputElement;
const emailInput = document.getElementById("email") as HTMLInputElement;
const registerBtn = document.getElementById("register") as HTMLButtonElement;
const authenticateBtn = document.getElementById(
  "authenticate"
) as HTMLButtonElement;

export const elements = () => ({
  registerBtn,
  authenticateBtn,
});

export const getValues = () => ({
  username: usernameInput.value,
  email: emailInput.value,
});
