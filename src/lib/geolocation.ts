export type DetectedLocation = {
  latitude: number;
  longitude: number;
  address: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  pincode: string;
};

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location detection isn't supported in this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, () => reject(new Error("Couldn't detect your location.")), {
      enableHighAccuracy: true,
      timeout: 10_000,
    });
  });
}

type NominatimAddress = {
  road?: string;
  suburb?: string;
  village?: string;
  town?: string;
  city?: string;
  county?: string;
  state_district?: string;
  state?: string;
  postcode?: string;
};

/** Free, no-API-key reverse geocoding via OpenStreetMap Nominatim. Best-effort — India's admin
 * hierarchy (state > district > taluka > village) doesn't map cleanly onto OSM's tags. */
export async function reverseGeocode(latitude: number, longitude: number): Promise<DetectedLocation> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) throw new Error("Could not look up your address.");
  const data = (await res.json()) as { address?: NominatimAddress; display_name?: string };
  const a = data.address ?? {};

  return {
    latitude,
    longitude,
    address: a.road ?? data.display_name ?? "",
    village: a.village ?? a.suburb ?? a.town ?? a.city ?? "",
    taluka: a.state_district ?? a.county ?? "",
    district: a.county ?? a.state_district ?? "",
    state: a.state ?? "",
    pincode: a.postcode ?? "",
  };
}
