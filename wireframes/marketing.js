// Marketing: the technical proposal engine, moved into Phase 1 by R3 (S11 OS Introduction r13-14, carried into S10 §05).
// AI sorts, drafts and lists conflicts; the marketing engineer accepts or rejects every one (S10 §07, S15-61).

const MKT_Q = {
  enq: 'In Phase 1 there is no CRM (it is Phase 2). What does a technical proposal hang on: an enquiry number typed by Marketing, or an enquiry register in Phase 1?',
  ai: 'May masked customer specifications go to hosted AI models under zero-retention terms, or must they stay on a model inside Enpro’s cloud project? (C-12)',
  bed: 'Send a Basic Engineering Document and a datasheet in Enpro’s format to use as the generation templates',
  userList: 'Is the User List generator (past supplies by product, seven product sheets) in Phase 1?',
  signoff: 'Should the Engineering Sign-off Sheet (22 Marketing inputs, priority and owner) be master data in Enpro OS?',
  capacity: 'Which capacity figures does the timeline fit check use before an order exists (shop load, engineering hours)?',
  doa: 'No Delegation of Authority matrix exists at Enpro today for commercial pricing approval (S05-24) — Phase 2 cannot enforce one until Enpro defines it.'
};

const CRS_SEED = [
  { n: '1', conflict: 'Datasheet asks for API 614; the general specification cites API 610 for the pumps', where: 'Datasheet p.2 · Spec §4.3', decision: null },
  { n: '2', conflict: 'Two different design temperatures for the cooler', where: 'P&ID note 7 · Datasheet line 31', decision: null },
  { n: '3', conflict: 'Vendor list names one approved pump maker; the RFQ asks for three quotes', where: 'Vendor list · RFQ §2', decision: 'Accepted' }
];
function crsRows() { return loadJSON('enpro-os-wf-crs', CRS_SEED); }
function decideCRS(el) {
  mutate('enpro-os-wf-crs', rows => rows.map(r => r.n === el.dataset.n ? { ...r, decision: el.dataset.decision } : r), CRS_SEED);
  render();
}
const SPEC_SEED = [
  { f: 'RFQ, rev 0', fo: 'RFQ and commercial', confirmed: true },
  { f: 'P&ID, rev B', fo: 'Drawings', confirmed: false },
  { f: 'General specification, edition 2024', fo: 'Standards and specs', confirmed: false },
  { f: 'Approved vendor list', fo: 'Vendor lists', confirmed: true }
];
function specRows() { return loadJSON('enpro-os-wf-spec', SPEC_SEED); }
function confirmSpec(el) {
  mutate('enpro-os-wf-spec', rows => rows.map((r, i) => i === Number(el.dataset.i) ? { ...r, confirmed: true } : r), SPEC_SEED);
  render();
}

add('mkt-proposal', 'Technical proposal', 'Marketing', 'Technical proposal: from customer documents to a Basic Engineering Document', 'REQ-OS-P2-002, REQ-AI-014', 'S10 §05; S11 OS Introduction r13-14; product-spec §4.1', () => {
  const crs = crsRows(), spec = specRows();
  return `${recordHead('ENQ-0412 (sample)', 'Lube oil system for a refinery compressor · Customer A', ['Technical review', 'info'], btn('Generate proposal (technical part)', 'primary'))}
  <p class="lede">${tbc(MKT_Q.enq)} ${tbc(MKT_Q.ai, 'OPEN DECISION · C-12')}</p>
  ${steps([['Ingest', 'RFQ, P&ID, GA, specs, vendor lists'], ['Sort', 'AI files them, you confirm'], ['Conflicts', 'into the CRS'], ['Draft', 'BOMs, datasheets, vendor list, BED'], ['Estimate', 'work content and timeline'], ['Release', 'technical proposal']], 2)}
  <div class="cols" style="margin-top:16px">
    <div class="panel"><h2>${term('CRS')}</h2>
      ${table(['#', 'Conflict found', 'Where', 'Decision'], crs.map(r => [r.n, esc(r.conflict), r.where,
        r.decision ? status(r.decision, r.decision === 'Accepted' ? 'good' : 'bad')
          : `<button class="btn" type="button" data-do="decideCRS" data-n="${r.n}" data-decision="Accepted">Accept</button> <button class="btn" type="button" data-do="decideCRS" data-n="${r.n}" data-decision="Rejected">Reject</button>`]))}
      <p class="hint">Each conflict cites both places. Nothing reaches the customer until the engineer accepts or rejects it, for real, in this browser; the CRS keeps its revisions. Sample conflicts.</p></div>
    <div class="stack">
      <div class="panel"><h2>Specification library</h2>
        <div class="status-list">${spec.map((r, i) => `<div><span><b>${esc(r.f)}</b><br><span class="hint">AI filed under: ${esc(r.fo)}</span></span>${r.confirmed ? status('Confirmed', 'good') : `<button class="btn" type="button" data-do="confirmSpec" data-i="${i}">Confirm</button>`}</div>`).join('')}</div>
        <div class="photo" style="margin-top:10px">Drop customer files here</div></div>
      <div class="panel"><h2>Drafts</h2><div class="status-list">${['Project BOM', 'Product BOMs', 'Datasheets (Enpro format)', 'Project vendor list', 'Basic Engineering Document', 'Work content and timeline'].map((d, i) => `<div><span>${d}</span>${i < 2 ? status('Draft ready', 'info') : status('Not started', '')}</div>`).join('')}</div>
        <p class="hint">${tbc(MKT_Q.bed)} ${tbc(MKT_Q.capacity)}</p></div>
    </div></div>
  <div class="panel" style="margin-top:14px"><h2>Hand-off to Engineering</h2><p class="hint">When the order is won, the project is created from the template with this enquiry’s documents attached (<a href="${go('prj-new')}">Create project</a>). ${tbc(MKT_Q.signoff)} ${tbc(MKT_Q.userList)}</p></div>`;
}, [], 'CONFIRMED');

// Enquiry and commercial proposal (product-spec §4.12): Phase 2, go-live 26 Feb 2027. Drawn here as a preview so
// the lifecycle map's first two stages have a real screen behind them, not just a "Phase 2" label — outline
// acceptance only; product-spec says Phase 2 specifications are signed by 15 Jan 2027, after this draft.
const ENQUIRY_SEED = [
  { id: 'ENQ-0412', customer: 'Customer A', product: 'Lube oil system', score: 78, status: status('With Marketing · technical review', 'info') },
  { id: 'ENQ-0405', customer: 'Customer E', product: 'Seal gas panel', score: 41, status: status('Lost · price', 'bad') },
  { id: 'ENQ-0398', customer: 'Customer B', product: 'Air cooler', score: 86, status: status('Won · see P-260071', 'good') }
];
add('crm-enquiry', 'Enquiry & commercial proposal', 'Marketing', 'Enquiry & commercial proposal (Phase 2 preview)', 'Named in product-spec §4.12 (Phase 2; not yet broken into individual REQ rows)', 'product-spec §4.12', () => `
  <p class="lede"><span class="soon">Phase 2, go-live 26 Feb 2027</span> — an outline preview from the confirmed Phase 2 module list, drawn so this stage of the lifecycle map is a real screen rather than a bare label. None of this is scheduled to build before the Phase 1 go-live on 15 Jan 2027.</p>
  <h2 style="margin-top:18px">Enquiry register</h2>
  ${table(['Enquiry', 'Customer', 'Product', 'AI attractiveness score', 'Status'], ENQUIRY_SEED.map(e => [code(e.id), esc(e.customer), esc(e.product), `${e.score} / 100`, e.status]))}
  <p class="hint">Accounts and contacts sync from the SAP customer master; a lost enquiry records its reason so the pattern is visible later.</p>
  <div class="cols even" style="margin-top:14px">
    <div class="panel"><h2>Commercial proposal engine</h2><p class="hint">Costing from SAP history and metal prices, a what-if view, pricing against a Delegation of Authority (${term('DoA')}) matrix, and flags for any term-and-conditions deviation. ${tbc(MKT_Q.doa, 'OPEN DECISION')}</p></div>
    <div class="panel"><h2>Budget control</h2><p class="hint">Budget against commitment per WBS, with a reason recorded for every overrun — the same WBS budget the Supply chain comparison sheet checks against today, read-only.</p></div>
  </div>`,
  [MKT_Q.doa], 'SOURCE-DERIVED');
