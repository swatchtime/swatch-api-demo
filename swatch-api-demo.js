(function () {
  const $ = (sel) => document.querySelector(sel);
  const fetchBtn = $('#fetch-btn');
  const fieldsInput = $('#fields-input');
  const rawJson = $('#raw-json');
  const parsedOutput = $('#parsed-output');
  const snippet = $('#snippet');
  const exampleSwatch = $('#example-swatch');
  const exampleWhole = $('#example-whole');
  const sampleBtn = $('#sample-btn');
  const copyBtn = $('#copy-btn');
  const fieldsContainer = document.getElementById('fields-checkboxes');

  // Utility: get checkbox elements under the container
  function getCheckboxElements() {
    if (!fieldsContainer) return [];
    return Array.from(fieldsContainer.querySelectorAll('input[type=checkbox]'));
  }

  // Update the read-only input with a CSV of checked boxes (no spaces)
  function updateFieldsInputFromCheckboxes() {
    const vals = getCheckboxElements().filter(b => b.checked).map(b => b.value);
    fieldsInput.value = vals.join(',');
    updateSnippetFromSelection();
  }

  // Parse CSV in fieldsInput and update checkboxes (kept for completeness)
  function updateCheckboxesFromInput() {
    const vals = (fieldsInput.value || '').split(',').map(s => s.trim()).filter(Boolean);
    const boxes = getCheckboxElements();
    boxes.forEach(b => { b.checked = vals.includes(b.value); });
    // ensure time12 <-> ampm stay linked
    const time12Box = boxes.find(b => b.value === 'time12');
    const ampmBox = boxes.find(b => b.value === 'ampm');
    if (time12Box && ampmBox) {
      const should = vals.includes('time12') || vals.includes('ampm');
      time12Box.checked = should;
      ampmBox.checked = should;
    }
    updateSnippetFromSelection();
  }

  function setRaw(v) { rawJson.value = v; }
  function setParsed(v) { parsedOutput.textContent = v; }
  function setSnippet(v) { snippet.textContent = v; }

  function updateSnippetFromSelection() {
    const url = buildUrl();
    const fields = (fieldsInput.value || '').trim() || getCheckboxElements().filter(b => b.checked).map(b => b.value).join(',');
    const parts = fields.split(',').map(s => s.trim()).filter(Boolean);
    const lines = [];
    lines.push('// Example fetch (with basic error handling)');
    lines.push(`fetch('${url}')`);
    lines.push('  .then(resp => {');
    lines.push("    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);");
    lines.push('    return resp.json();');
    lines.push('  })');
    lines.push('  .then(data => {');
    if (parts.length === 0) {
      lines.push('    // data contains all fields (see README)');
    } else {
      for (const f of parts) lines.push(`    // access ${f}: data.${f}`);
    }
    lines.push('    console.log(data);');
    lines.push('  })');
    lines.push('  .catch(err => {');
    lines.push("    console.error('Fetch error:', err);");
    lines.push('  });');
    setSnippet(lines.join('\n'));
  }

  function displayParsed(data) {
    const lines = [];
    if (!data || Object.keys(data).length === 0) {
      lines.push('(empty response)');
    } else {
      for (const k of Object.keys(data)) lines.push(`${k}: ${JSON.stringify(data[k])}`);
      if (data.timestamp) {
        try {
          const d = new Date(data.timestamp);
          const utc24 = `${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}:${String(d.getUTCSeconds()).padStart(2,'0')}`;
          let h = d.getUTCHours();
          const ampm = h >= 12 ? 'PM' : 'AM';
          h = h % 12 || 12;
          const utc12 = `${String(h).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}:${String(d.getUTCSeconds()).padStart(2,'0')} ${ampm}`;
          lines.push('\nUTC (24hr): ' + utc24);
          lines.push('UTC (12hr): ' + utc12);
        } catch (e) { console.error(e); }
      }
    }
    setParsed(lines.join('\n'));
  }

  function buildUrl() {
    const base = 'https://api.swatchtime.online/api/v1/current';
    const inputFields = (fieldsInput.value || '').split(',').map(s => s.trim()).filter(Boolean);
    const boxFields = getCheckboxElements().filter(b => b.checked).map(b => b.value);
    const combined = Array.from(new Set([...inputFields, ...boxFields]));
    const url = new URL(base);
    if (combined.length) url.searchParams.set('fields', combined.join(','));
    return url.toString();
  }

  // Small helper to fetch and return parsed JSON (or plain text)
  async function fetchJson(url) {
    const resp = await fetch(url, { cache: 'no-store' });
    if (!resp.ok) throw new Error(`Request failed: ${resp.status} ${resp.statusText}`);
    const txt = await resp.text();
    try { return JSON.parse(txt); } catch (_) { return txt; }
  }

  function updateLastUpdatedFrom(parsed) {
    try {
      const el = document.getElementById('lastupdated');
      if (!el) return;
      let lastText = '';
      if (parsed && parsed.timestamp !== undefined) {
        lastText = `Last updated: ${parsed.timestamp}`;
      } else if (parsed && (parsed.time12 !== undefined || parsed.ampm !== undefined)) {
        const t12 = parsed.time12 !== undefined ? parsed.time12 : '';
        const am = parsed.ampm ? (' ' + parsed.ampm) : '';
        if (t12 || am) lastText = `Last updated: ${t12}${am} UTC`;
      } else if (parsed && parsed.time24 !== undefined) {
        lastText = `Last updated: ${parsed.time24} UTC`;
      }
      el.textContent = lastText;
    } catch (e) { console.error(e); }
  }

  function updateSampleButtonFromParsed(parsed) {
    try {
      if (!sampleBtn || !parsed) return;
      if (parsed.swatch !== undefined) { sampleBtn.textContent = `Swatch Internet Time: @${parsed.swatch}`; return; }
      if (parsed.whole !== undefined) { sampleBtn.textContent = `Swatch Internet Time: @${parsed.whole}`; return; }
      if (parsed.rounded !== undefined) { sampleBtn.textContent = `Swatch Internet Time: @${parsed.rounded}`; return; }
    } catch (e) { console.error(e); }
  }

  async function fetchApi() {
    setRaw(''); setParsed('Loading...'); setSnippet('');
    try {
      const url = buildUrl();
      const reqEl = document.getElementById('request-url-val'); if (reqEl) reqEl.textContent = url;
      updateSnippetFromSelection();
      const parsed = await fetchJson(url);
      setRaw(typeof parsed === 'object' ? JSON.stringify(parsed, null, 2) : String(parsed));
      displayParsed(parsed || {});
      updateLastUpdatedFrom(parsed || {});
      updateSampleButtonFromParsed(parsed || {});
    } catch (err) {
      console.error(err);
      setRaw(String(err));
      setParsed('Error fetching API');
    }
  }

  // Wire main fetch button
  if (fetchBtn) fetchBtn.addEventListener('click', fetchApi);

  // Example buttons
  if (exampleWhole) exampleWhole.addEventListener('click', () => {
    getCheckboxElements().forEach(i => i.checked = (i.value === 'whole'));
    updateFieldsInputFromCheckboxes();
    fetchApi();
  });
  if (exampleSwatch) exampleSwatch.addEventListener('click', () => {
    getCheckboxElements().forEach(i => i.checked = (i.value === 'swatch'));
    updateFieldsInputFromCheckboxes();
    fetchApi();
  });

  // Sample button: request preferred display field + timestamp and update button
  if (sampleBtn) {
    sampleBtn.addEventListener('click', async () => {
      const prev = sampleBtn.textContent;
      const lastUpdatedEl = document.getElementById('lastupdated');
      const luprev = lastUpdatedEl ? lastUpdatedEl.textContent : '';
      sampleBtn.textContent = 'Loading...';
      try {
        const inputFields = (fieldsInput.value || '').split(',').map(s => s.trim()).filter(Boolean);
        const boxFields = getCheckboxElements().filter(b => b.checked).map(b => b.value);
        const parts = inputFields.length ? inputFields : boxFields;
        const prefs = ['swatch','whole','time12','time24','rounded'];
        let displayField = 'swatch';
        for (const p of prefs) if (parts.includes(p)) { displayField = p; break; }
        const req = new Set(parts);
        req.add(displayField);
        req.add('timestamp');
        if (req.has('time12')) req.add('ampm');
        const url = new URL('https://api.swatchtime.online/api/v1/current');
        url.searchParams.set('fields', Array.from(req).join(','));
        const data = await fetchJson(url.toString());
        if (data) {
          if (displayField === 'swatch' && data.swatch !== undefined) sampleBtn.textContent = `Swatch Internet Time: @${data.swatch}`;
          else if (displayField === 'whole' && data.whole !== undefined) sampleBtn.textContent = `Swatch Internet Time: @${data.whole}`;
          else if (displayField === 'time24' && data.time24 !== undefined) sampleBtn.textContent = `${data.time24}`;
          else if (displayField === 'time12' && data.time12 !== undefined) sampleBtn.textContent = `${data.time12}${data.ampm ? ' '+data.ampm : ''}`;
          else if (data.swatch !== undefined) sampleBtn.textContent = `Swatch Internet Time: @${data.swatch}`;
          if (data.timestamp !== undefined && lastUpdatedEl) lastUpdatedEl.textContent = `Last updated: ${data.timestamp}`;
        } else {
          sampleBtn.textContent = prev;
          if (lastUpdatedEl) lastUpdatedEl.textContent = luprev;
        }
      } catch (e) {
        console.error(e);
        sampleBtn.textContent = prev;
        const lastUpdatedEl = document.getElementById('lastupdated'); if (lastUpdatedEl) lastUpdatedEl.textContent = luprev;
      }
    });
  }

  // Delegated checkbox handling (single listener)
  if (fieldsContainer) {
    fieldsContainer.addEventListener('change', (e) => {
      const target = e.target;
      if (!target || !target.matches('input[type=checkbox]')) return;
      // link time12 <-> ampm
      if (target.value === 'time12' || target.value === 'ampm') {
        const boxes = getCheckboxElements();
        const t12 = boxes.find(b => b.value === 'time12');
        const am = boxes.find(b => b.value === 'ampm');
        if (t12 && am) { t12.checked = am.checked = target.checked; }
      }
      // clear outputs if unchecked to avoid stale display
      if (target.checked === false) { setRaw(''); setParsed(''); }
      updateFieldsInputFromCheckboxes();
    });
  }

  // fieldsInput change handler (mostly for programmatic updates)
  if (fieldsInput) fieldsInput.addEventListener('input', () => updateCheckboxesFromInput());

  // show a small helper snippet on load
  updateSnippetFromSelection();

  // Safe toast init
  const toastEl = document.getElementById('copy-toast');
  let bsToast = null;
  if (toastEl && window.bootstrap && typeof bootstrap.Toast === 'function') {
    try { bsToast = new bootstrap.Toast(toastEl); } catch (e) { console.error(e); bsToast = null; }
  }

  // Copy button -> clipboard + toast
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(snippet.textContent || '');
        if (bsToast) { bsToast.show(); setTimeout(() => bsToast.hide(), 2000); }
      } catch (e) {
        console.error(e);
        // fallback: select + execCommand
        try {
          const ta = document.createElement('textarea');
          ta.value = snippet.textContent || '';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          if (bsToast) { bsToast.show(); setTimeout(() => bsToast.hide(), 2000); }
        } catch (err) { console.error(err); alert('Copy failed'); }
      }
    });
  }

})();
