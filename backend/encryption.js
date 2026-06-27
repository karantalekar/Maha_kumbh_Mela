import crypto from "crypto";
import config from "./config.js";

const algorithm = "aes-256-cbc";
const secretKey = crypto
  .createHash("sha256")
  .update(config.encryptionSecret)
  .digest("hex")
  .substring(0, 32);

function encrypt(text) {
  if (!text) return "";

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
}

function decrypt(text) {
  if (!text) return "";

  const parts = text.split(":");
  if (parts.length !== 2) return "";

  const iv = Buffer.from(parts[0], "hex");
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  let decrypted = decipher.update(parts[1], "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

export { encrypt, decrypt };
