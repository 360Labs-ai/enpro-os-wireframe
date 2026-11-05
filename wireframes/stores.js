// Stores (03-enpro-os §3.6): inward acceptance from the gate to the store. SAP owns GRN, stock and movements; Enpro OS
// holds the tasks and decisions around them. Steps and the 52 commodity checklists are SOURCE-DERIVED from RR-03.
// Gate entry is OPEN DECISION O-GATE; how ZQA32 lots reach Enpro OS is OPEN DECISION O-ZREP.

const STR_Q = {
  gate: 'O-GATE: does security create the gate entry in SAP (Enpro’s store flowchart) or in Enpro OS (R3)? Needed by 23 Oct',
  zrep: 'O-ZREP: how ZQA32 inspection lots and usage decisions reach Enpro OS (RFC, CDS view or OData), who builds it and who pays',
  qm: 'After a rejection, does the SAP QM notification stay alongside the automatic punch point, or does the punch point replace it?',
  webhook: 'Is the SAP webhook for QC after GRN built, and in which environments?'
};

const INWARD_SEED = { step: 5, status: 'Under QC', tone: 'info' };
function inwardState() { return loadJSON('enpro-os-wf-inward', INWARD_SEED); }
function acceptInward() {
  mutate('enpro-os-wf-inward', () => ({ step: 7, status: 'Accepted · issued to shop', tone: 'good' }), INWARD_SEED);
  render();
}
function holdInward() {
  mutate('enpro-os-wf-inward', st => ({ ...st, status: 'On hold · QC query raised', tone: 'warn' }), INWARD_SEED);
  render();
}

add('str-inward', 'Inward acceptance', 'Stores', 'Inward acceptance: gate to store', 'REQ-OS-STR-002, REQ-OS-QA-007', 'Store and inward quality workflow, 52 checklists, ZQA32 and QM samples (RR-03); S10 §05', () => {
  const gate = pick('gate', 'sap');
  const inw = inwardState();
  return `${recordHead('PO 4500012345 (sample)', 'Pump set for P-260114-FG-A1-BO-PMP-01 · Supplier B', [inw.status, inw.tone], inw.step < 7 ? `<button class="btn primary" type="button" data-do="acceptInward">Accept</button><button class="btn" type="button" data-do="holdInward">Hold</button>` : '')}
  ${steps([['Gate entry', gate === 'sap' ? 'security, in SAP' : 'security, in Enpro OS'], ['Documents', 'invoice, LR, e-way bill, MTC'], ['Physical check', 'coordinator'], ['GRN', 'read from SAP'], ['Laser tag', 'by item code'], ['QC', 'commodity checklist'], ['Usage decision', 'ZQA32'], ['Store', 'or rejection area']], inw.step)}
  <p class="hint">“Accept” and “Hold” are real, in this browser: Accept moves the tracker above to Store; Hold keeps this at QC and flags the record.</p>
  <div class="cols" style="margin-top:16px"><div class="panel">
    <h2>Pump receipt inspection <span class="chip">30 items</span> ${fmt('RR-03', 'ID/QAC/26.41')}</h2>
    ${kv([['GRN no.', '5000098765 (from SAP)'], ['Lot / heat / serial', 'LOT-2210'], ['Lot quantity', '2'], ['Inspected quantity', '<input class="ctl" type="number" value="2" aria-label="Inspected quantity" style="max-width:90px">']])}
    ${table(['#', 'Check', 'QC verification'], [1, 2, 3].map(i => [String(i), `<span class="muted">Item ${i}, Enpro’s wording from the pump receipt checklist</span>`, '<select class="ctl" aria-label="Result"><option>OK</option><option>Not OK</option></select>']))}
    <p class="hint">Consumables skip QC. Each item loops until accepted.</p></div>
  <div class="stack">
    <div class="panel"><h2>Gate entry ${tbc(STR_Q.gate, 'OPEN DECISION · O-GATE')}</h2>${switcher('gate', 'Made in', { sap: 'SAP', app: 'Enpro OS' }, 'sap')}<p class="hint">${gate === 'sap' ? 'Read from SAP with the PO; the stores team sees it here.' : 'Security raises it here by PO; the reference is pushed or keyed into SAP.'}</p></div>
    <div class="panel"><h2>If rejected</h2><p class="hint">The usage decision in SAP and the QM notification create a punch point here automatically, then NCR or rework, an R-code reject in SAP, or a replacement by the buyer. ${tbc(STR_Q.qm, 'OPEN DECISION')}</p></div>
    <div class="panel"><h2>From SAP</h2><p class="hint">GRN, inspection lots and usage decisions are read, never written. ${tbc(STR_Q.zrep, 'OPEN DECISION · O-ZREP')} ${tbc(STR_Q.webhook)}</p></div>
  </div></div>`;
}, [], 'SOURCE-DERIVED');
