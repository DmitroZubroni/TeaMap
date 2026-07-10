// Rough centroids used only to place the world-view country pins.
// When a country's regions are loaded, the map fits to their real bounds
// instead — these coordinates never drive anything more precise than "which
// pin to draw before we've fetched region data".
export const COUNTRY_CENTROIDS = {
  china: { lat: 34.5, lng: 104.0 },
  india: { lat: 22.4, lng: 78.7 },
  sri_lanka: { lat: 7.6, lng: 80.7 },
  vietnam: { lat: 15.9, lng: 106.3 },
  thailand: { lat: 15.9, lng: 100.9 },
  russia: { lat: 44.0, lng: 40.0 }, // biased to the Krasnodar tea-growing coast
  taiwan: { lat: 23.7, lng: 121.0 },
  japan: { lat: 36.2, lng: 138.2 },
}
