import { Storage } from "./base";
import { Config } from "../services/types";

const KEY = "current-config";
export const ConfigStorage = new Storage<Config>(KEY);
