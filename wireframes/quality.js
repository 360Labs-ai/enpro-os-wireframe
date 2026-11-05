// Quality (03-enpro-os §3.8): an inspection on a phone, with a punch point. Mobile with offline capture is CONFIRMED
// (S10 §05) and a go-live need after the 9 Oct floor tour (S15, design consequence 2); its scope is INFERENCE.
// The 16 punch categories and H/W/R/A codes are SOURCE-DERIVED from RR-04 and RR-02.

const QA_Q = {
  offline: 'Offline scope: assigned inspections for today and the next working day, their checklists, readings, photos and punch points. Is that enough? (to agree with the QC lead)',
  hwra: 'ITP codes H, W and R read as hold, witness and review. What does A mean?',
  cats: 'Is the 16-value punch category list final? Workmanship (Visual) is 73% of all points, too coarse to act on',
  reject: 'On a QC reject inside an equipment workflow, does the task loop back to the production engineer, or raise a punch point?'
};

const PUNCH_SEED = [];
function punchPoints() { return loadJSON('enpro-os-wf-punch', PUNCH_SEED); }
function raisePunch() {
  const cat = document.getElementById('pp-cat').value;
  const src = document.getElementById('pp-src').value;
  const due = document.getElementById('pp-due').value || 'not set';
  mutate('enpro-os-wf-punch', rows => [{ id: `PP0657${rows.length}`, cat, src, due }, ...rows], PUNCH_SEED);
  render();
}
const INSPECT_SEED = { status: 'In progress', tone: 'info' };
function inspectState() { return loadJSON('enpro-os-wf-inspect', INSPECT_SEED); }
function releaseInspection() { mutate('enpro-os-wf-inspect', () => ({ status: 'Released · TPI offered', tone: 'good' }), INSPECT_SEED); render(); }
function holdInspection() { mutate('enpro-os-wf-inspect', () => ({ status: 'On hold', tone: 'warn' }), INSPECT_SEED); render(); }

add('qa-inspect', 'Inspection on a phone', 'Quality', 'Inspection on the floor', 'REQ-OS-QA-003, REQ-OS-QA-004, REQ-OS-QA-005', 'S10 §05; punch categories (RR-04); ITP codes (RR-02); POC features 3 and 8 (product-spec §6)', () => {
  const insp = inspectState();
  const punches = punchPoints();
  return `<p class="lede">A project QC engineer in a dead spot on the shop floor. Readings, photos and punch points save on the phone and send when connected. ${tbc(QA_Q.offline, 'INFERENCE')}</p>
  <div class="cols"><div class="phone">
    <div class="hint" style="margin-bottom:8px">${status('Offline', 'warn')} Saved on this phone. Sends when connected. ${status(insp.status, insp.tone)}</div>
    <div style="font-weight:700">Hydro test · P-260071-FG-A1</div><div class="hint">ITP stage 19 · ${status('H', 'info')} hold point · internal first, then customer witness ${tbc(QA_Q.hwra)}</div>
    <div class="field"><label class="lbl" for="qa-p">Test pressure (bar)<span class="req">*</span></label><input class="ctl" id="qa-p" type="number" value="21"></div>
    <div class="field"><label class="lbl" for="qa-h">Hold time (min)<span class="req">*</span></label><input class="ctl" id="qa-h" type="number" value="30"></div>
    <div class="field"><span class="lbl">Leaks found</span><div class="seg" role="group" aria-label="Leaks found"><button type="button" data-seg aria-pressed="true">No</button><button type="button" data-seg aria-pressed="false">Yes</button></div></div>
    <div class="photo">Tap to take a photo</div>
    <div class="btns"><button class="btn primary" type="button" data-do="releaseInspection">Release</button><button class="btn" type="button" data-do="holdInspection">Hold</button><button class="btn" type="button" data-do="raisePunch">Raise punch point</button></div>
  </div>
  <div class="stack">
    <div class="panel"><h2>Raise a punch point</h2>
      <div class="field"><label class="lbl" for="pp-cat">Category<span class="req">*</span> ${fmt('RR-04')}</label><select class="ctl" id="pp-cat"><option>Workmanship (Visual)</option><option>Workmanship (Welding)</option><option>Drawing/SVL/DS mismatch</option><option>Tagging</option><option>12 more from Enpro’s list</option></select></div>
      <div class="field"><label class="lbl" for="pp-src">Source</label><select class="ctl" id="pp-src"><option>Internal</option><option>Customer</option><option>Both</option></select></div>
      <div class="field"><label class="lbl" for="pp-resp">Responsibility</label><select class="ctl" id="pp-resp"><option>From Enpro’s responsibility list</option></select></div>
      <div class="field"><label class="lbl" for="pp-due">Due date</label><input class="ctl" id="pp-due" type="date"></div>
      <p class="hint">Closed only after someone else verifies it; cost goes to ${term('COPQ')}. ${tbc(QA_Q.cats)}</p>
      ${punches.length ? `<div class="status-list" style="margin-top:8px">${punches.map(p => `<div><span><b>${code(p.id)}</b><br><span class="hint">${esc(p.cat)} · ${esc(p.src)} · due ${esc(p.due)}</span></span>${status('Raised', 'warn')}</div>`).join('')}</div><p class="hint">Raised for real, in this browser, by “Raise punch point” above.</p>` : ''}</div>
    <div class="panel"><h2>Then</h2><p class="hint">Release lets production move on and offers the TPI call. Released inspection reports and punch closures flow into the MDR, which is locked once issued.</p></div>
  </div></div>`;
}, [QA_Q.reject], 'CONFIRMED');
