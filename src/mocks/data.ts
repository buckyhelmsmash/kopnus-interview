import type { Contact, Transaction, User } from "@/lib/types";

/**
 * Seed data backing the mock API. A single logged-in user is assumed
 * (auth is out of scope). Avatars use DiceBear so no binary assets are needed.
 */

function avatar(seed: string): string {
	return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

export const user: User = {
	id: "u_1",
	name: "Andi Wijaya",
	avatar: avatar("Andi Wijaya"),
	points: 1972,
	balance: 24_321_900,
};

export const contacts: Contact[] = [
	{
		id: "c_1",
		name: "Alexandria",
		phone: "0812 3456 7890",
		avatar: avatar("Alexandria"),
	},
	{
		id: "c_2",
		name: "Brian Kusuma",
		phone: "0813 2233 4455",
		avatar: avatar("Brian Kusuma"),
	},
	{
		id: "c_3",
		name: "Citra Dewi",
		phone: "0821 9988 7766",
		avatar: avatar("Citra Dewi"),
	},
	{
		id: "c_4",
		name: "Dimas Prakoso",
		phone: "0857 1212 3434",
		avatar: avatar("Dimas Prakoso"),
	},
	{
		id: "c_5",
		name: "Ella Ramadhani",
		phone: "0819 5566 7788",
		avatar: avatar("Ella Ramadhani"),
	},
	{
		id: "c_6",
		name: "Fajar Nugroho",
		phone: "0838 4455 6677",
		avatar: avatar("Fajar Nugroho"),
	},
	{
		id: "c_7",
		name: "Gita Lestari",
		phone: "0812 7788 9900",
		avatar: avatar("Gita Lestari"),
	},
	{
		id: "c_8",
		name: "Hendra Saputra",
		phone: "0852 3344 5566",
		avatar: avatar("Hendra Saputra"),
	},
];

export const transactions: Transaction[] = [
	{
		id: "t_1",
		name: "Alexandria",
		timestamp: "2024-06-11T19:12:00+07:00",
		amount: 600_000,
		direction: "out",
		kind: "transfer",
	},
	{
		id: "t_2",
		name: "Top Up",
		timestamp: "2024-06-11T09:03:00+07:00",
		amount: 1_500_000,
		direction: "in",
		kind: "topup",
	},
	{
		id: "t_3",
		name: "Brian Kusuma",
		timestamp: "2024-06-10T14:40:00+07:00",
		amount: 250_000,
		direction: "out",
		kind: "transfer",
	},
	{
		id: "t_4",
		name: "Withdraw",
		timestamp: "2024-06-09T20:15:00+07:00",
		amount: 400_000,
		direction: "out",
		kind: "withdraw",
	},
	{
		id: "t_5",
		name: "Citra Dewi",
		timestamp: "2024-06-08T11:27:00+07:00",
		amount: 175_000,
		direction: "out",
		kind: "transfer",
	},
];
