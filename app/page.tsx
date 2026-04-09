// app/page.tsx
import { promises as fs } from "fs";

type Post = {
  id: number;
  title: string;
  body: string;
};

async function getSecret(name: string): Promise<string> {
  // CSI mount: /mnt/secrets/API_URL файлаас уншина
  const value = await fs.readFile(`/mnt/secrets/${name}`, "utf-8");
  return value.trim();
}

async function getPosts(): Promise<Post[]> {
  const apiUrl = await getSecret("API_URL");

  const res = await fetch(`${apiUrl}/posts`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

export default async function Home() {
  const posts = await getPosts();

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