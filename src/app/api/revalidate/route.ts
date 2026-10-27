import crypto from "crypto";
import { revalidatePath } from "next/cache";

/**
 * On-demand revalidation webhook, called by the backend after a CMS change.
 *
 * The backend signs the raw JSON body with HMAC-SHA256 under a shared secret and sends it in
 * `x-cms-signature`. We recompute and compare with a timing-safe equal; a mismatch or missing
 * secret is rejected. No secret ever reaches the client bundle — this runs server-side only.
 */
export const runtime = "nodejs";

function timingSafeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.CMS_REVALIDATE_SECRET;
  if (!secret) {
    return Response.json({ ok: false, error: "revalidation not configured" }, { status: 503 });
  }

  const signature = request.headers.get("x-cms-signature");
  const body = await request.text();
  const expected = `sha256=${crypto.createHmac("sha256", secret).update(body).digest("hex")}`;

  if (!signature || !timingSafeEqual(signature, expected)) {
    return Response.json({ ok: false, error: "invalid signature" }, { status: 401 });
  }

  // The CMS only drives the homepage hero/content and the privacy notice today. Revalidate both;
  // unknown tags in the payload are ignored.
  revalidatePath("/");
  revalidatePath("/privacy");

  return Response.json({ ok: true, revalidated: ["/", "/privacy"], at: new Date().toISOString() });
}
