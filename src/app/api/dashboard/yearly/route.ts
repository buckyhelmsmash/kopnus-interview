import { delay } from "@/lib/format";
import { yearly } from "@/mocks/dashboard";

export const dynamic = "force-dynamic";

export async function GET() {
	await delay(200);
	return Response.json(yearly);
}
