import { SetAmountScreen } from "@/components/cashease/set-amount-screen";

export default async function SetAmountPage({
	params,
}: PageProps<"/cashease/transfer/friends/[contactId]">) {
	const { contactId } = await params;
	return <SetAmountScreen contactId={contactId} />;
}
