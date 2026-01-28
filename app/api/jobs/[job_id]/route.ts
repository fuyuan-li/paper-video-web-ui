export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ job_id: string }> }) {
  const base = process.env.BACKEND_BASE_URL;
  if (!base) return new Response("BACKEND_BASE_URL not set", { status: 500 });

  const { job_id } = await ctx.params;
  const resp = await fetch(`${base}/v1/jobs/${encodeURIComponent(job_id)}`, { method: "GET" });

  const text = await resp.text();
  return new Response(text, {
    status: resp.status,
    headers: { "Content-Type": resp.headers.get("Content-Type") ?? "application/json" },
  });
}