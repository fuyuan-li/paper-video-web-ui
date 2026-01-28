export const runtime = "nodejs";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ job_id: string }> }
) {
  const base = process.env.BACKEND_BASE_URL;
  if (!base) {
    return new Response("BACKEND_BASE_URL not set", { status: 500 });
  }

  const { job_id } = await ctx.params;

  // get query from req.url
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  const expiresSeconds = url.searchParams.get("expires_seconds");

  if (!key) {
    return new Response(
      'Missing required query param "key"',
      { status: 400 }
    );
  }

  // build backend URL for signed-url
  const backendUrl = new URL(
    `${base}/v1/jobs/${encodeURIComponent(job_id)}/signed-url`
  );
  backendUrl.searchParams.set("key", key);

  // expires_seconds optional
  if (expiresSeconds) {
    backendUrl.searchParams.set("expires_seconds", expiresSeconds);
  }

  const resp = await fetch(backendUrl.toString(), { method: "GET" });

  const text = await resp.text();
  return new Response(text, {
    status: resp.status,
    headers: {
      "Content-Type":
        resp.headers.get("Content-Type") ?? "application/json",
    },
  });
}