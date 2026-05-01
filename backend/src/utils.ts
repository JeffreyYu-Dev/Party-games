import { customAlphabet } from "nanoid";

const generateCode = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890", 6);

export { generateCode };
