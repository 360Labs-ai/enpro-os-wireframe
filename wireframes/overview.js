// Overview: home by role and the enquiry-to-after-sales map. Mapping and open items live in wireframes.html.
// Home follows product-spec §7 and docs/architecture/ux/home-screen.md: who I am, what I may do, what needs me now,
// with EPN or MPN as the first column of My Tasks (doc 17.06, RR-01). Sample data; people appear as roles.

const HOME_Q = {
  which: 'Which priority number leads each role’s task list: EPN for engineering and supply chain, MPN for production and quality?',
  gpn: 'GPN in the Despatch Plan: the same number as EPN or MPN, a derived number, or retired? (stored as a manual field until decided)',
  kpi: 'Which KPIs does management want on the Enpro OS home, and from which report (Project MIS, Engg KPI, COPQ)?',
  dash: 'Do users want to build their own dashboards and post to an activity feed, as in CONTACT, or is a role-based home enough?',
  tpi: 'TPI call notice: 14 days ahead and confirmed 3 days ahead (Enpro’s BO workflow) or 15 days (R3)?'
};

add('home', 'Home', 'Overview', 'Home: what needs you now', 'REQ-UI-002, REQ-OS-PM-006', 'product-spec §7; home-screen.md; doc 17.06 (RR-01)', () => {
  const role = ROLE || 'eng';
  const who = ROLES[role].who;
  const strip = `<div class="panel" style="margin-bottom:14px;display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center"><b>${who}</b><span class="hint">Signed in with Microsoft. What you can open follows your role and project team — <a href="#" data-action="open-account">not you? Switch role</a>.</span></div>`;
  const ai = `<div class="ai" style="margin-top:14px"><b>What first today</b> <span class="chip info">Draft by AI · you decide</span><p class="hint" style="margin:6px 0 0">Pump datasheet for P-260114 is on the critical path: the RFQ waits for it. Heater check can follow. Live by 15 Jan (product-spec §7).</p></div>`;
  const views = {
    eng: `<div class="grid">${tile('Tasks due this week', 7, '2 overdue')}${tile('Reviews waiting on me', 3, 'Oldest 2 days')}${tile('Submittals due back', 4, 'From customers, 14-day cycle')}${tile('Returned by customer', 1, 'Code 3, resubmit')}</div>
      <h2 style="margin-top:20px">My tasks ${tbc(HOME_Q.which)}</h2>
      ${table(['EPN', 'Task', 'Project · WBS', 'Due', 'Status', ''], [
        [epn(10), 'T2 Prepare pump datasheet', code('P-260114-FG-A1-BO-PMP-01'), '16 Oct', status('In progress', 'info'), `<a href="${go('eng-task')}">Open</a>`],
        [epn(20, true), 'Check heater datasheet (checker)', code('P-260098-FG-A1-BO-EHR-01'), '15 Oct', status('Overdue', 'bad'), `<a href="${go('eng-task')}">Open</a>`],
        [epn(30), 'Resubmit P&ID, customer code 3', code('P-260071-FG-0A-SF-ISO-01'), '20 Oct', status('Returned', 'warn'), `<a href="${go('sub-mdl')}">Open</a>`],
        [epn(40), 'Technical review of offer, Supplier B', code('P-260114-FG-A1-BO-PMP-01'), '22 Oct', status('Waiting for you', 'warn'), `<a href="${go('scm-compare')}">Open</a>`]])}
      <p class="hint">Lower is more urgent. An orange number was set by the Project HOD or a Director; the rest re-sequence around it (doc 17.06).</p>${ai}`,
    buyer: `<div class="grid">${tile('Indents ready for RFQ', 5, 'Datasheet and ITP checked')}${tile('Held at Kit Not OK', 2)}${tile('Comparisons to sign', 1, 'Waiting for TL')}${tile('SLPD at risk', 3, 'Escalates to TL, HOD, PE')}</div>
      <h2 style="margin-top:20px">My tasks</h2>
      ${table(['EPN', 'Task', 'Project · WBS', 'Due', 'Status', ''], [
        [epn(10), 'Compare offers, 3 suppliers, REV 2', code('P-260114-FG-A1-BO-PMP-01'), '17 Oct', status('In progress', 'info'), `<a href="${go('scm-compare')}">Open</a>`],
        [epn(30), 'Send RFQ to AVL suppliers', code('P-260071-FG-A1-BO-EHR-01'), '18 Oct', status('Ready', 'good'), `<a href="${go('scm-indents')}">Open</a>`],
        [epn(50), 'Chase post-order documents and MTCs', code('P-260040-FG-A2-SF-MBF-01'), '14 Oct', status('Overdue', 'bad'), '']])}`,
    pe: `<div class="grid">${tile('My projects', 6)}${tile('Slipping this week', 2, 'Forecast past plan')}${tile('Open issues and CRs', 5, '1 major')}${tile('Plan changes to approve', 1)}</div>
      <h2 style="margin-top:20px">My projects</h2>
      ${table(['EPN', 'Project', 'Status', 'Next milestone', 'Schedule', ''], [
        [epn(10), 'P-260114 · Lube oil system, 2 skids', code('15 Tack weld'), 'Kit 1 review, 30 Oct', status('On plan', 'good'), `<a href="${go('prj-wbs')}">Open</a>`],
        [epn(20, true), 'P-260098 · Seal gas panel', code('01 Indent pending'), 'KOM, 16 Oct', status('Slipping 4 days', 'bad'), `<a href="${go('prj-gantt')}">Plan</a>`],
        [epn(40), 'P-260071 · Air cooler', code('22 Painting'), 'Internal FAT, 12 Nov', status('On plan', 'good'), '']])}
      <p class="hint">Status codes are Enpro’s 29-code ladder (RR-04).</p>`,
    qc: `<div class="grid">${tile('Inspections today', 4, '1 TPI witness')}${tile('Punch points due', 6, '2 overdue')}${tile('TPI calls next 14 days', 3, 'Notice ' + tbc(HOME_Q.tpi, 'OPEN DECISION · sources differ'))}${tile('Lots on hold', 1)}</div>
      <h2 style="margin-top:20px">Today</h2>
      ${table(['MPN', 'Inspection', 'System tag', 'Stage', ''], [
        [epn(10), 'Hydro test, internal', code('P-260071-FG-A1'), '19 Hydro', `<a href="${go('qa-inspect')}">Start</a>`],
        [epn(20), 'Weld visual, root pass', code('P-260114-FG-A1'), '15 Tack weld', `<a href="${go('qa-inspect')}">Start</a>`]])}`,
    mgmt: `<div class="grid">${tile('Active projects', '-', 'By division')}${tile('Projects slipping', '-')}${tile('Overdue customer submittals', '-')}${tile('Priority overrides', '-', 'Set this month')}</div>
      <p class="hint" style="margin-top:12px">Management sees tiles and approvals, not task lists (product-spec §7). ${tbc(HOME_Q.kpi)}</p>`
  };
  return `<p class="lede">One home for Enpro OS and Common Functions, one task list across both (S15-84). ${tbc(HOME_Q.dash)}</p>` + strip + views[role];
}, [HOME_Q.gpn], 'SOURCE-DERIVED');

add('lifecycle', 'Enquiry to after-sales', 'Overview', 'Enquiry to after-sales: where each screen sits', 'REQ-OS-PM-001, REQ-OS-P2-002', 'business-spec §4; product-spec §2; S10 §05; S11 OS', () => `
  <p class="lede">The whole job on one line. Phase 1 goes live on 15 Jan 2027 and Phase 2 on 26 Feb 2027 (CONFIRMED, S10). Every stage below now has a screen behind it, even where Enpro has only confirmed the feature list and nothing has been walked screen by screen yet (marked "outline" in the Modules table, not "not drawn yet") — so nothing on the map reads as missing, only as more or less reviewed. Features not live yet show greyed out inside a screen, as agreed on 9 Oct (S15-68).</p>
  ${steps([['Enquiry', 'CRM, Phase 2'], ['Technical proposal', 'Phase 1'], ['Order won', 'project, WBS, team'], ['Engineering', 'per WBS item'], ['Submittals', '14-day cycle'], ['Supply chain', 'indent to PO'], ['Stores', 'gate to issue'], ['Production and quality', 'shifts, ITP, punch'], ['Despatch and closure', 'TECO, LLM'], ['Service', 'complaints']], 2)}
  <h2 style="margin-top:22px">Modules</h2>
  ${table(['Module', 'Phase', 'POC feature', 'In this draft'], [
    ['Enquiry, commercial proposal, budget control (CRM)', '2', 'none', `<a href="${go('crm-enquiry')}">Enquiry &amp; commercial proposal</a> <span class="soon">Phase 2 preview</span>`],
    ['Marketing: technical proposal, project creation', '1', '10', `<a href="${go('mkt-proposal')}">Technical proposal</a> · <a href="${go('prj-new')}">Create project</a>`],
    ['Projects: WBS, Gantt, priorities, registers, viewer, closure', '1', '1, 10', `<a href="${go('prj-list')}">Projects</a> · <a href="${go('prj-wbs')}">WBS</a> · <a href="${go('prj-gantt')}">Schedule</a> · <a href="${go('prj-closure')}">Despatch &amp; closure</a>`],
    ['Engineering: workflows, checklists, documents', '1', '2, 3, 4, 6, 7, 9, 11', `<a href="${go('eng-task')}">Engineering task</a>`],
    ['Customer submittals', '1', '5', `<a href="${go('sub-mdl')}">Document list and transmittal</a>`],
    ['Supply chain', '1', '12', `<a href="${go('scm-indents')}">Indents</a> · <a href="${go('scm-compare')}">Comparison</a>`],
    ['Stores', '1', 'not in POC', `<a href="${go('str-inward')}">Inward acceptance</a>`],
    ['Production: shifts, planners, displays, job card', '1', 'not in POC', `<a href="${go('prd-floor')}">Shop floor</a> <span class="soon">outline</span>`],
    ['Quality', '1', '3, 8', `<a href="${go('qa-inspect')}">Inspection on a phone</a>`],
    ['Change and issue management', '1', 'not in POC', `<a href="${go('chg-log')}">Change &amp; issue log</a> <span class="soon">outline</span>`],
    ['Customer service', '1', 'not in POC', `<a href="${go('cs-complaint')}">Complaint</a> <span class="soon">outline</span>`],
    ['Material Master and BOM creator; Ask Enpro OS', '2', 'none', '<span class="soon">Phase 2, not drawn</span>']])}
  <p class="hint">POC features are numbered as on Enpro’s POC sheet (product-spec §6). Stores, Production, Change and issue management, and Customer service start after the POC (03-enpro-os §11) — "outline" means the screen is drawn from the confirmed feature list in product-spec §4.7, §4.9 and §4.11, not yet walked field by field with Enpro the way the other eight screens were.</p>`,
  [], 'CONFIRMED');
