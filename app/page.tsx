// app-page.tsx
import { cache } from "react";

type Post = {
  id: number;
  title: string;
  body: string;
};

// Vault-аас API URL авах helper
async function getVaultSecret(): Promise<string> {
  const vaultAddr = process.env.VAULT_ADDR; // https://172.16.50.36:8200
  const vaultRole = process.env.VAULT_ROLE; // "nextjs-role"
  
  // Pod service account token
  const k8sToken = await Deno.readTextFile("/var/run/secrets/kubernetes.io/serviceaccount/token");

  // Vault login
  const loginRes = await fetch(`${vaultAddr}/v1/auth/kubernetes/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: vaultRole, jwt: k8sToken.trim() }),
  });
  const loginData = await loginRes.json();
  const vaultToken = loginData?.auth?.client_token;
  if (!vaultToken) throw new Error("Vault login failed");

  // Secret унших
  const secretRes = await fetch(`${vaultAddr}/v1/secret/data/nextjs/API_URL`, {
    headers: { "X-Vault-Token": vaultToken },
  });
  const secretData = await secretRes.json();
  const apiUrl = secretData?.data?.data?.API_URL;
  if (!apiUrl) throw new Error("Vault secret not found");

  return apiUrl;
}

// Posts авах
async function getPosts(): Promise<Post[]> {
  const baseUrl = await getVaultSecret();

  const res = await fetch(`${baseUrl}/posts`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
}

export default async function Home() {
  const posts = await getPosts();

  return (
    <main style={{ padding: "20px" }}>
      <h1>Vault API URL API</h1>
      {posts.slice(0, 5).map((post) => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.body}</p>
        </div>
      ))}
    </main>
  );
}