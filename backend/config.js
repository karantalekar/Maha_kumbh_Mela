const splitList = (value) =>
  value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean) || [];

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

const config = {
  nodeEnv,
  isProduction,
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/tracker",
  jwtSecret: process.env.JWT_SECRET || "dev_jwt_secret_change_me",
  adminSecret: process.env.ADMIN_SECRET || "Admin123",
  encryptionSecret: process.env.ENCRYPTION_SECRET || "dev_encryption_secret_change_me",
  clientUrls: splitList(process.env.CLIENT_URL || "http://localhost:5173"),
};

const missing = [];
if (isProduction && !process.env.MONGO_URI) missing.push("MONGO_URI");
if (isProduction && !process.env.JWT_SECRET) missing.push("JWT_SECRET");
if (isProduction && !process.env.ADMIN_SECRET) missing.push("ADMIN_SECRET");
if (isProduction && !process.env.ENCRYPTION_SECRET) {
  missing.push("ENCRYPTION_SECRET");
}
if (isProduction && !process.env.CLIENT_URL) missing.push("CLIENT_URL");

if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

export default config;
