export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    {
      ok: true,
      service: "kalkulator-harga-shopee",
      runtime: "cloudflare-workers",
    },
    {
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}
