// app/page.tsx
import { promises as fs } from "fs";

// ⭐ Энэ мөр нэмэх — static cache хийхгүй, runtime-д render хийнэ
export const dynamic = "force-dynamic";

type Post = {
  id: number;
  title: string;
  body: string;
};

async function getSecret(name: string): Promise<string> {
  try {
    const value = await fs.readFile(`/mnt/secrets/${name}`, "utf-8");
    return value.trim();
  } catch {
    return process.env[name] ?? "";
  }
}

async function getPosts(apiUrl: string): Promise<Post[]> {
  const res = await fetch(`${apiUrl}/posts`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

export default async function Home() {
  const apiUrl = await getSecret("API_URL");

  if (!apiUrl) {
    return (
      <main style={{ padding: "20px" }}>
        <h1>Posts</h1>
        <p>API URL тохируулагдаагүй байна.</p>
      </main>
    );
  }

  const posts = await getPosts(apiUrl);

  return (
    <main style={{ padding: "20px" }}>
      <h1>Posts</h1>
      {posts.slice(0, 5).map((post) => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.body}</p>
        </div>
      ))}
    </main>
  );
}