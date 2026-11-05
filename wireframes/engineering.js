// Engineering: one task inside a WBS-based workflow. The Pump workflow (23 tasks, owned by Process, QA preparing the
// Vendor ITP in parallel at T2) and its checklists are SOURCE-DERIVED from RR-02. Office editing is OPEN DECISION O-DOCS.

const ENG_Q = {
  docs: 'O-DOCS: Word and Excel opened in desktop Office through SharePoint and OneDrive, under Enpro OS version control, instead of editing inside the app. Is that acceptable, in writing, before the POC demo?',
  rev: 'Revision convention: numeric with a reason log (datasheets), letters (ITPs), or R1 and R1.1 (the plan’s major and minor)?',
  sla: 'Durations or SLAs per workflow task: none are given in the workflow files',
  ko: 'On CONTACT checklists, what do K.O. and Weight mean, and do they stop a task from closing?',
  missing: 'Workflows still to receive: OPT/OFT and the MBOM shop issue workflow; 15 equipment checklists named but not supplied'
};

const ENG_TASK_SEED = { status: 'In progress', tone: 'info', checklist: [1, 2, 3, 4].map(i => ({ i, result: '', remark: '' })), hist: [] };
function engState() { return loadJSON('enpro-os-wf-engtask', ENG_TASK_SEED); }
function setCheckResult(el) {
  const i = Number(el.dataset.i);
  mutate('enpro-os-wf-engtask', st => ({ ...st, checklist: st.checklist.map(c => c.i === i ? { ...c, result: el.value } : c) }), ENG_TASK_SEED);
  render();
}
function setCheckRemark(el) {
  const i = Number(el.dataset.i);
  mutate('enpro-os-wf-engtask', st => ({ ...st, checklist: st.checklist.map(c => c.i === i ? { ...c, remark: el.value } : c) }), ENG_TASK_SEED);
}
function submitToChecker() {
  const st = engState();
  const unset = st.checklist.filter(c => !c.result);
  if (unset.length) { toast(`Fill every creator result before submitting (item${unset.length > 1 ? 's' : ''} ${unset.map(c => c.i).join(', ')} still blank).`); return; }
  mutate('enpro-os-wf-engtask', s => ({ ...s, status: 'Submitted, awaiting checker', tone: 'warn', hist: [['Just now', 'You', 'submitted the checklist to Process TL'], ...s.hist] }), ENG_TASK_SEED);
  render();
}

add('eng-task', 'Engineering task', 'Engineering', 'Engineering task: prepare the pump datasheet', 'REQ-OS-ENG-002, REQ-OS-ENG-003, REQ-OS-ENG-005', 'Pump workflow and checklists (RR-02); POC features 2, 3, 4, 6, 9 (product-spec §6); S10 §05', () => {
  const tab = pick('eng-tab', 'check');
  const st = engState();
  const submitted = st.status !== 'In progress';
  const tabs = {
    check: `<h2>Checklist 01 · Pump datasheet preparation <span class="chip">25 items</span></h2>
      ${table(['#', 'Check', 'Creator', 'Checker', 'Remark'], st.checklist.map(c => [String(c.i), `<span class="muted">Item ${c.i}, Enpro’s wording from Checklist 01</span>`,
        `<select class="ctl" aria-label="Creator result" data-do="setCheckResult" data-i="${c.i}" ${submitted ? 'disabled' : ''}><option value=""${c.result ? '' : ' selected'}>—</option><option${c.result === 'OK' ? ' selected' : ''}>OK</option><option${c.result === 'Not OK' ? ' selected' : ''}>Not OK</option><option${c.result === 'NA' ? ' selected' : ''}>NA</option></select>`,
        submitted ? '<span class="muted">With Process TL</span>' : '<span class="muted">After submit</span>',
        `<input class="ctl" aria-label="Remark" data-do="setCheckRemark" data-i="${c.i}" value="${esc(c.remark)}" ${submitted ? 'disabled' : ''}>`]))}
      <p class="hint">Creator and checker fill separate columns; the checker cannot edit the creator’s. Results and remarks here are saved for real, in this browser. Offer check (16 items) and POD check (18) follow at T7 and T17. ${tbc(ENG_Q.ko)}</p>`,
    docs: `<h2>Documents on this task</h2>
      ${table(['Document', 'Rev', 'State', ''], [
        [code('P-260114-DS-PMP-01') + ' Pump datasheet', 'R0', status('Draft · checked out by you', 'warn'), `${btn('Open in Excel')} ${tbc(ENG_Q.docs, 'OPEN DECISION · O-DOCS')}`],
        [code('EIPL-260114-ITP-PUMP') + ' Vendor ITP (QA)', 'A', status('In review', 'info'), btn('Annotate PDF')],
        ['Customer pump specification', '2', status('Released', 'good'), btn('View')]])}
      <div class="ai" style="margin-top:12px"><b>First draft of the datasheet</b> <span class="chip info">Draft by AI · held as draft</span><p class="hint" style="margin:6px 0 0">Filled from the customer specification and the template. Stays a draft until you submit and the checker releases it (REQ-OS-ENG-003).</p></div>
      <p class="hint">${tbc(ENG_Q.rev)}</p>`,
    hist: history([...st.hist, ['14 Oct 10:12', 'Process engineer', 'checked out the datasheet'], ['13 Oct 17:40', 'System', 'T1 Full kit skipped: Marketing supplied it at the KOM'], ['13 Oct 17:40', 'System', 'Pump workflow started when the WBS was ready']])
  };
  return `${recordHead('P-260114-FG-A1-BO-PMP-01', 'T2 Prepare pump datasheet', [st.status, st.tone], submitted ? btn('Reassign') : `<button class="btn primary" type="button" data-do="submitToChecker">Submit to checker</button>${btn('Reassign')}`)}
  <div class="panel" style="margin-bottom:14px">${kv([['Priority', epn(10) + ' EPN'], ['Owner', 'Process engineer · checker: Process TL'], ['Due', '16 Oct ' + tbc(ENG_Q.sla)], ['In parallel', 'Vendor ITP, QA engineer']])}</div>
  ${lifecycle([{ name: 'T1 Full kit', who: 'Marketing', sla: 'skipped' }, { name: 'T2 Datasheet and ITP', who: 'Process ∥ QA' }, { name: 'T3 to T10 Three supplier lanes', who: 'Buyer, Process' }, { name: 'T11 to T15 PR, budget, PO', who: 'Projects, Marketing, SCM' }, { name: 'T16 to T23 POD, receipt, complete', who: 'Process, QC' }], submitted ? 2 : 1, 'Releasing the datasheet starts the supply chain Bought Out workflow without waiting (03-enpro-os §3.3). Loops back at T1, T2, T5, T8, T12 and T18.')}
  <div style="margin-top:16px">${switcher('eng-tab', 'Tab', { check: 'Checklist', docs: 'Documents', hist: 'History' })}</div>
  <div class="panel">${tabs[tab]}</div>`;
}, [ENG_Q.missing], 'SOURCE-DERIVED');
