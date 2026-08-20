import { addPhotoEntry, requestOwner } from "@/db/app-data";

export const dynamic = "force-dynamic";

type StoredObject = { body: ReadableStream; httpEtag: string; writeHttpMetadata: (headers: Headers) => void };
type Bucket = {
  put: (key: string, value: ArrayBuffer, options: { httpMetadata: { contentType: string }; customMetadata: Record<string, string> }) => Promise<unknown>;
  get: (key: string) => Promise<StoredObject | null>;
};

async function bucket() {
  const { env } = await import("cloudflare:workers");
  const value = (env as unknown as { BUCKET?: Bucket }).BUCKET;
  if (!value) throw new Error("Photo storage is unavailable");
  return value;
}

export async function POST(request: Request) {
  try {
    const owner = requestOwner(request);
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "Choose a photo" }, { status: 400 });
    if (!file.type.startsWith("image/")) return Response.json({ error: "Only image files are supported" }, { status: 415 });
    if (file.size > 8 * 1024 * 1024) return Response.json({ error: "Photo must be smaller than 8 MB" }, { status: 413 });
    const safeName = file.name.replace(/[^a-z0-9._-]/gi, "-");
    const key = `${owner}/diary/${crypto.randomUUID()}-${safeName}`;
    await (await bucket()).put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type }, customMetadata: { originalName: file.name, uploadedAt: new Date().toISOString() } });
    return Response.json({ data: await addPhotoEntry(owner, key, file.name) }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Photo could not be uploaded" }, { status: 503 });
  }
}

export async function GET(request: Request) {
  try {
    const owner = requestOwner(request);
    const key = new URL(request.url).searchParams.get("key") || "";
    if (!key.startsWith(`${owner}/`)) return Response.json({ error: "Photo not found" }, { status: 404 });
    const object = await (await bucket()).get(key);
    if (!object) return Response.json({ error: "Photo not found" }, { status: 404 });
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("cache-control", "private, max-age=300");
    return new Response(object.body, { headers });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Photo is unavailable" }, { status: 503 });
  }
}
