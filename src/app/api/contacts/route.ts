import { delay } from "@/lib/format";
import { contacts } from "@/mocks/data";

export const dynamic = "force-dynamic";

export async function GET() {
	await delay(1000);
	return Response.json(contacts);
}
