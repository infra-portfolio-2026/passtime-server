import admin from "firebase-admin";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serviceAccountPath = path.resolve(
  __dirname,
  "../../firebase/passtime-95bad-firebase-adminsdk-fbsvc-7b019cd11f.json"
);

const rawJson = await fs.readFile(serviceAccountPath, "utf-8");
const serviceAccount = JSON.parse(rawJson);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
