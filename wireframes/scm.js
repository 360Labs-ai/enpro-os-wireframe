// Supply chain (03-enpro-os §3.5): the buyer's indent list and the techno-commercial comparison.
// The six SCM workflow types, the PO types that skip the RFQ and the comparison sheet (3 supplier lanes x 4 revisions,
// LPO benchmark, budget overrun per WBS, TL, SM and GM sign-off) are SOURCE-DERIVED from RR-03.

const SCM_Q = {
  fx: 'Exchange rate per supplier on the comparison: SAP rates, or typed by the buyer?',
  tl: 'Buyer matrix: four team leaders (R3) or five (Rev 17)? Seven material groups are unassigned and P48 is unmapped',
  budget: 'Budget overrun per WBS needs the SAP budget read (flow 8) in Phase 1. Who triggers a budget change in SAP, and when?',
  real: 'May the POC comparison use real (masked) supplier offers, or synthetic offers only? (C-12)',
  zmaster: 'Kit OK comes from Zmaster today. With Zmaster’s logic moving into Enpro OS (9 Oct), send its rules, not only its output',
  sub: 'Sub Contract was removed from the equipment workflows in R1. Is it an SCM workflow type now, or still current?'
};

add('scm-indents', 'Indents and RFQs', 'Supply chain', 'Indents and RFQs', 'REQ-OS-SCM-001, REQ-OS-SCM-002, REQ-WF-007', 'Six SCM workflow types, PO types and buyer matrix (RR-03); S10 §05', () => `
  <p class="lede">Purchasing group P12 · everything waiting on this buyer, by EPN. An RFQ cannot go out until the datasheet and ITP are released and the kit check passes.</p>
  ${table(['EPN', 'WBS', 'Workflow', 'Ready for RFQ?', 'PO type', 'Next', ''], [
    [epn(10), code('P-260114-FG-A1-BO-PMP-01'), 'Bought Out · 44 tasks', status('Yes', 'good'), 'RFQ to 3 AVL suppliers', 'Offers due 20 Oct', `<a href="${go('scm-compare')}">Compare</a>`],
    [epn(30), code('P-260071-FG-A1-BO-EHR-01'), 'Bought Out · 44 tasks', status('Datasheet in review', 'warn'), 'RFQ', 'Waiting for Process', ''],
    [epn(40), code('P-260071-FG-A1-SF-MBF-01'), 'SF-STD · 20 tasks', status('Yes', 'good'), 'Repeat PO at last price · no RFQ', 'Raise PO in SAP', btn('Open')],
    [epn(50), code('P-260040-FG-A2-SF-TNK-01'), 'SF-Plate · 17 tasks', status('Kit Not OK', 'bad'), 'Check stock first', 'Stores', '']])}
  <div class="cols even" style="margin-top:14px"><div class="panel"><h2>Kit readiness</h2><p class="hint">Kit OK or Kit Not OK per material, read from SAP until Enpro OS computes it. ${tbc(SCM_Q.zmaster, 'OPEN DECISION · O-ZREP')}</p></div>
  <div class="panel"><h2>Buyer assignment</h2><p class="hint">Material group → purchasing group → buyer and team leader, from Enpro’s matrix. ${conflict(SCM_Q.tl)}</p></div></div>`,
  [SCM_Q.sub], 'SOURCE-DERIVED');

const LANES = [
  ['Supplier A', 'INR', '4,10,000', '3,96,000', '3,88,000', '', '12 weeks', '30% advance', 92, 'L2'],
  ['Supplier B', 'EUR', '4,32,000', '4,05,000', '3,79,000', '3,72,000', '14 weeks', '100% on delivery', 88, 'L1'],
  ['Supplier C', 'INR', '4,55,000', '4,40,000', '', '', '10 weeks', '50% advance', 71, 'L3']
];
// Sign-off: stage is the chain's current "on" index into SIGNOFF_LEVELS, matching lifecycle()'s own on-index
// convention (everything before it is done, that index is current). 4 means every level has signed.
const SIGNOFF_LEVELS = [{ name: 'Buyer', who: 'recommends' }, { name: 'Team Lead', who: 'signs' }, { name: 'Senior Manager', who: 'signs' }, { name: 'General Manager', who: 'signs' }];
const SIGNOFF_SEED = { stage: 1 };
const SIGNOFF_STATUS = { 1: ['Waiting for TL', 'warn'], 2: ['Waiting for SM', 'warn'], 3: ['Waiting for GM', 'warn'], 4: ['Signed · ready for PO', 'good'] };
function signoffState() { return loadJSON('enpro-os-wf-signoff', SIGNOFF_SEED); }
function advanceSignoff() {
  mutate('enpro-os-wf-signoff', st => ({ stage: Math.min(st.stage + 1, SIGNOFF_LEVELS.length) }), SIGNOFF_SEED);
  render();
}

add('scm-compare', 'Comparison', 'Supply chain', 'Techno-commercial comparison', 'REQ-OS-SCM-003, REQ-AI-014', 'Comparison sheet (RR-03); POC feature 12 (product-spec §6); S10 §07', () => {
  const so = signoffState();
  return `${recordHead('P-260114-FG-A1-BO-PMP-01', 'Pump, Bought Out workflow · comparison REV 3', SIGNOFF_STATUS[so.stage], so.stage < SIGNOFF_LEVELS.length ? `<button class="btn primary" type="button" data-do="advanceSignoff">Send for sign-off</button>` : btn('Raise PO in SAP', 'primary'))}
  <p class="lede">Three AVL supplier lanes, up to four price revisions each. Sample figures in rupees after conversion. ${tbc(SCM_Q.real, 'OPEN DECISION · C-12')}</p>
  <div class="panel">${table(['Line', ...LANES.map(l => l[0])], [
    ['Currency and rate', ...LANES.map(l => `${l[1]} ${l[1] === 'INR' ? '' : tbc(SCM_Q.fx, 'OPEN DECISION')}`)],
    ['REV 0 total', ...LANES.map(l => l[2])],
    ['REV 1 total', ...LANES.map(l => l[3])],
    ['REV 2 total', ...LANES.map(l => l[4] || '<span class="muted">none</span>')],
    ['REV 3 total', ...LANES.map(l => l[5] || '<span class="muted">none</span>')],
    ['Extra charges (documents, certification, packing, site support)', '12,000', '18,500', '9,000'],
    ['Delivery', ...LANES.map(l => l[6])],
    ['Payment terms', ...LANES.map(l => l[7])],
    ['Compliance score against the offer checklist', ...LANES.map(l => `${l[8]} / 100 <span class="chip info">AI</span>`)],
    ['Rank', ...LANES.map(l => `<b>${l[9]}</b>`)]])}</div>
  <div class="cols" style="margin-top:14px">
    <div class="panel"><h2>Against benchmark and budget</h2>${kv([['Last PO (LPO), from SAP', '3,64,000 · 11 months ago'], ['Allocated budget, this WBS', '3,80,000'], ['L1 against budget', status('Over by 10,500', 'bad') + ' · Additional budget required: goes to Marketing']])}
      <p class="hint">${tbc(SCM_Q.budget)}</p></div>
    <div class="stack"><div class="ai"><b>Recommendation</b> <span class="chip info">Draft by AI · buyer decides</span><p class="hint" style="margin:6px 0 0">Supplier B is lowest after conversion and meets the datasheet except one deviation on seal flushing, noted in its offer. Supplier A is two weeks faster.</p></div>
      <div class="panel"><h2>Sign-off</h2>${lifecycle(SIGNOFF_LEVELS, so.stage)}<p class="hint">Real against this browser: “Send for sign-off” moves the chain one level at a time.</p></div></div>
  </div>`;
}, [], 'SOURCE-DERIVED');
