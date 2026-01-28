export const runtime = "nodejs";

export async function POST(req: Request) {
  const base = process.env.BACKEND_BASE_URL;
  if (!base) return new Response("BACKEND_BASE_URL not set", { status: 500 });

  const incoming = await req.formData();

  // frontend receives field name "pdf"
  const file = incoming.get("pdf");
  if (!file) return new Response('Missing "pdf" in form-data', { status: 400 });

  // forward to backend /v1/upload
  const fd = new FormData();
  fd.set("file", file);

  const resp = await fetch(`${base}/v1/upload`, {
    method: "POST",
    body: fd,
  });

  const text = await resp.text();
  return new Response(text, {
    status: resp.status,
    headers: { "Content-Type": resp.headers.get("Content-Type") ?? "application/json" },
  });
}