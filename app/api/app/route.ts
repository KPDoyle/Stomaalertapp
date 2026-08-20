import { applyAppAction, readAppData, requestOwner } from "@/db/app-data";
import type { AppAction } from "@/lib/app-types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    return Response.json({ data: await readAppData(requestOwner(request)) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Data could not be loaded" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const action = await request.json() as AppAction;
    return Response.json({ data: await applyAppAction(requestOwner(request), action) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Change could not be saved" }, { status: 400 });
  }
}
