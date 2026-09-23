/* دروب — تطبيق الواجهة */
(function () {
  'use strict';
  const C = window.DuroobCore;

  // ---------- Storage ----------
  const STATE_KEY = 'duroob.state.v1';
  const TRACK_KEY = 'duroob.track.v1';
  const LEGACY_KEY = 'trip_intelligence_last_route';

  const DEFAULT_STATE = {
    start: { lat: 23.588, lng: 58.383 },
    dest: { lat: 22.566, lng: 59.528 },
    waypoints: [
      { id: 'wp_demo', lat: 23.15, lng: 58.9, name: 'نقطة تجمع', status: 'PLANNED', notes: 'تزوّد بالوقود وتأكد من ضغط الإطارات' },
    ],
    terrain: 'mixed',
    theme: 'day',
    lang: 'ar',
    layer: 'map',
    savedAt: 0,
  };

  function safeGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function safeSet(key, val) { try { localStorage.setItem(key, val); return true; } catch (e) { return false; } }

  function loadState() {
    const raw = safeGet(STATE_KEY);
    if (raw) {
      try {
        const s = JSON.parse(raw);
        if (C.isValidPoint(s.start) && C.isValidPoint(s.dest) && Array.isArray(s.waypoints)) {
          return Object.assign({}, DEFAULT_STATE, s, {
            waypoints: s.waypoints.filter(C.isValidPoint).map((w) => ({
              id: String(w.id || newId()), lat: w.lat, lng: w.lng,
              name: String(w.name || ''), notes: String(w.notes || ''),
              status: C.STATUSES.includes(w.status) ? w.status : 'PLANNED',
            })),
          });
        }
      } catch (e) { /* fall through */ }
    }
    // First run after updating from the old version: bring back its last route.
    const legacy = safeGet(LEGACY_KEY);
    const m = legacy && C.migrateLegacySnapshot(legacy);
    if (m) {
      return Object.assign({}, DEFAULT_STATE, {
        start: m.start, dest: m.dest,
        waypoints: m.waypoints.map((p, i) => ({ id: newId(), lat: p.lat, lng: p.lng, name: `نقطة ${i + 1}`, notes: '', status: 'PLANNED' })),
      });
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  function loadTrack() {
    try {
      const t = JSON.parse(safeGet(TRACK_KEY) || 'null');
      if (t && Array.isArray(t.fixes)) return { fixes: t.fixes.filter(C.isValidPoint), wasRecording: !!t.recording };
    } catch (e) { /* ignore */ }
    return { fixes: [], wasRecording: false };
  }

  let state = loadState();
  const trackLoaded = loadTrack();
  let fixes = trackLoaded.fixes;
  let recording = false;
  let watchId = null;
  let wakeLock = null;
  let lastRawFix = null; // last position from GPS (even if not stored in track)
  let pickMode = null;   // 'start' | 'dest' | 'wp'
  let trackSaveTimer = null;

  function newId() { return 'wp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function saveState() {
    state.savedAt = Date.now();
    const ok = safeSet(STATE_KEY, JSON.stringify(state));
    el.savedAt.textContent = ok
      ? t('savedAt', { time: new Date(state.savedAt).toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' }) })
      : t('saveFailed');
  }

  function saveTrackSoon() {
    if (trackSaveTimer) return;
    trackSaveTimer = setTimeout(() => {
      trackSaveTimer = null;
      if (!safeSet(TRACK_KEY, JSON.stringify({ fixes, recording }))) showBanner(t('trackStorageFull'), 'error');
    }, 3000);
  }
  function saveTrackNow() {
    clearTimeout(trackSaveTimer); trackSaveTimer = null;
    safeSet(TRACK_KEY, JSON.stringify({ fixes, recording }));
  }

  // ---------- i18n ----------
  const I18N = {
    ar: {
      appName: 'دروب', tagline: 'مخطط رحلات البر', globalActions: 'إجراءات عامة', map: 'الخريطة',
      sos: 'طوارئ', themeNight: 'ليلي', themeDay: 'نهاري', close: 'إغلاق', cancel: 'إلغاء', delete: 'حذف', gotIt: 'تم',
      showMyLocation: 'موقعي على الخريطة', fitRoute: 'عرض المسار كاملاً', layerSat: 'قمر صناعي', layerMap: 'خريطة',
      straightLineNote: 'مسافة بخط مستقيم بين النقاط، والوقت تقدير حسب نوع الطريق. للمسار الفعلي على الطرق استخدم خرائط Google.',
      tabRoute: 'المسار', tabTrack: 'تسجيل المسار',
      start: 'نقطة الانطلاق', dest: 'الوجهة النهائية', myLocation: 'موقعي', pickOnMap: 'من الخريطة',
      lat: 'خط العرض', lng: 'خط الطول', checkpoints: 'نقاط التجمع', addMyLocation: '+ موقعي', addFromMap: '+ من الخريطة',
      wpEmpty: 'لا توجد نقاط تجمع. أضف نقطة من الخريطة أو من موقعك الحالي.',
      terrain: 'نوع الطريق الغالب', terrainHighway: 'طرق معبّدة (85 كم/س)', terrainMixed: 'مختلط: أودية ومدقّات (52 كم/س)', terrainOffroad: 'رمال وكثبان (28 كم/س)',
      legs: 'مقاطع المسار', openGoogle: 'افتح المسار في خرائط Google', shareRoute: 'مشاركة المسار', exportRouteGpx: 'تصدير النقاط GPX',
      recordStart: 'ابدأ التسجيل', recordResume: 'تابع التسجيل', recordStop: 'أوقف التسجيل',
      recordHint: 'أبقِ التطبيق مفتوحاً والشاشة تعمل أثناء التسجيل؛ المتصفح يوقف GPS إذا انتقلت لتطبيق آخر.',
      statDistance: 'المسافة', statDuration: 'المدة', statAvg: 'متوسط السرعة', statSpeed: 'السرعة الآن', statPoints: 'النقاط', statAcc: 'دقة GPS',
      exportTrackGpx: 'تصدير المسار المسجّل GPX', clearTrack: 'مسح المسار',
      savedLocal: 'محفوظ على هذا الجهاز', savedAt: 'حُفظ على الجهاز {time}', saveFailed: 'تعذّر الحفظ: مساحة المتصفح ممتلئة',
      online: 'متصل', offline: 'دون اتصال — الخرائط المحفوظة فقط',
      sosTitle: 'طوارئ', sosCoordsHint: 'آخر موقع معروف. اضغط «تحديث موقعي» للحصول على موقع جديد.',
      call9999: 'اتصل بالطوارئ 9999 (عُمان)', shareMyLocation: 'أرسل موقعي', copyCoords: 'نسخ الإحداثيات', refreshLocation: 'تحديث موقعي',
      otherNumbers: 'أرقام أخرى: الإمارات 999، السعودية 911، والرقم الدولي 112 يعمل من أي شبكة GSM.',
      noLocationYet: 'لا يوجد موقع بعد', accuracy: 'الدقة ±{acc} م.',
      geoTitle: 'تفعيل إذن الموقع', geoStep1: 'اضغط على رمز القفل أو الإعدادات بجانب عنوان الصفحة.', geoStep2: 'افتح «الأذونات» ثم «الموقع».',
      geoStep3: 'اختر «السماح»، وتأكد أن خدمة الموقع مفعّلة في إعدادات الهاتف.', geoStep4: 'ارجع واضغط زر «موقعي» مرة أخرى.',
      pickStart: 'اضغط على الخريطة لتحديد نقطة الانطلاق', pickDest: 'اضغط على الخريطة لتحديد الوجهة', pickWp: 'اضغط على الخريطة لإضافة نقطة تجمع',
      locating: 'جارٍ تحديد موقعك بدقة عالية…', locatingNetwork: 'إشارة الأقمار ضعيفة، نحاول بالشبكة…',
      located: 'تم تحديد موقعك (±{acc} م)', geoUnsupported: 'هذا المتصفح لا يدعم تحديد الموقع',
      geoDenied: 'إذن الموقع مرفوض.', geoHow: 'كيف أفعّله؟', geoTimeout: 'لم تصل إشارة GPS. اخرج لمكان مكشوف وحاول مجدداً.', geoFailed: 'تعذّر تحديد الموقع.',
      geoInsecure: 'تحديد الموقع يحتاج فتح التطبيق من رابط https.',
      wpName: 'اسم النقطة', wpStatus: 'حالة النقطة', wpNotes: 'ملاحظة (وقود، مدقّ رملي…)', wpDefaultName: 'نقطة {n}', wpMyLocation: 'موقعي {time}',
      moveUp: 'تحريك للأعلى', moveDown: 'تحريك للأسفل', removeWp: 'حذف النقطة', wpRemoved: 'حُذفت «{name}»', undo: 'تراجع',
      PLANNED: 'مخطَّطة', REACHED: 'وصلنا', DELAYED: 'متأخرة', SKIPPED: 'تجاوزناها (خارج المسار)',
      km: 'كم', kmh: 'كم/س', m: 'م', total: 'الإجمالي',
      legFromStart: 'الانطلاق', legToDest: 'الوجهة',
      invalidCoord: 'إحداثية غير صحيحة', coordsPasted: 'تم لصق الإحداثيتين',
      copied: 'تم النسخ', shareFallback: 'تم نسخ الرابط؛ الصقه في واتساب أو الرسائل',
      exported: 'تم تصدير الملف {file}', nothingToExport: 'لا توجد نقاط مسجّلة للتصدير',
      clearTrackTitle: 'مسح المسار المسجّل؟', clearTrackText: 'سيُحذف {n} نقطة نهائياً من هذا الجهاز. صدّر ملف GPX أولاً إن احتجته.',
      trackCleared: 'تم مسح المسار', resumePrompt: 'كان التسجيل يعمل قبل إغلاق الصفحة. {n} نقطة محفوظة.',
      trackStorageFull: 'مساحة التخزين ممتلئة؛ صدّر المسار GPX وامسحه',
      wakeLockOn: 'الشاشة ستبقى مضاءة أثناء التسجيل', wakeLockOff: 'لا يدعم المتصفح إبقاء الشاشة مضاءة؛ اضبط مهلة الشاشة يدوياً',
      recordingStopped: 'توقف التسجيل. النقاط محفوظة.', gpsLost: 'انقطعت إشارة GPS مؤقتاً…',
      shareRouteText: 'مسار رحلتنا ({km} كم، {n} نقطة تجمع):', shareLocText: 'موقعي الآن:', routeName: 'مسار دروب', trackName: 'مسار مسجّل دروب',
      updateReady: 'نسخة جديدة جاهزة', reload: 'تحديث',
    },
    en: {
      appName: 'Duroob', tagline: 'Overland trip planner', globalActions: 'Global actions', map: 'Map',
      sos: 'SOS', themeNight: 'Night', themeDay: 'Day', close: 'Close', cancel: 'Cancel', delete: 'Delete', gotIt: 'Got it',
      showMyLocation: 'Show my location', fitRoute: 'Show whole route', layerSat: 'Satellite', layerMap: 'Map',
      straightLineNote: 'Straight-line distance between points; time is an estimate by road type. Use Google Maps for the actual road route.',
      tabRoute: 'Route', tabTrack: 'Record track',
      start: 'Start', dest: 'Destination', myLocation: 'My location', pickOnMap: 'Pick on map',
      lat: 'Latitude', lng: 'Longitude', checkpoints: 'Checkpoints', addMyLocation: '+ My location', addFromMap: '+ From map',
      wpEmpty: 'No checkpoints yet. Add one from the map or your current location.',
      terrain: 'Main road type', terrainHighway: 'Paved roads (85 km/h)', terrainMixed: 'Mixed: wadis and tracks (52 km/h)', terrainOffroad: 'Sand and dunes (28 km/h)',
      legs: 'Route legs', openGoogle: 'Open route in Google Maps', shareRoute: 'Share route', exportRouteGpx: 'Export points as GPX',
      recordStart: 'Start recording', recordResume: 'Resume recording', recordStop: 'Stop recording',
      recordHint: 'Keep the app open and the screen on while recording; browsers stop GPS when you switch apps.',
      statDistance: 'Distance', statDuration: 'Duration', statAvg: 'Avg speed', statSpeed: 'Speed now', statPoints: 'Points', statAcc: 'GPS accuracy',
      exportTrackGpx: 'Export recorded track (GPX)', clearTrack: 'Clear track',
      savedLocal: 'Saved on this device', savedAt: 'Saved on device {time}', saveFailed: 'Could not save: browser storage is full',
      online: 'Online', offline: 'Offline — cached maps only',
      sosTitle: 'Emergency', sosCoordsHint: 'Last known position. Tap “Refresh location” for a new fix.',
      call9999: 'Call emergency 9999 (Oman)', shareMyLocation: 'Send my location', copyCoords: 'Copy coordinates', refreshLocation: 'Refresh location',
      otherNumbers: 'Other numbers: UAE 999, Saudi Arabia 911, and 112 works on any GSM network.',
      noLocationYet: 'No position yet', accuracy: 'Accuracy ±{acc} m.',
      geoTitle: 'Allow location access', geoStep1: 'Tap the lock or settings icon next to the page address.', geoStep2: 'Open “Permissions”, then “Location”.',
      geoStep3: 'Choose “Allow” and make sure location is on in your phone settings.', geoStep4: 'Come back and tap “My location” again.',
      pickStart: 'Tap the map to set the start', pickDest: 'Tap the map to set the destination', pickWp: 'Tap the map to add a checkpoint',
      locating: 'Getting a high-accuracy fix…', locatingNetwork: 'Weak satellite signal, trying network location…',
      located: 'Location found (±{acc} m)', geoUnsupported: 'This browser does not support location',
      geoDenied: 'Location permission denied.', geoHow: 'How to allow', geoTimeout: 'No GPS signal. Move to open sky and try again.', geoFailed: 'Could not get your location.',
      geoInsecure: 'Location needs the app to be opened over https.',
      wpName: 'Checkpoint name', wpStatus: 'Checkpoint status', wpNotes: 'Note (fuel, sand track…)', wpDefaultName: 'Point {n}', wpMyLocation: 'My location {time}',
      moveUp: 'Move up', moveDown: 'Move down', removeWp: 'Remove checkpoint', wpRemoved: 'Removed “{name}”', undo: 'Undo',
      PLANNED: 'Planned', REACHED: 'Reached', DELAYED: 'Delayed', SKIPPED: 'Skipped (not on route)',
      km: 'km', kmh: 'km/h', m: 'm', total: 'Total',
      legFromStart: 'Start', legToDest: 'Destination',
      invalidCoord: 'Invalid coordinate', coordsPasted: 'Both coordinates pasted',
      copied: 'Copied', shareFallback: 'Link copied; paste it into WhatsApp or Messages',
      exported: 'Exported {file}', nothingToExport: 'No recorded points to export',
      clearTrackTitle: 'Clear the recorded track?', clearTrackText: '{n} points will be permanently deleted from this device. Export GPX first if you need it.',
      trackCleared: 'Track cleared', resumePrompt: 'Recording was running when the page closed. {n} points saved.',
      trackStorageFull: 'Storage is full; export the track as GPX and clear it',
      wakeLockOn: 'Screen will stay on while recording', wakeLockOff: 'This browser cannot keep the screen on; set the screen timeout manually',
      recordingStopped: 'Recording stopped. Points are saved.', gpsLost: 'GPS signal lost for now…',
      shareRouteText: 'Our trip route ({km} km, {n} checkpoints):', shareLocText: 'My location now:', routeName: 'Duroob route', trackName: 'Duroob recorded track',
      updateReady: 'A new version is ready', reload: 'Reload',
    },
  };

  function t(key, vars) {
    let s = (I18N[state.lang] && I18N[state.lang][key]) || I18N.ar[key] || key;
    if (vars) for (const k of Object.keys(vars)) s = s.split('{' + k + '}').join(String(vars[k]));
    return s;
  }
  function locale() { return state.lang === 'en' ? 'en-GB' : 'ar-OM-u-nu-latn'; }
  function fmtNum(v, d) { return Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); }

  function applyI18n() {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
    document.title = state.lang === 'ar' ? 'دروب — مخطط رحلات البر' : 'Duroob — Overland trip planner';
    document.querySelectorAll('[data-i18n]').forEach((n) => { n.textContent = t(n.dataset.i18n); });
    document.querySelectorAll('[data-i18n-attr]').forEach((n) => {
      n.dataset.i18nAttr.split(',').forEach((pair) => {
        const [attr, key] = pair.split(':');
        n.setAttribute(attr.trim(), t(key.trim()));
      });
    });
    el.langBtn.textContent = state.lang === 'ar' ? 'EN' : 'عربي';
    el.langBtn.lang = state.lang === 'ar' ? 'en' : 'ar';
    el.themeBtn.textContent = state.theme === 'day' ? t('themeNight') : t('themeDay');
    el.layerBtn.textContent = state.layer === 'map' ? t('layerSat') : t('layerMap');
    updateOnline();
  }

  // ---------- DOM refs ----------
  const $ = (id) => document.getElementById(id);
  const el = {
    langBtn: $('langBtn'), themeBtn: $('themeBtn'), sosBtn: $('sosBtn'), layerBtn: $('layerBtn'),
    banner: $('banner'), bannerText: $('bannerText'), bannerAction: $('bannerAction'), bannerClose: $('bannerClose'),
    startLat: $('startLat'), startLng: $('startLng'), destLat: $('destLat'), destLng: $('destLng'),
    terrain: $('terrain'), wpList: $('wpList'), wpEmpty: $('wpEmpty'), legList: $('legList'),
    sumKm: $('sumKm'), sumTime: $('sumTime'), gmapsBtn: $('gmapsBtn'),
    pickNotice: $('pickNotice'), pickNoticeText: $('pickNoticeText'),
    recordBtn: $('recordBtn'), exportTrackBtn: $('exportTrackBtn'), clearTrackBtn: $('clearTrackBtn'),
    stDist: $('stDist'), stDur: $('stDur'), stAvg: $('stAvg'), stSpeed: $('stSpeed'), stPts: $('stPts'), stAcc: $('stAcc'),
    savedAt: $('savedAt'), offlineState: $('offlineState'),
    sosDialog: $('sosDialog'), sosCoords: $('sosCoords'), geoDialog: $('geoDialog'),
    confirmDialog: $('confirmDialog'), confirmTitle: $('confirmTitle'), confirmText: $('confirmText'),
  };

  // ---------- Banner ----------
  let bannerTimer = null;
  function showBanner(text, kind, action) {
    clearTimeout(bannerTimer);
    el.banner.hidden = false;
    el.banner.className = 'banner' + (kind === 'error' ? ' is-error' : kind === 'ok' ? ' is-ok' : '');
    el.bannerText.textContent = text;
    if (action) {
      el.bannerAction.hidden = false;
      el.bannerAction.textContent = action.label;
      el.bannerAction.onclick = () => { hideBanner(); action.run(); };
    } else {
      el.bannerAction.hidden = true;
      el.bannerAction.onclick = null;
    }
    if (kind !== 'sticky') bannerTimer = setTimeout(hideBanner, action ? 8000 : 5000);
  }
  function hideBanner() { el.banner.hidden = true; }
  el.bannerClose.addEventListener('click', hideBanner);

  // ---------- Map ----------
  const map = L.map('map', { zoomControl: true, attributionControl: true }).setView([state.start.lat, state.start.lng], 8);
  const layers = {
    map: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }),
    sat: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19, attribution: 'Imagery &copy; Esri, Maxar, Earthstar Geographics',
    }),
  };
  layers[state.layer === 'sat' ? 'sat' : 'map'].addTo(map);

  function pinIcon(cls, label) {
    return L.divIcon({
      className: '',
      html: `<div class="pin ${cls}">${label == null ? '' : `<span style="${cls === 'pin-dest' ? 'transform:rotate(-45deg)' : ''}">${Number(label)}</span>`}</div>`,
      iconSize: [30, 30], iconAnchor: [15, 15],
    });
  }
  function textPopup(title, sub) {
    const d = document.createElement('div');
    const b = document.createElement('strong'); b.textContent = title; d.appendChild(b);
    if (sub) { const p = document.createElement('div'); p.textContent = sub; d.appendChild(p); }
    return d;
  }

  const startMarker = L.marker([state.start.lat, state.start.lng], { draggable: true, icon: pinIcon('pin-start'), keyboard: true }).addTo(map);
  const destMarker = L.marker([state.dest.lat, state.dest.lng], { draggable: true, icon: pinIcon('pin-dest'), keyboard: true }).addTo(map);
  startMarker.on('dragend', (e) => { setPoint('start', e.target.getLatLng()); });
  destMarker.on('dragend', (e) => { setPoint('dest', e.target.getLatLng()); });
  const routeLine = L.polyline([], { color: '#26235C', weight: 4, dashArray: '10 8', opacity: 0.9 }).addTo(map);
  const trackLine = L.polyline([], { color: '#2F6B4F', weight: 5, opacity: 0.9 }).addTo(map);
  let meMarker = null;
  let wpLayer = L.layerGroup().addTo(map);

  map.on('click', (e) => {
    if (!pickMode) return;
    const p = { lat: C.round(e.latlng.lat, 5), lng: C.round(e.latlng.lng, 5) };
    if (pickMode === 'wp') addWaypoint(p, t('wpDefaultName', { n: state.waypoints.length + 1 }));
    else setPoint(pickMode, p);
    setPickMode(null);
  });

  function fitRoute() {
    const pts = [state.start, ...state.waypoints, state.dest, ...fixes].map((p) => [p.lat, p.lng]);
    if (pts.length) map.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 14 });
  }

  function setPickMode(mode) {
    pickMode = pickMode === mode ? null : mode;
    document.querySelectorAll('[data-pick]').forEach((b) => b.classList.toggle('is-active', b.dataset.pick === pickMode));
    el.pickNotice.hidden = !pickMode;
    map.getContainer().style.cursor = pickMode ? 'crosshair' : '';
    if (pickMode) el.pickNoticeText.textContent = t(pickMode === 'start' ? 'pickStart' : pickMode === 'dest' ? 'pickDest' : 'pickWp');
  }

  // ---------- State mutations ----------
  function setPoint(which, latlng) {
    const p = { lat: C.round(latlng.lat, 5), lng: C.round(latlng.lng, 5) };
    if (!C.isValidPoint(p)) return;
    state[which] = p;
    render();
  }

  function addWaypoint(p, name) {
    state.waypoints.push({ id: newId(), lat: C.round(p.lat, 5), lng: C.round(p.lng, 5), name, notes: '', status: 'PLANNED' });
    render();
  }

  function removeWaypoint(id) {
    const idx = state.waypoints.findIndex((w) => w.id === id);
    if (idx < 0) return;
    const [removed] = state.waypoints.splice(idx, 1);
    render();
    showBanner(t('wpRemoved', { name: removed.name || '—' }), null, {
      label: t('undo'),
      run: () => { state.waypoints.splice(Math.min(idx, state.waypoints.length), 0, removed); render(); },
    });
  }

  function moveWaypoint(idx, dir) {
    const j = idx + dir;
    if (j < 0 || j >= state.waypoints.length) return;
    const a = state.waypoints;
    [a[idx], a[j]] = [a[j], a[idx]];
    render();
  }

  // ---------- Rendering ----------
  function render() {
    writeCoordInputs();
    renderWaypoints();
    renderRoute();
    saveState();
  }

  function writeCoordInputs() {
    for (const [which, latEl, lngEl] of [['start', el.startLat, el.startLng], ['dest', el.destLat, el.destLng]]) {
      if (document.activeElement !== latEl) latEl.value = fmtCoord(state[which].lat);
      if (document.activeElement !== lngEl) lngEl.value = fmtCoord(state[which].lng);
      latEl.removeAttribute('aria-invalid'); lngEl.removeAttribute('aria-invalid');
    }
    el.terrain.value = state.terrain;
  }
  function fmtCoord(v) { return String(C.round(v, 5)); }

  function renderWaypoints() {
    el.wpList.replaceChildren();
    wpLayer.clearLayers();
    el.wpEmpty.hidden = state.waypoints.length > 0;

    state.waypoints.forEach((wp, idx) => {
      const n = idx + 1;
      // Map marker
      const cls = 'pin-wp' + (wp.status === 'REACHED' ? ' is-reached' : wp.status === 'DELAYED' ? ' is-delayed' : wp.status === 'SKIPPED' ? ' is-skipped' : '');
      const mk = L.marker([wp.lat, wp.lng], { draggable: true, icon: pinIcon(cls, n) });
      mk.bindPopup(() => textPopup(`${n}. ${wp.name || '—'}`, wp.notes));
      mk.on('dragend', (e) => { const ll = e.target.getLatLng(); wp.lat = C.round(ll.lat, 5); wp.lng = C.round(ll.lng, 5); render(); });
      wpLayer.addLayer(mk);

      // List item (built with DOM APIs — user text never goes through innerHTML)
      const li = document.createElement('li');
      li.className = 'wp-item';
      li.dataset.status = wp.status;

      const num = document.createElement('span');
      num.className = 'wp-num'; num.textContent = String(n);
      num.setAttribute('aria-hidden', 'true');

      const name = document.createElement('input');
      name.value = wp.name; name.placeholder = t('wpName'); name.setAttribute('aria-label', t('wpName'));
      name.addEventListener('change', () => { wp.name = name.value.trim(); render(); });

      const body = document.createElement('div'); body.className = 'wp-body';
      const notes = document.createElement('input');
      notes.value = wp.notes; notes.placeholder = t('wpNotes'); notes.setAttribute('aria-label', t('wpNotes'));
      notes.addEventListener('change', () => { wp.notes = notes.value.trim(); saveState(); });

      const controls = document.createElement('div'); controls.className = 'wp-controls';
      const sel = document.createElement('select');
      sel.setAttribute('aria-label', t('wpStatus'));
      for (const s of C.STATUSES) {
        const o = document.createElement('option'); o.value = s; o.textContent = t(s); if (s === wp.status) o.selected = true; sel.appendChild(o);
      }
      sel.addEventListener('change', () => { wp.status = sel.value; render(); });

      const up = iconButton('▲', t('moveUp'), () => moveWaypoint(idx, -1)); up.disabled = idx === 0;
      const down = iconButton('▼', t('moveDown'), () => moveWaypoint(idx, 1)); down.disabled = idx === state.waypoints.length - 1;
      const del = iconButton('✕', t('removeWp'), () => removeWaypoint(wp.id)); del.classList.add('btn-danger-outline');
      controls.append(sel, up, down, del);

      const meta = document.createElement('div'); meta.className = 'wp-meta';
      meta.textContent = `${fmtCoord(wp.lat)}, ${fmtCoord(wp.lng)}`;

      body.append(notes, controls, meta);
      li.append(num, name, body);
      el.wpList.appendChild(li);
    });
  }

  function iconButton(symbol, label, onClick) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'btn icon-btn'; b.textContent = symbol;
    b.setAttribute('aria-label', label); b.title = label;
    b.addEventListener('click', onClick);
    return b;
  }

  function renderRoute() {
    startMarker.setLatLng([state.start.lat, state.start.lng]);
    destMarker.setLatLng([state.dest.lat, state.dest.lng]);

    const r = C.computeLegs(state.start, state.waypoints, state.dest, state.terrain);
    routeLine.setLatLngs(r.points.map((p) => [p.lat, p.lng]));

    el.sumKm.textContent = `${fmtNum(r.totalKm, 1)} ${t('km')}`;
    el.sumTime.textContent = `≈ ${C.formatDuration(r.totalMinutes, state.lang)}`;

    el.legList.replaceChildren();
    for (const leg of r.legs) {
      const li = document.createElement('li'); li.className = 'leg';
      const idx = document.createElement('span'); idx.className = 'leg-idx'; idx.textContent = String(leg.index);
      const names = document.createElement('span'); names.className = 'leg-names';
      names.textContent = `${pointName(leg.from)} ← ${pointName(leg.to)}`;
      if (state.lang === 'en') names.textContent = `${pointName(leg.from)} → ${pointName(leg.to)}`;
      const nums = document.createElement('span'); nums.className = 'leg-nums';
      nums.textContent = `${fmtNum(leg.km, 1)} ${t('km')}`;
      const small = document.createElement('small'); small.textContent = `≈ ${C.formatDuration(leg.minutes, state.lang)}`;
      nums.appendChild(small);
      li.append(idx, names, nums);
      el.legList.appendChild(li);
    }
    el.gmapsBtn.href = C.googleMapsDirUrl(state.start, state.waypoints, state.dest);
  }

  function pointName(p) {
    if (p.kind === 'start') return t('legFromStart');
    if (p.kind === 'dest') return t('legToDest');
    const i = state.waypoints.indexOf(p.ref);
    return p.ref.name || t('wpDefaultName', { n: i + 1 });
  }

  // ---------- Coordinate inputs ----------
  function bindCoordInputs(which, latEl, lngEl) {
    function commit() {
      const lat = Number(String(latEl.value).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace('٫', '.'));
      const lng = Number(String(lngEl.value).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace('٫', '.'));
      const okLat = latEl.value.trim() !== '' && C.isValidLat(lat);
      const okLng = lngEl.value.trim() !== '' && C.isValidLng(lng);
      latEl.toggleAttribute('aria-invalid', !okLat); if (!okLat) latEl.setAttribute('aria-invalid', 'true');
      lngEl.toggleAttribute('aria-invalid', !okLng); if (!okLng) lngEl.setAttribute('aria-invalid', 'true');
      if (okLat && okLng) { state[which] = { lat, lng }; renderRoute(); saveState(); }
      else showBanner(t('invalidCoord'), 'error');
    }
    [latEl, lngEl].forEach((inp) => {
      inp.addEventListener('change', commit);
      // Pasting "23.588, 58.383" into either field fills both.
      inp.addEventListener('paste', (e) => {
        const text = (e.clipboardData || window.clipboardData).getData('text');
        const p = C.parseCoordPair(text);
        if (p && /[,،\s]/.test(text.trim())) {
          e.preventDefault();
          latEl.value = fmtCoord(p.lat); lngEl.value = fmtCoord(p.lng);
          state[which] = p; render(); showBanner(t('coordsPasted'), 'ok');
        }
      });
    });
  }
  bindCoordInputs('start', el.startLat, el.startLng);
  bindCoordInputs('dest', el.destLat, el.destLng);
  el.terrain.addEventListener('change', () => { state.terrain = el.terrain.value; renderRoute(); saveState(); });

  // ---------- Geolocation ----------
  function locate(onOk) {
    if (!('geolocation' in navigator)) { showBanner(t('geoUnsupported'), 'error'); return; }
    if (!window.isSecureContext) { showBanner(t('geoInsecure'), 'error'); return; }
    showBanner(t('locating'), 'sticky');
    navigator.geolocation.getCurrentPosition(
      (pos) => done(pos),
      (err1) => {
        if (err1.code === 1) return fail(err1);
        showBanner(t('locatingNetwork'), 'sticky');
        navigator.geolocation.getCurrentPosition(done, fail, { enableHighAccuracy: false, timeout: 15000, maximumAge: 120000 });
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 15000 }
    );
    function done(pos) {
      const p = { lat: C.round(pos.coords.latitude, 6), lng: C.round(pos.coords.longitude, 6), acc: pos.coords.accuracy };
      lastRawFix = Object.assign({ t: pos.timestamp || Date.now() }, p);
      showMe(p);
      showBanner(t('located', { acc: Math.round(pos.coords.accuracy || 0) }), 'ok');
      onOk(p);
    }
    function fail(err) {
      if (err.code === 1) showBanner(t('geoDenied'), 'error', { label: t('geoHow'), run: () => openDialog(el.geoDialog) });
      else if (err.code === 3) showBanner(t('geoTimeout'), 'error');
      else showBanner(t('geoFailed'), 'error');
    }
  }

  function showMe(p) {
    if (!meMarker) meMarker = L.marker([p.lat, p.lng], { icon: pinIcon('pin-me'), interactive: false, keyboard: false }).addTo(map);
    else meMarker.setLatLng([p.lat, p.lng]);
  }

  document.querySelectorAll('[data-gps]').forEach((b) => b.addEventListener('click', () => {
    const target = b.dataset.gps;
    locate((p) => {
      if (target === 'wp') {
        const time = new Date().toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' });
        addWaypoint(p, t('wpMyLocation', { time }));
      } else {
        setPoint(target, p);
      }
      map.setView([p.lat, p.lng], Math.max(map.getZoom(), 13));
    });
  }));
  document.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => setPickMode(b.dataset.pick)));
  $('pickCancel').addEventListener('click', () => setPickMode(null));
  $('locateMeBtn').addEventListener('click', () => locate((p) => map.setView([p.lat, p.lng], Math.max(map.getZoom(), 14))));
  $('fitBtn').addEventListener('click', fitRoute);

  el.layerBtn.addEventListener('click', () => {
    map.removeLayer(layers[state.layer === 'sat' ? 'sat' : 'map']);
    state.layer = state.layer === 'sat' ? 'map' : 'sat';
    layers[state.layer].addTo(map);
    applyI18n(); saveState();
  });

  // ---------- Tabs ----------
  const tabs = [[$('tabRoute'), $('paneRoute')], [$('tabTrack'), $('paneTrack')]];
  tabs.forEach(([tab], i) => tab.addEventListener('click', () => selectTab(i)));
  tabs.forEach(([tab], i) => tab.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { selectTab(1 - i); tabs[1 - i][0].focus(); }
  }));
  function selectTab(i) {
    tabs.forEach(([tab, pane], j) => { tab.setAttribute('aria-selected', String(i === j)); tab.tabIndex = i === j ? 0 : -1; pane.hidden = i !== j; });
  }
  selectTab(0);

  // ---------- Track recording ----------
  function updateTrackUi() {
    const s = C.trackStats(fixes);
    el.stDist.textContent = `${fmtNum(s.km, 2)} ${t('km')}`;
    el.stDur.textContent = fmtClock(s.durationMs);
    el.stAvg.textContent = `${fmtNum(s.avgKmh, 1)} ${t('kmh')}`;
    el.stPts.textContent = String(s.points);
    el.exportTrackBtn.disabled = fixes.length === 0;
    el.clearTrackBtn.disabled = fixes.length === 0 || recording;
    el.recordBtn.classList.toggle('is-recording', recording);
    el.recordBtn.textContent = recording ? t('recordStop') : fixes.length ? t('recordResume') : t('recordStart');
    trackLine.setLatLngs(fixes.map((f) => [f.lat, f.lng]));
  }

  function fmtClock(ms) {
    const sec = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s2 = sec % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return h ? `${h}:${pad(m)}:${pad(s2)}` : `${pad(m)}:${pad(s2)}`;
  }

  async function requestWakeLock() {
    if (!('wakeLock' in navigator)) { showBanner(t('wakeLockOff')); return; }
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    } catch (e) { /* battery saver etc. */ }
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && recording && !wakeLock) requestWakeLock();
    if (document.visibilityState === 'hidden') saveTrackNow();
  });

  function startRecording() {
    if (!('geolocation' in navigator)) { showBanner(t('geoUnsupported'), 'error'); return; }
    if (!window.isSecureContext) { showBanner(t('geoInsecure'), 'error'); return; }
    recording = true;
    requestWakeLock();
    watchId = navigator.geolocation.watchPosition(onTrackFix, (err) => {
      if (err.code === 1) { stopRecording(); showBanner(t('geoDenied'), 'error', { label: t('geoHow'), run: () => openDialog(el.geoDialog) }); }
      else el.stAcc.textContent = t('gpsLost');
    }, { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 });
    updateTrackUi(); saveTrackNow();
  }

  function stopRecording() {
    recording = false;
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    watchId = null;
    if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
    updateTrackUi(); saveTrackNow();
  }

  function onTrackFix(pos) {
    const c = pos.coords;
    const fix = {
      lat: C.round(c.latitude, 6), lng: C.round(c.longitude, 6), t: pos.timestamp || Date.now(),
      acc: Math.round(c.accuracy || 0), alt: (typeof c.altitude === 'number' ? C.round(c.altitude, 1) : null),
    };
    lastRawFix = fix;
    showMe(fix);
    el.stAcc.textContent = `±${fix.acc} ${t('m')}`;
    el.stSpeed.textContent = typeof c.speed === 'number' && c.speed >= 0 ? `${fmtNum(c.speed * 3.6, 0)} ${t('kmh')}` : '—';
    const prev = fixes[fixes.length - 1] || null;
    if (C.acceptFix(prev, fix)) {
      fixes.push(fix);
      updateTrackUi();
      saveTrackSoon();
    }
  }

  el.recordBtn.addEventListener('click', () => {
    if (recording) { stopRecording(); showBanner(t('recordingStopped'), 'ok'); }
    else startRecording(); // resuming keeps all previous points
  });
  el.exportTrackBtn.addEventListener('click', () => {
    if (!fixes.length) { showBanner(t('nothingToExport'), 'error'); return; }
    const gpx = C.buildGpx({ name: t('trackName'), track: fixes });
    download(gpx, `duroob-track-${stamp()}.gpx`);
  });
  el.clearTrackBtn.addEventListener('click', async () => {
    const ok = await confirmDialog(t('clearTrackTitle'), t('clearTrackText', { n: fixes.length }));
    if (!ok) return;
    fixes = []; saveTrackNow(); updateTrackUi(); showBanner(t('trackCleared'), 'ok');
  });

  // ---------- Export / share ----------
  function stamp() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
  }
  async function download(text, filename) {
    const blob = new Blob([text], { type: 'application/gpx+xml' });
    // Installed PWAs on iOS ignore <a download>; use the share sheet when files can be shared.
    try {
      const file = new File([blob], filename, { type: 'application/gpx+xml' });
      if (navigator.canShare && navigator.canShare({ files: [file] }) && /iPhone|iPad/.test(navigator.userAgent)) {
        await navigator.share({ files: [file], title: filename });
        return;
      }
    } catch (e) { /* fall back to download */ }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    showBanner(t('exported', { file: filename }), 'ok');
  }
  async function shareText(title, text, url) {
    if (navigator.share) {
      try { await navigator.share({ title, text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(`${text}\n${url}`); showBanner(t('shareFallback'), 'ok'); }
    catch (e) { window.prompt(t('copyCoords'), `${text}\n${url}`); }
  }

  $('exportRouteBtn').addEventListener('click', () => {
    const pts = [
      Object.assign({ name: t('start') }, state.start),
      ...state.waypoints.map((w, i) => ({ lat: w.lat, lng: w.lng, name: w.name || t('wpDefaultName', { n: i + 1 }), notes: w.notes })),
      Object.assign({ name: t('dest') }, state.dest),
    ];
    download(C.buildGpx({ name: t('routeName'), waypoints: pts }), `duroob-route-${stamp()}.gpx`);
  });
  $('shareRouteBtn').addEventListener('click', () => {
    const r = C.computeLegs(state.start, state.waypoints, state.dest, state.terrain);
    shareText(t('routeName'), t('shareRouteText', { km: fmtNum(r.totalKm, 1), n: state.waypoints.length }), el.gmapsBtn.href);
  });

  // ---------- SOS ----------
  function sosPoint() { return lastRawFix || (fixes.length ? fixes[fixes.length - 1] : null); }
  function renderSos() {
    const p = sosPoint();
    el.sosCoords.textContent = p ? `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}` : t('noLocationYet');
    $('sosCoordsHint').textContent = (p && p.acc ? t('accuracy', { acc: Math.round(p.acc) }) + ' ' : '') + t('sosCoordsHint');
  }
  el.sosBtn.addEventListener('click', () => {
    renderSos(); openDialog(el.sosDialog);
    if (!sosPoint()) locate(() => renderSos());
  });
  $('sosRefreshBtn').addEventListener('click', () => locate(() => renderSos()));
  $('sosShareBtn').addEventListener('click', () => {
    const p = sosPoint();
    if (!p) { locate((q) => { renderSos(); shareText(t('sosTitle'), t('shareLocText'), C.mapsPinUrl(q)); }); return; }
    shareText(t('sosTitle'), `${t('shareLocText')} ${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`, C.mapsPinUrl(p));
  });
  $('sosCopyBtn').addEventListener('click', async () => {
    const p = sosPoint(); if (!p) return;
    const text = `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)} ${C.mapsPinUrl(p)}`;
    try { await navigator.clipboard.writeText(text); showBanner(t('copied'), 'ok'); } catch (e) { window.prompt(t('copyCoords'), text); }
  });

  // ---------- Dialogs ----------
  function openDialog(d) {
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
  }
  // Light-dismiss fallback for browsers without <dialog closedby> (Safari).
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    document.querySelectorAll('dialog[closedby="any"]').forEach((d) => d.addEventListener('click', (e) => {
      if (e.target !== d) return;
      const r = d.getBoundingClientRect();
      const inside = r.top <= e.clientY && e.clientY <= r.bottom && r.left <= e.clientX && e.clientX <= r.right;
      if (!inside) d.close();
    }));
  }
  function confirmDialog(title, text) {
    el.confirmTitle.textContent = title; el.confirmText.textContent = text;
    el.confirmDialog.returnValue = '';
    openDialog(el.confirmDialog);
    return new Promise((resolve) => {
      el.confirmDialog.addEventListener('close', () => resolve(el.confirmDialog.returnValue === 'yes'), { once: true });
    });
  }

  // ---------- Theme & language ----------
  function applyTheme() {
    document.documentElement.dataset.theme = state.theme;
    $('themeColorMeta').setAttribute('content', state.theme === 'night' ? '#121130' : '#F2DEC2');
  }
  el.themeBtn.addEventListener('click', () => { state.theme = state.theme === 'day' ? 'night' : 'day'; applyTheme(); applyI18n(); saveState(); });
  el.langBtn.addEventListener('click', () => {
    state.lang = state.lang === 'ar' ? 'en' : 'ar';
    applyI18n(); render(); updateTrackUi(); map.invalidateSize();
  });

  // ---------- Online / offline ----------
  function updateOnline() { el.offlineState.textContent = navigator.onLine ? t('online') : t('offline'); }
  window.addEventListener('online', updateOnline);
  window.addEventListener('offline', updateOnline);

  // ---------- Service worker (offline support) ----------
  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('sw.js').then((reg) => {
      reg.addEventListener('updatefound', () => {
        const w = reg.installing;
        if (!w) return;
        w.addEventListener('statechange', () => {
          if (w.state === 'installed' && navigator.serviceWorker.controller) {
            showBanner(t('updateReady'), 'sticky', { label: t('reload'), run: () => location.reload() });
          }
        });
      });
    }).catch(() => { /* offline support unavailable */ });
  }

  window.addEventListener('pagehide', saveTrackNow);

  // ---------- Boot ----------
  applyTheme();
  applyI18n();
  render();
  updateTrackUi();
  fitRoute();
  if (trackLoaded.wasRecording && fixes.length) {
    showBanner(t('resumePrompt', { n: fixes.length }), 'sticky', {
      label: t('recordResume'),
      run: () => { selectTab(1); startRecording(); },
    });
  }
})();
