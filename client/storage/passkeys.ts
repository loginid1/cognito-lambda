import { Storage } from "./base";
import { Credential } from "../services/types";

const KEY = "current-user-passkeys";
export const PasskeysStorage = new Storage<Credential[]>(KEY);
