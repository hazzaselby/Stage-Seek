const API_BASE = 'https://fluffy-carnival-x56qgx9657q5hv6xw-3000.app.github.dev';

export async function searchPerformances(params) {
  const query = new URLSearchParams();
  
  query.append('from', params.from);
  query.append('to', params.to);
  
  if (params.lat) query.append('lat', params.lat);
  if (params.lng) query.append('lng', params.lng);
  if (params.radius) query.append('radius', params.radius);
  if (params.genres?.length) query.append('genres', params.genres.join(','));
  if (params.venue_types?.length) query.append('venue_types', params.venue_types.join(','));
  if (params.regions?.length) query.append('regions', params.regions.join(','));
  if (params.max_price) query.append('max_price', params.max_price);
  if (params.free_only) query.append('free_only', 'true');
  if (params.accessible) query.append('accessible', 'true');

  const response = await fetch(`${API_BASE}/api/search?${query}`);
  if (!response.ok) throw new Error('Search failed');
  return response.json();
}

export async function getProduction(slug) {
  const response = await fetch(`${API_BASE}/api/productions/${slug}`);
  if (!response.ok) throw new Error('Failed to fetch production');
  return response.json();
}

export async function getVenue(id) {
  const response = await fetch(`${API_BASE}/api/venues/${id}`);
  if (!response.ok) throw new Error('Failed to fetch venue');
  return response.json();
}
