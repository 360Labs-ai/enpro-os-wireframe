// Customer submittals (03-enpro-os §3.4): the master document list per project and a transmittal.
// The 11-step flow, transmittal types, status codes 1 to 5 and the 14-day cycle are SOURCE-DERIVED from RR-02.

const SUB_Q = {
  codes: 'Customer status codes: the proposed set (1 Approved, 2 Minor comments, 3 Not approved, 4 Retained, 5 Rejected) or the existing report (3 Rejected, 5 Waiting for comments)?',
  mailbox: 'Transmittals go out from a shared service mailbox, or from each document owner’s own mailbox? (C-2)',
  migrate: 'Do we migrate historical transmittals from CONTACT and WRENCH?',
  dedupe: 'Will Enpro fill the blank effort and format columns in the 225-document master and remove duplicate variants (for example 5 per motor across 8 motors)?'
};
const CODE = { 1: ['1 Approved', 'good'], 2: ['2 Minor comments', 'warn'], 3: ['3 Not approved', 'bad'], 4: ['4 Retained', ''], 5: ['5 Rejected', 'bad'] };

const TRANSMITTAL_SEED = { checked: false, sent: [] };
function trState() { return loadJSON('enpro-os-wf-transmittal', TRANSMITTAL_SEED); }
function checkPackage() {
  mutate('enpro-os-wf-transmittal', st => ({ ...st, checked: true }), TRANSMITTAL_SEED);
  render();
}
function reviewEmailDraft() {
  const typeSel = document.getElementById('tr-type');
  const type = typeSel ? typeSel.value : 'Issued for Approval';
  mutate('enpro-os-wf-transmittal', st => {
    const num = `TR-${String(st.sent.length + 7).padStart(4, '0')}`;
    return { ...st, sent: [{ num, type }, ...st.sent] };
  }, TRANSMITTAL_SEED);
  render();
}

add('sub-mdl', 'Document list and transmittal', 'Submittals', 'Customer submittals: document list and transmittal', 'REQ-OS-ENG-006, REQ-DOC-013, REQ-INT-010', 'Submittal flow, codes and 225-document master (RR-02); POC feature 5 (product-spec §6)', () => {
  const st = trState();
  const latest = st.sent[0];
  return `<p class="lede">P-260114 · seeded from Enpro’s 225-document master list (Process 85, E&I 88, DA&D 31, QA 21). A code 2, 3 or 5 returns the document to its owner for resubmission; 1 and 4 close it. ${conflict(SUB_Q.codes)}</p>
  ${states('sub-mdl', () => table(['Document', 'Discipline', 'Owner', 'Rev', 'Sent', 'Due back#', 'Customer code', ''], [
    [code('P-260114-PID-01') + ' P&ID', 'Process', 'Process engineer', 'B', '30 Sep', '14 Oct', status(...CODE[3]), `<a href="${go('eng-task')}">Resubmit</a>`],
    [code('P-260114-GA-01') + ' General arrangement', 'DA&D', 'DA&D engineer', 'A', '6 Oct', '20 Oct', status('Waiting', 'info'), btn('Remind')],
    [code('P-260114-DS-PMP-01') + ' Pump datasheet', 'Process', 'Process engineer', 'R0', '', '', status('In preparation', ''), ''],
    [code('EIPL-260114-ITP') + ' Inspection and test plan', 'QA', 'QA engineer', 'A', '2 Oct', '16 Oct', status(...CODE[2]), btn('Open comments')],
    [code('P-260114-ELD-01') + ' Electrical load list', 'E&I', 'E&I engineer', '0', '24 Sep', '8 Oct', status(...CODE[1]), '']]),
    ['No documents on this project yet', 'The list is generated from the template when the project is created.', 'Generate from master list'],
    'The document list did not load. Nothing was sent; try again.')}
  <div class="cols" style="margin-top:16px">
    <div class="panel"><h2>New transmittal</h2>
      <div class="field"><label class="lbl" for="tr-type">Type</label><select class="ctl" id="tr-type"><option>Issued for Approval</option><option>Issued for Information</option><option>Issued for Construction</option><option>As Built</option></select></div>
      <div class="field"><span class="lbl">Number</span><input class="ctl" readonly value="${latest ? esc(latest.num) : 'Generated on send'}"></div>
      <div class="field"><span class="lbl">Recipients</span><input class="ctl" readonly value="Authorised customer contacts for P-260114"></div>
      <div class="field"><span class="lbl">Package</span><span class="hint">GA rev A, ITP rev A (2 documents)</span></div>
      <div class="btns"><button class="btn" type="button" data-do="checkPackage">Check package</button><button class="btn primary" type="button" data-do="reviewEmailDraft">Review email draft</button></div>
      <p class="hint">Sent through Outlook; the customer’s reply is matched by transmittal number and its comments become tasks for the document owners (AI extracts, the owner confirms). ${tbc(SUB_Q.mailbox, 'OPEN DECISION · C-2')}</p>
      ${latest ? `<div class="panel" style="margin-top:10px;background:var(--sunk)"><h2>Drafted email</h2><pre style="white-space:pre-wrap;font:12.5px/1.5 var(--f-body);margin:0">Subject: ${esc(latest.type)} — P-260114 — ${esc(latest.num)}
To: Authorised customer contacts for P-260114
Package: GA rev A, ITP rev A (2 documents)

Please find attached transmittal ${esc(latest.num)} (${esc(latest.type)}) for P-260114. Kindly acknowledge receipt and return your comments within 14 days.</pre></div>` : ''}
      ${st.sent.length > 1 ? `<p class="hint" style="margin-top:8px">Earlier this session: ${st.sent.slice(1).map(t => esc(t.num)).join(', ')}</p>` : ''}</div>
    <div class="stack">
      <div class="panel"><h2>Package check</h2>${st.checked
        ? `<div class="status-list"><div><span>Latest released revision of each document</span>${status('Pass', 'good')}</div><div><span>Title block matches the transmittal</span>${status('Pass', 'good')}</div><div><span>Recipient authorised for this project</span>${status('Pass', 'good')}</div></div>`
        : `<div class="state"><b>Not checked yet</b>Click “Check package” to run the three checks against this transmittal.</div>`}</div>
      <div class="panel"><h2>Flow</h2>${steps([['MDL', ''], ['Prepare', ''], ['Review', ''], ['Transmittal', ''], ['Email draft', ''], ['Issue', ''], ['Code', '']], latest ? 5 : (st.checked ? 4 : 3))}<p class="hint">Enpro’s 11 steps, shortened here (RR-02). The stage above moves as you check the package and draft the email, for real, in this browser. ${tbc(SUB_Q.migrate)}</p></div>
    </div></div>`;
}, [SUB_Q.dedupe], 'SOURCE-DERIVED');
