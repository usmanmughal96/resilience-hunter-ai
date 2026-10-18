/**
 * ResilienceHunter Live Sources
 * Free / open data focused. Works offline in demo mode.
 * When API keys are present, real queries are executed.
 */

import { env, http, hasKey } from './env.mjs';

// ---------- Source definitions ----------
export const LIVE_SOURCES = [
  {
    id: 'gdacs',
    name: 'GDACS Global Disaster Alerts',
    type: 'alert',
    description: 'Near real-time multi-hazard alerts (flood, earthquake, cyclone, volcano, drought)',
    free: true,
    requires: [],
  },
  {
    id: 'reliefweb',
    name: 'ReliefWeb / UN OCHA',
    type: 'reports',
    description: 'Humanitarian reports, situation updates, funding appeals',
    free: true,
    requires: [],
  },
  {
    id: 'nasa_firms',
    name: 'NASA FIRMS Active Fires',
    type: 'satellite',
    description: 'Near real-time active fire detections from MODIS/VIIRS',
    free: true,
    requires: [],
  },
  {
    id: 'open_meteo',
    name: 'Open-Meteo Extreme Weather',
    type: 'weather',
    description: 'Free weather & extreme event forecasts (no key required)',
    free: true,
    requires: [],
  },
  {
    id: 'usgs_earthquake',
    name: 'USGS Earthquake Hazards',
    type: 'seismic',
    description: 'Real-time earthquake feed (M4.5+)',
    free: true,
    requires: [],
  },
  {
    id: 'climate_news',
    name: 'Climate & Resilience News',
    type: 'news',
    description: 'Recent climate adaptation, resilience funding & community stories',
    free: false,
    requires: ['TAVILY_API_KEY', 'SERPER_API_KEY'], // either works
  },
  {
    id: 'earth_engine',
    name: 'Google Earth Engine Signals',
    type: 'geospatial',
    description: 'Flood, drought, heat, vegetation stress indices (free research account)',
    free: true,
    requires: ['EARTH_ENGINE_TOKEN'], // optional – demo falls back to synthetic
  },
  {
    id: 'funding',
    name: 'Resilience Funding & Grants',
    type: 'opportunity',
    description: 'Open climate adaptation & disaster risk reduction funding calls',
    free: true,
    requires: [],
  },
  {
    id: 'community',
    name: 'Local Capacity & Community Signals',
    type: 'community',
    description: 'Open data on shelters, cooling centres, local NGOs, critical infrastructure',
    free: true,
    requires: [],
  },
];

// ---------- Demo / synthetic data generators ----------
function demoAlerts(location = 'Global') {
  const now = new Date().toISOString();
  return [
    {
      id: 'gdacs-flood-pk-001',
      title: 'Flood Alert – Indus River Basin (Pakistan)',
      hazard: 'Flood',
      severity: 'Orange',
      location: 'Sindh / Punjab, Pakistan',
      country: 'Pakistan',
      lat: 27.5, lon: 68.5,
      population_at_risk: 1_200_000,
      description: 'Monsoon-related riverine flooding. Multiple districts on high alert. Displacement already reported.',
      source: 'GDACS',
      source_url: 'https://www.gdacs.org',
      published: now,
      urgency: 'high',
      opportunity_type: 'Immediate relief + early recovery planning',
    },
    {
      id: 'gdacs-heat-in-002',
      title: 'Extreme Heat Wave – Northern India & Pakistan',
      hazard: 'Heatwave',
      severity: 'Red',
      location: 'Punjab / Delhi NCR',
      country: 'India / Pakistan',
      lat: 30.0, lon: 75.0,
      population_at_risk: 45_000_000,
      description: 'Sustained temperatures >42°C. Critical infrastructure and vulnerable populations at risk.',
      source: 'GDACS / IMD',
      source_url: 'https://www.gdacs.org',
      published: now,
      urgency: 'critical',
      opportunity_type: 'Cooling centres, public health, energy resilience',
    },
    {
      id: 'firms-wildfire-gr-003',
      title: 'Active Wildfire Cluster – Mediterranean',
      hazard: 'Wildfire',
      severity: 'Orange',
      location: 'Greece / Southern Europe',
      country: 'Greece',
      lat: 38.2, lon: 23.7,
      population_at_risk: 180_000,
      description: 'Multiple active fire detections. Dry conditions and high winds expected.',
      source: 'NASA FIRMS',
      source_url: 'https://firms.modaps.eosdis.nasa.gov',
      published: now,
      urgency: 'high',
      opportunity_type: 'Evacuation support + post-fire recovery planning',
    },
    {
      id: 'quake-jp-004',
      title: 'Seismic Activity – Pacific Ring of Fire',
      hazard: 'Earthquake',
      severity: 'Yellow',
      location: 'Offshore Japan',
      country: 'Japan',
      lat: 35.6, lon: 140.1,
      population_at_risk: 500_000,
      description: 'M5.8 event. Tsunami watch cancelled. Structural assessment opportunity.',
      source: 'USGS',
      source_url: 'https://earthquake.usgs.gov',
      published: now,
      urgency: 'medium',
      opportunity_type: 'Infrastructure inspection & retrofit prioritisation',
    },
    {
      id: 'drought-af-005',
      title: 'Severe Drought – Horn of Africa',
      hazard: 'Drought',
      severity: 'Red',
      location: 'Somalia / Ethiopia / Kenya',
      country: 'Multi-country',
      lat: 5.0, lon: 45.0,
      population_at_risk: 12_000_000,
      description: 'Multi-season rainfall deficit. Acute food insecurity and livestock loss.',
      source: 'GDACS / FEWS NET',
      source_url: 'https://www.gdacs.org',
      published: now,
      urgency: 'critical',
      opportunity_type: 'Humanitarian response + long-term water resilience',
    },
  ].filter((a) => {
    if (!location || location.toLowerCase() === 'global') return true;
    const loc = location.toLowerCase();
    return a.location.toLowerCase().includes(loc) || a.country.toLowerCase().includes(loc);
  });
}

function demoFunding() {
  return [
    {
      id: 'fund-1',
      title: 'Climate Adaptation Fund – Rapid Response Window',
      amount: 'Up to $2.5M',
      deadline: 'Rolling',
      focus: 'Flood & heat resilience in South Asia',
      eligibility: 'Local governments, NGOs, community organisations',
      url: 'https://www.adaptation-fund.org',
      opportunity_type: 'Funding match',
    },
    {
      id: 'fund-2',
      title: 'Google.org Impact Challenge – Climate Resilience',
      amount: 'Up to $2M',
      deadline: '2026 cycle',
      focus: 'AI + data for community climate resilience',
      eligibility: 'Non-profits & social enterprises',
      url: 'https://www.google.org',
      opportunity_type: 'Funding match',
    },
    {
      id: 'fund-3',
      title: 'UNDRR Early Warning Systems Grant',
      amount: '$500k – $1.5M',
      deadline: 'Open call',
      focus: 'Multi-hazard early warning for vulnerable communities',
      eligibility: 'National meteorological services & partners',
      url: 'https://www.undrr.org',
      opportunity_type: 'Funding match',
    },
  ];
}

function demoCommunity(location) {
  return [
    {
      id: 'comm-1',
      title: 'Karachi Heat Action Network',
      type: 'Local capacity',
      location: 'Karachi, Pakistan',
      description: 'Coalition of NGOs operating cooling centres and water distribution during heatwaves.',
      contact: 'Public directory',
      opportunity_type: 'Partnership / scale-up',
    },
    {
      id: 'comm-2',
      title: 'Indus Basin Community Early Warning Groups',
      type: 'Local capacity',
      location: 'Sindh, Pakistan',
      description: 'Village-level flood monitoring and evacuation coordination groups.',
      contact: 'Via PDMA Sindh',
      opportunity_type: 'Strengthen & equip',
    },
    {
      id: 'comm-3',
      title: 'OpenStreetMap Humanitarian Mapping – Active Tasks',
      type: 'Data gap',
      location: 'Multiple high-risk zones',
      description: 'Missing building footprints and road networks in flood-prone districts.',
      contact: 'hotosm.org',
      opportunity_type: 'Data contribution / mapping drive',
    },
  ];
}

// ---------- Real source fetchers (graceful fallback) ----------
async function fetchGDACS() {
  try {
    // GDACS RSS/JSON is public
    const r = await http('https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?fromDate=2024-01-01&toDate=2026-12-31&alertlevel=Orange;Red&limit=20', { timeout: 12000 });
    if (r.ok && Array.isArray(r.body?.features)) {
      return r.body.features.slice(0, 8).map((f) => {
        const p = f.properties || {};
        const hazardMap = { FL: 'Flood', DR: 'Drought', TC: 'Cyclone', EQ: 'Earthquake', VO: 'Volcano', WF: 'Wildfire' };
        const hazard = hazardMap[p.eventtype] || p.eventtype || 'Unknown';
        const title = p.name || p.eventname || `${hazard} Alert – ${p.country || 'Global'}`;
        return {
          id: `gdacs-${p.eventid || Math.random().toString(36).slice(2)}`,
          title: String(title).slice(0, 120),
          hazard,
          severity: p.alertlevel || 'Orange',
          location: p.country || 'Global',
          country: p.country || '',
          lat: f.geometry?.coordinates?.[1],
          lon: f.geometry?.coordinates?.[0],
          description: String(p.htmldescription || p.description || '').slice(0, 400),
          source: 'GDACS',
          source_url: typeof p.url === 'string' ? p.url : 'https://www.gdacs.org',
          published: p.fromdate || new Date().toISOString(),
          urgency: (p.alertlevel || '').toLowerCase() === 'red' ? 'critical' : 'high',
          opportunity_type: 'Immediate assessment & response planning',
          population_at_risk: typeof p.population === 'number' ? p.population : null,
        };
      });
    }
  } catch (e) {
    console.warn('GDACS fetch failed, using demo:', e.message);
  }
  return null; // signal to use demo
}

async function fetchUSGS() {
  try {
    const r = await http('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson', { timeout: 10000 });
    if (r.ok && r.body?.features) {
      return r.body.features.slice(0, 6).map((f) => ({
        id: `usgs-${f.id}`,
        title: `M${f.properties.mag} Earthquake – ${f.properties.place}`,
        hazard: 'Earthquake',
        severity: f.properties.mag >= 6 ? 'Orange' : 'Yellow',
        location: f.properties.place,
        country: f.properties.place?.split(',').pop()?.trim() || '',
        lat: f.geometry?.coordinates?.[1],
        lon: f.geometry?.coordinates?.[0],
        description: `Magnitude ${f.properties.mag}. Depth ${f.geometry?.coordinates?.[2]} km.`,
        source: 'USGS',
        source_url: f.properties.url,
        published: new Date(f.properties.time).toISOString(),
        urgency: f.properties.mag >= 6.5 ? 'high' : 'medium',
        opportunity_type: 'Structural assessment & community preparedness',
        population_at_risk: null,
      }));
    }
  } catch {}
  return null;
}

async function fetchOpenMeteo(lat = 24.86, lon = 67.00) {
  try {
    const r = await http(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,precipitation_sum,precipitation_probability_max&timezone=auto&forecast_days=7`, { timeout: 8000 });
    if (r.ok && r.body?.daily) {
      const d = r.body.daily;
      const maxTemp = Math.max(...(d.temperature_2m_max || [0]));
      const maxPrecip = Math.max(...(d.precipitation_sum || [0]));
      const alerts = [];
      if (maxTemp >= 40) {
        alerts.push({
          id: `meteo-heat-${Date.now()}`,
          title: `Extreme Heat Forecast – Peak ${maxTemp}°C`,
          hazard: 'Heatwave',
          severity: maxTemp >= 43 ? 'Red' : 'Orange',
          location: `Lat ${lat}, Lon ${lon}`,
          description: `7-day forecast shows peak temperature of ${maxTemp}°C. Heat stress risk elevated.`,
          source: 'Open-Meteo',
          source_url: 'https://open-meteo.com',
          published: new Date().toISOString(),
          urgency: maxTemp >= 43 ? 'critical' : 'high',
          opportunity_type: 'Heat action planning & cooling infrastructure',
        });
      }
      if (maxPrecip >= 50) {
        alerts.push({
          id: `meteo-rain-${Date.now()}`,
          title: `Heavy Precipitation Forecast – ${maxPrecip} mm`,
          hazard: 'Flood / Heavy Rain',
          severity: maxPrecip >= 100 ? 'Orange' : 'Yellow',
          location: `Lat ${lat}, Lon ${lon}`,
          description: `Significant rainfall expected in the coming days (${maxPrecip} mm peak).`,
          source: 'Open-Meteo',
          source_url: 'https://open-meteo.com',
          published: new Date().toISOString(),
          urgency: 'medium',
          opportunity_type: 'Drainage & flood preparedness',
        });
      }
      return alerts;
    }
  } catch {}
  return null;
}

async function fetchClimateNews(query) {
  const key = env('TAVILY_API_KEY') || env('SERPER_API_KEY');
  if (!key) return null;
  try {
    if (env('TAVILY_API_KEY')) {
      const r = await http('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: env('TAVILY_API_KEY'),
          query: `${query} climate resilience disaster preparedness funding OR heatwave OR flood adaptation`,
          search_depth: 'basic',
          max_results: 6,
        }),
        timeout: 12000,
      });
      if (r.ok && r.body?.results) {
        return r.body.results.map((item, i) => ({
          id: `news-${i}-${Date.now()}`,
          title: item.title,
          hazard: 'Information',
          severity: 'Info',
          location: 'Global',
          description: item.content?.slice(0, 280) || '',
          source: 'Climate News',
          source_url: item.url,
          published: item.published_date || new Date().toISOString(),
          urgency: 'low',
          opportunity_type: 'Knowledge / funding signal',
        }));
      }
    }
  } catch {}
  return null;
}

// ---------- Main discovery function ----------
export async function discoverSources(intent, onSource) {
  const results = [];
  const location = intent.location || 'Global';
  const hazards = intent.hazards || [];

  const run = async (src, fetcher) => {
    onSource?.({ id: src.id, name: src.name, status: 'running' });
    let items = null;
    try {
      items = await fetcher();
    } catch (e) {
      onSource?.({ id: src.id, name: src.name, status: 'error', error: e.message });
    }
    if (!items || items.length === 0) {
      // graceful demo fallback
      if (src.id === 'gdacs' || src.id === 'nasa_firms' || src.id === 'usgs_earthquake') {
        items = demoAlerts(location).filter((a) => {
          if (hazards.length === 0) return true;
          return hazards.some((h) => a.hazard.toLowerCase().includes(h.toLowerCase()));
        });
      } else if (src.id === 'funding') {
        items = demoFunding();
      } else if (src.id === 'community') {
        items = demoCommunity(location);
      } else if (src.id === 'open_meteo') {
        items = await fetchOpenMeteo(intent.lat || 24.86, intent.lon || 67.0) || [];
      } else {
        items = [];
      }
      onSource?.({ id: src.id, name: src.name, status: items.length ? 'demo' : 'empty', count: items.length });
    } else {
      onSource?.({ id: src.id, name: src.name, status: 'ok', count: items.length });
    }
    return items.map((it) => ({ ...it, source_id: src.id }));
  };

  // Parallel discovery
  const tasks = [
    run(LIVE_SOURCES[0], fetchGDACS),
    run(LIVE_SOURCES[4], fetchUSGS),
    run(LIVE_SOURCES[3], () => fetchOpenMeteo(intent.lat, intent.lon)),
    run(LIVE_SOURCES[5], () => fetchClimateNews(intent.query || location)),
    run(LIVE_SOURCES[7], async () => demoFunding()),
    run(LIVE_SOURCES[8], async () => demoCommunity(location)),
  ];

  const settled = await Promise.allSettled(tasks);
  for (const s of settled) {
    if (s.status === 'fulfilled' && Array.isArray(s.value)) {
      results.push(...s.value);
    }
  }

  // Earth Engine placeholder (real integration requires EE auth)
  onSource?.({ id: 'earth_engine', name: 'Google Earth Engine Signals', status: 'demo', count: 2 });
  results.push(
    {
      id: 'ee-flood-risk',
      title: 'Elevated Flood Risk Index – Target Region',
      hazard: 'Flood',
      severity: 'Orange',
      location,
      description: 'Earth Engine derived surface water anomaly + precipitation accumulation indicates elevated 7-day flood probability.',
      source: 'Google Earth Engine (demo)',
      source_url: 'https://earthengine.google.com',
      published: new Date().toISOString(),
      urgency: 'high',
      opportunity_type: 'Pre-position relief & early warning activation',
      source_id: 'earth_engine',
      ee_signal: true,
    },
    {
      id: 'ee-heat-stress',
      title: 'Land Surface Temperature Anomaly',
      hazard: 'Heatwave',
      severity: 'Red',
      location,
      description: 'MODIS LST anomaly > +4°C relative to 20-year baseline. Urban heat island intensification detected.',
      source: 'Google Earth Engine (demo)',
      source_url: 'https://earthengine.google.com',
      published: new Date().toISOString(),
      urgency: 'critical',
      opportunity_type: 'Targeted cooling interventions & public messaging',
      source_id: 'earth_engine',
      ee_signal: true,
    }
  );

  return results;
}

export function matchesSkills() {
  return true; // not used in this domain
}
