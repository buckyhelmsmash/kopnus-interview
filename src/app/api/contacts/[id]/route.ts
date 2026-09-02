import { delay } from "@/lib/format";
import { contacts } from "@/mocks/data";

export const dynamic = "force-dynamic";

export async function GET(
	_request: Request,
	ctx: RouteContext<"/api/contacts/[id]">,
) {
	const { id } = await ctx.params;
	await delay(700);

	const contact = contacts.find((c) => c.id === id);
	if (!contact) {
		return Response.json({ error: "Contact not found" }, { status: 404 });
	}
	return Response.json(contact);
}
