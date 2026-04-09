type Post = {
  id: number
  title: string
  body: string
}

async function getPosts(): Promise<Post[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL

  const res = await fetch(`${baseUrl}/posts`, {
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("Failed to fetch data")
  }

  return res.json()
}

export default async function Home() {
  const posts = await getPosts()

  return (
    <main style={{ padding: "20px" }}>
      <h1>K8s ConfigMap API</h1>

      {posts.slice(0, 5).map((post) => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.body}</p>
        </div>
      ))}
    </main>
  )
}