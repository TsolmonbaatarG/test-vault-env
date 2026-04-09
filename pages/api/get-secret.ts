// pages/api/get-secret.ts
// ✅ CSI Driver /mnt/secrets/ файлаас уншина
// ❌ Vault API шууд дуудахгүй — CSI Provider хийж өгнө
// ❌ node-fetch хэрэггүй — Next.js 16 built-in fetch ашиглана
// ❌ K8s SA token-ийг энэ файлаас уншихгүй — CSI Provider хийж өгнө

import type { NextApiRequest, NextApiResponse } from "next";
import { promises as fs } from "fs";
import path from "path";

const SECRETS_DIR = "/mnt/secrets";

type SecretResponse = {
  [key: string]: string;
};

type ErrorResponse = {
  error: string;
  detail?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SecretResponse | ErrorResponse>
) {
  // GET /api/get-secret?name=API_URL  → тухайн нэрийн secret
  // GET /api/get-secret               → бүх secret-ийн жагсаалт

  try {
    const { name } = req.query;

    if (name && typeof name === "string") {
      // Тухайн secret файл унших
      // Path traversal хамгаалалт
      const safeName = path.basename(name);
      const filePath = path.join(SECRETS_DIR, safeName);

      const value = await fs.readFile(filePath, "utf-8");

      return res.status(200).json({ [safeName]: value.trim() });
    }

    // Бүх secret-ийг буцаах
    const files = await fs.readdir(SECRETS_DIR);

    // CSI symlink файлуудыг шүүх (.. гэж эхэлдэг hidden files)
    const secretFiles = files.filter((f) => !f.startsWith(".."));

    const secrets: SecretResponse = {};

    await Promise.all(
      secretFiles.map(async (file) => {
        const filePath = path.join(SECRETS_DIR, file);
        const value = await fs.readFile(filePath, "utf-8");
        secrets[file] = value.trim();
      })
    );

    return res.status(200).json(secrets);
  } catch (error) {
    console.error("Secret унших алдаа:", error);
    return res.status(500).json({
      error: "Secret уншиж чадсангүй",
      detail: String(error),
    });
  }
}