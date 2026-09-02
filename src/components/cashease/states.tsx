import { AlertCircle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Inline error state with a retry action. */
export function ErrorState({
	message,
	onRetry,
}: {
	message: string;
	onRetry?: () => void;
}) {
	return (
		<div className="flex flex-col items-center gap-3 py-8 text-center">
			<AlertCircle className="size-8 text-danger" />
			<p className="text-sm text-muted-foreground">{message}</p>
			{onRetry ? (
				<Button variant="outline" size="sm" onClick={onRetry}>
					Try again
				</Button>
			) : null}
		</div>
	);
}

/** Empty state placeholder. */
export function EmptyState({ message }: { message: string }) {
	return (
		<div className="flex flex-col items-center gap-3 py-8 text-center">
			<Inbox className="size-8 text-muted-foreground" />
			<p className="text-sm text-muted-foreground">{message}</p>
		</div>
	);
}
