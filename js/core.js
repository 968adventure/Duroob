/*
 * دروب — المنطق الأساسي (بدون أي اعتماد على المتصفح، قابل للاختبار في Node).
 * Duroob core logic: distances, route legs, track filtering, GPX export.
 */
(function (root) {
  'use strict';

  const EARTH_R_KM = 6371.0088;

  /** Average travel speeds (km/h) used for the rough time estimate. */
  const TERRAIN_SPEEDS = { highway: 85, mixed: 52, offroad: 28 };

  const STATUSES = ['PLANNED', 'REACHED', 'DELAYED', 'SKIPPED'];

  function toRad(d) { return (d * Math.PI) / 180; }

  /** Great-circle distance in km between {lat,lng} points. */
  function haversineKm(a, b) {
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * EARTH_R_KM * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  function isValidLat(v) { return typeof v === 'number' && Number.isFinite(v) && v >= -90 && v <= 90; }
  function isValidLng(v) { return typeof v === 'number' && Number.isFinite(v) && v >= -180 && v <= 180; }
  function isValidPoint(p) { return !!p && isValidLat(p.lat) && isValidLng(p.lng); }

  /**
   * Accepts "23.588, 58.383", "23.588 58.383", Arabic-Indic digits and the
   * Arabic comma "،". Returns {lat,lng} or null.
   */
  function parseCoordPair(text) {
    if (typeof text !== 'string') return null;
    const western = text
      .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
      .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
      .replace(/٫/g, '.')
      .replace(/،/g, ',');
    const nums = western.match(/-?\d+(?:\.\d+)?/g);
    if (!nums || nums.length < 2) return null;
    const lat = parseFloat(nums[0]);
    const lng = parseFloat(nums[1]);
    const p = { lat, lng };
    return isValidPoint(p) ? p : null;
  }

  function round(v, n) { const f = 10 ** n; return Math.round(v * f) / f; }

  /**
   * Builds the ordered list of route legs. Skipped checkpoints are left out of the
   * route (you are not going there), but still shown in the checkpoint list.
   */
  function computeLegs(start, waypoints, dest, terrain) {
    const speed = TERRAIN_SPEEDS[terrain] || TERRAIN_SPEEDS.mixed;
    const active = (waypoints || []).filter((w) => w.status !== 'SKIPPED' && isValidPoint(w));
    const pts = [
      { kind: 'start', ref: null, lat: start.lat, lng: start.lng },
      ...active.map((w) => ({ kind: 'wp', ref: w, lat: w.lat, lng: w.lng })),
      { kind: 'dest', ref: null, lat: dest.lat, lng: dest.lng },
    ];
    const legs = [];
    let totalKm = 0;
    let totalMin = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const km = haversineKm(pts[i], pts[i + 1]);
      const min = Math.round((km / speed) * 60);
      totalKm += km;
      totalMin += min;
      legs.push({ index: i + 1, from: pts[i], to: pts[i + 1], km: round(km, 1), minutes: min });
    }
    return { legs, totalKm: round(totalKm, 1), totalMinutes: totalMin, speed, points: pts };
  }

  /** "3 س 05 د" / "3h 05m" */
  function formatDuration(minutes, lang) {
    const m = Math.max(0, Math.round(minutes));
    const h = Math.floor(m / 60);
    const r = m % 60;
    if (lang === 'en') return h > 0 ? `${h}h ${String(r).padStart(2, '0')}m` : `${r}m`;
    return h > 0 ? `${h} س ${String(r).padStart(2, '0')} د` : `${r} د`;
  }

  /**
   * Track recording filter. Rejects:
   *  - fixes with poor accuracy (> maxAccuracyM),
   *  - jitter while standing still (moved less than the combined accuracy radius and < minMoveM),
   *  - impossible jumps (implied speed > 250 km/h).
   */
  function acceptFix(prev, fix, opts) {
    const o = Object.assign({ maxAccuracyM: 50, minMoveM: 5, maxSpeedKmh: 250 }, opts || {});
    if (!isValidPoint(fix)) return false;
    if (typeof fix.acc === 'number' && fix.acc > o.maxAccuracyM) return false;
    if (!prev) return true;
    const dKm = haversineKm(prev, fix);
    const dM = dKm * 1000;
    const jitterRadius = Math.max(o.minMoveM, ((prev.acc || 0) + (fix.acc || 0)) / 2);
    if (dM < jitterRadius) return false;
    const dtH = (fix.t - prev.t) / 3600000;
    if (dtH > 0 && dKm / dtH > o.maxSpeedKmh) return false;
    return true;
  }

  function trackStats(fixes) {
    let km = 0;
    for (let i = 1; i < fixes.length; i++) km += haversineKm(fixes[i - 1], fixes[i]);
    const durationMs = fixes.length > 1 ? fixes[fixes.length - 1].t - fixes[0].t : 0;
    const hours = durationMs / 3600000;
    return {
      points: fixes.length,
      km: round(km, 2),
      durationMs,
      avgKmh: hours > 0 ? round(km / hours, 1) : 0,
    };
  }

  function escapeXml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /** Valid GPX 1.1: route points as <wpt>, recorded track as <trk>. */
  function buildGpx(opts) {
    const name = escapeXml(opts.name || 'Duroob');
    const time = new Date(opts.now || Date.now()).toISOString();
    const lines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<gpx version="1.1" creator="Duroob" xmlns="http://www.topografix.com/GPX/1/1">',
      `  <metadata><name>${name}</name><time>${time}</time></metadata>`,
    ];
    for (const w of opts.waypoints || []) {
      if (!isValidPoint(w)) continue;
      lines.push(`  <wpt lat="${w.lat.toFixed(6)}" lon="${w.lng.toFixed(6)}"><name>${escapeXml(w.name)}</name>` +
        (w.notes ? `<desc>${escapeXml(w.notes)}</desc>` : '') + '</wpt>');
    }
    const fixes = opts.track || [];
    if (fixes.length) {
      lines.push(`  <trk><name>${name}</name><trkseg>`);
      for (const f of fixes) {
        let pt = `    <trkpt lat="${f.lat.toFixed(6)}" lon="${f.lng.toFixed(6)}">`;
        if (typeof f.alt === 'number' && Number.isFinite(f.alt)) pt += `<ele>${f.alt.toFixed(1)}</ele>`;
        pt += `<time>${new Date(f.t).toISOString()}</time></trkpt>`;
        lines.push(pt);
      }
      lines.push('  </trkseg></trk>');
    }
    lines.push('</gpx>');
    return lines.join('\n');
  }

  /** Google Maps driving directions including (up to 9) intermediate checkpoints. */
  function googleMapsDirUrl(start, waypoints, dest) {
    const f = (p) => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`;
    const active = (waypoints || []).filter((w) => w.status !== 'SKIPPED' && isValidPoint(w)).slice(0, 9);
    let url = `https://www.google.com/maps/dir/?api=1&origin=${f(start)}&destination=${f(dest)}&travelmode=driving`;
    if (active.length) url += `&waypoints=${encodeURIComponent(active.map(f).join('|'))}`;
    return url;
  }

  function mapsPinUrl(p) { return `https://maps.google.com/?q=${p.lat.toFixed(6)},${p.lng.toFixed(6)}`; }

  /**
   * Migrates the route saved by the previous version (key
   * "trip_intelligence_last_route", value {key:"lat,lng|lat,lng;lat,lng|lat,lng"}).
   */
  function migrateLegacySnapshot(raw) {
    try {
      const snap = JSON.parse(raw);
      const parts = String(snap.key || '').split('|');
      if (parts.length !== 3) return null;
      const pt = (s) => { const [a, b] = s.split(',').map(Number); const p = { lat: a, lng: b }; return isValidPoint(p) ? p : null; };
      const start = pt(parts[0]);
      const dest = pt(parts[2]);
      if (!start || !dest) return null;
      const wps = parts[1] ? parts[1].split(';').map(pt).filter(Boolean) : [];
      return { start, dest, waypoints: wps };
    } catch (e) {
      return null;
    }
  }

  const api = {
    TERRAIN_SPEEDS, STATUSES, haversineKm, isValidLat, isValidLng, isValidPoint,
    parseCoordPair, computeLegs, formatDuration, acceptFix, trackStats, escapeXml,
    buildGpx, googleMapsDirUrl, mapsPinUrl, migrateLegacySnapshot, round,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DuroobCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
