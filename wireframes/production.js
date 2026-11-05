// Production (03-enpro-os §3.7, product-spec §4.7): readiness gates, schedules, shifts, workstation planners,
// load analysis and the shop-floor job card. Not in the 12-feature POC, but full Phase 1 scope for 15 Jan 2027
// the same as the eight POC screens (03-enpro-os §11) — drawn here from the confirmed feature table rather than
// left as a "not drawn yet" line on the lifecycle map, because the feature list already exists even though no
// field-by-field walkthrough with Enpro has happened yet for this module (unlike Projects, Engineering, etc.).

const PRD_Q = {
  shift: 'Shift length and count are not given in the source documents — product-spec §4.7 names shifts as a feature without the roster itself.',
  kit23: 'Kit 1 (16 material groups, 11 documents) is defined; Kit 2 and Kit 3 are named but not yet defined (product-spec §4.7).'
};

const JOB_CARD_SEED = [
  { id: 'JC-1', tag: 'P-260114-FG-A1-SF-MBF-01', op: 'Fit-up, main base frame', station: 'Fabrication bay 2', shift: 'A', actual: '', unit: 'sq m', done: false },
  { id: 'JC-2', tag: 'P-260114-FG-A1-SF-MBF-01', op: 'Weld, root pass', station: 'Fabrication bay 2', shift: 'A', actual: '', unit: 'sq m', done: false },
  { id: 'JC-3', tag: 'P-260114-FG-0A-SF-ISO-01', op: 'Pipe spool, fit-up', station: 'Pipe shop', shift: 'B', actual: '', unit: 'inch-dia', done: true },
  { id: 'JC-4', tag: 'P-260071-FG-A1-SF-TNK-01', op: 'Hydrotest', station: 'Hydrotest bay', shift: 'A', actual: '', unit: 'qty', done: false }
];
function jobCard() { return loadJSON('enpro-os-wf-jobcard', JOB_CARD_SEED); }
function toggleJobCard(el) {
  mutate('enpro-os-wf-jobcard', rows => rows.map(r => r.id === el.dataset.job ? { ...r, done: !r.done } : r), JOB_CARD_SEED);
  render();
}

add('prd-floor', 'Shop floor', 'Production', 'Production: readiness, schedules and the shop-floor job card', 'REQ-OS-PRD-001..006 (named in product-spec §4.7, not yet broken into individual REQ rows)', 'product-spec §4.7; business-spec §4; tech-spec §3 (os_production schema)', () => {
  const rows = jobCard();
  const done = rows.filter(r => r.done).length;
  return `<p class="lede">An outline draft from the confirmed Production feature table — not yet walked screen by screen with Enpro the way Projects, Engineering and Quality were. Readiness, schedules and shifts live here; punch points and inspection stay on the Quality screen (ITP and MDR are shared between the two).</p>
  <div class="grid">${tile('Kit 1 ready', '11 / 11 docs', '16 material groups checked')}${tile('Equipment schedules, this skid', 3, 'plus the main skid schedule')}${tile('Job card, today', `${done} / ${rows.length}`, 'tap a row to mark it done')}${tile('Contract workers on shift', 14, 'biometric attendance')}</div>
  <h2 style="margin-top:20px">Readiness gate ${tbc(PRD_Q.kit23, 'UNKNOWN')}</h2>
  ${table(['Material group', 'Status', ''], [
    ['SF — main base frame', status('Completed', 'good'), ''],
    ['SF — cooler', status('WIP', 'warn'), ''],
    ['BO — pump', status('Under QC', 'warn'), `<a href="${go('str-inward')}">Open in Stores</a>`],
    ['BO — electric heater', status('Not Received', 'bad'), `<a href="${go('scm-indents')}">Open in Supply chain</a>`]])}
  <p class="hint">Kit 1 review runs 15 days before the LOS start date. Statuses follow the SF (Not started/WIP/Completed) and RM-/BO- (Not Received/In Transit/Partially Received/Under QC/KIT OK) sets named in 03-enpro-os.md.</p>
  <h2 style="margin-top:20px">Shop-floor job card, Fabrication bay 2 &amp; Pipe shop ${tbc(PRD_Q.shift)}</h2>
  ${table(['', 'WBS', 'Operation', 'Station', 'Shift', 'Unit', ''], rows.map(r =>
    [`<input type="checkbox" aria-label="${esc(r.op)} done" ${r.done ? 'checked' : ''} data-do="toggleJobCard" data-job="${esc(r.id)}">`, code(r.tag), esc(r.op), esc(r.station), r.shift, r.unit, r.done ? status('Done', 'good') : status('In progress', 'info')]))}
  <p class="hint">A touch display with biometric login shows this against the live drawing (DWG/PDF) on the shop floor; export to Excel is part of the same feature (product-spec §4.7). Checking a row here is real — it is saved in this browser only.</p>
  <div class="cols even" style="margin-top:14px">
    <div class="panel"><h2>Load analysis, this week</h2>${bars([['Fabrication bay 1', 62], ['Fabrication bay 2', 91], ['Pipe shop', 74], ['Hydrotest bay', 38]], 100, false, '%')}<p class="hint">Manpower, workstation and space load by period, over the bay and cell layout; flags the bottleneck (product-spec §4.7).</p></div>
    <div class="panel"><h2>Workstation planners</h2><p class="hint">Painting (14 components × 8 stages), hydrotest, pipe spool, acid pickling are confirmed; the framework is built to add 15 to 20 more without new code.</p></div>
  </div>`;
}, [PRD_Q.shift, PRD_Q.kit23], 'SOURCE-DERIVED');
