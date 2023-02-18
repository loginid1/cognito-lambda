const usernameInput = document.getElementById("username") as HTMLInputElement;
const emailInput = document.getElementById("email") as HTMLInputElement;
const passwordInput = document.getElementById("password") as HTMLInputElement;
const form = document.querySelector("form") as HTMLFormElement;
const logoutBtn = document.getElementById("logout-btn") as HTMLButtonElement;
const header = document.querySelector("h1") as HTMLHeadingElement;
const addFIDO2Btn = document.getElementById(
  "passwordless-btn"
) as HTMLButtonElement;

export const elements = () => ({
  addFIDO2Btn,
  form,
  header,
  logoutBtn,
});

export const getValues = () => ({
  email: emailInput?.value,
  password: passwordInput?.value,
  username: usernameInput?.value,
});
