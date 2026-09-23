// اختبارات حقيقية لمنطق التطبيق نفسه. التشغيل: node tests/core.test.cjs
const assert = require('node:assert/strict');
const C = require('../js/core.js');
let n = 0;
function t(name, fn) { fn(); n++; console.log('✓', name); }

t('haversine Muscat → Sur ≈ 163 km', () => {
  const d = C.haversineKm({ lat: 23.588, lng: 58.383 }, { lat: 22.566, lng: 59.528 });
  assert.ok(d > 160 && d < 166, d);
});

t('legs skip SKIPPED checkpoints and sum correctly', () => {
  const r = C.computeLegs({ lat: 23.588, lng: 58.383 },
    [{ lat: 23.15, lng: 58.9, status: 'PLANNED' }, { lat: 22.9, lng: 59.1, status: 'SKIPPED' }],
    { lat: 22.566, lng: 59.528 }, 'mixed');
  assert.equal(r.legs.length, 2);
  assert.equal(r.speed, 52);
  const sum = r.legs.reduce((a, l) => a + l.km, 0);
  assert.ok(Math.abs(sum - r.totalKm) < 0.2);
});

t('parseCoordPair handles Arabic digits and comma', () => {
  assert.deepEqual(C.parseCoordPair('٢٣٫٥٨٨، ٥٨٫٣٨٣'), { lat: 23.588, lng: 58.383 });
  assert.deepEqual(C.parseCoordPair('23.5,58.4'), { lat: 23.5, lng: 58.4 });
  assert.equal(C.parseCoordPair('999, 1'), null);
  assert.equal(C.parseCoordPair('hello'), null);
});

t('acceptFix rejects inaccurate, jitter and impossible jumps', () => {
  const a = { lat: 23.5880, lng: 58.3830, acc: 5, t: 0 };
  assert.equal(C.acceptFix(null, a), true);
  assert.equal(C.acceptFix(a, { lat: 23.6, lng: 58.4, acc: 120, t: 60000 }), false); // poor accuracy
  assert.equal(C.acceptFix(a, { lat: 23.58801, lng: 58.38301, acc: 5, t: 1000 }), false); // ~1.5 m jitter
  assert.equal(C.acceptFix(a, { lat: 23.5890, lng: 58.3830, acc: 5, t: 10000 }), true); // 111 m in 10 s
  assert.equal(C.acceptFix(a, { lat: 24.5880, lng: 58.3830, acc: 5, t: 10000 }), false); // 111 km in 10 s
});

t('GPX is valid XML with <name>, namespace, escaping, no fake elevation', () => {
  const gpx = C.buildGpx({
    name: 'رحلة <الشرقية> & "صور"',
    waypoints: [{ lat: 23.15, lng: 58.9, name: 'وادي & العق', notes: 'وقود' }],
    track: [{ lat: 23.588, lng: 58.383, t: 0, alt: 12.5 }, { lat: 23.589, lng: 58.384, t: 60000, alt: null }],
    now: 0,
  });
  assert.ok(gpx.includes('xmlns="http://www.topografix.com/GPX/1/1"'));
  assert.ok(!/<n>/.test(gpx), 'no bogus <n> tag');
  assert.ok(gpx.includes('&lt;الشرقية&gt; &amp; &quot;صور&quot;'));
  assert.equal((gpx.match(/<ele>/g) || []).length, 1, 'only real elevation written');
  assert.equal((gpx.match(/<trkpt /g) || []).length, 2);
  assert.equal((gpx.match(/<wpt /g) || []).length, 1);
});

t('trackStats distance/duration/speed', () => {
  const s = C.trackStats([{ lat: 23.588, lng: 58.383, t: 0 }, { lat: 23.598, lng: 58.383, t: 3600000 }]);
  assert.ok(s.km > 1.1 && s.km < 1.12, s.km);
  assert.equal(s.durationMs, 3600000);
  assert.equal(s.avgKmh, 1.1);
});

t('Google Maps URL includes waypoints and excludes skipped', () => {
  const u = C.googleMapsDirUrl({ lat: 1, lng: 2 }, [{ lat: 3, lng: 4 }, { lat: 5, lng: 6, status: 'SKIPPED' }], { lat: 7, lng: 8 });
  assert.ok(u.includes('origin=1.000000,2.000000'));
  assert.ok(decodeURIComponent(u).includes('waypoints=3.000000,4.000000'));
  assert.ok(!u.includes('5.000000'));
});

t('legacy snapshot from old version is migrated', () => {
  const raw = JSON.stringify({ key: '23.588,58.383|23.15,58.9;22.8,59.2|22.566,59.528' });
  const m = C.migrateLegacySnapshot(raw);
  assert.equal(m.waypoints.length, 2);
  assert.equal(m.dest.lng, 59.528);
  assert.equal(C.migrateLegacySnapshot('{"key":"23.5,58.3||22.5,59.5"}').waypoints.length, 0);
  assert.equal(C.migrateLegacySnapshot('garbage'), null);
});

t('formatDuration ar/en', () => {
  assert.equal(C.formatDuration(185, 'ar'), '3 س 05 د');
  assert.equal(C.formatDuration(45, 'en'), '45m');
});

console.log(`\nنجحت ${n} اختبارات / ${n} tests passed`);
