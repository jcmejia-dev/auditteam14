import { detectSafeImageContentType } from "@/lib/media/validation";
import { downloadPublishedPhoto } from "@/lib/media/data";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/media/photo/[slug]/[position]">,
) {
  const { slug, position: positionValue } = await params;
  const position = Number(positionValue);

  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
    !Number.isInteger(position) ||
    position < 1 ||
    position > 1000
  ) {
    return new Response("Not found", { status: 404 });
  }

  const bytes = await downloadPublishedPhoto(slug, position);

  if (!bytes) {
    return new Response("Not found", { status: 404 });
  }

  const contentType = detectSafeImageContentType(bytes);

  if (!contentType) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(bytes, {
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      "Content-Length": String(bytes.byteLength),
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
