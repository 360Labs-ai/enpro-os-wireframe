// Customer service (03-enpro-os §3.11, product-spec §4.11): complaints, warranty and site visits, after dispatch.
// Not in the 12-feature POC, but full Phase 1 scope for 15 Jan 2027 (03-enpro-os §11). Migration brings in 255
// existing complaints and 28 site visits (tech-spec, migration section); legacy complaint-number conversion is OPEN.

const CS_Q = {
  source: 'Whether the website complaint form already exists, and what it posts to, is UNKNOWN (product-spec §4.11).',
  sap: 'The SAP service-order flow a warranty complaint creates is UNKNOWN beyond being named (product-spec §4.11).'
};

const COMPLAINT_SEED = [
  { id: 'CC-26-0041', project: 'P-250311', item: 'FG-A1-BO-PMP-01, seal leak reported by site team', warranty: true, logged: '18 Oct', status: 'Engineer assigned · closure committed 20 Oct', tone: 'warn' },
  { id: 'CC-26-0038', project: 'P-250298', item: 'FG-0A-SF-ISO-01, pipe support fabrication defect', warranty: false, logged: '9 Oct', status: 'Out-of-warranty offer approved by VP Marketing', tone: 'info' },
  { id: 'CC-25-0255', project: 'P-240177', item: 'FG-A2-SF-TNK-01, panel wiring rework', warranty: true, logged: '2 Sep', status: 'Closed on customer confirmation', tone: 'good' }
];
function complaints() { return loadJSON('enpro-os-wf-complaints', COMPLAINT_SEED); }
function logComplaint() {
  const project = document.getElementById('cs-project').value.trim();
  const item = document.getElementById('cs-what').value.trim();
  if (!project || !item) { toast('Add a project and what the customer reported.'); return; }
  const warranty = document.getElementById('cs-warranty').value === 'Yes';
  mutate('enpro-os-wf-complaints', rows => {
    const year = '26'; // sample clock: this draft's "today" is 23 Oct 2026, financial year starting 1 April
    const seq = rows.filter(r => r.id.startsWith(`CC-${year}-`)).length + 1;
    return [{ id: `CC-${year}-${String(seq).padStart(4, '0')}`, project, item, warranty, logged: '23 Oct', status: 'Acknowledgement sent · engineer assignment pending', tone: 'warn' }, ...rows];
  }, COMPLAINT_SEED);
  render();
}

add('cs-complaint', 'Complaint', 'Customer service', 'Customer service: complaint to closure', 'REQ named in product-spec §4.11 (not yet broken into individual REQ rows)', 'product-spec §4.11; 03-enpro-os.md §3.11; tech-spec (os_service schema, migration section)', () => {
  const rows = complaints();
  const open = rows.filter(r => r.tone !== 'good').length;
  return `<p class="lede">An outline draft from the confirmed feature table — not yet walked screen by screen with Enpro. A complaint is logged from email or a website form, acknowledged with closure committed inside 2 days, checked against warranty, and if out of warranty needs a VP Marketing-approved offer before a service project, SAP service order and any site visit proceed. ${tbc(CS_Q.source)}</p>
  <div class="grid">${tile('Open complaints', open)}${tile('Migration backlog', '255 + 28', 'complaints and site visits, per tech-spec')}${tile('Closure commitment', '2 days', 'from acknowledgement')}</div>
  ${table(['Complaint', 'Project', 'Item', 'Warranty', 'Logged', 'Status'], rows.map(r => [code(r.id), code(r.project), esc(r.item), r.warranty ? status('In warranty', 'good') : status('Out of warranty', 'warn'), r.logged, status(r.status, r.tone)]))}
  <div class="panel" style="margin-top:14px"><h2>Log a complaint</h2>
    <div class="field"><label class="lbl" for="cs-project">Project</label><input class="ctl" id="cs-project" placeholder="e.g. P-260114" value="P-260114"></div>
    <div class="field"><label class="lbl" for="cs-what">What the customer reported</label><textarea class="ctl" id="cs-what" placeholder="e.g. Seal leak on skid 2, reported by site team"></textarea></div>
    <div class="field"><label class="lbl" for="cs-warranty">Warranty</label><select class="ctl" id="cs-warranty"><option>Yes</option><option>No</option></select></div>
    <div class="btns"><button class="btn primary" type="button" data-do="logComplaint">Log complaint</button></div>
    <p class="hint">Numbered <code class="mono">CC-YY####</code>, financial year resetting 1 April. Logging here assigns the next number for real, in this browser.</p></div>
  <div class="cols even" style="margin-top:14px">
    <div class="panel"><h2>If out of warranty</h2><p class="hint">An offer is drafted and needs VP Marketing approval before a short service project (an A- WBS prefix) and SAP service order are created.</p></div>
    <div class="panel"><h2>Site visit</h2><p class="hint">Travel, third-party and other expenses roll up per complaint and per project. ${tbc(CS_Q.sap)}</p></div>
  </div>`;
}, [CS_Q.source, CS_Q.sap], 'SOURCE-DERIVED');
