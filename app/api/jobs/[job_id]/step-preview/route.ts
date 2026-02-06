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

  const url = new URL(req.url);
  const step = url.searchParams.get("step");

  if (!step) {
    return new Response('Missing required query param "step"', { status: 400 });
  }

  // build backend URL for step-preview
  const backendUrl = new URL(
    `${base}/v1/jobs/${encodeURIComponent(job_id)}/step-preview`
  );
  backendUrl.searchParams.set("step", step);

  const resp = await fetch(backendUrl.toString(), { method: "GET" });

  const text = await resp.text();
  return new Response(text, {
    status: resp.status,
    headers: {
      "Content-Type": resp.headers.get("Content-Type") ?? "application/json",
    },
  });
}