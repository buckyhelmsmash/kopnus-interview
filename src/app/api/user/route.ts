import { delay } from "@/lib/format";
import { user } from "@/mocks/data";

export const dynamic = "force-dynamic";

export async function GET() {
	await delay(1200);
	return Response.json(user);
}
