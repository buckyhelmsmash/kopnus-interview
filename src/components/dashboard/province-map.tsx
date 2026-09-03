"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { Map as MapLibre, Marker } from "@vis.gl/react-maplibre";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Province } from "@/mocks/dashboard";

/**
 * Heavy widget #2 — pulls in maplibre-gl (WebGL). This is the biggest single
 * dependency on the page, which is why the `after` variant loads it via
 * `dynamic({ ssr: false })`: maplibre touches `window`, so it can't render on
 * the server, and it has no business being in the first-load bundle.
 *
 * Carto's positron style is used directly (keyless, no signup/token), matching
 * the production dashboard this demo reconstructs.
 */

const MAP_STYLE =
	"https://tiles.basemaps.cartocdn.com/gl/positron-gl-style/style.json";

export function ProvinceMap({ provinces }: { provinces: Province[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Sebaran UMKM per Provinsi</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				<div className="h-80 w-full overflow-hidden">
					<MapLibre
						initialViewState={{ longitude: 118, latitude: -2, zoom: 3.6 }}
						mapStyle={MAP_STYLE}
						attributionControl={false}
						style={{ width: "100%", height: "100%" }}
					>
						{provinces.map((p) => (
							<Marker key={p.name} longitude={p.lng} latitude={p.lat}>
								<span
									title={`${p.name}: ${p.count.toLocaleString("id-ID")}`}
									className="block size-3 rounded-full bg-brand ring-2 ring-white"
								/>
							</Marker>
						))}
					</MapLibre>
				</div>
			</CardContent>
		</Card>
	);
}
