/**
 * Seed data + types for the dashboard performance demo (Soal 4 evidence).
 *
 * This is a smaller reconstruction of a real production UMKM dashboard: stat
 * cards, a yearly chart, and a maplibre province map. It backs the mock API
 * that both the `/dashboard/before` and `/dashboard/after` pages read from.
 */

export interface DashboardStats {
	umkm: number;
	students: number;
	mentors: number;
	programs: number;
}

export interface YearlyPoint {
	year: string;
	value: number;
}

export interface Province {
	name: string;
	lng: number;
	lat: number;
	count: number;
}

export interface ActivityRow {
	id: string;
	name: string;
	action: string;
	timestamp: string;
}

export const stats: DashboardStats = {
	umkm: 12_480,
	students: 3_204,
	mentors: 512,
	programs: 87,
};

export const yearly: YearlyPoint[] = [
	{ year: "2019", value: 1_240 },
	{ year: "2020", value: 2_980 },
	{ year: "2021", value: 4_510 },
	{ year: "2022", value: 6_870 },
	{ year: "2023", value: 9_640 },
	{ year: "2024", value: 12_480 },
];

/** A handful of Indonesian provinces with rough centroids for map markers. */
export const provinces: Province[] = [
	{ name: "DKI Jakarta", lng: 106.845, lat: -6.208, count: 2_140 },
	{ name: "Jawa Barat", lng: 107.619, lat: -6.914, count: 3_210 },
	{ name: "Jawa Tengah", lng: 110.42, lat: -7.15, count: 2_480 },
	{ name: "Jawa Timur", lng: 112.75, lat: -7.25, count: 2_760 },
	{ name: "Bali", lng: 115.188, lat: -8.409, count: 640 },
	{ name: "Sumatera Utara", lng: 98.678, lat: 3.597, count: 890 },
	{ name: "Sulawesi Selatan", lng: 119.417, lat: -5.147, count: 560 },
];

export const activity: ActivityRow[] = [
	{
		id: "a_1",
		name: "Warung Bu Sri",
		action: "menyelesaikan modul pemasaran",
		timestamp: "2024-06-11T19:12:00+07:00",
	},
	{
		id: "a_2",
		name: "Andi Wijaya",
		action: "bergabung sebagai mentor baru",
		timestamp: "2024-06-11T09:03:00+07:00",
	},
	{
		id: "a_3",
		name: "Kopi Kenangan Lokal",
		action: "mengunggah laporan keuangan",
		timestamp: "2024-06-10T14:40:00+07:00",
	},
	{
		id: "a_4",
		name: "Citra Dewi",
		action: "mendaftar program magang",
		timestamp: "2024-06-09T20:15:00+07:00",
	},
	{
		id: "a_5",
		name: "Batik Nusantara",
		action: "menyelesaikan program pendampingan",
		timestamp: "2024-06-08T11:27:00+07:00",
	},
];
