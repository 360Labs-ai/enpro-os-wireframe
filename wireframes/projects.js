// Projects (03-enpro-os §3.1, §4, §5): project list, project creation from a template with the Project Mask,
// the six-level WBS, the schedule and closure. WBS grammar and the Marketing workflow are SOURCE-DERIVED from
// RR-01 and RR-02; the WBS direction is OPEN DECISION O-WBS, narrowed on 9 Oct (S15-65).

const PRJ_Q = {
  wbs: 'O-WBS: is the 9 Oct position final, so Enpro OS generates the SAP upload files in Phase 1 (Marketing uploads them with ZWPS) and the link is automatic in Phase 2? The repository still lists O-WBS as open.',
  codes: 'WBS character codes and heads per product (the L2 to L5 skeleton) plus the common set, promised by Marketing on 9 Oct',
  mask: 'Project Mask: the 39 fields, or 39 plus the six Contact Page fields (Net Value, Currency, Application, LO Filter, OME, No. of Pumps)?',
  sapFields: 'Which Project Details fields come from the SAP sales order, and which does Marketing type?',
  tmpl: 'Product templates per division: SED first from the reference set; the PED and RED sets have not been received',
  design: 'Design tag 0A against system tag A1: is 0A the WBS level and A1 the material level, or the reverse?',
  suffix: 'The last WBS segment: two digits only (product spec), or also PE, EI and US (architecture, and US on CONTACT’s cooler WBS)?',
  indent: 'Are SCM indent and ordering dates (planned, forecast and actual indent, target ordering) part of the project schedule?',
  msp: 'MS Project: is export enough, or is import also needed?',
  spi: 'Do you use SPI or any earned value measure today, and should the project header show it?',
  viewer: 'Which fields may the customer see in the project viewer, and who at Enpro marks them?',
  basis: 'Is the schedule offset rule (internal dispatch minus 30, piping minus 80, Kit 1 minus 10, Kit 2 plus 20, fabricated minus 75) standard, or set per project?'
};

Object.assign(FORMS, {
  mask: [
    F('Product template', 'select', true, 'Template library, one per core product per division', { options: ['SED · Lube oil system (LOS)', 'SED · Seal gas panel', 'SED · Air cooler'], r3: 'S10 §05, POC 10', tbc: PRJ_Q.tmpl }),
    F('Company, division, site', 'auto', true, 'From the sales order and the user’s scope', { value: 'EIPL · SED · MKL Phase-I', r3: 'business-spec §1' }),
    F('Work order no.', 'text', true, 'Typed by Marketing', { fmt: 'RR-01', r3: 'RR-01 Project Mask' }),
    F('PO number and date', 'auto', true, 'SAP sales order', { value: 'From SAP', fmt: 'RR-01', tbc: PRJ_Q.sapFields }),
    F('Sold-to customer', 'auto', true, 'SAP customer master', { value: 'Customer A (sample)', fmt: 'RR-01' }),
    F('EPC contractor and PMC', 'auto', false, 'SAP sales order', { value: 'From SAP', fmt: 'RR-01' }),
    F('Incoterm and location', 'auto', true, 'SAP sales order', { value: 'From SAP', fmt: 'RR-01' }),
    F('Industry, TEMA', 'auto', false, 'SAP sales order', { value: 'From SAP', fmt: 'RR-01' }),
    F('API standard', 'text', true, 'Typed', { fmt: 'RR-01' }),
    F('Area classification, pressure class', 'text', true, 'Typed', { fmt: 'RR-01' }),
    F('Mounting', 'select', true, 'Enpro dropdown', { options: ['Skid mounted', 'Loose supply'], fmt: 'RR-01', tbcLabel: 'UNKNOWN', tbc: 'Mounting dropdown values (the list is not in the reference set)' }),
    F('Cooler type', 'select', true, 'Enpro dropdown; drives the conditional fields below', { options: ['Shell and tube', 'Air fin', 'Plate'], fmt: 'RR-01', tbc: 'Cooler type dropdown values', tbcLabel: 'UNKNOWN' }),
    F('Air fin only: fans, turbulators, air design temperature', 'text', false, 'Shown only when the cooler type is Air fin', { fmt: 'RR-01' }),
    F('Highlights (up to 1,000 words)', 'textarea', false, 'Typed by Marketing', { fmt: 'RR-01', tbc: PRJ_Q.mask, tbcLabel: 'OPEN DECISION' })
  ]
});
Object.assign(FORM_SCREENS, { mask: 'prj-new' });

// PROJECTS: the shared list behind both prj-list and the project-creation flow, so submitting the Project Mask
// on prj-new genuinely adds a row here rather than only toasting. epn/over follow the same doc-17.06 shape as
// the Home screen's own task lists.
const PROJECTS_SEED = [
  { epn: 10, over: false, id: 'P-260114', name: 'Lube oil system, 2 skids', customer: 'Customer A', tmpl: 'LOS', st: '15 Tack weld', dispatch: '18 Jan 2027', sched: 'On plan', tone: 'good', open: 'prj-wbs' },
  { epn: 20, over: true, id: 'P-260098', name: 'Seal gas panel', customer: 'Customer B', tmpl: 'Seal gas panel', st: '01 Indent pending', dispatch: '26 Feb 2027', sched: 'Slipping', tone: 'bad', open: 'prj-gantt' },
  { epn: 30, over: false, id: 'S-260012', name: 'Spares for P-250311', customer: 'Customer C', tmpl: 'Spare', st: '01 Indent pending', dispatch: '4 Dec 2026', sched: 'On plan', tone: 'good', open: '' },
  { epn: 40, over: false, id: 'P-260071', name: 'Air cooler', customer: 'Customer D', tmpl: 'Air cooler', st: '22 Painting', dispatch: '9 Dec 2026', sched: 'On plan', tone: 'good', open: '' }
];
function projects() { return loadJSON('enpro-os-wf-projects', PROJECTS_SEED); }
function createProject() {
  const tmplSelect = document.getElementById('mask-0'), woInput = document.getElementById('mask-2');
  if (!tmplSelect || !woInput) { toast('Turn off “Show field mapping” to fill in the form first.'); return; }
  const wo = woInput.value.trim();
  if (!wo) { toast('Type a work order number before creating the project.'); return; }
  const tmpl = (tmplSelect.value.split('· ')[1] || tmplSelect.value).trim();
  mutate('enpro-os-wf-projects', rows => {
    const nextEpn = Math.max(0, ...rows.map(r => r.epn)) + 10;
    const n = rows.length;
    return [{ epn: nextEpn, over: false, id: `P-2606${String(n).padStart(2, '0')}`, name: `${tmpl} (work order ${wo})`, customer: 'Customer A (sample)', tmpl, st: '01 Indent pending', dispatch: 'Not yet scheduled', sched: 'On plan', tone: 'good', open: 'prj-wbs' }, ...rows];
  }, PROJECTS_SEED);
  toast(`Project created from ${tmpl} — opening the project list.`);
  location.hash = 'prj-list';
}

add('prj-list', 'Projects', 'Projects', 'Projects', 'REQ-OS-PM-001, REQ-OS-PM-004, REQ-OS-PM-006', 'S10 §05; doc 17.06 (RR-01); 29-code ladder (RR-04); filters from CONTACT, functional reference only (RR-10)', () => `
  <div class="bar-row"><input class="ctl" style="max-width:340px" data-search placeholder="Search a project, work order, tag or PO" aria-label="Search projects">
    <span class="lab">Filter</span><div class="seg" role="group" aria-label="Division">${['All', 'SED', 'PED', 'RED'].map((d, i) => `<button type="button" data-seg aria-pressed="${i === 1}">${d}</button>`).join('')}</div>
    <a class="btn primary" href="${go('prj-new')}">New project from template</a></div>
  ${states('prj-list', () => table(['EPN', 'Project', 'Customer', 'Template', 'Status', 'Dispatch (plan)', 'Schedule', ''], projects().map(p =>
    [epn(p.epn, p.over), code(p.id) + ' ' + esc(p.name), esc(p.customer), esc(p.tmpl), code(p.st), esc(p.dispatch), status(p.sched, p.tone), p.open ? `<a href="${go(p.open)}">Open</a>` : ''])),
    ['No projects in SED yet', 'Projects are created from a template once an order is won.', 'New project from template'],
    'The project list did not load. Your last view is shown when you reconnect; try again.')}
  <p class="hint">EPN is one per project: the earliest manufacturing start of any system tag ranks first; ties go to the earlier initiation. Recalculated on every change, not daily (doc 17.06). The search box and “New project from template” are both real against this list. Spare (S-) projects ${tbc('Are Spare (S-) projects and the User List generator in Phase 1?')}</p>`,
  [HOME_Q.gpn], 'SOURCE-DERIVED');

add('prj-new', 'Create project', 'Projects', 'Create a project from a won order', 'REQ-OS-PM-001, REQ-OS-P2-003, REQ-INT-006', 'Marketing workflow and Project Mask (RR-01); S10 §05; S11 OS Marketing r34; S15-65', () => {
  const path = pick('wbs', 'upload');
  const paths = {
    upload: `<p class="hint">Enpro OS builds WBS L1 to L6 from the template and generates the SAP upload files: project, WBS, network and components. Marketing uploads them with ZWPS; Enpro OS then reads the SAP keys back (S15-65).</p>
      ${table(['File', 'Rows', ''], [['Project and WBS', '42', btn('Download')], ['Network (activity 0010 Release of PR)', '28', btn('Download')], ['Components', '504', btn('Download')]])}
      <p class="hint">Status: ${status('Not yet in SAP', 'warn')} until the upload is read back. Engineering waits for the WBS to be ready, whichever path made it.</p>`,
    fetch: `<p class="hint">Marketing prepares the WBS in SAP, as today, and types the work order number here. Enpro OS fetches the elements and material codes and flags any element that does not match the template (RR-01).</p>`,
    auto: `<p class="hint soon">Enpro OS creates the WBS in SAP directly. Planned for Phase 2 (S15-65).</p>`
  };
  return `${steps([['Order received', 'Marketing'], ['SO in SAP', 'Marketing'], ['Create project', 'Marketing engineer'], ['Basic Engineering Document', 'review'], ['Six parallel branches', 'kick-off, spec, WBS, full kit, team, PO and OA'], ['AVL, release WBS and full kit', 'TL, HOD'], ['KOM', 'all'], ['Budget in SAP', 'Projects starts']], 2)}
    <p class="hint" style="margin-top:8px">Enpro’s Marketing workflow (RR-01). Release and KOM complete only when every branch is done.</p>
    ${formScreen('mask', 'Create project and WBS', `
      <div class="panel"><h2>WBS path ${tbc(PRJ_Q.wbs, 'OPEN DECISION · O-WBS')}</h2>
        ${switcher('wbs', 'Path', { upload: 'Phase 1: upload files', fetch: 'Created in SAP', auto: 'Phase 2: automatic' }, 'upload')}${paths[path]}</div>
      <div class="panel"><h2>What the template creates</h2><p class="hint">WBS skeleton, a workflow per component type, the folder structure and document list, standard durations and the team by role (03-enpro-os §5). ${tbc(PRJ_Q.codes)}</p></div>`,
      'createProject')}
    <p class="hint">Fill a product template and a work order number above, then “Create project and WBS” genuinely adds the project to the list — try it, then open Projects.</p>`;
}, [PRJ_Q.wbs, PRJ_Q.codes, PRJ_Q.basis], 'SOURCE-DERIVED');

const WBS_ROWS = [
  [1, 'P-260114', 'Lube oil system, 2 skids', 'Project engineer', '', ''],
  [2, 'P-260114-FG', 'Finished goods', '', '', ''],
  [3, 'P-260114-FG-0A', 'Design tag (designs once for A1 and A2)', 'Process', '', 'design tag'],
  [4, 'P-260114-FG-0A-SF', 'Self-fabricated', '', '', ''],
  [6, 'P-260114-FG-0A-SF-ISO-01', 'Piping ISO and BOM', 'Detailing', 'ISO workflow', 'In progress'],
  [3, 'P-260114-FG-A1', 'System tag A1 (skid 1)', 'PPC', '', ''],
  [4, 'P-260114-FG-A1-BO', 'Bought out', '', '', ''],
  [6, 'P-260114-FG-A1-BO-PMP-01', 'Pump', 'Process', 'Datasheet BO · 23 tasks', 'T2 of 23'],
  [6, 'P-260114-FG-A1-BO-EHR-01', 'Electric heater', 'E&I', 'Datasheet BO · 30 tasks', 'Not started'],
  [4, 'P-260114-FG-A1-SF', 'Self-fabricated', '', '', ''],
  [6, 'P-260114-FG-A1-SF-MBF-01', 'Main base frame', 'Detailing', 'Fabricated · 22 tasks', 'Not started'],
  [6, 'P-260114-FG-A1-SF-C1D-US', 'Cooler', 'Process', 'Fabricated · 28 tasks', 'Not started'],
  [3, 'P-260114-FG-A2', 'System tag A2 (skid 2, replicated from the design tag)', 'PPC', '', 'replica']
];
const WBS_L4_CODES = ['SF', 'BO', 'DM', 'FI'];
function checkWBSCode() {
  const el = document.getElementById('wbsCheckInput'), out = document.getElementById('wbsCheckResult');
  if (!el || !out) return;
  const parts = el.value.trim().toUpperCase().split('-');
  const l4 = parts[4];
  if (!l4) { out.innerHTML = '<div class="hint" style="padding:10px 0 0">Type a full WBS code to check its L4 segment.</div>'; return; }
  out.innerHTML = WBS_L4_CODES.includes(l4)
    ? `<div class="hint" style="padding:10px 0 0">${code(l4)} is a valid L4 code.</div>`
    : `<div class="state err" style="padding:10px 0;text-align:left">${esc(l4)} is not a valid L4 code. Use SF, BO, DM or FI.</div>`;
}
document.addEventListener('input', e => { if (e.target.id === 'wbsCheckInput') checkWBSCode(); });

add('prj-wbs', 'Project and WBS', 'Projects', 'Project workspace: structure', 'REQ-OS-PM-004, REQ-OS-PM-007, REQ-OS-PM-008', 'WBS grammar and six levels (RR-01, RR-02); design tag mapping (03-enpro-os §3.1); S10 §05', () => `
  ${recordHead('P-260114', 'Lube oil system, 2 skids · Customer A', ['Execution', 'info'], btn('Share') + btn('Download WBS'))}
  <div class="panel" style="margin-bottom:14px">${kv([['EPN', epn(10)], ['Status', code('15 Tack weld')], ['Template', 'SED · LOS'], ['Dispatch', '18 Jan 2027 (internal) · 25 Jan 2027 (customer)'], ['SAP', status('Upload file generated, not yet read back', 'warn') + ' ' + tbc(PRJ_Q.wbs, 'OPEN DECISION · O-WBS')]])}</div>
  <div class="seg" role="group" aria-label="Project tabs" style="margin-bottom:14px">${['Structure', 'Schedule', 'Team', 'Documents', 'Registers', 'Customer viewer'].map((t, i) => `<button type="button" data-seg aria-pressed="${i === 0}">${t}</button>`).join('')}</div>
  <div class="cols"><div class="panel"><h2>WBS, six levels</h2>
    <div class="tbl wbs"><table><thead><tr><th>Level</th><th>Code</th><th>Name</th><th>Owner</th><th>Workflow</th><th>State</th></tr></thead><tbody>${WBS_ROWS.map(([l, c, n, o, w, st]) =>
      `<tr><td><span class="lv">L${l}</span></td><td style="padding-left:${(l - 1) * 10 + 10}px">${esc(c)}</td><td>${esc(n)}</td><td>${esc(o)}</td><td>${esc(w)}</td><td>${st === 'design tag' ? status('design tag', 'info') : st === 'replica' ? status('linked to 0A', '') : st ? esc(st) : ''}</td></tr>`).join('')}</tbody></table></div>
    <p class="hint">L5 items sit inside the L6 code here to keep the sample short. Grammar: ${code('[P|S|E]-YYNNNN-FG-<tag>-<SF|BO|DM|FI>-<item>-<NN>')} ${conflict(PRJ_Q.suffix)}</p></div>
  <div class="stack">
    <div class="panel"><h2>Check a code</h2><input class="ctl mono" id="wbsCheckInput" value="P-260114-FG-A1-XX-PMP-01" aria-label="WBS code"><div id="wbsCheckResult" class="state err" style="padding:10px 0 0;text-align:left">XX is not a valid L4 code. Use SF, BO, DM or FI.</div></div>
    <div class="panel"><h2>Design tag</h2><p class="hint">0A carries the design-once items and maps to A1 and A2. Replicating a skid clones the L3 subtree and links it to 0A (S07-3). ${tbc(PRJ_Q.design)}</p></div>
    <div class="panel"><h2>Customer viewer</h2><p class="hint">A per-project link with its own login and MFA, showing only customer-visible fields (REQ-OS-PM-007). ${tbc(PRJ_Q.viewer)}</p></div>
  </div></div>`,
  [PRJ_Q.design], 'SOURCE-DERIVED');

// gantt rows: [name, planned [start%, width%], actual, forecast, critical, baseline]
const GANTT = [
  ['P-260114 Lube oil system', [2, 94], [2, 10], [12, 86], false, [2, 90]],
  ['Pump datasheet and ITP (T2)', [4, 10], [4, 8], [12, 4], true, [4, 8]],
  ['RFQ to PO, 3 suppliers (T3 to T15)', [14, 22], null, [19, 24], true, [12, 22]],
  ['Base frame fabrication', [30, 20], null, [30, 20], false, [30, 20]],
  ['Kit 1 review (15 days before LOS start)', [36, 0], null, null, false, null],
  ['Assembly and welding', [50, 22], null, [52, 22], true, [48, 22]],
  ['Hydro test, painting, internal FAT', [72, 14], null, [74, 14], true, [70, 14]],
  ['Client FAT and despatch', [88, 8], null, [90, 8], true, [86, 8]]
];
const bar = (cls, r) => r ? `<span class="bar ${cls}" style="left:${r[0]}%;width:${Math.max(r[1], 0.8)}%"></span>` : '';

add('prj-gantt', 'Schedule', 'Projects', 'Project schedule: planned, actual and forecast', 'REQ-OS-PM-002, REQ-OS-PM-003', 'S10 §05; POC feature 1 (product-spec §6); CONTACT schedule and Gantt, functional reference only (RR-10)', () => {
  const view = pick('gantt-view', 'internal');
  const showBase = pick('gantt-base', 'off') === 'on';
  return `${switcher('gantt-view', 'Schedule', { internal: 'Internal', customer: 'Customer' })}${switcher('gantt-base', 'Baseline', { off: 'Hide', on: 'Show baseline 1' })}
  <p class="lede">${view === 'customer' ? 'The customer schedule: the same plan, with customer dates and only customer-visible rows.' : 'Forward pass to material receipt, a buffer, then backward from dispatch. Successors move when an activity slips; a receipt later than production start raises a conflict.'}</p>
  <div class="panel"><div class="gantt">
    <div class="g"><span></span><div class="scale"><span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span></div></div>
    ${GANTT.filter((r, i) => view === 'internal' || [0, 4, 7].includes(i)).map(([n, p, a, f, crit, b]) => `<div class="g"><span>${crit ? '<b>' + esc(n) + '</b>' : esc(n)}</span><div class="lane">${showBase ? bar('bl', b) : ''}${p[1] === 0 ? bar('ms', p) : bar('pl', p) + bar('ac', a) + bar('fc', f)}<span class="today" style="left:12%"></span></div></div>`).join('')}
  </div>
  <p class="hint" style="margin-top:10px">Outline: planned. Solid: actual. Hatched red: forecast. Diamond: milestone. Bold rows are on the critical path. Blue line: today. All four link types, several baselines and the buffer are required (REQ-OS-PM-003); links are not drawn in this sketch.</p></div>
  <div class="cols even" style="margin-top:14px"><div class="panel"><h2>Indent dates in the plan?</h2><p class="hint">CONTACT’s schedule carried planned, forecast and actual indent dates. ${tbc(PRJ_Q.indent)}</p></div>
  <div class="panel"><h2>Export</h2><p class="hint">MS Project export is one of Enpro’s 24 reports (RR-01). ${tbc(PRJ_Q.msp)} ${tbc(PRJ_Q.spi)}</p></div></div>`;
}, [], 'CONFIRMED');

// Despatch and closure (product-spec §2, §4.2; R3): the lifecycle stage after Quality. Drawn from the confirmed
// Closure feature row rather than walked screen by screen the way Projects' other tabs were with Enpro.
const CLOSURE_SEED = {
  dispatch: '18 Jan 2027',
  payments: [
    { m: 'Advance (30%)', received: true },
    { m: 'On dispatch (50%)', received: true },
    { m: 'On commissioning (20%)', received: false }
  ]
};
function closureState() { return loadJSON('enpro-os-wf-closure', CLOSURE_SEED); }
function togglePayment(el) {
  mutate('enpro-os-wf-closure', st => ({ ...st, payments: st.payments.map((p, i) => i === Number(el.dataset.i) ? { ...p, received: !p.received } : p) }), CLOSURE_SEED);
  render();
}
add('prj-closure', 'Despatch & closure', 'Projects', 'Despatch and closure', 'Closure feature row, product-spec §4.2 (not yet broken into individual REQ rows)', 'product-spec §2, §4.2 (R3)', () => {
  const st = closureState();
  const allPaid = st.payments.every(p => p.received);
  return `<p class="lede">P-260114 · the lifecycle stage after Quality, drawn here from the confirmed Closure feature row so it has a real screen rather than only appearing as a label on the lifecycle map.</p>
  ${steps([['Dispatch', st.dispatch], [term('TECO'), 'day after dispatch'], ['Internal ' + term('LLM'), '7 days after'], ['Customer LLM', '2 weeks after'], [term('LD') + ' analysis', ''], ['Credit note & ' + term('IRN'), ''], ['Closed', allPaid ? 'ready' : 'blocked on payment']], allPaid ? 7 : 5)}
  <div class="cols even" style="margin-top:16px">
    <div class="panel"><h2>Milestone payments</h2>
      ${st.payments.map((p, i) => `<label style="display:flex;gap:8px;align-items:center;padding:6px 0"><input type="checkbox" data-do="togglePayment" data-i="${i}" ${p.received ? 'checked' : ''}> ${esc(p.m)} ${p.received ? status('Received', 'good') : status('Outstanding', 'warn')}</label>`).join('')}
      <p class="hint">Closure happens only once every milestone payment above is received (product-spec §4.2) — tick the outstanding one and watch the stepper above reach Closed, for real, in this browser.</p></div>
    <div class="panel"><h2>Lessons-learnt</h2><p class="hint">An internal ${term('LLM')} at 7 days and a customer-facing one 2 weeks after dispatch, plus a per-department lessons-learnt presentation and an ${term('LD')} analysis, all precede the credit note and ${term('IRN')}.</p></div>
  </div>`;
}, [], 'SOURCE-DERIVED');
