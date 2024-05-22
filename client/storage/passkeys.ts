import { Storage } from "./base";
import { PasskeyInfo } from "../services/types";

const KEY = "current-user-passkeys";
export const PasskeysStorage = new Storage<PasskeyInfo[]>(KEY);
