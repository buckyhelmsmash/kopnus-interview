import { delay } from "@/lib/format";
import { transactions } from "@/mocks/data";

export const dynamic = "force-dynamic";

export async function GET() {
	await delay(1400);
	return Response.json(transactions);
}
