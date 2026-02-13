/**
 * Parse elevation profile CSV text into an array of objects.
 *
 * Expected CSV columns:
 *   lat, lon, ele, time, segment_distance_km, distance_km_cum,
 *   segment_time_s, elev_delta_m, elev_gain_pos_m, elev_gain_pos_cum_m, slope_percent
 *
 * All numeric columns are parsed to floats. The `time` column is kept as a string (ISO 8601).
 *
 * @param {string} csvText - Raw CSV text content
 * @returns {Array<Object>} Parsed rows with typed values
 */
export function parseElevationCsv(csvText) {
  if (!csvText || typeof csvText !== 'string') return [];

  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());

  // Columns that should be parsed as numbers
  const numericFields = new Set([
    'lat', 'lon', 'ele',
    'segment_distance_km', 'distance_km_cum',
    'segment_time_s', 'elev_delta_m',
    'elev_gain_pos_m', 'elev_gain_pos_cum_m', 'slope_percent',
  ]);

  return lines.slice(1).map(line => {
    const values = line.split(',');
    const row = {};
    headers.forEach((header, i) => {
      const val = (values[i] || '').trim();
      row[header] = numericFields.has(header) ? (parseFloat(val) || 0) : val;
    });
    return row;
  });
}
