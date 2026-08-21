import rawElementProfiles from "./element-personalities.json";
import { validateElementProfiles } from "../../schemas";

export const elementProfiles = validateElementProfiles(rawElementProfiles);
