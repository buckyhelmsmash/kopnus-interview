import { delay } from "@/lib/format";
import { yearly } from "@/mocks/dashboard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	await delay(200);
	const upto = new URL(request.url).searchParams.get("upto");
	const data = upto ? yearly.filter((p) => p.year <= upto) : yearly;
	return Response.json(data);
}
