// Change and issue management (03-enpro-os §3.9, product-spec §4.9): two separate 13-step workflows sharing
// masters, the DCR and horizontal deployment. Not in the 12-feature POC, but full Phase 1 scope for 15 Jan 2027
// (03-enpro-os §11). Runs across every other stage of the lifecycle (product-spec §2), so this screen is a log
// across projects rather than one more per-project tab.

const CHG_Q = {
  matrix: 'The approval matrix by change type and value is OPEN (product-spec §4.9, RR-05) — who signs a change above what cost is not yet defined.',
  numbering: 'DCR, Change Control Record and Issue numbering formats beyond the DCR pattern itself are UNKNOWN (tech-spec, os_change schema note).'
};

const CHANGE_SEED = [
  { id: 'CHG-14', project: 'P-260114', what: 'Customer revised seal flush plan from Plan 11 to Plan 53', cat: 'Model or design', status: status('CFT meeting held · MOM logged', 'info') },
  { id: 'CHG-13', project: 'P-260098', what: 'Delivery date moved 3 weeks at customer request', cat: 'Delivery date', status: status('DCR issued', 'good') }
];
const ISSUE_SEED = [
  { id: 'ISS-31', project: 'P-260114', what: 'Vendor ITP missing hold point for hydrotest witness', sev: 'Major', status: status('TL + HOD cost/time approval pending', 'warn'), flagsLLM: true },
  { id: 'ISS-28', project: 'P-260071', what: 'Base frame drawing revision not propagated to shop copy', sev: 'Minor', status: status('Closed, RCA logged', 'good'), flagsLLM: false }
];
function changes() { return loadJSON('enpro-os-wf-changes', CHANGE_SEED); }
function issues() { return loadJSON('enpro-os-wf-issues', ISSUE_SEED); }
function logChange() {
  const what = document.getElementById('chg-what').value.trim();
  if (!what) { toast('Describe the change before logging it.'); return; }
  const cat = document.getElementById('chg-cat').value;
  mutate('enpro-os-wf-changes', rows => [{ id: `CHG-${15 + rows.length}`, project: 'P-260114', what, cat, status: status('Logged · duplicate check running', 'warn') }, ...rows], CHANGE_SEED);
  render();
}
function logIssue() {
  const what = document.getElementById('iss-what').value.trim();
  if (!what) { toast('Describe the issue before raising it.'); return; }
  const sev = document.getElementById('iss-sev').value;
  mutate('enpro-os-wf-issues', rows => [{ id: `ISS-${32 + rows.length}`, project: 'P-260114', what, sev, status: status('Raised · awaiting TL/HOD approval', 'warn'), flagsLLM: sev === 'Major' }, ...rows], ISSUE_SEED);
  render();
}

add('chg-log', 'Change & issue log', 'Change & issue management', 'Change and issue management', 'REQ named in product-spec §4.9 (not yet broken into individual REQ rows)', 'product-spec §4.9; 03-enpro-os.md §3.9; tech-spec (os_change schema)', () => {
  const ch = changes(), is = issues();
  return `<p class="lede">An outline draft from the confirmed feature table — not yet walked screen by screen with Enpro. Two separate 13-step workflows share this log: a customer <b>Change</b> (logged, PE acknowledges, a CFT meets with ${term('MOM')}, impact is assessed, the customer approves with a PO amendment, a ${term('DCR')} is issued) and an internal <b>Issue</b> (raised by anyone, cost/time impact approved by the project ${term('TL')} and ${term('HOD')}, ${term('COPQ')} assigned by cause, a Major one flags an ${term('LLM')}). ${tbc(CHG_Q.matrix)}</p>
  <div class="cols">
    <div class="panel"><h2>Customer changes</h2>
      ${table(['ID', 'Project', 'What changed', 'Category', 'Status'], ch.map(c => [c.id, code(c.project), esc(c.what), esc(c.cat), c.status]))}
      <div class="field" style="margin-top:10px"><label class="lbl" for="chg-what">Log a new change</label><textarea class="ctl" id="chg-what" placeholder="What the customer is asking to change, and where"></textarea></div>
      <div class="field"><label class="lbl" for="chg-cat">Category</label><select class="ctl" id="chg-cat"><option>Scope</option><option>Model or design</option><option>Delivery date</option><option>Logistic terms</option><option>Specification or certification</option><option>AVL</option></select></div>
      <div class="btns"><button class="btn primary" type="button" data-do="logChange">Log change</button></div></div>
    <div class="panel"><h2>Internal issues</h2>
      ${table(['ID', 'Project', 'What happened', 'Severity', 'Status'], is.map(i => [i.id, code(i.project), esc(i.what) + (i.flagsLLM ? ` ${status('Flags LLM', 'warn')}` : ''), i.sev, i.status]))}
      <div class="field" style="margin-top:10px"><label class="lbl" for="iss-what">Raise a new issue</label><textarea class="ctl" id="iss-what" placeholder="What happened, and on which task or document"></textarea></div>
      <div class="field"><label class="lbl" for="iss-sev">Severity</label><select class="ctl" id="iss-sev"><option>Minor</option><option>Major</option></select></div>
      <div class="btns"><button class="btn primary" type="button" data-do="logIssue">Raise issue</button></div></div>
  </div>
  <div class="panel" style="margin-top:14px"><h2>${term('DCR')} numbering and horizontal deployment</h2><p class="hint">A DCR is numbered <code class="mono">&lt;WO&gt;-DCR-&lt;seq&gt;-&lt;yyyymmdd&gt;</code> with a 32-line checklist. Horizontal deployment lists related projects and pushes the same action to each one tagged. ${tbc(CHG_Q.numbering)}</p></div>`;
}, [CHG_Q.matrix, CHG_Q.numbering], 'SOURCE-DERIVED');
