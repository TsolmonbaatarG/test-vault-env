import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import fetch from "node-fetch";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const vaultAddr = process.env.VAULT_ADDR; // ex: https://172.16.50.36:8200
    const vaultRole = process.env.VAULT_ROLE; // K8s role, ex: "nextjs-role"

    // 1️⃣ Pod service account token унших
    const k8sToken = await fs.readFile(
      "/var/run/secrets/kubernetes.io/serviceaccount/token",
      "utf8"
    );

    // 2️⃣ Vault login
    const loginResponse = await fetch(`${vaultAddr}/v1/auth/kubernetes/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: vaultRole,
        jwt: k8sToken.trim(),
      }),
    });

    const loginData = await loginResponse.json();
    const vaultToken = loginData?.auth?.client_token;

    if (!vaultToken) {
      return res.status(500).json({ error: "Vault login failed" });
    }

    // 3️⃣ Secret унших
    const secretResponse = await fetch(
      `${vaultAddr}/v1/secret/data/nextjs/API_URL`,
      {
        headers: { "X-Vault-Token": vaultToken },
      }
    );

    const secretData = await secretResponse.json();
    const apiUrl = secretData?.data?.data?.API_URL || null;

    res.status(200).json({ apiUrl });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}