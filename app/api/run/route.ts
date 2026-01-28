export const runtime = "nodejs";

export async function POST(req: Request) {
  const base = process.env.BACKEND_BASE_URL;
  if (!base) return new Response("BACKEND_BASE_URL not set", { status: 500 });

  const body = await req.json();

  const resp = await fetch(`${base}/v1/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await resp.text();
  return new Response(text, {
    status: resp.status,
    headers: { "Content-Type": resp.headers.get("Content-Type") ?? "application/json" },
  });
}