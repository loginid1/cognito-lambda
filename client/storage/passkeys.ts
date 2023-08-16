import { Credential } from "../services/credentials";

const KEY = "current-user-passkeys";

export const setPasskeysInfo = (credentials: Credential[] = []) => {
  localStorage.setItem(KEY, JSON.stringify(credentials));
};

export const getPasskeysInfo = () => {
  return JSON.parse(localStorage.getItem(KEY) || "[]");
};

export const clearPasskeysInfo = () => {
  localStorage.removeItem(KEY);
};
