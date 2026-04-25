// ═══════════════════════════════════════════════════════════════════
// VIKTOR HUB — core.js
// All logic: navigation, streak, pomodoro, checklist, calendar, etc.
// ═══════════════════════════════════════════════════════════════════

// projects array defined in index.html before this script loads



const viktorChecklist=[
  {title:'System Setup',items:[
    'Open Obsidian and create the folder structure from the Obsidian panel (00-Inbox through Assets)',
    'Create your first concept note using the template from the Obsidian panel — any A&P topic',
    'Install Gizmo and create your first 3 clinical scenario cards from that concept note',
    'Add the first 5 #clinical-german tags to Gizmo: Schmerzen, Blutdruck, Atemfrequenz, Fieber, Übelkeit',
    'Mark today in the streak tracker and write one synthesis sentence in Daily/',
    'Open the Study System tool and complete the Feynman tab for one concept you studied today',
    'Embed this hub in Obsidian using Custom Frames (see Obsidian panel for exact steps)',
    'Identify your Study Mafia candidate — one person who shows up and can explain, not just recite'
  ]},
  {title:'A&P Coverage',items:[
    'Complete Organization & Chemistry section — draw the cell from memory without looking',
    'Complete Cell Biology section — explain membrane transport to an imaginary patient',
    'Complete Tissues section — list all 4 tissue types and one clinical example of each',
    'Complete Integumentary section — stage a pressure injury from the Braden Scale',
    'Complete Skeletal + Muscular sections — name the bones relevant to a fall assessment',
    'Complete Nervous System sections (Fundamentals + CNS + PNS) — explain action potential in own words',
    'Complete Special Senses section — describe what a positive Rinne test means clinically',
    'Complete Endocrine section — draw the HPA axis feedback loop from memory',
    'Complete Cardiovascular section — explain S3 vs S4 and when each appears',
    'Complete Respiratory section — explain the O2-hemoglobin curve shift right and why it matters',
    'Complete Digestive + Urinary sections — explain why furosemide causes hypokalemia using the nephron',
    'Complete Reproductive section — describe the menstrual cycle hormone sequence'
  ]},
  {title:'Fundamentals Coverage',items:[
    'Complete The Nursing Profession — define scope of practice and give one example of boundary violation',
    'Complete Nursing Process (ADPIE) — write a correctly formatted nursing diagnosis for a fictional patient',
    'Complete Legal & Ethical Foundations — explain informed consent in your own words with two exceptions',
    'Complete Therapeutic Communication — practice 3 therapeutic responses vs 3 non-therapeutic ones',
    'Complete Health Assessment & Vital Signs — measure your own BP, HR, RR, SpO2 and document them',
    'Complete Safety & Infection Control — don and doff PPE in correct order without reference',
    'Complete Maslow sections through End of Life Care — explain priority-setting for a multi-problem patient'
  ]},
  {title:'German Milestones',items:[
    'Complete Duolingo German Level 1 checkpoint',
    'Learn all 10 body parts in clinical German vocab Gizmo deck',
    'Learn all 5 vital signs in German and use them in a sentence',
    'Complete one full Nicos Weg episode with comprehension',
    'Watch one Easy German video without pausing more than 3 times'
  ]},
  {title:'Study Skill Verification',items:[
    'Complete 2 consecutive weeks with active recall (blurting) on every study session — no passive re-reading',
    'Write and answer 10 self-generated NCLEX-style questions from your Obsidian notes',
    'Attempt 50 NCLEX practice questions on RegisteredNurseRN — analyze errors by bucket type',
    'Complete one full study loop (read → close → write → test → space) and document it in Daily/',
    'Review your Gizmo deck for 7 consecutive days rating honestly — no Easy inflation'
  ]},
  {title:'Pre-Enrollment Actions',items:[
    'Write one paragraph in your own words: why nursing, why Germany, why now — save it in Obsidian',
    'Research admission requirements for your target nursing school and list them all',
    'List all application deadlines and add them to the calendar in this hub',
    'Identify which clinical specialties interest you most and find one nurse in that specialty to talk to',
    'Talk to at least one Filipino nurse who has worked in Germany — Reddit, Facebook OFW groups, LinkedIn',
    'Calculate the minimum language score you need and when you need to sit the first Goethe exam'
  ]}
];

// ─── STATE ───────────────────────────────────────────────────────────────────
let state={};
function loadState(){try{const s=localStorage.getItem(STORAGE_KEY);if(s)state=JSON.parse(s);}catch(e){state={};}}
function saveState(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(e){}}
function cbId(projId,secIdx,layer,itemIdx){return `${projId}-${secIdx}-${layer||'s'}-${itemIdx}`;}
function isChecked(id){return state[id]===true;}
function setChecked(id,val){state[id]=val;saveState();}

function getProjectProgress(proj){
  let total=0,done=0;
  if(proj.layered){
    proj.sections.forEach((sec,si)=>{
      ['knowledge','skill','judgment'].forEach(layer=>{
        if(sec[layer]){sec[layer].forEach((item,ii)=>{total++;if(isChecked(cbId(proj.id,si,layer,ii)))done++;});}
      });
    });
  } else {
    proj.sections.forEach((sec,si)=>{
      if(sec.items){sec.items.forEach((item,ii)=>{total++;if(isChecked(cbId(proj.id,si,'s',ii)))done++;});}
    });
  }
  return {total,done,pct:total?Math.round(done/total*100):0};
}

function getViktorChecklistProgress(){
  let total=0,done=0;
  viktorChecklist.forEach((sec,si)=>{
    sec.items.forEach((item,ii)=>{total++;if(isChecked(cbId('vc',si,'s',ii)))done++;});
  });
  return {total,done,pct:total?Math.round(done/total*100):0};
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function buildDashboard(){
  const grid=document.getElementById('cards-grid');
  grid.innerHTML='';

  const yearGroups=[
    {label:'Year 1 · Sem 1',   ids:['ap','biochem','theo']},
    {label:'Year 1 · Sem 2',   ids:['micro','ha','fund','nut']},
    {label:'Year 2 · Sem 1',   ids:['pharm']},
    {label:'Year 2 · Sem 1–2', ids:['matob']},
    {label:'Year 3–4',         ids:['medsurg','psych']},
    {label:'Long Game',        ids:['de']},
  ];

  yearGroups.forEach(group=>{
    const lbl=document.createElement('div');
    lbl.className='section-label';
    lbl.textContent=group.label;
    grid.appendChild(lbl);
    group.ids.forEach(id=>{
      const proj=projects.find(p=>p.id===id);
      if(!proj)return;
      const {total,done,pct}=getProjectProgress(proj);
      const card=document.createElement('div');
      card.className='project-card';
      card.style.cssText=`background:${proj.colorBg};border-color:${proj.color}40;`;
      card.onmouseenter=function(){this.style.borderColor=proj.color+'90';};
      card.onmouseleave=function(){this.style.borderColor=proj.color+'40';};
      card.onclick=()=>showProject(proj.id);
      card.innerHTML=`
        <div class="card-top">
          <div class="card-icon" style="background:rgba(255,255,255,.60);color:${proj.color}">${proj.icon}</div>
          <div class="card-meta">
            <div class="card-title">${proj.titleHTML}</div>
            <div class="card-desc">${proj.desc}</div>
          </div>
          <div class="card-arrow">→</div>
        </div>
        <div class="card-progress-track"><div class="card-progress-fill" style="width:${pct}%;background:${proj.color}"></div></div>
        <div class="card-stats"><span>${done} of ${total} items</span><span>${pct}%</span></div>`;
      grid.appendChild(card);
    });
  });

  // Section label: Tools
  const lbl2=document.createElement('div');lbl2.className='section-label';lbl2.textContent='Tools & Guides';grid.appendChild(lbl2);

  // Viktor card
  const vcProg=getViktorChecklistProgress();
  const vcCard=document.createElement('div');
  vcCard.className='project-card';
  vcCard.onclick=()=>showViktor();
  vcCard.innerHTML=`
    <div class="card-top">
      <div class="card-icon" style="background:#FBF0EA;color:#B85C2A">◈</div>
      <div class="card-meta"><div class="card-title">Project Viktoria</div><div class="card-desc">Your profile, the study system, the 5-month plan, and your personal checklist.</div></div>
      <div class="card-arrow">→</div>
    </div>
    <div class="card-progress-track"><div class="card-progress-fill" style="width:${vcProg.pct}%;background:#B85C2A"></div></div>
    <div class="card-stats"><span>${vcProg.done} of ${vcProg.total} items</span><span>${vcProg.pct}%</span></div>`;
  grid.appendChild(vcCard);

  // Survival Guide card
  const sgCard=document.createElement('div');sgCard.className='project-card';sgCard.onclick=()=>showView('survival');
  sgCard.innerHTML=`<div class="card-top"><div class="card-icon" style="background:#F0EAF8;color:#5A3A8A">⊞</div><div class="card-meta"><div class="card-title">Survival Guide</div><div class="card-desc">Professors, groupmates, clinicals, research, exams, college life, and mental health.</div></div><div class="card-arrow">→</div></div>`;
  grid.appendChild(sgCard);

  // Tool cards
  const toolDefs=[
    {icon:'◎',title:'Study System',desc:'The study loop, Feynman, active recall, spaced repetition, Gizmo card craft.',color:'#2A7A5A',bg:'#EAF5EE',view:'studysystem'},
    {icon:'◱',title:'Daily Structure',desc:'Sequence-based, energy-adaptive daily blocks. Three modes.',color:'#8A2020',bg:'#FDE8E8',view:'timeblock'},
    {icon:'◳',title:'Low Energy Protocol',desc:'Diagnose the type. Apply only the right intervention. Minimum viable day.',color:'#2A5A7A',bg:'#EAF0F5',view:'lowenergy'},
  ];
  toolDefs.forEach(t=>{
    const tc=document.createElement('div');tc.className='project-card';tc.onclick=()=>showView(t.view);
    tc.innerHTML=`<div class="card-top"><div class="card-icon" style="background:${t.bg};color:${t.color}">${t.icon}</div><div class="card-meta"><div class="card-title">${t.title}</div><div class="card-desc">${t.desc}</div></div><div class="card-arrow">→</div></div>`;
    grid.appendChild(tc);
  });
}

// ─── VIEW ROUTING ─────────────────────────────────────────────────────────────
function showView(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  const el=document.getElementById('view-'+id);
  if(el)el.classList.add('active');
  window.scrollTo(0,0);
}
function showDashboard(){buildDashboard();showView('dashboard');}
function showViktor(){buildViktorChecklist();showView('viktor');pvGoTo(0);}

// ─── PROJECT VIEW ─────────────────────────────────────────────────────────────
let currentProj=null;
function showProject(projId){
  const proj=projects.find(p=>p.id===projId);
  if(!proj)return;
  currentProj=proj;
  const titleEl=document.getElementById('proj-title');
  if(titleEl)titleEl.innerHTML=proj.titleHTML;
  const resetEl=document.getElementById('proj-reset');
  if(resetEl)resetEl.onclick=()=>resetProject(projId);
  if(proj.layered)buildLayered(proj);
  else buildSimple(proj);
  buildCourseInfo(proj);
  updateProjectProgress(proj);
  showView('project');
}

function clItemHTML(item, id, chk, projId, si, layer, ii){
  const sep = item.indexOf(': ');
  const hasSep = sep > 0 && sep < 60;
  const head = hasSep ? item.slice(0, sep) : item;
  const detail = hasSep ? item.slice(sep + 2) : '';
  const expandBtn = detail ? `<span class="cl-expand-btn" onclick="event.preventDefault();event.stopPropagation();clItemToggle(this)" tabindex="0">›</span>` : '';
  const detailDiv = detail ? `<div class="cl-detail">${detail}</div>` : '';
  const onchange = layer === 's'
    ? `gclCheck(this,'${projId}',${si},'s',${ii})`
    : `gclCheck(this,'${projId}',${si},'${layer}',${ii})`;
  return `<div class="cl-item">
    <input type="checkbox" id="${id}" ${chk?'checked':''} onchange="${onchange}">
    <label for="${id}" class="${chk?'done':''}">
      <div class="cl-label-head"><span class="cl-label-head-text">${head}</span>${expandBtn}</div>
      ${detailDiv}
    </label>
  </div>`;
}
function clItemToggle(btn){
  btn.classList.toggle('open');
  const detail = btn.closest('label').querySelector('.cl-detail');
  if(detail) detail.classList.toggle('open');
}

function buildSimple(proj){
  const cont=document.getElementById('proj-sections');
  cont.innerHTML='';
  proj.sections.forEach((sec,si)=>{
    const priorityTag=sec.priority?`<span class="tag" style="background:${sec.priority==='critical'?'rgba(139,58,42,.10)':'rgba(154,124,58,.10)'};color:${sec.priority==='critical'?'var(--accent)':'var(--gold)'}">${sec.priority}</span>`:'';
    const secEl=document.createElement('div');secEl.className='cl-section';
    const prog=sec.items.filter((_,ii)=>isChecked(cbId(proj.id,si,'s',ii))).length;
    secEl.innerHTML=`
      <div class="cl-section-header" onclick="clToggle(this)">
        <span class="cl-section-num">${String(si+1).padStart(2,'0')}</span>
        <div class="cl-section-title">${sec.title}${priorityTag}</div>
        <span class="cl-badge" id="badge-${proj.id}-${si}">${prog}/${sec.items.length}</span>
        <span class="chevron">›</span>
      </div>
      <div class="cl-section-body">
        <div style="padding-top:10px">${sec.items.map((item,ii)=>{
          const id=cbId(proj.id,si,'s',ii);const chk=isChecked(id);
          return clItemHTML(item,id,chk,proj.id,si,'s',ii);
        }).join('')}</div>
      </div>`;
    cont.appendChild(secEl);
  });
}

function buildLayered(proj){
  const cont=document.getElementById('proj-sections');
  cont.innerHTML='';
  const layerDefs=[{key:'knowledge',label:'Knowledge',color:'#2A7A5A'},{key:'skill',label:'Skill',color:'#2A5A8A'},{key:'judgment',label:'Clinical Judgment',color:'#8A2020'}];
  proj.sections.forEach((sec,si)=>{
    const priorityTag=sec.priority?`<span class="tag" style="background:${sec.priority==='critical'?'rgba(139,58,42,.10)':'rgba(154,124,58,.10)'};color:${sec.priority==='critical'?'var(--accent)':'var(--gold)'}">${sec.priority}</span>`:'';
    let secTotal=0,secDone=0;
    layerDefs.forEach(l=>{if(sec[l.key]){sec[l.key].forEach((_,ii)=>{secTotal++;if(isChecked(cbId(proj.id,si,l.key,ii)))secDone++;});}});
    const secEl=document.createElement('div');secEl.className='cl-section';
    secEl.innerHTML=`
      <div class="cl-section-header" onclick="clToggle(this)">
        <span class="cl-section-num">${String(si+1).padStart(2,'0')}</span>
        <div class="cl-section-title">${sec.title}${priorityTag}</div>
        <span class="cl-badge" id="badge-${proj.id}-${si}">${secDone}/${secTotal}</span>
        <span class="chevron">›</span>
      </div>
      <div class="cl-section-body">
        ${layerDefs.map(l=>!sec[l.key]?'': `
          <div class="layer">
            <div class="layer-label" style="color:${l.color}">${l.label}<div class="layer-line" style="background:${l.color}"></div></div>
            ${sec[l.key].map((item,ii)=>{const id=cbId(proj.id,si,l.key,ii);const chk=isChecked(id);return clItemHTML(item,id,chk,proj.id,si,l.key,ii);}).join('')}
          </div>`).join('')}
      </div>`;
    cont.appendChild(secEl);
  });
}

function gclCheck(el,projId,si,layer,ii){
  const id=cbId(projId,si,layer,ii);
  setChecked(id,el.checked);
  const lbl=el.nextElementSibling;if(lbl){lbl.className=el.checked?'done':'';}
  updateGclBadge(projId,si);
  updateProjectProgress(projects.find(p=>p.id===projId));
}

function updateGclBadge(projId,si){
  const proj=projects.find(p=>p.id===projId);if(!proj)return;
  const badge=document.getElementById(`badge-${projId}-${si}`);if(!badge)return;
  const sec=proj.sections[si];
  let total=0,done=0;
  if(proj.layered){['knowledge','skill','judgment'].forEach(l=>{if(sec[l]){sec[l].forEach((_,ii)=>{total++;if(isChecked(cbId(projId,si,l,ii)))done++;});}});}
  else if(sec.items){sec.items.forEach((_,ii)=>{total++;if(isChecked(cbId(projId,si,'s',ii)))done++;});}
  badge.textContent=`${done}/${total}`;
}

function updateProjectProgress(proj){
  const {total,done,pct}=getProjectProgress(proj);
  const bar=document.getElementById('proj-pbar');const lbl=document.getElementById('proj-plabel');
  if(bar)bar.style.cssText=`width:${pct}%;background:${proj.color}`;
  if(lbl)lbl.textContent=`${done} of ${total} items — ${pct}%`;
}

function resetProject(projId){
  if(!confirm('Reset all progress for this coverage map?'))return;
  const proj=projects.find(p=>p.id===projId);if(!proj)return;
  if(proj.layered){proj.sections.forEach((sec,si)=>{['knowledge','skill','judgment'].forEach(l=>{if(sec[l])sec[l].forEach((_,ii)=>{setChecked(cbId(projId,si,l,ii),false);});});});}
  else{proj.sections.forEach((sec,si)=>{if(sec.items)sec.items.forEach((_,ii)=>{setChecked(cbId(projId,si,'s',ii),false);});});}
  if(proj.layered)buildLayered(proj);else buildSimple(proj);
  updateProjectProgress(proj);
}

// ─── VIKTOR CHECKLIST ─────────────────────────────────────────────────────────
function buildViktorChecklist(){
  const cont=document.getElementById('pv-cl-sections');cont.innerHTML='';
  const dateTgts=getChecklistDates();
  viktorChecklist.forEach((sec,si)=>{
    const done=sec.items.filter((_,ii)=>isChecked(cbId('vc',si,'s',ii))).length;
    const secEl=document.createElement('div');secEl.className='cl-section';
    secEl.innerHTML=`
      <div class="cl-section-header" onclick="clToggle(this)">
        <span class="cl-section-num">${String(si+1).padStart(2,'0')}</span>
        <div class="cl-section-title">${sec.title}</div>
        <span class="cl-badge" id="vc-badge-${si}">${done}/${sec.items.length}</span>
        <span class="chevron">›</span>
      </div>
      <div class="cl-section-body">
        <div style="padding-top:10px">${sec.items.map((item,ii)=>{
          const id=cbId('vc',si,'s',ii);const chk=isChecked(id);
          const dtKey=`vc-date-${si}-${ii}`;const dt=dateTgts[dtKey]||'';
          const today=todayISO();
          let badgeClass='cl-date-badge',badgeText=dt?dt:'set date';
          if(dt&&dt<today&&!chk)badgeClass+=' overdue';
          else if(dt)badgeClass+=' set';
          return `<div class="cl-item-wrap"><div style="display:flex;align-items:flex-start;gap:10px;flex:1"><input type="checkbox" id="${id}" ${chk?'checked':''} onchange="viktorCheck(this,${si},${ii})"><label for="${id}" class="${chk?'done':''}" style="font-size:13px;color:var(--text-primary);cursor:pointer;line-height:1.6;transition:color .2s">${item}</label></div><span class="${badgeClass}" title="Target completion date" onclick="pickChecklistDate('${dtKey}',this)">${badgeText}</span></div>`;
        }).join('')}</div>
      </div>`;
    cont.appendChild(secEl);
  });
  updateViktorChecklistUI();
}

function viktorCheck(el,si,ii){
  const id=cbId('vc',si,'s',ii);setChecked(id,el.checked);
  el.nextElementSibling.className=el.checked?'done':'';
  const badge=document.getElementById(`vc-badge-${si}`);
  if(badge){const sec=viktorChecklist[si];const d=sec.items.filter((_,i)=>isChecked(cbId('vc',si,'s',i))).length;badge.textContent=`${d}/${sec.items.length}`;}
  updateViktorChecklistUI();
}

function updateViktorChecklistUI(){
  const {total,done,pct}=getViktorChecklistProgress();
  const bar=document.getElementById('pv-cl-bar');const lbl=document.getElementById('pv-cl-label');
  if(bar)bar.style.width=pct+'%';
  if(lbl)lbl.textContent=`${done} of ${total} — ${pct}%`;
  if(typeof updateProfilePulse==='function')updateProfilePulse();
}

function resetViktorChecklist(){
  if(!confirm('Reset Viktoria checklist?'))return;
  viktorChecklist.forEach((sec,si)=>{sec.items.forEach((_,ii)=>{setChecked(cbId('vc',si,'s',ii),false);});});
  buildViktorChecklist();
}

// ─── ACCORDION ───────────────────────────────────────────────────────────────
function clToggle(header){
  const body=header.nextElementSibling;const chevron=header.querySelector('.chevron');
  const sec=header.closest('.cl-section');
  const isOpen=body.classList.contains('open');
  body.classList.toggle('open',!isOpen);
  if(chevron)chevron.classList.toggle('open',!isOpen);
  if(sec)sec.classList.toggle('open-section',!isOpen);
}

// ─── PROJECT VIKTOR SLIDESHOW ─────────────────────────────────────────────────
const PV_TOTAL=6;let pvIdx=0,pvTimer=null;
function pvGoTo(i){
  document.querySelectorAll('#view-viktor .pv-panel').forEach((p,idx)=>p.classList.toggle('active',idx===i));
  const tabs=document.querySelectorAll('#view-viktor .pv-nav-tab');
  tabs.forEach((t,idx)=>t.classList.toggle('active',idx===i));
  pvIdx=i;
  if(tabs[i])tabs[i].scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
}
function pvNext(){if(pvIdx<PV_TOTAL-1)pvGoTo(pvIdx+1);_pvUpdateArrows();}

// ─── ENGINE RITUAL TABS ───────────────────────────────────────────────────────
function egRitualSwitch(btn, panelId) {
  document.querySelectorAll('.eg-rtab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.eg-ritual-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  const p = document.getElementById(panelId);
  if (p) p.classList.add('active');
}

// ─── WIRING FEAR TOGGLE ───────────────────────────────────────────────────────
const WR_FEAR_KEY = 'viktor-wiring-fears-v1';
function wrFearToggle(n, btn) {
  const card = document.getElementById('wrf-' + n);
  if (!card) return;
  try {
    const s = JSON.parse(localStorage.getItem(WR_FEAR_KEY) || '{}');
    s[n] = !s[n];
    localStorage.setItem(WR_FEAR_KEY, JSON.stringify(s));
    card.classList.toggle('resolved', !!s[n]);
    btn.textContent = s[n] ? 'mark active' : 'mark resolved';
    btn.classList.toggle('resolved-btn', !!s[n]);
  } catch(e) {}
}
function wrFearInit() {
  try {
    const s = JSON.parse(localStorage.getItem(WR_FEAR_KEY) || '{}');
    Object.keys(s).forEach(n => {
      if (!s[n]) return;
      const card = document.getElementById('wrf-' + n);
      const btn = card && card.querySelector('.wr-fear-btn');
      if (card) card.classList.add('resolved');
      if (btn) { btn.textContent = 'mark active'; btn.classList.add('resolved-btn'); }
    });
  } catch(e) {}
}
setTimeout(wrFearInit, 200);

// ─── CLINICAL CHAIN ───────────────────────────────────────────────────────────
const CHAIN_DATA = {
  hf: {
    name: 'Heart Failure',
    nodes: [
      { course: 'A&P', color: '#1E6449', badge: 'Mechanism', title: 'Cardiac output = HR × SV', body: 'Heart failure occurs when the heart cannot maintain adequate CO. Left HF → pulmonary congestion (back-pressure into lungs). Right HF → systemic congestion (JVD, edema, hepatomegaly). Starling\'s law: preload ↑ → SV ↑ until the muscle is overstretched. Understanding this explains every clinical sign.', pearl: 'PNLE pearl: S3 = overfilled ventricle = HF in adults. S4 = stiff ventricle = HTN or HF.' },
      { course: 'Pharmacology', color: '#8A2020', badge: 'Drugs', title: 'Furosemide · Digoxin · ACE inhibitors', body: 'Loop diuretics (furosemide) reduce preload by eliminating fluid — monitor K+. Digoxin increases contractility but has a narrow TI — hold if K+ <3.5. ACE inhibitors (-pril) reduce afterload — monitor K+ and creatinine. Knowing the mechanism means you know what to monitor without memorizing a separate list.', pearl: 'PNLE pearl: Furosemide + digoxin = always monitor potassium together.' },
      { course: 'Fundamentals', color: '#5A3A8A', badge: 'Process', title: 'ADPIE applied to HF', body: 'Assess: daily weight, lung sounds, edema grade, JVD, SpO2. Diagnose: Decreased Cardiac Output r/t reduced myocardial contractility. Plan: patient will maintain SpO2 ≥94%, weight stable within 1kg. Implement: semi-Fowler\'s, fluid restriction, daily weights, medication. Evaluate: weight trend, dyspnea, lung sounds.', pearl: 'PNLE pearl: Daily weight gain >1kg in 24h or >2kg in 72h = notify physician immediately.' },
      { course: 'Health Assessment', color: '#2A5A7A', badge: 'Signs', title: 'Left vs Right HF assessment', body: 'Left HF: bilateral crackles, orthopnea, PND, S3 gallop, elevated BNP. Right HF: JVD (>3cm above sternal angle at 45°), peripheral pitting edema (grade 1–4+), hepatomegaly. PMI displaced laterally = cardiomegaly. S3 at apex = left HF. Bilateral 3+ edema + JVD + hepatomegaly = right HF.', pearl: 'PNLE pearl: Measure JVD at 45° — only position where it\'s clinically meaningful.' },
      { course: 'Med-Surg', color: '#2A3A7A', badge: 'Clinical', title: 'HFrEF vs HFpEF · Priority nursing', body: 'HFrEF (EF<40%): systolic failure, dilated heart, responds to digoxin/diuretics/ACEi. HFpEF (EF≥50%): diastolic failure, stiff ventricle, harder to treat. Priority: airway first → oxygen → position → medication. 3 lb overnight weight gain + new crackles + SpO2 drop = call before anything else. Fluid restriction 1.5–2L/day.', pearl: 'PNLE pearl: HF patient + furosemide + low K+ + digoxin = triple monitoring priority. One check, three drugs.' }
    ]
  },
  furosemide: {
    name: 'Furosemide (Loop Diuretics)',
    nodes: [
      { course: 'A&P', color: '#1E6449', badge: 'Mechanism', title: 'Loop of Henle — where furosemide acts', body: 'The ascending limb of the Loop of Henle reabsorbs Na+, K+, and Cl− via the NKCC2 cotransporter. Furosemide blocks NKCC2, preventing reabsorption. Result: more Na+, K+, Cl−, and water excreted in urine. This also disrupts the concentration gradient needed to reabsorb water in the collecting duct → massive diuresis. Every adverse effect derives from this one mechanism.', pearl: 'PNLE pearl: Furosemide causes hypokalemia because K+ follows Na+ into the filtrate.' },
      { course: 'Pharmacology', color: '#8A2020', badge: 'Drugs', title: 'Monitoring · Interactions · Antidote', body: 'Monitor: K+ (hypokalemia), Na+ (hyponatremia), creatinine (pre-renal AKI risk), hearing (ototoxicity at high IV doses). Dangerous interactions: + digoxin (hypokalemia potentiates toxicity), + aminoglycosides (additive ototoxicity), + NSAIDs (reduced efficacy + renal risk). No antidote — stop drug, replace electrolytes.', pearl: 'PNLE pearl: Furosemide IV fast push → tinnitus and hearing loss. Always give slowly.' },
      { course: 'Fundamentals', color: '#5A3A8A', badge: 'Process', title: 'Nursing priorities for diuretic therapy', body: 'Before giving: check K+, check BP (hold if SBP <90 or per parameter), check recent weight. During: document urine output hourly if acute. After: assess for dizziness (orthostatic hypotension), muscle cramps (hypokalemia), signs of dehydration. 10 Rights — "right assessment" means electrolytes, BP, weight before every dose.', pearl: 'PNLE pearl: Furosemide + fall risk = always assess orthostatic BP before discharge teaching.' },
      { course: 'Health Assessment', color: '#2A5A7A', badge: 'Signs', title: 'What to find before and after giving', body: 'Before: lung sounds (crackles = fluid overload → diuretic needed), BP, edema grade, JVD, weight. After: reassess lung sounds (should improve), I&O balance, skin turgor (dehydration sign — assess at clavicle), mucous membranes, orthostatic BP. U waves on ECG = hypokalemia developing — critical finding.', pearl: 'PNLE pearl: U waves on ECG after furosemide = hypokalemia emergency — check K+ immediately.' },
      { course: 'Med-Surg', color: '#2A3A7A', badge: 'Clinical', title: 'HF · CKD · Hypertension — clinical contexts', body: 'HF: first-line for fluid overload. Target: dry weight (euvolemia). CKD: use with caution — may precipitate AKI (pre-renal); monitor BUN/Cr. Hypertension: second-line after thiazides. Cirrhosis ascites: furosemide + spironolactone (K+-sparing) in 100:40 ratio to prevent both hypo and hyperkalemia. Dose titration based on urine output response.', pearl: 'PNLE pearl: No urine output after furosemide in CKD = notify physician — pre-renal AKI developing.' }
    ]
  },
  dka: {
    name: 'Diabetic Ketoacidosis (DKA)',
    nodes: [
      { course: 'A&P', color: '#1E6449', badge: 'Mechanism', title: 'Insulin deficiency → ketone production', body: 'Without insulin: glucose cannot enter cells. Cells starve despite hyperglycemia. Liver responds by breaking down fat → fatty acids → ketones (acetoacetate, beta-hydroxybutyrate). Ketones are acidic → metabolic acidosis (↓pH, ↓HCO3−). Hyperosmolarity from high glucose → osmotic diuresis → profound dehydration. All DKA signs derive from this chain.', pearl: 'PNLE pearl: Kussmaul respirations = body blowing off CO2 to compensate for metabolic acidosis.' },
      { course: 'Pharmacology', color: '#8A2020', badge: 'Drugs', title: 'Fluids FIRST, then insulin — always', body: 'Step 1: IV isotonic NS (not LR) to restore volume — 1L in first hour. Step 2: Insulin infusion after hydration — NEVER give insulin without first treating dehydration (worsens hypotension). Step 3: Add dextrose to IV fluid when glucose <250 mg/dL to prevent hypoglycemia. Step 4: Replace K+ — insulin drives K+ into cells, serum K+ will drop rapidly (watch for hypokalemia during treatment).', pearl: 'PNLE pearl: Never give insulin in DKA without first giving IV fluids. Sequence matters on the board.' },
      { course: 'Fundamentals', color: '#5A3A8A', badge: 'Process', title: 'ADPIE in DKA — priorities and monitoring', body: 'Assess: glucose, ABG (pH, HCO3−), K+, Na+, urine output, LOC, breath odor. Diagnose: Deficient Fluid Volume + Imbalanced Blood Glucose. Implement: IV access × 2, fluids per protocol, insulin drip, hourly glucose, cardiac monitoring (K+ changes). Evaluate: glucose trending down 50–75 mg/dL/hr, pH normalizing, K+ stable, LOC improving.', pearl: 'PNLE pearl: Glucose drops before acidosis resolves. Don\'t stop insulin when glucose normalizes — continue until anion gap closes.' },
      { course: 'Health Assessment', color: '#2A5A7A', badge: 'Signs', title: 'The triad you will see', body: 'Classic triad: fruity/acetone breath (ketones), Kussmaul respirations (deep, rapid, sighing — compensatory), altered LOC (ranging from confusion to coma). Assess: skin turgor (poor), mucous membranes (dry), eyeballs (sunken in severe cases), BP (low), HR (elevated), UO (initially polyuria, then oliguria). ABG: pH <7.30, HCO3− <15, elevated anion gap.', pearl: 'PNLE pearl: Anion gap = Na+ − (Cl− + HCO3−). Normal 8–12. DKA = elevated anion gap metabolic acidosis.' },
      { course: 'Med-Surg', color: '#2A3A7A', badge: 'Clinical', title: 'DKA vs HHS — the distinction that matters', body: 'DKA: Type 1 mostly, ketones present, glucose usually <600, acidosis present, develops in hours. HHS: Type 2 elderly, NO ketones, glucose >600 (often >1000), NO acidosis, develops over days, higher mortality. Both: hyperosmolar, dehydrated, treat with fluids first. DKA priority: correct acidosis. HHS priority: correct dehydration. K+ management critical in both.', pearl: 'PNLE pearl: HHS = no ketones, no acidosis, extreme hyperglycemia. Same fluid-first rule, different target glucose correction rate (slower in HHS).' }
    ]
  },
  shock: {
    name: 'Shock',
    nodes: [
      { course: 'A&P', color: '#1E6449', badge: 'Mechanism', title: 'Inadequate tissue perfusion — the final common pathway', body: 'All shock types share one endpoint: cells don\'t receive enough O2. Without O2: aerobic metabolism → anaerobic → lactic acid → metabolic acidosis. Types by cause: hypovolemic (↓volume), distributive (↓vascular resistance — septic, anaphylactic, neurogenic), cardiogenic (↓pump function), obstructive (↓flow from outside). MAP = CO × SVR. Drop either CO or SVR without compensation → shock.', pearl: 'PNLE pearl: Lactate >2 mmol/L = anaerobic metabolism = inadequate perfusion = shock.' },
      { course: 'Pharmacology', color: '#8A2020', badge: 'Drugs', title: 'Vasopressors · Fluids · Epinephrine', body: 'Norepinephrine: first-line for septic shock (α>β → vasoconstriction + mild inotropy). Dopamine: second-line, dose-dependent effects. Epinephrine: anaphylaxis ONLY — 0.3–0.5mg of 1:1000 IM into outer thigh, FIRST drug, no exceptions. IV crystalloids: 30mL/kg bolus in sepsis. Vasopressors: only after adequate volume — giving pressors first in hypovolemic shock worsens tissue ischemia.', pearl: 'PNLE pearl: Anaphylaxis = epinephrine IM first, always. Antihistamines and steroids are second.' },
      { course: 'Fundamentals', color: '#5A3A8A', badge: 'Process', title: 'Early recognition — ADPIE before collapse', body: 'Assess early shock before hypotension: tachycardia, cool clammy extremities, narrowed pulse pressure (early sign, often missed), anxiety, decreased urine output, capillary refill >3s. Diagnose: Ineffective Tissue Perfusion. Implement: position (Trendelenburg for hypovolemic — legs up 30°), IV access × 2 large bore, oxygen, fluids per order, call physician with SBAR. Monitor every 15 minutes.', pearl: 'PNLE pearl: Narrowed pulse pressure (SBP − DBP) is an early shock sign that predates hypotension.' },
      { course: 'Health Assessment', color: '#2A5A7A', badge: 'Signs', title: 'Compensated vs decompensated shock signs', body: 'Compensated (early): tachycardia, normal or slightly low BP, anxious, cool pale skin, decreased UO. Decompensated (late): hypotension, AMS (confusion→unconscious), oliguria, mottled skin, lactic acidosis. Distributive (septic/anaphylactic): WARM skin early (vasodilation differentiates from hypovolemic). Cardiogenic: JVD + crackles (pump failure — fluid backs up).', pearl: 'PNLE pearl: Warm shock = distributive (sepsis, anaphylaxis). Cold shock = hypovolemic or cardiogenic.' },
      { course: 'Med-Surg', color: '#2A3A7A', badge: 'Clinical', title: 'Sepsis Hour-1 Bundle — board favorite', body: 'Within 1 hour of sepsis recognition: (1) Blood cultures ×2 before antibiotics. (2) IV broad-spectrum antibiotics. (3) Serum lactate. (4) 30mL/kg IV crystalloid if MAP <65 or lactate ≥4. (5) Vasopressors (norepinephrine) if hypotension persists despite fluids, target MAP ≥65. SOFA score for severity. Cultures BEFORE antibiotics — sequence always tested on boards.', pearl: 'PNLE pearl: Cultures BEFORE antibiotics, antibiotics BEFORE vasopressors, vasopressors BEFORE more fluids if MAP restored.' }
    ]
  },
  hypokalemia: {
    name: 'Hypokalemia',
    nodes: [
      { course: 'A&P', color: '#1E6449', badge: 'Mechanism', title: 'K+ maintains resting membrane potential', body: 'Normal serum K+: 3.5–5.0 mEq/L. K+ is the primary intracellular cation — 98% inside cells. The Na+/K+ ATPase pump maintains this gradient, creating the resting membrane potential (−70mV). Low serum K+ → hyperpolarization → cells harder to excite. Effect: muscle weakness, cardiac conduction changes. Every clinical sign of hypokalemia traces to hyperpolarization of excitable cells.', pearl: 'PNLE pearl: Hypokalemia + digoxin = dangerous. Low K+ increases digoxin binding to Na+/K+ ATPase → toxicity at normal doses.' },
      { course: 'Pharmacology', color: '#8A2020', badge: 'Drugs', title: 'Replacement · Interactions · Causes', body: 'IV KCl: never bolus, maximum 10–20 mEq/hr via peripheral line, must be diluted. Oral K+ preferred if patient can take orally (less arrhythmia risk). Causes by drug: furosemide, thiazides, amphotericin B, steroids (all cause hypokalemia). K+-sparing diuretics (spironolactone) used to prevent. Critical: always check K+ before digoxin — hold if <3.5.', pearl: 'PNLE pearl: IV KCl is a high-alert medication — NEVER give undiluted or by rapid infusion (cardiac arrest).' },
      { course: 'Fundamentals', color: '#5A3A8A', badge: 'Process', title: 'Safety: five rights + assessment before replacement', body: 'Before any K+ replacement: verify urine output ≥30mL/hr (cannot give K+ if oliguria — will cause hyperkalemia). Check cardiac monitor before and during IV infusion. Right assessment = current K+ level, UO, cardiac rhythm, renal function. Document: time, dose, route, site, patient response. Oral KCl: give with food (GI irritant). Never NG tube unless extended-release formulation is liquid.', pearl: 'PNLE pearl: Always confirm UO before IV K+ — kidneys must be working to excrete excess.' },
      { course: 'Health Assessment', color: '#2A5A7A', badge: 'Signs', title: 'What hypokalemia looks like clinically', body: 'Mild (<3.5): muscle weakness, fatigue, constipation, leg cramps. Moderate (<3.0): muscle cramping, worsening weakness, ileus. Severe (<2.5): paralytic ileus, respiratory muscle weakness, cardiac arrhythmias. ECG findings: U waves (after T wave, best seen in V2-V3), flattened T waves, prolonged QU interval, SVT/VT in severe cases. Assess: grip strength, deep tendon reflexes, bowel sounds.', pearl: 'PNLE pearl: U waves on ECG = hypokalemia until proven otherwise. Classic board ECG finding.' },
      { course: 'Med-Surg', color: '#2A3A7A', badge: 'Clinical', title: 'DKA · HF · Post-op — when K+ crashes', body: 'DKA: insulin drives K+ into cells → serum K+ drops rapidly during treatment → monitor every 1–2hr. Furosemide for HF: chronic hypokalemia risk → supplement with oral K+ or K+-sparing diuretic. Post-op NG suction: HCl loss → metabolic alkalosis → kidneys excrete K+ to compensate → hypokalemia. Eating disorders, vomiting: same pathway. Treatment: always oral first if GI working.', pearl: 'PNLE pearl: Metabolic alkalosis + hypokalemia = think gastric losses (vomiting, NG suction).' }
    ]
  }
};
// Fill remaining options with basic structure
['stroke','iv_fluids','sepsis','hypoxia','mi'].forEach(k => {
  if (!CHAIN_DATA[k]) CHAIN_DATA[k] = { name: k, nodes: [] };
});
CHAIN_DATA['stroke'] = { name: 'Stroke / Increased ICP', nodes: [
  { course:'A&P', color:'#1E6449', badge:'Mechanism', title:'Cerebral blood flow and autoregulation', body:'The brain autoregulates blood flow (CBF) between MAP 60–150mmHg. Ischemic stroke: clot occludes artery → ischemic penumbra (salvageable tissue surrounding infarct core). ICP = brain volume + CSF volume + blood volume. Any increase in one must be compensated or ICP rises. Cushing\'s triad (HTN + bradycardia + irregular respirations) = herniation is imminent — late and ominous sign.', pearl:'PNLE pearl: Ischemic stroke — do NOT aggressively lower BP (>220/>120 only) — hypertension is compensatory.' },
  { course:'Pharmacology', color:'#8A2020', badge:'Drugs', title:'tPA · Mannitol · Nimodipine', body:'tPA (alteplase): ischemic stroke only, within 4.5hr of symptom onset, NO hemorrhagic stroke. Contraindications: recent surgery, active bleeding, BP >185/110 (treat first), INR >1.7. Mannitol: osmotic diuretic for cerebral edema — draws water from brain → monitor ICP, electrolytes, osmolarity. Nimodipine: subarachnoid hemorrhage only — prevents cerebral vasospasm, NOT for BP control.', pearl:'PNLE pearl: Give tPA? Control BP to <185/110 FIRST, then give. BP too high = contraindication.' },
  { course:'Fundamentals', color:'#5A3A8A', badge:'Process', title:'Code stroke priorities', body:'FAST: Face drooping, Arm weakness, Speech difficulty, Time to call. Last known well time is critical — it starts the tPA window clock, not when found. Position: HOB 0–15° for first 24hr post-stroke (promotes perfusion) unless aspiration risk. After tPA: no anticoagulants/antiplatelets ×24hr. Dysphagia screen before any oral intake — aspiration risk is immediate.', pearl:'PNLE pearl: Dysphagia screen before ANYTHING by mouth post-stroke. Aspiration pneumonia is the leading complication.' },
  { course:'Health Assessment', color:'#2A5A7A', badge:'Signs', title:'NIH Stroke Scale + ICP signs', body:'NIHSS: 15 items assessing LOC, gaze, visual fields, facial palsy, motor (arms/legs), ataxia, sensation, language, dysarthria, extinction. Score 0=normal, 42=maximum. ICP signs: progressive headache, vomiting (often projectile), papilledema, Cushing\'s triad (late). Unequal pupils: CN III compression from herniation — emergency. Periorbital bruising (raccoon eyes) = basilar skull fracture.', pearl:'PNLE pearl: Unequal pupils post-stroke = herniation until proven otherwise. Immediate physician notification.' },
  { course:'Med-Surg', color:'#2A3A7A', badge:'Clinical', title:'Ischemic vs hemorrhagic — opposite management', body:'Ischemic (87%): tPA if eligible, aspirin after 24hr, permissive hypertension initially. Hemorrhagic (13%): NO tPA, NO aspirin, BP control aggressive (target SBP <140), reverse anticoagulants if applicable. Both: HOB 30° for ICP management, NPO until dysphagia cleared, continuous neuro assessment (GCS q1-2hr), DVT prophylaxis after 24–48hr. Rehab: speech, OT, PT as early as day 2 if stable.', pearl:'PNLE pearl: Hemorrhagic stroke + anticoagulated patient = reverse anticoagulation immediately (Vit K, PCC, protamine for heparin).' }
]};

function chainRender(key) {
  const visual = document.getElementById('chain-visual');
  const empty = document.getElementById('chain-empty');
  if (!key || !CHAIN_DATA[key]) {
    if (visual) visual.style.display = 'none';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';
  if (!visual) return;
  const chain = CHAIN_DATA[key];
  visual.style.display = 'flex';
  visual.innerHTML = chain.nodes.map(n => `
    <div class="chain-node">
      <div class="chain-node-head" onclick="this.parentElement.classList.toggle('open')">
        <span class="chain-node-badge" style="background:${n.color}22;color:${n.color};border:1px solid ${n.color}44">${n.badge}</span>
        <span class="chain-node-title"><strong style="font-family:var(--font-mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:${n.color};margin-right:8px">${n.course}</strong>${n.title}</span>
        <span class="chain-node-chev">›</span>
      </div>
      <div class="chain-node-body">
        <p>${n.body}</p>
        <div class="chain-node-pearl" style="border-color:${n.color}">${n.pearl}</div>
      </div>
    </div>`).join('');
}

// goDeep alias for chain
const _origGoDeepChain = goDeep;
goDeep = function(viewId) {
  if (viewId === 'chain') {
    _backDest = _currentHubTab || 'tools';
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const el = document.getElementById('view-chain');
    if (el) el.classList.add('active');
    window.scrollTo(0, 0);
    return;
  }
  _origGoDeepChain(viewId);
};
function pvPrev(){if(pvIdx>0)pvGoTo(pvIdx-1);_pvUpdateArrows();}
function _pvUpdateArrows(){
  const prevBtn=document.querySelector('#view-viktor .pv-tab-arrow:first-child');
  const nextBtn=document.querySelector('#view-viktor .pv-tab-arrow:last-child');
  if(prevBtn){prevBtn.style.opacity=pvIdx===0?'0.25':'1';prevBtn.style.pointerEvents=pvIdx===0?'none':'auto';}
  if(nextBtn){nextBtn.style.opacity=pvIdx===PV_TOTAL-1?'0.25':'1';nextBtn.style.pointerEvents=pvIdx===PV_TOTAL-1?'none':'auto';}
}
function pvTogglePlay(){
  const btn=document.getElementById('pv-play-btn');
  if(pvTimer){clearInterval(pvTimer);pvTimer=null;btn.textContent='⏵ Auto-play';btn.classList.remove('playing');}
  else{pvTimer=setInterval(pvNext,5000);btn.textContent='⏸ Pause';btn.classList.add('playing');}
}

// ─── SURVIVAL GUIDE TABS ──────────────────────────────────────────────────────
const SG_TOTAL=11;let sgIdx=0;
function sgGoTo(i){
  const domOrder=['sg-0','sg-10','sg-1','sg-2','sg-3','sg-4','sg-5','sg-6','sg-7','sg-8','sg-9'];
  // Hide grid, show detail area
  const grid=document.querySelector('.sg-grid');
  const detail=document.getElementById('sg-detail-area');
  if(grid) grid.style.display='none';
  if(detail) detail.style.display='block';
  // Show correct panel
  document.querySelectorAll('#view-survival .pv-panel').forEach((p,idx)=>p.classList.toggle('active',idx===i));
  sgIdx=i;
  window.scrollTo({top:0,behavior:'smooth'});
}
function sgBackToGrid(){
  const grid=document.querySelector('.sg-grid');
  const detail=document.getElementById('sg-detail-area');
  if(grid) grid.style.display='grid';
  if(detail) detail.style.display='none';
  document.querySelectorAll('#view-survival .pv-panel').forEach(p=>p.classList.remove('active'));
  sgIdx=-1;
  window.scrollTo({top:0,behavior:'smooth'});
}
function sgNext(){ if(sgIdx<SG_TOTAL-1) sgGoTo(sgIdx+1); }
function sgPrev(){
  if(sgIdx>0){sgGoTo(sgIdx-1);}
  _sgUpdateArrows();
}
function _sgUpdateArrows(){
  const prevBtn=document.querySelector('#view-survival .pv-tab-arrow:first-child');
  const nextBtn=document.querySelector('#view-survival .pv-tab-arrow:last-child');
  if(prevBtn){prevBtn.style.opacity=sgIdx===0?'0.25':'1';prevBtn.style.pointerEvents=sgIdx===0?'none':'auto';}
  if(nextBtn){nextBtn.style.opacity=sgIdx===SG_TOTAL-1?'0.25':'1';nextBtn.style.pointerEvents=sgIdx===SG_TOTAL-1?'none':'auto';}
}

// ─── TOOL SUB-TABS ────────────────────────────────────────────────────────────
function showToolTab(prefix,panelId){
  const viewMap={ss:'studysystem',tb:'timeblock',le:'lowenergy',rs:'resources',ws:'weeklySynth'};
  const viewId=viewMap[prefix];if(!viewId)return;
  const container=document.getElementById('view-'+viewId);if(!container)return;
  container.querySelectorAll('.tool-panel').forEach(p=>p.classList.remove('active'));
  container.querySelectorAll('.tool-tab').forEach(t=>t.classList.remove('active'));
  const panel=container.querySelector('#'+prefix+'-'+panelId);if(panel)panel.classList.add('active');
  container.querySelectorAll('.tool-tab').forEach(t=>{
    if(t.getAttribute('onclick')===`showToolTab('${prefix}','${panelId}')`)t.classList.add('active');
  });
  if(prefix==='rs'&&panelId==='custom')renderCustomResources();
  if(prefix==='rs'&&panelId==='files')renderFileList();
  if(prefix==='ws'&&panelId==='history')setTimeout(synthLoadHistory,50);
  if(prefix==='ws'&&panelId==='sessionlog')setTimeout(slogRender,50);
  if(prefix==='ws'&&panelId==='review')setTimeout(synthLoadCurrent,50);
}


// ─── HUB TAB NAVIGATION ─────────────────────────────────────────────────────
let _currentHubTab='home';
let _backDest='home';

function showHubTab(tab){
  _currentHubTab=tab;
  const map={home:'dashboard',coverage:'coverage',tools:'tools',viktor:'viktor',survival:'survival'};
  const viewId=map[tab]||tab;
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  const el=document.getElementById('view-'+viewId);
  if(el)el.classList.add('active');
  document.querySelectorAll('.hub-nav-btn').forEach(b=>b.classList.remove('active'));
  const btn=document.getElementById('hnb-'+tab);
  if(btn)btn.classList.add('active');
  window.scrollTo(0,0);
  if(tab==='home')buildOverview();
  if(tab==='coverage')buildCoverageCards();
  if(tab==='viktor'){if(typeof buildViktorChecklist==='function')buildViktorChecklist();pvGoTo(0);setTimeout(connRender,80);}
  if(tab==='survival')sgBackToGrid();
}

function goDeep(viewId){
  // alias is also applied in the patched outer goDeep — safe to resolve again here
  const alias={'return-demo':'returnDemo','weekly-synthesis':'weeklySynth'};
  viewId=alias[viewId]||viewId;
  _backDest=_currentHubTab||'tools';
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  const el=document.getElementById('view-'+viewId);
  if(el)el.classList.add('active');
  if(viewId==='resources')renderCustomResources();
  if(viewId==='returnDemo')rdtRender();
  window.scrollTo(0,0);
}

function goBack(){showHubTab(_backDest||'home');}

// Patch showProject to set back destination
const _origShowProject=showProject;
showProject=function(projId){
  _backDest=_currentHubTab||'coverage';
  _origShowProject(projId);
};

// ─── OVERVIEW ────────────────────────────────────────────────────────────────
function buildOverview(){
  updateOverallProgress();
  renderDonuts();
  buildStreakGrid();
  buildCalendar();
  renderTodos();
  _todoDate=null;
  const d=document.getElementById('todo-date');
  if(d)d.textContent=new Date().toLocaleDateString('en-PH',{weekday:'short',month:'short',day:'numeric'});
  const titleEl=document.querySelector('.todo-title');
  if(titleEl)titleEl.textContent="Today's Tasks";
}

function updateOverallProgress(){
  let total=0,done=0;
  projects.forEach(p=>{const pg=getProjectProgress(p);total+=pg.total;done+=pg.done;});
  const pct=total?Math.round(done/total*100):0;
  const bar=document.getElementById('ov-total-bar');
  const meta=document.getElementById('ov-total-meta');
  const pctEl=document.getElementById('ov-total-pct');
  if(meta)meta.textContent=done+' of '+total+' items';
  if(pctEl)pctEl.textContent=pct+'%';
  if(bar){
    bar.style.width='0%';
    requestAnimationFrame(()=>requestAnimationFrame(()=>{bar.style.width=pct+'%';}));
  }
}

function renderDonuts(){
  const cont=document.getElementById('ov-donuts');if(!cont)return;
  cont.innerHTML='';
  const iconMap={ap:'🫀',fund:'🩺',ha:'🔬',pharm:'💊'};
  const labelMap={ap:'A&P',fund:'Fundamentals',ha:'Health Assess',pharm:'Pharmacology'};
  projects.forEach(p=>{
    const {pct}=getProjectProgress(p);
    const R=24,C=+(2*Math.PI*R).toFixed(2),offset=+(C*(1-pct/100)).toFixed(2);
    const icon=iconMap[p.id]||'📖';
    const lbl=labelMap[p.id]||p.id;
    const div=document.createElement('div');div.className='donut-item';
    const {total:ptotal,done:pdone}=getProjectProgress(p);
    div.title=`${lbl}: ${pdone} of ${ptotal} items (${pct}%)`;
    div.innerHTML=`<div style="position:relative;width:60px;height:60px"><svg width="60" height="60" viewBox="0 0 60 60"><circle cx="30" cy="30" r="${R}" fill="none" stroke="rgba(107,94,74,.12)" stroke-width="5"/><circle cx="30" cy="30" r="${R}" fill="none" stroke="${p.color}" stroke-width="5" stroke-dasharray="${C}" stroke-dashoffset="${offset}" stroke-linecap="round" transform="rotate(-90 30 30)"/></svg><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:18px">${icon}</div></div><div class="donut-label">${lbl}</div><div class="donut-pct">${pct}%</div>`;
    div.onclick=()=>{_backDest='home';showProject(p.id);};
    cont.appendChild(div);
  });
}

// ─── STREAK TRACKER ──────────────────────────────────────────────────────────
const STREAK_KEY='viktor-streak-v1';
function getStreakData(){try{return JSON.parse(localStorage.getItem(STREAK_KEY)||'[]');}catch{return[];}}
function saveStreakData(d){localStorage.setItem(STREAK_KEY,JSON.stringify(d));}
function todayISO(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}

function computeCurrentStreak(data){
  const s=new Set(data);
  let streak=0;
  const startOffset=s.has(todayISO())?0:1;
  for(let i=startOffset;i<400;i++){
    const d=new Date();d.setDate(d.getDate()-i);
    const iso=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    if(s.has(iso))streak++;
    else break;
  }
  return streak;
}

function buildStreakGrid(){
  const cont=document.getElementById('streak-grid');if(!cont)return;
  const data=getStreakData();const today=todayISO();
  cont.innerHTML='';
  for(let i=27;i>=0;i--){
    const d=new Date();d.setDate(d.getDate()-i);
    const iso=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    const dot=document.createElement('div');
    const isDone=data.includes(iso);
    const isToday=iso===today;
    // 'recent' = within last 7 days
    const daysAgo=i;
    const isRecent=isDone&&daysAgo<=6&&!isToday;
    dot.className='streak-dot'+(isDone?' done':'')+(isToday&&isDone?' today-dot today':(isToday?' today':''))+(isRecent?' recent':'');
    dot.title=iso;
    dot.onclick=()=>toggleStreakDay(iso,dot);
    cont.appendChild(dot);
  }
  const cnt=document.getElementById('streak-count');
  if(cnt)cnt.textContent=computeCurrentStreak(data);
}

function toggleStreakDay(iso,dot){
  let data=getStreakData();
  if(data.includes(iso)){data=data.filter(d=>d!==iso);dot.classList.remove('done');}
  else{data.push(iso);dot.classList.add('done');}
  saveStreakData(data);
  const cnt=document.getElementById('streak-count');
  if(cnt)cnt.textContent=computeCurrentStreak(data);
}

// ─── CALENDAR ────────────────────────────────────────────────────────────────
const CAL_KEY='viktor-cal-v1';
let calOffset=0;
let calEventType='';
function getCalEvents(){try{return JSON.parse(localStorage.getItem(CAL_KEY)||'{}')}catch{return{};}}
function saveCalEvents(d){localStorage.setItem(CAL_KEY,JSON.stringify(d));}
function calPrev(){calOffset--;buildCalendar();}
function calNext(){calOffset++;buildCalendar();}

let _selectedCalISO=null;

function buildCalendar(){
  const cont=document.getElementById('week-days');if(!cont)return;
  const titleEl=document.getElementById('week-title');
  const now=new Date();
  const dow=now.getDay()||7;
  const monday=new Date(now);monday.setDate(now.getDate()-dow+1+calOffset*7);
  const sunday=new Date(monday);sunday.setDate(monday.getDate()+6);
  const fmt=d=>d.toLocaleDateString('en-PH',{month:'short',day:'numeric'});
  if(titleEl)titleEl.textContent=fmt(monday)+' – '+fmt(sunday);
  const events=getCalEvents();
  const today=todayISO();
  cont.innerHTML='';
  for(let i=0;i<7;i++){
    const d=new Date(monday);d.setDate(monday.getDate()+i);
    const iso=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    const isSelected=_selectedCalISO===iso;
    const cell=document.createElement('div');
    cell.className='week-day-cell'+(iso===today?' today':'')+(isSelected?' selected':'');
    cell.dataset.iso=iso;
    const evts=events[iso]||[];
    const todosForDay=getTodos().filter(t=>t.date===iso);
    const hasTodos=todosForDay.length>0;
    let inner=`<div class="week-day-num" style="font-weight:${iso===today?'600':'400'}">${d.getDate()}</div>`;
    evts.forEach((ev,evIdx)=>{
      inner+=`<div class="week-day-event ${ev.type||''}" title="${ev.text}"><span class="ev-text">${ev.text}</span><span class="ev-del" onclick="event.stopPropagation();deleteCalEvent('${iso}',${evIdx})">✕</span></div>`;
    });
    if(hasTodos){inner+=`<div class="week-todo-dot" title="${todosForDay.length} task${todosForDay.length>1?'s':''}">${todosForDay.length} task${todosForDay.length>1?'s':''}</div>`;}
    cell.innerHTML=inner;
    cell.addEventListener('click',()=>{openSharedForm(iso,d);setTodoDate(iso);});
    cont.appendChild(cell);
  }
}

function openSharedForm(iso, dateObj){
  _selectedCalISO=iso;
  const form=document.getElementById('week-shared-form');
  const lbl=document.getElementById('week-form-date-lbl');
  const inp=document.getElementById('cal-shared-inp');
  if(!form)return;
  const fmtd=dateObj.toLocaleDateString('en-PH',{weekday:'short',month:'short',day:'numeric'});
  if(lbl)lbl.textContent='Adding event for '+fmtd;
  if(inp)inp.value='';
  // reset type buttons
  document.querySelectorAll('#cal-type-btns .week-type-btn').forEach(b=>b.classList.remove('active'));
  const first=document.querySelector('#cal-type-btns .week-type-btn');
  if(first)first.classList.add('active');
  calEventType='';
  form.classList.add('open');
  setTimeout(()=>{if(inp)inp.focus();},50);
  // highlight selected cell
  document.querySelectorAll('.week-day-cell').forEach(c=>{
    c.classList.toggle('selected',c.dataset.iso===iso);
  });
}

function closeSharedForm(){
  const form=document.getElementById('week-shared-form');
  if(form)form.classList.remove('open');
  _selectedCalISO=null;
  document.querySelectorAll('.week-day-cell').forEach(c=>c.classList.remove('selected'));
}

function setCalType(btn,type){
  calEventType=type;
  btn.closest('.week-add-type').querySelectorAll('.week-type-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
}

function saveSharedCalEvent(){
  const inp=document.getElementById('cal-shared-inp');
  if(!inp||!inp.value.trim()||!_selectedCalISO)return;
  const events=getCalEvents();if(!events[_selectedCalISO])events[_selectedCalISO]=[];
  events[_selectedCalISO].push({text:inp.value.trim(),type:calEventType});
  saveCalEvents(events);closeSharedForm();buildCalendar();
}

function deleteCalEvent(iso,idx){
  const events=getCalEvents();
  if(events[iso]){events[iso].splice(idx,1);if(!events[iso].length)delete events[iso];saveCalEvents(events);buildCalendar();}
}

// legacy aliases (unused but harmless)
function saveCalEvent(iso){saveSharedCalEvent();}
function closeAllCalForms(){closeSharedForm();}

// ─── TODO LIST ────────────────────────────────────────────────────────────────
const TODO_KEY='viktor-todo-v1';
let _todoDate=null; // null = today
function getTodos(){try{return JSON.parse(localStorage.getItem(TODO_KEY)||'[]');}catch{return[];}}
function saveTodos(d){localStorage.setItem(TODO_KEY,JSON.stringify(d));}

function getActiveTodoDate(){return _todoDate||todayISO();}

function setTodoDate(iso){
  _todoDate=iso;
  const titleEl=document.querySelector('.todo-title');
  const dateEl=document.getElementById('todo-date');
  const today=todayISO();
  if(titleEl)titleEl.textContent=iso===today?'Today\'s Tasks':formatISOForDisplay(iso)+' Tasks';
  if(dateEl)dateEl.textContent=formatISOForDisplay(iso);
  renderTodos();
}

function formatISOForDisplay(iso){
  if(!iso)return '';
  const d=new Date(iso+'T00:00:00');
  return d.toLocaleDateString('en-PH',{weekday:'short',month:'short',day:'numeric'});
}

function renderTodos(){
  const list=document.getElementById('todo-list');if(!list)return;
  const todos=getTodos();
  const activeDate=getActiveTodoDate();
  const today=todayISO();
  // show todos for active date; legacy todos with no date show on today only
  const filtered=todos.filter(t=>t.date===activeDate||((!t.date)&&activeDate===today));
  list.innerHTML='';
  if(!filtered.length){list.innerHTML='<li class="todo-empty">No tasks for this day. Add one above.</li>';return;}
  filtered.forEach(t=>{
    const li=document.createElement('li');li.className='todo-item';
    li.innerHTML=`<input type="checkbox" class="todo-cb" ${t.done?'checked':''}><span class="todo-text ${t.done?'done':''}">${t.text}</span><button class="todo-del">✕</button>`;
    li.querySelector('.todo-cb').onchange=function(){toggleTodo(t.id,this);};
    li.querySelector('.todo-del').onclick=()=>deleteTodo(t.id);
    list.appendChild(li);
  });
}
function addTodo(){
  const inp=document.getElementById('todo-input');if(!inp||!inp.value.trim())return;
  const todos=getTodos();
  todos.push({id:Date.now().toString(36),text:inp.value.trim(),done:false,date:getActiveTodoDate()});
  saveTodos(todos);inp.value='';renderTodos();
}
function toggleTodo(id,cb){
  const todos=getTodos();const t=todos.find(x=>x.id===id);
  if(t)t.done=cb.checked;
  saveTodos(todos);
  if(cb.nextElementSibling)cb.nextElementSibling.className='todo-text'+(cb.checked?' done':'');
}
function deleteTodo(id){saveTodos(getTodos().filter(t=>t.id!==id));renderTodos();}

// ─── POMODORO (inline widget — legacy, kept for compat) ────────────────────────
// NOTE: The active timer is the overlay (PF/pfStart). pomoStart/pomoReset/setPomoMode
// below are legacy stubs — the HTML they targeted no longer exists in v11+.
const POMO={mode:'work',running:false,remaining:25*60,sessions:0,timer:null};
const POMO_DUR={work:25*60,short:5*60,long:15*60};
const POMO_LABELS={work:'Focus session',short:'Short break',long:'Long break'};

function setPomoMode(mode){
  if(POMO.running){clearInterval(POMO.timer);POMO.timer=null;POMO.running=false;}
  POMO.mode=mode;POMO.remaining=POMO_DUR[mode];
}
function pomoStart(){/* legacy stub — use pfStart() via the FAB overlay */}
function pomoReset(){clearInterval(POMO.timer);POMO.timer=null;POMO.running=false;POMO.remaining=POMO_DUR[POMO.mode];}
function pomoUpdateUI(){/* legacy stub */}

// ─── RESOURCE NOTES ───────────────────────────────────────────────────────────
const RES_NOTES_KEY='viktor-res-notes-v1';
function getResNotes(){try{return JSON.parse(localStorage.getItem(RES_NOTES_KEY)||'{}');}catch{return{};}}
function saveResNotes(d){localStorage.setItem(RES_NOTES_KEY,JSON.stringify(d));}
function toggleResNote(id){
  const area=document.getElementById('res-note-'+id);if(!area)return;
  area.classList.toggle('open');
  const btn=area.nextElementSibling;
  if(btn)btn.textContent=area.classList.contains('open')?'− hide notes':'+ add notes';
  if(area.classList.contains('open')){
    const notes=getResNotes();const ta=area.querySelector('textarea');
    if(ta&&notes[id])ta.value=notes[id];
  }
}
function autoSaveResNote(id,el){const n=getResNotes();n[id]=el.value;saveResNotes(n);}

// ─── CUSTOM RESOURCES ─────────────────────────────────────────────────────────
const CUSTOM_RES_KEY='viktor-custom-res-v1';
function getCustomResources(){try{return JSON.parse(localStorage.getItem(CUSTOM_RES_KEY)||'[]');}catch{return[];}}
function saveCustomResources(d){localStorage.setItem(CUSTOM_RES_KEY,JSON.stringify(d));}
function toggleResAddForm(){const f=document.getElementById('res-custom-form');if(f)f.classList.toggle('open');}
function saveCustomResource(){
  const name=document.getElementById('res-new-name');if(!name||!name.value.trim())return;
  const url=document.getElementById('res-new-url');
  const subject=document.getElementById('res-new-subject');
  const note=document.getElementById('res-new-note');
  const res=getCustomResources();
  res.push({id:Date.now().toString(36),name:name.value.trim(),url:(url&&url.value.trim())||'',subject:(subject&&subject.value.trim())||'',note:(note&&note.value.trim())||''});
  saveCustomResources(res);
  [name,url,subject,note].forEach(el=>{if(el)el.value='';});
  toggleResAddForm();renderCustomResources();
}
function deleteCustomResource(id){saveCustomResources(getCustomResources().filter(r=>r.id!==id));renderCustomResources();}
function renderCustomResources(){
  const cont=document.getElementById('res-custom-list');if(!cont)return;
  const res=getCustomResources();
  if(!res.length){cont.innerHTML='<div style="font-size:13px;color:var(--text-muted);padding:12px 0;font-style:italic">No saved resources yet.</div>';return;}
  cont.innerHTML=res.map(r=>`<div class="res-card"><div class="res-icon">🔗</div><div class="res-meta"><div class="res-name">${r.name}</div>${r.subject?`<div class="res-url">${r.subject}</div>`:''}<div class="res-body">${r.note||''}</div></div>${r.url?`<a class="res-link-btn" href="${r.url.startsWith('http')?r.url:'https://'+r.url}" target="_blank">↗ open</a>`:''}<button class="res-note-toggle" onclick="deleteCustomResource('${r.id}')" style="margin-left:8px;color:var(--accent)">✕ remove</button></div>`).join('');
}


// ─── FILE VIEWER ────────────────────────────────────────────────────────────
const FILE_STORE_KEY='viktor-files-v1';
let openedFiles=[];
function getStoredFiles(){try{return JSON.parse(localStorage.getItem(FILE_STORE_KEY)||'[]');}catch{return[];}}
function saveStoredFiles(arr){localStorage.setItem(FILE_STORE_KEY,JSON.stringify(arr));}

function fileDragOver(e){e.preventDefault();document.getElementById('file-drop-zone').classList.add('drag-over');}
function fileDragLeave(e){document.getElementById('file-drop-zone').classList.remove('drag-over');}
function fileDrop(e){e.preventDefault();fileDragLeave(e);const files=e.dataTransfer.files;if(files.length)processFile(files[0]);}
function fileInputChange(e){if(e.target.files.length)processFile(e.target.files[0]);}

function processFile(file){
  const name=file.name;
  const ext=name.split('.').pop().toLowerCase();
  const size=file.size;
  const sizeStr=size>1048576?(size/1048576).toFixed(1)+' MB':(size/1024).toFixed(0)+' KB';
  const reader=new FileReader();
  reader.onload=function(ev){
    const stored=getStoredFiles();
    // check dupe
    const existing=stored.findIndex(f=>f.name===name);
    const entry={name,ext,sizeStr,dataUrl:ev.target.result,added:Date.now()};
    if(existing>=0)stored[existing]=entry; else stored.push(entry);
    try{saveStoredFiles(stored);}catch(e){
      // storage full — don't store, just open directly
    }
    renderFileList();
    openFile(entry);
  };
  reader.readAsDataURL(file);
}

function renderFileList(){
  const cont=document.getElementById('file-list-cont');if(!cont)return;
  const files=getStoredFiles();
  if(!files.length){cont.innerHTML='';return;}
  cont.innerHTML=files.map((f,i)=>`
    <div class="file-list-item" onclick="openFileByIndex(${i})">
      <span class="file-type-badge file-type-${f.ext}">${f.ext.toUpperCase()}</span>
      <span class="file-list-name">${f.name}</span>
      <span class="file-list-size">${f.sizeStr}</span>
      <button class="file-list-del" onclick="event.stopPropagation();deleteFile(${i})">✕</button>
    </div>`).join('');
}

function openFileByIndex(i){
  const files=getStoredFiles();
  if(files[i])openFile(files[i]);
}

function openFile(entry){
  const wrap=document.getElementById('file-viewer-wrap');
  const iframe=document.getElementById('fv-iframe');
  const epub=document.getElementById('fv-epub');
  const nameEl=document.getElementById('fv-name');
  if(!wrap)return;
  wrap.style.display='block';
  if(nameEl)nameEl.textContent=entry.name;
  iframe.classList.remove('open');
  epub.classList.remove('open');
  if(entry.ext==='pdf'){
    iframe.src=entry.dataUrl;
    iframe.className='file-viewer-frame open';
  } else if(entry.ext==='txt'||entry.ext==='md'){
    // Decode base64 text
    try{
      const b64=entry.dataUrl.split(',')[1];
      const text=atob(b64);
      epub.innerHTML='<pre style="white-space:pre-wrap;font-family:var(--font-mono);font-size:12px;line-height:1.8">'+text.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</pre>';
      epub.className='epub-render open';
    }catch(e){epub.innerHTML='<p>Could not render file.</p>';epub.className='epub-render open';}
  } else if(entry.ext==='epub'){
    const epubHtml='<div style="text-align:center;padding:40px;color:var(--text-muted)"><div style="font-size:32px;margin-bottom:12px">📖</div><div style="font-family:var(--font-mono);font-size:11px;letter-spacing:.1em">EPUB opened</div><div style="font-size:12px;margin-top:8px">'+entry.name+'</div><div style="font-size:11px;color:var(--text-muted);margin-top:16px;line-height:1.7">EPUB rendering requires the Epub.js library. For now, open in Calibre or your reader, then save pages as PDF to open here.</div></div>';
    epub.innerHTML=epubHtml;
    epub.className='epub-render open';
  }
  wrap.scrollIntoView({behavior:'smooth',block:'start'});
}

function closeFileViewer(){
  const wrap=document.getElementById('file-viewer-wrap');
  const iframe=document.getElementById('fv-iframe');
  if(iframe)iframe.src='';
  if(wrap)wrap.style.display='none';
}

function deleteFile(i){
  const files=getStoredFiles();files.splice(i,1);saveStoredFiles(files);renderFileList();
}

// file list rendering on tab open handled in original showToolTab




// ─── CONCEPT CONNECTIONS ─────────────────────────────────────────────────────
const CONN_KEY='viktor-connections-v1';
function getConns(){try{return JSON.parse(localStorage.getItem(CONN_KEY)||'[]');}catch{return[];}}
function saveConns(d){localStorage.setItem(CONN_KEY,JSON.stringify(d));}

function connAdd(){
  const inp=document.getElementById('conn-input');
  if(!inp||!inp.value.trim())return;
  const conns=getConns();
  conns.unshift({id:Date.now().toString(36),chain:inp.value.trim(),date:todayISO()});
  saveConns(conns);inp.value='';connRender();
}

function connDelete(id){
  saveConns(getConns().filter(c=>c.id!==id));connRender();
}

function connRender(){
  const cont=document.getElementById('conn-list');if(!cont)return;
  const conns=getConns();
  if(!conns.length){cont.innerHTML='<div style="font-size:12px;color:var(--ink-ghost);font-style:italic;padding:8px 0">No connections yet. Add your first cross-subject chain.</div>';return;}
  cont.innerHTML=conns.map(c=>`
    <div class="conn-item">
      <button class="conn-del" onclick="connDelete('${c.id}')">✕</button>
      <div class="conn-chain">${c.chain}</div>
    </div>`).join('');
}

// Patch showViktor to render connections
const _origShowViktor=showViktor||function(){};
function showViktor(){
  if(typeof buildViktorChecklist==='function')buildViktorChecklist();
  showView('viktor');
  pvGoTo(0);
  setTimeout(connRender,50);
}


// ─── FEAR RESOLVE ────────────────────────────────────────────────────────────
const FEAR_KEY='viktor-fear-resolved-v1';
function getFearState(){try{return JSON.parse(localStorage.getItem(FEAR_KEY)||'{}');}catch{return{};}}
function saveFearState(d){localStorage.setItem(FEAR_KEY,JSON.stringify(d));}

function toggleFearResolve(idx,btn){
  const state=getFearState();
  const key='fear-'+idx;
  const isNowResolved=!state[key];
  state[key]=isNowResolved;
  saveFearState(state);
  const card=document.getElementById('fear-card-'+idx)||btn.closest('.fear-card');
  if(card){card.classList.toggle('resolved',isNowResolved);}
  btn.className='fear-resolve-btn '+(isNowResolved?'resolved':'unresolved');
  btn.textContent=isNowResolved?'resolved ✓':'mark resolved';
  updateFearCount();
  updateFearDivider();
  updateProfilePulse();
}

function loadFearState(){
  const state=getFearState();
  let count=0;
  Object.keys(state).forEach(k=>{
    if(state[k]){
      count++;
      const idx=k.replace('fear-','');
      const card=document.getElementById('fear-card-'+idx);
      const btn=card?card.querySelector('.fear-resolve-btn'):null;
      if(card)card.classList.add('resolved');
      if(btn){btn.className='fear-resolve-btn resolved';btn.textContent='resolved ✓';}
    }
  });
  updateFearCount();
  updateFearDivider();
}

function updateFearCount(){
  const el=document.getElementById('fear-resolved-count');
  if(!el)return;
  const state=getFearState();
  const resolved=Object.values(state).filter(Boolean).length;
  el.textContent=resolved===0?'0 of 6 fears resolved — pre-school baseline':resolved+' of 6 fears resolved'+( resolved===6?' — all addressed':' — '+( 6-resolved)+' remain active');
}

// ─── RETURN DEMO TRACKER ────────────────────────────────────────────────────
const RDT_KEY='viktor-rdt-v1';
const RDT_STAGES=['Solo','Stress test','Partner observed','Partner + questions'];
const RDT_STATUS_BUCKET=[0,1,2,3]; // stage count -> bucket index
function getRDT(){try{return JSON.parse(localStorage.getItem(RDT_KEY)||'[]');}catch{return[];}}
function saveRDT(d){localStorage.setItem(RDT_KEY,JSON.stringify(d));}
function rdtStatusFromStages(stages){
  const done=stages.filter(Boolean).length;
  if(done===0)return'not-started';
  if(done===1)return'practicing';
  if(done===2||done===3)return'stress-test';
  return'ready';
}
function rdtBucketFromStages(stages){
  const done=stages.filter(Boolean).length;
  return Math.min(done,3);
}
function rdtStatusLabel(s){return{'not-started':'Not started','practicing':'Practicing','stress-test':'Stress testing','ready':'Ready to demo'}[s]||s;}

function rdtAddProcedure(){
  const inp=document.getElementById('rdt-new-proc');
  if(!inp||!inp.value.trim())return;
  const procs=getRDT();
  procs.push({id:Date.now().toString(36),name:inp.value.trim(),stages:[false,false,false,false],notes:''});
  saveRDT(procs);inp.value='';rdtRender();
}

function rdtRender(){
  const cont=document.getElementById('rdt-list');
  if(!cont)return;
  const procs=getRDT();

  // Update kanban board
  [0,1,2,3].forEach(b=>{
    const body=document.getElementById('rdt-col-body-'+b);
    const count=document.getElementById('rdt-count-'+b);
    const inBucket=procs.filter((_,i)=>rdtBucketFromStages(procs[i].stages)===b);
    if(body){
      body.innerHTML=inBucket.length
        ? inBucket.map(p=>`<div class="rdt-stage-chip" onclick="rdtScrollTo('${p.id}')">${p.name}</div>`).join('')
        : '<div style="padding:8px 4px;font-family:var(--font-mono);font-size:9px;color:var(--ink-ghost);letter-spacing:.04em">—</div>';
    }
    if(count)count.textContent=inBucket.length;
  });

  // Procedure detail list
  if(!procs.length){
    cont.innerHTML='<div style="font-size:13px;color:var(--ink-muted);text-align:center;padding:28px 0;font-style:italic;font-family:var(--font-body)">No procedures yet — add your first one above.</div>';
    return;
  }
  cont.innerHTML=procs.map((p,i)=>{
    const status=rdtStatusFromStages(p.stages);
    const statusLabel=rdtStatusLabel(status);
    const stagesHTML=RDT_STAGES.map((s,si)=>`
      <div class="rdt-mini-stage${p.stages[si]?' done':''}" onclick="rdtToggleStage(${i},${si})">
        <div class="rdt-mini-stage-icon">${p.stages[si]?'✦':String(si+1)}</div>
        <div class="rdt-mini-stage-lbl">${s}</div>
      </div>`).join('');
    return `<div class="rdt-proc-item" id="rdt-item-${p.id}">
      <div class="rdt-proc-item-head" onclick="rdtToggle(this)">
        <span class="rdt-proc-item-name">${p.name}</span>
        <span class="rdt-status-pill rdt-status-${status}">${statusLabel}</span>
        <span style="font-family:var(--font-mono);font-size:11px;color:var(--ink-ghost);margin-left:6px;transition:transform .2s">›</span>
      </div>
      <div class="rdt-proc-item-body">
        <div class="rdt-mini-track">${stagesHTML}</div>
        <textarea class="rdt-notes" placeholder="Notes — gaps, dropped steps, what to drill..." oninput="rdtSaveNote(${i},this.value)">${p.notes||''}</textarea>
        <div style="margin-top:8px;display:flex;justify-content:flex-end">
          <button onclick="rdtDelete(${i})" style="font-family:var(--font-mono);font-size:9px;color:var(--ink-ghost);background:none;border:none;cursor:pointer;letter-spacing:.06em;text-transform:uppercase;padding:2px 4px">✕ remove</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function rdtScrollTo(id){
  const el=document.getElementById('rdt-item-'+id);
  if(!el)return;
  el.scrollIntoView({behavior:'smooth',block:'center'});
  const body=el.querySelector('.rdt-proc-item-body');
  if(body&&!body.classList.contains('open'))body.classList.add('open');
  el.style.outline='2px solid var(--mauve)';
  el.style.outlineOffset='2px';
  setTimeout(()=>{el.style.outline='';el.style.outlineOffset='';},1800);
}

function rdtToggle(header){
  const body=header.nextElementSibling;
  body.classList.toggle('open');
}

function rdtToggleStage(procIdx,stageIdx){
  const procs=getRDT();
  if(!procs[procIdx])return;
  procs[procIdx].stages[stageIdx]=!procs[procIdx].stages[stageIdx];
  if(!procs[procIdx].stages[stageIdx]){
    for(let i=stageIdx+1;i<4;i++)procs[procIdx].stages[i]=false;
  }
  saveRDT(procs);
  const openId=procs[procIdx].id;
  rdtRender();
  // Re-open the toggled procedure
  setTimeout(()=>{
    const el=document.getElementById('rdt-item-'+openId);
    if(el){const b=el.querySelector('.rdt-proc-item-body');if(b)b.classList.add('open');}
  },0);
}

function rdtSaveNote(idx,val){
  const procs=getRDT();if(!procs[idx])return;
  procs[idx].notes=val;saveRDT(procs);
}
function rdtDelete(idx){
  if(!confirm('Remove this procedure?'))return;
  const procs=getRDT();procs.splice(idx,1);saveRDT(procs);rdtRender();
}

// ─── WEEKLY SYNTHESIS ────────────────────────────────────────────────────────
const SYNTH_KEY='viktor-synth-v1';
function getSynthData(){try{return JSON.parse(localStorage.getItem(SYNTH_KEY)||'{}');}catch{return{};}}
function saveSynthData(d){localStorage.setItem(SYNTH_KEY,JSON.stringify(d));}
function currentWeekKey(){
  const d=new Date();const day=d.getDay()||7;
  d.setDate(d.getDate()-day+1);
  return d.getFullYear()+'-W'+String(Math.ceil((((d-new Date(d.getFullYear(),0,1))/864e5)+1)/7)).padStart(2,'0');
}
function weekKeyToLabel(key){
  // key = "2026-W22" → "Week 22, 2026"
  const parts=key.split('-W');
  if(parts.length===2)return'Week '+parts[1]+', '+parts[0];
  return key;
}

let _synthTimer=null;
function synthAutosave(){
  clearTimeout(_synthTimer);
  _synthTimer=setTimeout(()=>{
    const key=currentWeekKey();
    const data=getSynthData();
    data[key]={
      q1:(document.getElementById('synth-q1')||{}).value||'',
      q2:(document.getElementById('synth-q2')||{}).value||'',
      q3:(document.getElementById('synth-q3')||{}).value||'',
      q4:(document.getElementById('synth-q4')||{}).value||'',
      saved:Date.now()
    };
    saveSynthData(data);
    const lbl=document.getElementById('synth-saved-lbl');
    if(lbl){lbl.textContent='autosaved';setTimeout(()=>{if(lbl)lbl.textContent='';},2000);}
  },800);
}

function synthSave(){
  const key=currentWeekKey();
  const data=getSynthData();
  data[key]={
    q1:(document.getElementById('synth-q1')||{}).value||'',
    q2:(document.getElementById('synth-q2')||{}).value||'',
    q3:(document.getElementById('synth-q3')||{}).value||'',
    q4:(document.getElementById('synth-q4')||{}).value||'',
    saved:Date.now()
  };
  saveSynthData(data);
  const btn=document.getElementById('synth-save-btn');
  if(btn){btn.textContent='Saved ✓';btn.classList.add('saved');setTimeout(()=>{btn.textContent='Save week';btn.classList.remove('saved');},2000);}
}

function synthClear(){
  if(!confirm('Clear this week synthesis?'))return;
  ['synth-q1','synth-q2','synth-q3','synth-q4'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
}

function synthLoadCurrent(){
  const key=currentWeekKey();
  const data=getSynthData();
  const entry=data[key];
  const dateEl=document.getElementById('synth-week-date');
  if(dateEl)dateEl.textContent=weekKeyToLabel(key);
  ['q1','q2','q3','q4'].forEach(q=>{
    const el=document.getElementById('synth-'+q);
    if(el)el.value=(entry&&entry[q])||'';
  });
}

function synthLoadHistory(){
  const cont=document.getElementById('synth-history-list');if(!cont)return;
  const data=getSynthData();
  const keys=Object.keys(data).sort().reverse();
  if(!keys.length){cont.innerHTML='<div style="font-size:13px;color:var(--ink-muted);text-align:center;padding:20px;font-style:italic">No saved syntheses yet.</div>';return;}
  cont.innerHTML=keys.map(k=>{
    const e=data[k];
    const preview=(e.q1||e.q2||e.q3||'').substring(0,80)||'(empty)';
    return `<div class="synth-history-item" onclick="synthShowEntry('${k}')">
      <div class="synth-history-week">${weekKeyToLabel(k)}</div>
      <div class="synth-history-preview">${preview}${preview.length===80?'…':''}</div>
    </div>`;
  }).join('');
}

function synthShowEntry(key){
  const data=getSynthData();
  const e=data[key];if(!e)return;
  // Switch to review tab and populate
  showToolTab('ws','review');
  ['q1','q2','q3','q4'].forEach(q=>{
    const el=document.getElementById('synth-'+q);
    if(el)el.value=(e[q])||'';
  });
  const dateEl=document.getElementById('synth-week-date');
  if(dateEl)dateEl.textContent=weekKeyToLabel(key)+' (read-only view)';
}

// ─── SESSION LOG ─────────────────────────────────────────────────────────────
function slogAddManual(){
  const inp=document.getElementById('slog-add-concept');
  const method=(document.getElementById('slog-method')||{}).value||'Active recall';
  const conf=parseInt((document.getElementById('slog-conf')||{}).value||'3');
  if(!inp||!inp.value.trim())return;
  const log=getSessionLog();
  log.unshift({id:Date.now().toString(36),date:todayISO(),concept:inp.value.trim(),method,conf});
  if(log.length>200)log.pop();
  saveSessionLog(log);inp.value='';slogRender();
}

function slogRender(){
  const cont=document.getElementById('slog-list');if(!cont)return;
  const log=getSessionLog();
  if(!log.length){cont.innerHTML='<div class="slog-empty">No sessions logged yet. Use the Focus Timer or add one manually above.</div>';return;}
  cont.innerHTML=log.slice(0,40).map(s=>`
    <div class="slog-item">
      <span class="slog-date">${s.date}</span>
      <div>
        <div class="slog-concept">${s.concept}</div>
        <div class="slog-meta">${s.method}</div>
      </div>
      <span class="slog-conf slog-conf-${s.conf}">${'●'.repeat(s.conf)}${'○'.repeat(5-s.conf)}</span>
    </div>`).join('');
}

// ─── PATCH goDeep for new views ───────────────────────────────────────────────
const _origGoDeep=goDeep;
goDeep=function(viewId){
  // Resolve alias first so our checks below match correctly
  const _alias={'return-demo':'returnDemo','weekly-synthesis':'weeklySynth'};
  viewId=_alias[viewId]||viewId;
  _origGoDeep(viewId);
  if(viewId==='returnDemo'){setTimeout(rdtRender,50);}
  if(viewId==='weeklySynth'){setTimeout(()=>{synthLoadCurrent();synthLoadHistory();slogRender();},50);}
};

// ws prefix handled directly in showToolTab viewMap above

// ─── FOCUS POMODORO ──────────────────────────────────────────────────────────
const PF={mode:'work',running:false,remaining:25*60,sessions:0,timer:null};
const PF_DUR={work:25*60,short:5*60,long:15*60};
const PF_LABELS={work:'Focus session',short:'Short break',long:'Long break'};
const PF_COLORS={work:'var(--accent)',short:'var(--teal)',long:'var(--gold)'};
const PF_C=2*Math.PI*80;

function openPomoOverlay(){document.getElementById('pomo-overlay').classList.add('open');pfUpdateUI();}
function closePomoOverlay(){document.getElementById('pomo-overlay').classList.remove('open');}

function setFocusMode(mode){
  if(PF.running){clearInterval(PF.timer);PF.timer=null;PF.running=false;}
  PF.mode=mode;PF.remaining=PF_DUR[mode];
  document.querySelectorAll('.pomo-focus-mode-btn').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
  const startBtn=document.getElementById('pf-start-btn');
  if(startBtn){startBtn.className='pomo-focus-start'+(mode!=='work'?' mode-'+mode:'');startBtn.textContent='Start';}
  pfUpdateUI();
}

function pfStart(){
  const startBtn=document.getElementById('pf-start-btn');
  if(PF.running){
    clearInterval(PF.timer);PF.timer=null;PF.running=false;
    if(startBtn)startBtn.textContent='Start';
    const _fab=document.getElementById('pomo-fab');if(_fab)_fab.classList.remove('running');
    return;
  }
  PF.running=true;
  if(startBtn)startBtn.textContent='Pause';
  const _fab2=document.getElementById('pomo-fab');if(_fab2)_fab2.classList.add('running');
  PF.timer=setInterval(()=>{
    if(PF.remaining>0){PF.remaining--;pfUpdateUI();}
    else{
      clearInterval(PF.timer);PF.timer=null;PF.running=false;
      const _fab=document.getElementById('pomo-fab');if(_fab)_fab.classList.remove('running');
      if(startBtn)startBtn.textContent='Start';
      if(PF.mode==='work'){
        PF.sessions=Math.min(PF.sessions+1,4);
        // Log session if task is set
        const task=document.getElementById('pomo-task-input');
        if(task&&task.value.trim()){logPomoSession(task.value.trim());}
        pfUpdateDots();
        const lbl=document.getElementById('pf-session-lbl');
        if(lbl)lbl.textContent='Session '+PF.sessions+' of 4';
      }
      const next=PF.sessions>=4?'long':(PF.mode==='work'?'short':'work');
      if(PF.sessions>=4)PF.sessions=0;
      setFocusMode(next);
      try{new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAA==').play().catch(()=>{});}catch(e){}
    }
  },1000);
}

function pfReset(){
  clearInterval(PF.timer);PF.timer=null;PF.running=false;
  PF.remaining=PF_DUR[PF.mode];
  const _fab=document.getElementById('pomo-fab');if(_fab)_fab.classList.remove('running');
  const startBtn=document.getElementById('pf-start-btn');
  if(startBtn)startBtn.textContent='Start';
  pfUpdateUI();
}

function pfUpdateUI(){
  const mins=Math.floor(PF.remaining/60);const secs=PF.remaining%60;
  const tEl=document.getElementById('pf-time');
  if(tEl)tEl.textContent=String(mins).padStart(2,'0')+':'+String(secs).padStart(2,'0');
  const lbl=document.getElementById('pf-mode-lbl');if(lbl)lbl.textContent=PF_LABELS[PF.mode];
  const fill=document.getElementById('pf-ring-fill');
  if(fill){
    const offset=PF_C*(1-PF.remaining/PF_DUR[PF.mode]);
    fill.style.strokeDashoffset=offset;
    fill.style.stroke=PF_COLORS[PF.mode];
    fill.className='pomo-focus-fill'+(PF.mode!=='work'?' mode-'+PF.mode:'');
  }
  // Update FAB icon
  const fab=document.getElementById('pomo-fab');
  if(fab){
    if(PF.running){
      const mins2=Math.floor(PF.remaining/60);const secs2=PF.remaining%60;
      fab.title=String(mins2).padStart(2,'0')+':'+String(secs2).padStart(2,'0');
    } else { fab.title='Focus Timer'; }
  }
  pfUpdateDots();
}

function pfUpdateDots(){
  document.querySelectorAll('#pf-dots .pomo-focus-dot').forEach((d,i)=>d.classList.toggle('done',i<PF.sessions));
}

// Keyboard shortcut: Space to start/pause when overlay is open
document.addEventListener('keydown',e=>{
  if(e.code==='Space'&&document.getElementById('pomo-overlay').classList.contains('open')&&e.target.tagName!=='INPUT'&&e.target.tagName!=='TEXTAREA'){
    e.preventDefault();pfStart();
  }
  if(e.code==='Escape'&&document.getElementById('pomo-overlay').classList.contains('open')){
    closePomoOverlay();
  }
});

// Session log for pomodoro
const SLOG_KEY='viktor-session-log-v1';
function getSessionLog(){try{return JSON.parse(localStorage.getItem(SLOG_KEY)||'[]');}catch{return[];}}
function saveSessionLog(d){localStorage.setItem(SLOG_KEY,JSON.stringify(d));}
function logPomoSession(task){
  const log=getSessionLog();
  log.unshift({id:Date.now().toString(36),date:todayISO(),concept:task,method:'Pomodoro',conf:3});
  if(log.length>100)log.pop();
  saveSessionLog(log);
}

// ─── STRENGTH ACCORDION ───────────────────────────────────────────────────────
function toggleStrength(header){
  const body=header.nextElementSibling;const chev=header.querySelector('.strength-chev');
  const isOpen=body.classList.contains('open');
  body.classList.toggle('open',!isOpen);if(chev)chev.classList.toggle('open',!isOpen);
}


// ─── COURSE INFO RENDERER ────────────────────────────────────────────────────
function ci2TabSwitch(btn,tabId,i){
  const card=btn.closest('.ci2-merged-card');
  card.querySelectorAll('.ci2-tab-btn').forEach(b=>b.classList.remove('active'));
  card.querySelectorAll('.ci2-tab-panel').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  card.querySelector('.ci2-tab-panel[data-tab="'+tabId+'-'+i+'"]').classList.add('active');
}
function buildCourseInfo(proj){
  if(!proj.courseInfo)return;
  const ci=proj.courseInfo;
  const cont=document.getElementById('proj-intro');
  if(!cont)return;
  cont.innerHTML='';

  const CC={
    ap:      {bg:'linear-gradient(135deg,#1a3d2e,#2a5a42)',acc:'#6dd9a0',dim:'rgba(109,217,160,.18)',lbl:'rgba(109,217,160,.65)',g:'A&P'},
    fund:    {bg:'linear-gradient(135deg,#2d1a52,#3d2470)',acc:'#b99dff',dim:'rgba(185,157,255,.18)',lbl:'rgba(185,157,255,.65)',g:'ADPIE'},
    ha:      {bg:'linear-gradient(135deg,#0d2535,#1a3d52)',acc:'#64b9e6',dim:'rgba(100,185,230,.18)',lbl:'rgba(100,185,230,.65)',g:'H→T'},
    pharm:   {bg:'linear-gradient(135deg,#2d0808,#4a1010)',acc:'#ff8282',dim:'rgba(255,130,130,.18)',lbl:'rgba(255,130,130,.65)',g:'Rx'},
    medsurg: {bg:'linear-gradient(135deg,#0d1428,#1a2448)',acc:'#8ca5ff',dim:'rgba(140,165,255,.18)',lbl:'rgba(140,165,255,.65)',g:'⊕'},
    de:      {bg:'linear-gradient(135deg,#1f1400,#3a2800)',acc:'#ffd24a',dim:'rgba(255,210,74,.18)', lbl:'rgba(255,210,74,.65)', g:'DE'},
    micro:   {bg:'linear-gradient(135deg,#2a1a08,#4a2e10)',acc:'#f0a060',dim:'rgba(240,160,96,.18)',lbl:'rgba(240,160,96,.65)',g:'🦠'},
    matob:   {bg:'linear-gradient(135deg,#2d0a1e,#4a1030)',acc:'#f090c0',dim:'rgba(240,144,192,.18)',lbl:'rgba(240,144,192,.65)',g:'♡'},
    psych:   {bg:'linear-gradient(135deg,#0a1828,#1a2e42)',acc:'#80b8d8',dim:'rgba(128,184,216,.18)',lbl:'rgba(128,184,216,.65)',g:'◐'},
    biochem: {bg:'linear-gradient(135deg,#1e1000,#3a2200)',acc:'#e8a84a',dim:'rgba(232,168,74,.18)',lbl:'rgba(232,168,74,.65)',g:'⬡'},
  };
  const c=CC[proj.id]||{bg:'linear-gradient(135deg,#1a1510,#2e2820)',acc:'#c8b89a',dim:'rgba(200,184,154,.18)',lbl:'rgba(200,184,154,.65)',g:'◎'};

  // Pull from courseRecs for merged tabs
  const rec=courseRecs[proj.id]||{};

  // Progress — pulled from live state
  const {total,done,pct}=getProjectProgress(proj);
  const progressBar=`
    <div style="margin-top:14px">
      <div style="height:3px;background:rgba(255,255,255,.12);border-radius:99px;overflow:hidden;margin-bottom:5px">
        <div id="proj-pbar" style="height:100%;border-radius:99px;background:${c.acc};width:${pct}%;transition:width .4s cubic-bezier(.4,0,.2,1)"></div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div id="proj-plabel" style="font-family:var(--font-mono);font-size:10px;color:${c.lbl};letter-spacing:.04em">${done} of ${total} — ${pct}%</div>
        <button id="proj-reset" onclick="resetProject('${proj.id}')" style="font-family:var(--font-mono);font-size:9px;color:${c.lbl};background:none;border:1px solid rgba(255,255,255,.18);border-radius:99px;padding:3px 10px;cursor:pointer;opacity:.7;transition:opacity .15s" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=.7">↺ reset</button>
      </div>
    </div>`;

  // Stats pills
  const statPills=(ci.stats||[]).map(s=>`
    <div class="ci2-stat">
      <div class="ci2-stat-val" style="color:${c.acc}">${s.val}</div>
      <div class="ci2-stat-label">${s.label}</div>
    </div>`).join('');

  // ── RICH TAB CONTENT BUILDERS ──────────────────────────────────────────────
  const tabId='citabs-'+proj.id;

  // --- OVERVIEW tab ---
  const overviewPillars = rec.pillars||[];
  const overviewBody = `
    <div class="ci-overview-thesis" style="--ci-acc:${c.acc}">${ci.body||''}</div>
    ${overviewPillars.length ? `<div class="ci-pillar-grid">${overviewPillars.map(p=>`<div class="ci-pillar" style="--ci-acc:${c.acc}"><div class="ci-pillar-label">${p.label}</div><div class="ci-pillar-body">${p.body}</div></div>`).join('')}</div>` : ''}
    ${rec.notVsThis ? `
    <div class="ci-notvs">
      <div class="ci-not"><div class="ci-not-label">✕ Not this course</div>${(rec.notVsThis.not||[]).map(x=>`<div class="ci-nv-item">— ${x}</div>`).join('')}</div>
      <div class="ci-this" style="background:${c.dim};border:1px solid ${c.acc}33;border-radius:6px"><div class="ci-this-label">◎ What it actually is</div>${(rec.notVsThis.is||[]).map(x=>`<div class="ci-nv-item">— ${x}</div>`).join('')}</div>
    </div>` : ''}
  `;

  // --- METHOD tab ---
  const methodSteps = rec.steps||[];
  const sessionBlocks = rec.session||[];
  const methodBody = `
    <div class="ci-method-badge" style="--ci-acc:${c.acc}">${rec.method||'Study Method'}</div>
    ${rec.body ? `<div style="font-size:12.5px;color:var(--ink-soft);line-height:1.8;margin-bottom:14px">${rec.body}</div>` : ''}
    ${methodSteps.length ? methodSteps.map((s,i)=>`<div class="ci-step-row"><div class="ci-step-num" style="color:${c.acc}">0${i+1}</div><div><div class="ci-step-title">${s.title}</div><div class="ci-step-body">${s.body}</div></div></div>`).join('') : ''}
    ${ci.studyTip ? `<div class="ci-tip-box" style="--ci-acc:${c.acc};border-left-color:${c.acc}"><div class="ci-tip-label">Study Tip</div><div class="ci-tip-body">${ci.studyTip}</div></div>` : ''}
    ${sessionBlocks.length ? `<div class="ci-session-wrap"><div class="ci-session-label">Sample Session Block</div>${sessionBlocks.map(s=>`<div class="ci-session-row"><span class="ci-session-time" style="color:${c.acc}">${s.time}</span><span class="ci-session-act">${s.act}</span></div>`).join('')}</div>` : ''}
  `;

  // --- GIZMO tab ---
  const cardExamples = rec.cardExamples||[];
  const gizmoBody = `
    <div class="ci-deck-intro">${rec.gizmo||''}</div>
    ${cardExamples.length ? `<div class="ci-cards-label" style="color:${c.acc}">Example Cards</div>${cardExamples.map(ex=>`<div class="ci-card-ex"><div class="ci-card-front"><div class="ci-card-side-label" style="color:${c.acc}">Front</div><div class="ci-card-front-text">${ex.front}</div></div><div class="ci-card-back"><div class="ci-card-side-label">Back</div><div class="ci-card-back-text">${ex.back}</div></div></div>`).join('')}` : ''}
    ${rec.antiPattern ? `<div class="ci-anti-box"><div class="ci-anti-label">✕ Anti-Pattern</div><div class="ci-anti-body">${rec.antiPattern}</div></div>` : ''}
  `;

  // --- BOARDS tab ---
  const boardStats = rec.boardStats||[];
  const yieldItems = rec.yieldItems||[];
  const boardsBody = `
    ${boardStats.length ? `<div class="ci-board-stats">${boardStats.map(s=>`<div class="ci-board-stat"><div class="ci-board-stat-val" style="color:${c.acc}">${s.val}</div><div class="ci-board-stat-lbl">${s.lbl}</div></div>`).join('')}</div>` : ''}
    ${ci.clinicalRelevance ? `<div class="ci-boards-body" style="border-left-color:${c.acc}">${ci.clinicalRelevance}</div>` : ''}
    ${yieldItems.length ? `<div class="ci-yield-label" style="color:${c.acc};margin-top:12px">High-Yield Topics</div>${yieldItems.map(y=>`<div class="ci-yield-row"><span class="ci-yield-tier" style="background:${y.tier==='critical'?'rgba(180,50,50,.2)':y.tier==='high'?'rgba(200,140,30,.2)':'rgba(50,100,50,.2)'};color:${y.tier==='critical'?'#e06060':y.tier==='high'?'#c89030':'#60a060'}">${y.tier}</span><div><div class="ci-yield-topic">${y.topic}</div>${y.note?`<div class="ci-yield-note">${y.note}</div>`:''}</div></div>`).join('')}` : ''}
  `;

  // Assemble tab sections
  const tabSections = [];
  if(ci.body || overviewPillars.length) tabSections.push({label:'◉ Overview', html:overviewBody});
  if(rec.method || rec.body || ci.studyTip || methodSteps.length) tabSections.push({label:'◈ Method', html:methodBody});
  if(rec.gizmo || cardExamples.length) tabSections.push({label:'◎ Gizmo', html:gizmoBody});
  if(ci.clinicalRelevance || yieldItems.length || boardStats.length) tabSections.push({label:'⊕ Boards', html:boardsBody});

  const tabBtns=tabSections.map((s,i)=>`<button class="ci2-tab-btn${i===0?' active':''}" onclick="ci2TabSwitch(this,'${tabId}',${i})" style="--ci-acc:${c.acc}">${s.label}</button>`).join('');
  const tabPanels=tabSections.map((s,i)=>`<div class="ci2-tab-panel${i===0?' active':''}" data-tab="${tabId}-${i}">${s.html}</div>`).join('');

  const resourcePills=(rec.resources||[]).map(r=>`<span class="ci2-res-pill" style="border-color:${c.acc};color:${c.acc}">${r}</span>`).join('');

  // Why panels
  let whyHTML='';
  if(ci.whyThis&&ci.whyThis.evidence){
    const cards=ci.whyThis.evidence.map((ev,i)=>`
      <div style="display:grid;grid-template-columns:28px 1fr;gap:10px;padding:12px 0;border-bottom:1px solid var(--border)">
        <div style="font-family:var(--font-display);font-size:20px;font-weight:300;font-style:italic;color:${c.acc};line-height:1;padding-top:1px">0${i+1}</div>
        <div>
          <div style="font-size:13px;font-weight:600;color:var(--ink);margin-bottom:3px;line-height:1.3">${ev.label}</div>
          <div style="font-size:12px;color:var(--ink-soft);line-height:1.65">${ev.body}</div>
        </div>
      </div>`).join('');
    const skipLine=ci.whyThis.skip?`<div style="font-size:12px;color:var(--ink-muted);line-height:1.6;padding:12px 0 2px;font-style:italic"><span style="color:${c.acc};font-weight:600;font-style:normal">If you skip this →</span> ${ci.whyThis.skip}</div>`:'';
    whyHTML=`
      <div style="background:var(--bg-section);border:1px solid var(--border);border-left:3px solid ${c.acc};border-radius:var(--radius-lg);padding:16px 18px;margin-bottom:12px">
        <div style="font-family:var(--font-mono);font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:${c.acc};font-weight:600;margin-bottom:2px">Why this matters</div>
        ${ci.whyThis.headline?`<div style="font-family:var(--font-display);font-size:18px;font-weight:400;font-style:italic;color:var(--ink);line-height:1.2;margin-bottom:12px">${ci.whyThis.headline}</div>`:''}
        ${cards}
        ${skipLine}
      </div>`;
  }

  const typeLabel={ap:'Pure Science',fund:'Clinical Framework',ha:'Skill-Heavy Clinical',pharm:'Patient Safety Critical',medsurg:'Pathophysiology-Driven',de:'Language Credential',micro:'Microbial Reasoning',matob:'Life-Span Critical',psych:'Therapeutic Relational',biochem:'Molecular Foundation'}[proj.id]||'';

  const div=document.createElement('div');
  div.innerHTML=`
    <div style="border-radius:var(--radius-lg);overflow:hidden;margin-bottom:14px">
      <div class="ci2-hero" style="background:${c.bg};border-radius:var(--radius-lg) var(--radius-lg) 0 0;margin-bottom:0;padding-bottom:20px">
        <div class="ci2-hero-wm" style="color:${c.acc}">${c.g}</div>
        <div class="ci2-hero-eyebrow" style="color:${c.lbl}">${ci.eyebrow||''}</div>
        <div style="font-family:var(--font-display);font-size:28px;font-weight:400;font-style:italic;color:#fff;line-height:1.1;margin-bottom:6px;letter-spacing:-.01em;text-shadow:0 1px 6px rgba(0,0,0,.35)">${ci.title||proj.title}</div>
        ${typeLabel?`<div style="font-family:var(--font-mono);font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:${c.lbl};margin-bottom:8px;opacity:.65">${typeLabel}</div>`:''}
        <div style="font-size:12px;color:rgba(255,255,255,.8);line-height:1.6;margin-bottom:14px;max-width:520px">${ci.subtitle||''}</div>
        ${statPills?`<div class="ci2-stats" style="margin-top:0;margin-bottom:14px">${statPills}</div>`:''}
        ${progressBar}
      </div>
      ${tabSections.length?`
      <div class="ci2-merged-card" style="border-radius:0 0 var(--radius-lg) var(--radius-lg);border-top:none;margin-bottom:0">
        <div class="ci2-tab-bar">${tabBtns}</div>
        <div style="padding:18px 20px;background:var(--bg-card)">${tabPanels}</div>
        ${resourcePills?`<div class="ci2-res-row" style="border-radius:0 0 var(--radius-lg) var(--radius-lg)">${resourcePills}</div>`:''}
      </div>`:''}
    </div>
    ${whyHTML}
    <div style="height:1px;background:var(--border);margin:18px 0 4px"></div>
  `;
  cont.appendChild(div);
}

// buildRec is now merged into buildCourseInfo — proj-rec cleared silently
function buildRec(proj){
  const cont=document.getElementById('proj-rec');
  if(cont)cont.innerHTML='';
}



// ─── COVERAGE HEATMAP ────────────────────────────────────────────────────────
function buildHeatmap(){
  const grid=document.getElementById('heatmap-grid');if(!grid)return;
  const labelMap={ap:'A&P',fund:'Fund.',ha:'Assess.',pharm:'Pharm.',medsurg:'Med-Surg',de:'German'};
  grid.innerHTML='';
  projects.forEach(p=>{
    const row=document.createElement('div');row.className='heatmap-course';
    const lbl=document.createElement('div');lbl.className='heatmap-course-label';lbl.textContent=labelMap[p.id]||p.id;
    const cells=document.createElement('div');cells.className='heatmap-cells';
    p.sections.forEach((sec,si)=>{
      let total=0,done=0;
      if(p.layered){
        ['knowledge','skill','judgment'].forEach(l=>{if(sec[l]){sec[l].forEach((_,ii)=>{total++;if(isChecked(cbId(p.id,si,l,ii)))done++;})}});
      } else {
        if(sec.items){sec.items.forEach((_,ii)=>{total++;if(isChecked(cbId(p.id,si,'s',ii)))done++;});}
      }
      const pct=total?done/total:0;
      const cell=document.createElement('div');
      cell.className='heatmap-cell';
      // Color: base accent with opacity from 0.08 to 0.9
      const opacity=0.08+pct*0.82;
      cell.style.background=`rgba(139,58,42,${opacity.toFixed(2)})`;
      cell.title=`${sec.title}: ${done}/${total} (${Math.round(pct*100)}%)`;
      cell.onclick=()=>showProject(p.id);
      cells.appendChild(cell);
    });
    row.appendChild(lbl);row.appendChild(cells);grid.appendChild(row);
  });
}

// ─── COVERAGE CARDS ───────────────────────────────────────────────────────────
function buildCoverageCards(){
  const cont=document.getElementById('cov-cards');if(!cont)return;
  cont.innerHTML='';
  projects.forEach((p,idx)=>{
    const {pct,done,total}=getProjectProgress(p);
    const sectionCount=(p.sections||[]).length;
    const bgCol=p.color+'18';
    const bdCol=p.color+'33';
    const card=document.createElement('div');
    card.className='cv-card';
    card.style.animationDelay=(idx*.05)+'s';
    card.onclick=()=>showProject(p.id);
    card.innerHTML=`
      <div class="cv-card-top">
        <div class="cv-card-icon" style="color:${p.color};background:${bgCol};border-color:${bdCol}">${p.icon||'◎'}</div>
        <div class="cv-card-meta">
          <div class="cv-card-name">${p.titleHTML}</div>
          <div class="cv-card-desc">${p.desc}</div>
        </div>
        <div class="cv-card-pct" style="color:${p.color}">${pct}<span class="cv-pct-sym">%</span></div>
      </div>
      <div class="cv-bar-wrap">
        <div class="cv-bar-track"><div class="cv-bar-fill" style="width:${pct}%;background:${p.color}"></div></div>
        <div class="cv-bar-meta">
          <span>${done} of ${total} items</span>
          <span>${sectionCount} section${sectionCount!==1?'s':''}</span>
        </div>
      </div>`;
    cont.appendChild(card);
  });
}

// showToolTab handles all prefixes cleanly above — no patch needed

// ─── OVERRIDE buildDashboard → buildOverview ─────────────────────────────────
buildDashboard=function(){buildOverview();};

// ─── PATCH showDashboard ─────────────────────────────────────────────────────
showDashboard=function(){showHubTab('home');};

// ─── COURSE FEATURES ─────────────────────────────────────────────────────────
const NOTES_KEY='viktor-notes-v1';
function getNotes(){try{return JSON.parse(localStorage.getItem(NOTES_KEY)||'{}');}catch{return{};}}
function saveNotes(d){localStorage.setItem(NOTES_KEY,JSON.stringify(d));}

const courseRecs={
  ap:{type:'Pure Science',color:'#2A7A5A',bg:'rgba(42,122,90,.07)',border:'rgba(42,122,90,.2)',
    method:'Feynman + Visual Mapping',
    body:'A&P is a reasoning course, not a memorization course. For each body system: watch a 10-min Khan Academy or Professor Dave video first (builds the "why"), then read one section, then close and draw the system from memory. Diagrams you draw yourself encode 3× more effectively than ones you copy.',
    gizmo:'Build scenario cards: "Patient has COPD — what happens to the O2-haemoglobin curve and why?" Connect each topic to its most common clinical failure mode before making cards.',
    resources:['Professor Dave Explains (YouTube)','Khan Academy Health & Medicine','OpenStax A&P (free PDF)']},
  fund:{type:'Clinical + Procedural',color:'#5A3A8A',bg:'rgba(90,58,138,.07)',border:'rgba(90,58,138,.2)',
    method:'ADPIE Framework + Return Demo Simulation',
    body:'Every Fundamentals topic has a clinical scenario embedded in it. Study using the ADPIE lens: given a patient, what would you assess, diagnose (nursing dx), plan, implement, and evaluate? Never study a concept without attaching it to a real or imagined patient.',
    gizmo:'Build judgment cards: "Patient refuses a dressing change. What is your first action and why?" Priority and judgment questions — not definitions.',
    resources:['Open RN Nursing Fundamentals (free)','RegisteredNurseRN (YouTube + site)','Nurseslabs NCP examples']},
  ha:{type:'Clinical Skill',color:'#2A5A7A',bg:'rgba(42,90,122,.07)',border:'rgba(42,90,122,.2)',
    method:'Paired Normal-Abnormal Study + Physical Practice',
    body:'You cannot identify abnormal if you do not know normal cold. Study every assessment technique as a pair: what is normal → what deviations indicate. Use your own body to practice — auscultate yourself, percuss your own abdomen, assess your own pupils. Embodied practice encodes assessment skills differently than reading.',
    gizmo:'Build finding-interpretation cards: "You hear dullness on percussion at the right lung base with decreased breath sounds — what are the two most likely causes?" Never "what does percussion measure?"',
    resources:['Bates\' Guide to Physical Examination (LibGen)','RegisteredNurseRN assessment playlist','YouTube: head-to-toe assessment demonstrations']},
  pharm:{type:'High-Stakes Science',color:'#8A2020',bg:'rgba(138,32,32,.07)',border:'rgba(138,32,32,.2)',
    method:'Mechanism-First + Calculation Daily Practice',
    body:'Never memorize a drug without understanding its mechanism. The mechanism predicts every expected effect, adverse effect, and nursing consideration — you can derive the rest from it. For calculations: 5 problems per session minimum, every session, until graduation. Calculation fluency is a perishable skill.',
    gizmo:'Build mechanism-to-monitoring cards: "Furosemide mechanism → expected electrolyte shift → nursing monitoring priority." And calculation cards with worked examples as backs.',
    resources:['Drugs.com (free drug reference)','Dirty Medicine (YouTube — mechanism-focused)','SimpleNursing pharmacology playlist']},
  medsurg:{type:'Clinical Integration',color:'#2A3A7A',bg:'rgba(42,58,122,.07)',border:'rgba(42,58,122,.2)',
    method:'Pathophysiology-First → Clinical Manifestations → Nursing Priorities',
    body:'For every disorder: start with what is broken physiologically, then derive what you would see in a patient, then determine nursing priorities using Maslow + ABCs. This five-step chain (pathophysiology → manifestations → assessment → interventions → patient teaching) means you can reconstruct any topic you half-remember under exam pressure.',
    gizmo:'Build priority scenario cards: "Patient post-op day 2, BP 88/56, HR 118, wound drainage soaked through dressing — first three nursing actions in order." Always clinical, always prioritized.',
    resources:['RegisteredNurseRN Med-Surg playlist','Brunner & Suddarth (LibGen)','Nurseslabs NCLEX practice by system']},
  de:{type:'Language Acquisition',color:'#B8882A',bg:'rgba(184,136,42,.07)',border:'rgba(184,136,42,.2)',
    method:'Daily Minimum + Clinical Vocab Parallel Track',
    pillars:[
      {label:'Daily habit',body:'15 min every day > 3hr once a week. Spacing is the mechanism.'},
      {label:'Clinical parallel',body:'Every nursing term you learn in English becomes a German card the same day.'},
      {label:'Register',body:'Clinical German is its own register — neither formal nor casual. Learn it separately.'}
    ],
    notVsThis:{not:['A hobby or interest project','Something you start when things calm down','General conversation German'],is:['A regulatory credential (B2 minimum for Anerkennung)','A compounding daily investment','A parallel track that integrates with every nursing course']},
    steps:[
      {title:'Build the habit first',body:'15 minutes at the same time each day before you care about progress. Habit is the container.'},
      {title:'Run dual Gizmo decks',body:'General vocabulary deck AND a clinical German deck. Add the German word for every nursing term you study.'},
      {title:'Nicos Weg as your spine',body:'Deutsche Welle\'s Nicos Weg (free) takes you from A1 to B1 in a structured narrative format.'},
      {title:'Listening daily',body:'Easy German on YouTube — authentic speech at conversational speed. Start with subtitles, remove them progressively.'}
    ],
    session:[
      {time:'0–5m',act:'Gizmo deck review — new cards + due cards'},
      {time:'5–12m',act:'Nicos Weg episode or grammar point'},
      {time:'12–15m',act:'One clinical German sentence written out'}
    ],
    body:'Language acquisition is time-on-task distributed over time — consistency matters more than session length. 15 minutes daily for a year produces more acquisition than 3-hour weekly cramming. Run two Gizmo decks in parallel: general German vocabulary and clinical German. Add the German word for every nursing term you learn in English.',
    gizmo:'Clinical vocab cards only after you know the English concept. Front: "Wie stark sind die Schmerzen von 0 bis 10?" Back: "(Pain scale question — used for every admission)" Keep cards bilingual with clinical context.',
    cardExamples:[
      {front:'Wie stark sind die Schmerzen von 0 bis 10?',back:'Pain scale question (0–10). Use on every admission and every pain assessment. Wichtig: 10 = schlimmster Schmerz vorstellbar.'},
      {front:'Die Sauerstoffsättigung',back:'SpO2 (oxygen saturation). Normal: 95–100%. Under 90% = concerning. Document as "SpO2 __ % unter __ L/min O2."'},
      {front:'der Blutdruck ist gefallen',back:'Blood pressure has dropped. Trigger for: position change assessment, medication review, physician notification if significant.'}
    ],
    antiPattern:'Don\'t just translate English cards. Clinical German requires the German register — not just the German word. Write the German sentence a nurse would actually say.',
    boardStats:[
      {val:'B2',lbl:'Required for Anerkennung'},
      {val:'C1',lbl:'Competitive level'},
      {val:'4 yr',lbl:'Compounding window'}
    ],
    yieldItems:[
      {tier:'critical',topic:'Patient communication phrases',note:'Schmerzen, Atemnot, Übelkeit — every chief complaint category'},
      {tier:'critical',topic:'Vital sign vocabulary',note:'Blutdruck, Puls, Atemfrequenz, Temperatur, Sauerstoffsättigung'},
      {tier:'high',topic:'Clinical hierarchy terms',note:'Stationsleitung, Chefarzt, Übergabe, Dienstplan'},
      {tier:'high',topic:'Documentation German',note:'SIS framework, Pflegedokumentation, Arztbrief'}
    ],
    resources:['Nicos Weg — Deutsche Welle (free A1-B1)','Easy German (YouTube)','Goethe Institut free practice materials']},

  micro:{type:'Microbial Reasoning',color:'#6A3A10',bg:'rgba(106,58,16,.07)',border:'rgba(106,58,16,.2)',
    method:'Organism-to-Pathogenesis → Transmission → Drug → Isolation',
    pillars:[
      {label:'Host-pathogen logic',body:'Every organism does damage through a specific mechanism. Know the mechanism and you know the manifestations.'},
      {label:'Transmission is isolation',body:'Knowing how something spreads tells you exactly what precautions to implement — contact, droplet, airborne.'},
      {label:'Drug mechanism matters',body:'Antibiotics work by specific mechanisms. Understanding targets explains resistance and adverse effects.'}
    ],
    notVsThis:{not:['A taxonomy course — organisms as facts to memorize','A list of drug-organism pairings to match','Separate from Med-Surg and Pharm'],is:['A reasoning course about how organisms cause disease','The foundation of infection control and antibiotic stewardship','Integrated with every infected patient you will ever care for']},
    steps:[
      {title:'Learn organisms by damage mechanism first',body:'How does it get in? What does it damage? What does that look like clinically? This sequence makes organisms memorable.'},
      {title:'Transmission determines isolation',body:'Airborne (TB, measles, varicella = N95 + negative pressure), Droplet (flu, COVID, meningitis = surgical mask + private room), Contact (MRSA, C.diff, VRE = gloves + gown).'},
      {title:'Connect organisms to clinical nursing',body:'Every organism links to a nursing intervention: MRSA → contact precautions + daily CHG baths; C.diff → contact precautions + sporicidal agents only; TB → airborne + RIPE.'},
      {title:'Antiparasitology as a PLE topic',body:'Philippine parasites are directly board-tested. Ascaris, hookworm, Schistosoma, Plasmodium, Entamoeba — transmission, diagnosis, treatment, and prevention.'}
    ],
    session:[
      {time:'0–10m',act:'Gizmo review — organism cards'},
      {time:'10–20m',act:'One organism: mechanism → manifestations → isolation → drug'},
      {time:'20–30m',act:'Connect to a Med-Surg case: which disorder does this organism cause?'}
    ],
    body:'Microbiology is not taxonomy — it is the study of how living organisms cause damage to human hosts and how the immune system and antimicrobials respond. Students who study micro as a list of organism-antibiotic pairings miss the reasoning that makes it clinically useful. Every organism has a story: entry route, damage mechanism, host response, clinical manifestations, isolation requirement, and drug target.',
    gizmo:'Build organism cards structured as: Front = organism name + clinical picture. Back = gram stain / morphology + virulence mechanism + transmission + isolation precaution + first-line drug + nursing priority. One card per organism. Never just "what is it" — always "what does it do and what do you do."',
    cardExamples:[
      {front:'Mycobacterium tuberculosis — patient with chronic cough, night sweats, weight loss, hemoptysis. AFB smear positive.',back:'Airborne transmission. Negative pressure room + N95. RIPE × 2mo → RI × 4mo. Sputum AFB × 3 before removing isolation. Report to DOH. Directly observed therapy (DOT) required.'},
      {front:'Clostridium difficile — post-antibiotic watery/bloody diarrhea, cramping, fever. WBC elevated.',back:'Spore-forming anaerobe. Contact precautions + GLOVES + GOWN. Sporicidal disinfectant ONLY (bleach 1:10) — alcohol gel ineffective on spores. First-line: oral vancomycin or fidaxomicin. STOP causative antibiotic if possible.'},
      {front:'Plasmodium falciparum — fever every 48hr, severe headache, thrombocytopenia, hemoglobinuria (blackwater fever).',back:'Anopheles mosquito vector. Most lethal species — cerebral malaria, ARDS, multi-organ failure. Artemisinin-based combination therapy (ACT). Thick/thin blood film for diagnosis. Standard precautions only (not vector-borne between humans).'}
    ],
    antiPattern:'Don\'t make cards that just ask "what antibiotic treats X?" Make cards that include the nursing response: isolation, monitoring, patient education, and drug administration.',
    boardStats:[
      {val:'15%',lbl:'PLE infection content'},
      {val:'5',lbl:'PH endemic parasites'},
      {val:'3',lbl:'Isolation categories'}
    ],
    yieldItems:[
      {tier:'critical',topic:'Isolation precautions by transmission route',note:'Airborne vs droplet vs contact — exact PPE for each; PLE tests this directly'},
      {tier:'critical',topic:'Philippine endemic parasites',note:'Ascaris, hookworm, Schistosoma japonicum, Plasmodium, Entamoeba histolytica'},
      {tier:'critical',topic:'C.diff nursing management',note:'Spores, sporicidal disinfectants, contact precautions, antibiotic stewardship'},
      {tier:'high',topic:'MRSA and drug-resistant organisms',note:'Vancomycin, decolonization, CHG baths, screening'},
      {tier:'high',topic:'Gram stain and morphology basics',note:'Gram+ vs gram− determines empiric drug choice'},
      {tier:'high',topic:'Antimicrobial stewardship',note:'Culture before antibiotics, de-escalation, duration — high clinical and PLE relevance'}
    ],
    resources:['Microbiology with Diseases by Body System (Bauman)','Ninja Nerd Science Microbiology (YouTube)','WHO Antimicrobial Resistance resources (free)']},

  matob:{type:'Life-Span Critical',color:'#8A2060',bg:'rgba(138,32,96,.07)',border:'rgba(138,32,96,.2)',
    method:'Normal Physiology Before Complications → Fetal Before Maternal → Priority Sequence',
    pillars:[
      {label:'Normal first',body:'You cannot identify a non-reassuring FHR tracing unless you know what reassuring looks like. Antepartum before intrapartum, normal before abnormal.'},
      {label:'Two patients',body:'Every maternal assessment is also a fetal assessment. Priority decisions must account for both — and when they conflict, the framework is not simple.'},
      {label:'Newborn transition',body:'The first hours of neonatal life are the highest-risk window. Transition physiology, APGAR, thermoregulation, and feeding establishment are heavily board-tested.'}
    ],
    notVsThis:{not:['A memorization course of labor stages and timing','Purely about pregnancy — it includes neonate and postpartum','Separate from A&P (it builds directly on reproductive and endocrine systems)'],is:['A two-patient clinical framework requiring simultaneous assessment','The course where A&P reproductive, hormonal, and cardiovascular physiology converge on a real clinical situation','One of the most emotionally demanding clinical rotations — therapeutic communication matters here']},
    steps:[
      {title:'Master the normal first',body:'Normal labor stages, normal FHR tracing (baseline 110–160 bpm, moderate variability, accelerations), normal newborn assessment. Normal is the reference standard for everything that follows.'},
      {title:'FHR interpretation as a clinical skill',body:'Baseline → variability → accelerations → decelerations (early = head compression, late = uteroplacental insufficiency, variable = cord compression). Late decelerations with absent variability = non-reassuring = LDRP interventions.'},
      {title:'Learn complications in reverse — from outcome to cause',body:'Postpartum hemorrhage: cause → uterine atony (most common) → nursing response (fundal massage, oxytocin, position). Eclampsia: cause → cerebral vasospasm → MgSO4 seizure prophylaxis → calcium gluconate at bedside.'},
      {title:'Newborn as a separate clinical unit',body:'APGAR at 1 and 5 min, thermoregulation (skin-to-skin first choice, radiant warmer second), neonatal hypoglycemia, jaundice (physiologic vs pathologic), newborn screening.'}
    ],
    session:[
      {time:'0–5m',act:'Gizmo review — obstetric complication cards'},
      {time:'5–15m',act:'One complication: normal → deviation → nursing priority → intervention'},
      {time:'15–25m',act:'FHR strip interpretation practice or newborn assessment'},
      {time:'25–30m',act:'Connection note: A&P → maternal physiology or Pharm → obstetric drug'}
    ],
    body:'Maternal and Newborn Nursing is the only nursing course where every intervention simultaneously affects two patients. The clinical reasoning framework is different from Med-Surg: you must always ask not just "what is happening to the mother?" but "what does this mean for the fetus?" and "what is the neonatal transition period telling us?" Students who approach this course with the same patho-first framework from Med-Surg often miss the normal physiology baseline that makes complications identifiable.',
    gizmo:'Build cards organized as: obstetric emergency → first nursing action → rationale. Never just "what is preeclampsia" — always "preeclampsia patient, BP 168/112, 3+ proteinuria, visual changes — your first three actions in order." The priority sequence is always what is tested.',
    cardExamples:[
      {front:'Postpartum patient: uterine fundus boggy, displaced to right of midline, lochia rubra soaking 2 pads in 30 min.',back:'Two separate problems: boggy uterus (atony → massage + oxytocin) AND bladder distension displacing uterus. First: have patient void or catheterize. Then reassess fundus. If still boggy after bladder emptied → massage → oxytocin. Displacement is not atony until bladder ruled out.'},
      {front:'FHR tracing: baseline 144, moderate variability, accelerations present, late decelerations after every contraction.',back:'Non-reassuring FHR. Late decels = uteroplacental insufficiency. Interventions in sequence: 1) Reposition left lateral, 2) O2 10L NRB, 3) Stop oxytocin if infusing, 4) IV fluid bolus, 5) Notify provider. Document everything with timestamps.'},
      {front:'Newborn 10 min old: HR 108, weak cry, flexion, grimace only, pink body with blue extremities.',back:'APGAR: HR 2 + Respiratory 1 + Tone 1 + Reflex 1 + Color 1 = 6. Moderate depression. Stimulate (dry/rub), warm, position airway. Reassess at 5 min. Score ≤6 at 5 min = further resuscitation. Acrocyanosis (blue hands/feet only) is normal in first 24hr — document accurately.'}
    ],
    antiPattern:'Don\'t memorize obstetric complications as isolated facts. Every card should have a priority sequence — the clinical action is what is tested, not the definition.',
    boardStats:[
      {val:'~12%',lbl:'PLE Maternal content'},
      {val:'2',lbl:'Patients always'},
      {val:'APGAR',lbl:'Neonatal key tool'}
    ],
    yieldItems:[
      {tier:'critical',topic:'Postpartum hemorrhage — sequence and causes',note:'Atony most common; Tone Tissue Trauma Thrombin (4 T\'s)'},
      {tier:'critical',topic:'Preeclampsia vs eclampsia management',note:'MgSO4 dosing, toxicity signs, calcium gluconate antidote'},
      {tier:'critical',topic:'FHR tracing interpretation',note:'Late decels = uteroplacental insufficiency = act immediately'},
      {tier:'critical',topic:'Newborn APGAR and immediate care',note:'1 and 5 minute scores; intervention thresholds; thermoregulation'},
      {tier:'high',topic:'Labor stages and nursing priorities per stage',note:'Stage 1 active phase, transition, pushing, placenta delivery'},
      {tier:'high',topic:'Gestational diabetes and preterm labor',note:'Tocolytics, corticosteroids for lung maturity, monitoring'},
      {tier:'high',topic:'RhoGAM indications and timing',note:'Rh-negative mother, within 72hr, every relevant event'}
    ],
    resources:['Pillitteri\'s Maternal & Child Health Nursing (LibGen)','RegisteredNurseRN OB nursing playlist','NurseInThemaking Maternal review (YouTube)']},

  psych:{type:'Therapeutic Relational',color:'#2A4A6A',bg:'rgba(42,74,106,.07)',border:'rgba(42,74,106,.2)',
    method:'Therapeutic Use of Self → Neurobiology → Priority Assessment → Intervention',
    pillars:[
      {label:'Therapeutic use of self',body:'The primary instrument in psychiatric nursing is the therapeutic relationship. Communication is not soft skill — it is the intervention.'},
      {label:'Safety first, always',body:'Every psychiatric disorder assessment begins with the same question: is this patient safe? Suicide risk, violence risk, self-harm risk — assessed every contact.'},
      {label:'Neurobiology as foundation',body:'Understanding the dopamine hypothesis, serotonin system, and limbic dysregulation explains why psychiatric drugs work and what to monitor.'}
    ],
    notVsThis:{not:['A course about memorizing DSM criteria and medications','Therapy — the nurse is not the patient\'s therapist','Soft or lower-stakes than medical nursing'],is:['A course about safety assessment, therapeutic communication, and medication management of psychiatric conditions','The course most likely to produce moral distress if you don\'t have a framework for it','One of the highest-stakes clinical environments for patient safety — especially suicidality and aggression']},
    steps:[
      {title:'Master therapeutic communication techniques first',body:'Silence, reflection, open-ended questions, clarification, validation, confrontation — and equally important, what NOT to say: false reassurance ("everything will be fine"), giving advice, changing the subject, asking "why" questions.'},
      {title:'Learn safety assessment as a scripted skill',body:'Suicide risk: ideation (passive vs active), plan, intent, means, lethality, protective factors. Assess directly, document completely. Every patient, every contact.'},
      {title:'Understand psychiatric medications mechanistically',body:'Antipsychotics: D2 blockade → positive symptom relief → EPS (extrapyramidal side effects). SSRIs: serotonin reuptake inhibition → delayed 2–4 weeks onset. Mood stabilizers: lithium (narrow TI, monitor levels). Benzodiazepines: GABA-A potentiation → sedation, dependence.'},
      {title:'The therapeutic milieu as a clinical concept',body:'The inpatient unit itself is a therapeutic environment. Structure, safety, group interaction, and limit-setting are all intentional interventions. Your role in the milieu is active.'}
    ],
    session:[
      {time:'0–8m',act:'Gizmo review — disorder + therapeutic response cards'},
      {time:'8–20m',act:'One disorder: neurobiology → clinical presentation → safety assessment → interventions → medications'},
      {time:'20–28m',act:'Communication scenario: patient statement → therapeutic vs non-therapeutic response'},
      {time:'28–30m',act:'Cross-course connection: Pharm → psychiatric medication or Fundamentals → therapeutic communication'}
    ],
    body:'Psychiatric-Mental Health Nursing is different from every other clinical course because the primary therapeutic instrument is the nurse-patient relationship itself. The skills tested on PLE and NCLEX are not diagnostic recall — they are: recognizing safety risks, responding therapeutically to patient statements, managing psychotropic medication side effects, and prioritizing interventions in acute psychiatric crisis. Students who dismiss this course as "soft" consistently underperform on these question types.',
    gizmo:'Build response-scenario cards: Front = patient statement or behavior. Back = therapeutic response + rationale + what NOT to say and why. Also build safety assessment cards: Front = clinical scenario with risk factors. Back = immediate nursing actions and documentation requirements.',
    cardExamples:[
      {front:'Patient says: "No one would miss me if I were gone." How do you respond?',back:'Direct, calm, non-reactive: "It sounds like you\'re having thoughts about not wanting to be here. Can you tell me more about what you\'re feeling?" — Do NOT: change the subject, offer reassurance ("That\'s not true!"), or ask "why do you feel that way?" — Immediately document, assess further, notify provider per protocol.'},
      {front:'Patient on haloperidol develops severe muscle rigidity, hyperthermia, diaphoresis, confusion, BP instability.',back:'Neuroleptic Malignant Syndrome (NMS). Medical emergency. Stop antipsychotic immediately. Notify provider stat. ICU transfer likely. Treatment: dantrolene (muscle relaxant), bromocriptine (dopamine agonist), supportive cooling. NOT the same as EPS — distinguish by systemic features (fever, BP instability, altered LOC).'},
      {front:'Manic patient refuses to sleep, pacing, talking rapidly, starting multiple projects, spending excessively. Lithium therapeutic level.',back:'Acute mania. Priority: safety and environmental management. Low-stimulation environment. Set limits on spending/phone. Ensure adequate hydration (lithium levels rise with dehydration). Do NOT argue or reason during acute mania — state limits clearly and redirect. Monitor for lithium toxicity: tremor, ataxia, confusion, polyuria.'}
    ],
    antiPattern:'Don\'t build cards that just list DSM criteria. Build cards around the NURSING response: what you say, what you assess, what you do, what you hold, what you document.',
    boardStats:[
      {val:'~10%',lbl:'PLE Psych content'},
      {val:'Safety',lbl:'Always first'},
      {val:'Therapeutic',lbl:'Relationship is Rx'}
    ],
    yieldItems:[
      {tier:'critical',topic:'Suicide risk assessment — direct questioning technique',note:'Ideation, plan, intent, means, lethality, protective factors — every patient, every contact'},
      {tier:'critical',topic:'Therapeutic vs non-therapeutic communication',note:'The most consistently board-tested content in this entire course'},
      {tier:'critical',topic:'Schizophrenia — positive/negative symptoms + antipsychotic management',note:'EPS spectrum: dystonia (acute), akathisia, Parkinsonism, tardive dyskinesia (late, irreversible)'},
      {tier:'critical',topic:'NMS vs serotonin syndrome vs EPS — differentiation',note:'NMS = stop antipsychotic; SS = stop serotonergic drug; EPS = manage with anticholinergic'},
      {tier:'high',topic:'Mood disorders — depression and bipolar — medication management',note:'SSRI onset 2–4 weeks; lithium narrow TI; valproate teratogenic'},
      {tier:'high',topic:'Anxiety disorders — benzodiazepine vs SSRI considerations',note:'Benzo: dependence, short-term only; SSRI: preferred long-term; tolerance and withdrawal'},
      {tier:'high',topic:'Personality disorders — boundary setting in therapeutic relationship',note:'BPD splitting, limit-setting, consistency; approach is the intervention'}
    ],
    resources:['Townsend\'s Essentials of Psychiatric Mental Health Nursing (LibGen)','RegisteredNurseRN Psych nursing playlist','Simple Nursing Psychiatric pharmacology review']},

  biochem:{type:'Molecular Foundation',color:'#8C5E14',bg:'rgba(140,94,20,.07)',border:'rgba(140,94,20,.2)',
    method:'Molecule → Reaction → Pathway → Clinical Disease',
    pillars:[
      {label:'Mechanisms over memorization',body:'Every pathway connects to a disease or a drug. If you cannot name the clinical consequence of an enzyme defect, you have not learned the pathway — you have just listed it.'},
      {label:'Cofactors = vitamin deficiency anchors',body:'Every B-vitamin is a cofactor. Knowing which reaction it runs means knowing exactly what breaks when the vitamin is absent. This converts vitamin deficiency into mechanistic reasoning.'},
      {label:'Metabolic integration',body:'Fed vs fasted vs starved states determine which pathways are active. The same glucose molecule can go six different ways depending on insulin signaling. Integration is the skill.'}
    ],
    notVsThis:{not:['A memorization course of enzyme names and pathway diagrams','Separate from clinical medicine — biochemistry is clinical medicine at the molecular level','Optional background knowledge'],is:['The molecular explanation for why every metabolic disease, drug mechanism, and cellular process works','The course that makes pharmacology and pathophysiology comprehensible rather than arbitrary','A reasoning framework that accelerates every downstream nursing course']},
    steps:[
      {title:'Anchor every pathway to a clinical disease',body:'Glycolysis → lactic acidosis. Fatty acid oxidation → carnitine deficiency. Urea cycle → hyperammonemia. Purine catabolism → gout. Never study a pathway without naming what breaks when it fails.'},
      {title:'Learn vitamins as cofactor maps',body:'B1 (TPP) runs PDH, α-KGDH, transketolase. Deficiency → Wernicke-Korsakoff + beriberi. B6 (PLP) runs transamination and heme synthesis. Deficiency → sideroblastic anemia. The cofactor defines the deficiency disease.'},
      {title:'Master metabolic integration',body:'Fed state: insulin on, glycolysis + glycogenesis + lipogenesis active. Fasted: glucagon on, gluconeogenesis + glycogenolysis + β-oxidation. Starved: ketogenesis. DKA: insulin off, unchecked lipolysis → ketone overflow. Build the state diagram.'},
      {title:'Connect to pharmacology from day one',body:'Statins block HMG-CoA reductase. Metformin inhibits Complex I. Allopurinol blocks xanthine oxidase. Methotrexate inhibits DHFR. These are not pharmacology facts — they are biochemistry facts with clinical labels.'}
    ],
    session:[
      {time:'0–8m',act:'Gizmo review — enzyme deficiency → disease + pathway cards'},
      {time:'8–20m',act:'One pathway: substrate → products → energy yield → regulatory step → clinical disease if broken'},
      {time:'20–28m',act:'Vitamin cofactor review OR inborn error of metabolism scenario'},
      {time:'28–30m',act:'Cross-course connection: A&P → metabolic basis OR Pharm → drug mechanism'}
    ],
    body:'Biochemistry is the molecular foundation that makes pharmacology and pathophysiology comprehensible rather than arbitrary. Students who study it as a list of pathways and enzyme names fail it. Students who study it as a series of "why" questions — why does this reaction happen, what breaks when this enzyme is missing, what drug targets this step — build a framework that accelerates every course that follows.',
    gizmo:'Build enzyme-deficiency cards: Front = enzyme name + pathway. Back = substrate accumulated + clinical disease + key features + any pharmacological relevance. Also build pathway-state cards: Front = metabolic state (DKA, starvation, fed). Back = active pathways + active hormones + key substrates + clinical signs.',
    cardExamples:[
      {front:'Enzyme deficient in classic PKU. Substrate accumulated. Clinical features.',back:'Phenylalanine hydroxylase (requires BH4 cofactor). Phenylalanine accumulates → intellectual disability, musty/mousy odor, fair skin and hair, seizures. Detected on newborn screen. Treatment: phenylalanine-restricted diet. Avoid aspartame (contains phenylalanine). Maternal PKU: uncontrolled phenylalanine in pregnancy → microcephaly, cardiac defects in fetus.'},
      {front:'A patient on isoniazid for TB develops peripheral neuropathy and sideroblastic anemia. Which vitamin and which reactions are affected?',back:'Vitamin B6 (pyridoxal phosphate, PLP). Isoniazid inhibits pyridoxine phosphokinase → depletes PLP. Affected reactions: transamination (amino acid catabolism), ALAS (first step of heme synthesis → sideroblastic anemia), GABA synthesis (neurological effects), glycogen phosphorylase. Treatment: B6 supplementation with INH prophylactically.'},
      {front:'DKA metabolic logic: why does insulin deficiency cause ketoacidosis?',back:'Insulin deficiency → cells cannot uptake glucose → glucagon + catecholamines dominate → uncontrolled lipolysis → FFA flood mitochondria → β-oxidation overwhelmed → acetyl-CoA overflow → ketogenesis (acetoacetate + β-hydroxybutyrate) → ketonemia + ketonuria. Osmotic diuresis from glucosuria → dehydration. K+ initially normal/elevated (shifts out with acidosis) but total body K+ depleted. Correct in order: fluids → insulin → K+ when K+ <5.3.'}
    ],
    antiPattern:'Do not draw full pathway diagrams from start to finish and call that studying. Map only the clinical branch points: regulatory steps, cofactors, where drugs act, and what disease arises from deficiency.',
    boardStats:[
      {val:'~5%',lbl:'PLE Biochem content'},
      {val:'Mechanism',lbl:'Always first'},
      {val:'Molecular',lbl:'Foundation'}
    ],
    yieldItems:[
      {tier:'critical',topic:'Glycolysis, TCA cycle, oxidative phosphorylation — energy logic',note:'Net ATP yields; why hypoxia causes lactic acidosis; Complex I as metformin target'},
      {tier:'critical',topic:'Ketogenesis and DKA mechanism',note:'Insulin off → uncontrolled lipolysis → acetyl-CoA overflow → anion gap metabolic acidosis'},
      {tier:'critical',topic:'B-vitamin cofactors and deficiency diseases',note:'B1/PDH (Wernicke), B6/PLP (sideroblastic anemia + neuropathy), B12/folate (megaloblastic + subacute combined)'},
      {tier:'high',topic:'Inborn errors — enzyme defect + clinical disease mapping',note:'PKU, galactosemia, G6PD deficiency, Gaucher, Tay-Sachs, homocystinuria, MSUD'},
      {tier:'high',topic:'Lipoproteins and cholesterol metabolism',note:'LDL/HDL roles; statin mechanism (HMG-CoA reductase); familial hypercholesterolemia'},
      {tier:'high',topic:'Urea cycle and hyperammonemia',note:'Liver failure → urea cycle fails → NH4+ accumulates → hepatic encephalopathy; lactulose mechanism'},
      {tier:'high',topic:'Nucleotide metabolism and drug targets',note:'Purine catabolism → uric acid → gout; allopurinol; methotrexate (DHFR); 5-FU (thymidylate synthase)'}
    ],
    resources:['Lippincott Biochemistry (Champe) — LibGen','Sketchy Biochemistry (if available)','Ninja Nerd Biochemistry series (YouTube, free)','First Aid USMLE Step 1 Biochemistry chapter (LibGen)']}
};

function buildNotesVault(proj){
  const cont=document.getElementById('proj-notes-vault');
  if(!cont)return;
  const notes=getNotes();
  const val=notes[proj.id]||'';
  const placeholders={
    ap:"Body systems you can\'t draw from memory. Mechanisms you understood today. Clinical connections — what does this failure mode look like in a patient?",
    fund:"ADPIE applications to fictional patients. Nursing diagnoses you formatted. Legal scenarios and what you would do. NCLEX questions you got wrong and why.",
    ha:"Assessment findings you misidentified. Normal vs abnormal pairs to drill. Techniques where your hands still feel uncertain. Documentation phrasing that worked.",
    pharm:"Drug mechanisms you got wrong. Calculation types to practice — show the setup. Adverse effects you mix up. Narrow TI drugs and their monitoring parameters.",
    medsurg:"Pathophysiology chains: disorder → manifestations → priorities. Confusing priority scenarios. Patient teaching points. ABG interpretations.",
    de:"German sentences you constructed today. Clinical vocab you keep forgetting. Phrases from Nicos Weg worth keeping. German you heard in a video and recognized.",
    biochem:"Pathways you keep confusing. Enzyme deficiency → disease pairs. Cofactor → reaction maps. Drug targets you want to remember mechanistically. Clinical connections that clicked."
  };
  const placeholder=placeholders[proj.id]||'Pin anything here — concepts that confused you, links, mnemonics, questions for your professor...';
  cont.innerHTML=`
    <div class="notes-vault">
      <div class="notes-vault-label">Notes vault — key insights, confusion points, links</div>
      <textarea class="notes-vault-area" id="nv-area-${proj.id}" placeholder="${placeholder}" oninput="saveNote('${proj.id}',this.value)">${val}</textarea>
      <div class="notes-vault-saved" id="nv-saved-${proj.id}" style="opacity:0">saved</div>
    </div>`;
}

let _noteSaveTimer=null;
function saveNote(projId,val){
  const notes=getNotes();
  notes[projId]=val;
  saveNotes(notes);
  const lbl=document.getElementById(`nv-saved-${projId}`);
  if(lbl){lbl.style.opacity='1';clearTimeout(_noteSaveTimer);_noteSaveTimer=setTimeout(()=>lbl.style.opacity='0',1500);}
}

function updateReadinessBar(){
  let total=0,done=0;
  projects.forEach(p=>{const pg=getProjectProgress(p);total+=pg.total;done+=pg.done;});
  const pct=total?Math.round((done/total)*100):0;
  const fill=document.getElementById('readiness-fill');
  const score=document.getElementById('readiness-score');
  const lbl=document.getElementById('readiness-label');
  if(fill)fill.style.width=pct+'%';
  if(score)score.textContent=pct+'%';
  if(lbl){
    const msg=pct===0?'Not started yet — open a course and begin':pct<25?'Early foundations — keep going':pct<50?'Building momentum':pct<75?'Solid progress — more than halfway':pct<100?'Nearly ready — strong position':'Complete — you are ready';
    lbl.textContent=msg;
  }
}

// Patch showProject to call new features
const _origShowProjectFeatures=showProject;
showProject=function(projId){
  // Clear intro before calling original (which clears proj-sections)
  const intro=document.getElementById('proj-intro');
  if(intro)intro.innerHTML='';
  _origShowProjectFeatures(projId);
  const proj=projects.find(p=>p.id===projId);
  if(proj){buildCourseInfo(proj);buildRec(proj);buildNotesVault(proj);}
};

// Patch buildCoverageCards to update readiness bar
const _origBuildCoverageCards=buildCoverageCards;
buildCoverageCards=function(){
  _origBuildCoverageCards();
  updateReadinessBar();
  buildHeatmap();
};

// ─── FOOTER DATE ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded',function(){
  var d=new Date();
  var ds=d.toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'});
  document.querySelectorAll('.footer').forEach(function(f){
    if(f.textContent.includes('2026')){
      var sp=document.createElement('span');
      sp.style.cssText='margin-left:6px;opacity:.5;font-size:9px;letter-spacing:.04em';
      sp.textContent='· '+ds;
      f.appendChild(sp);
    }
  });
});
// ─── FOCUS LOCK ───────────────────────────────────────────────────────────────
let _focusLocked=false;
function toggleFocusLock(){
  if(_focusLocked){exitFocusLock();return;}
  // Must be in work mode and running
  if(!PF.running&&PF.mode==='work'){pfStart();}
  _focusLocked=true;
  document.body.classList.add('focus-locked');
  const banner=document.getElementById('focus-lock-banner');
  if(banner)banner.classList.add('active');
  const lockBtn=document.getElementById('pf-lock-btn');
  if(lockBtn){lockBtn.textContent='⊠ locked';lockBtn.style.borderColor='var(--accent)';lockBtn.style.color='var(--accent)';}
  // Update task label in banner
  const task=document.getElementById('pomo-task-input');
  const fl=document.getElementById('fl-task');
  if(fl&&task&&task.value.trim())fl.textContent='· '+task.value.trim();
  closePomoOverlay();
  // Sync banner timer with PF
  _focusLockInterval=setInterval(_syncFocusLockBanner,500);
}
let _focusLockInterval=null;
function _syncFocusLockBanner(){
  if(!_focusLocked){clearInterval(_focusLockInterval);return;}
  const t=document.getElementById('fl-time');
  if(t){
    const mins=Math.floor(PF.remaining/60);const secs=PF.remaining%60;
    t.textContent=String(mins).padStart(2,'0')+':'+String(secs).padStart(2,'0');
  }
  // Auto-exit if session ends
  if(!PF.running&&PF.mode!=='work'){exitFocusLock();}
}
function exitFocusLock(){
  _focusLocked=false;
  document.body.classList.remove('focus-locked');
  const banner=document.getElementById('focus-lock-banner');
  if(banner)banner.classList.remove('active');
  const lockBtn=document.getElementById('pf-lock-btn');
  if(lockBtn){lockBtn.textContent='⊞ focus lock';lockBtn.style.borderColor='';lockBtn.style.color='';}
  clearInterval(_focusLockInterval);
}

// ─── FEAR REVISIT SYSTEM ──────────────────────────────────────────────────────
const FEAR_CUSTOM_KEY='viktor-fear-custom-v1';
const FEAR_REVISIT_KEY='viktor-fear-revisit-v1';
function getFearCustom(){try{return JSON.parse(localStorage.getItem(FEAR_CUSTOM_KEY)||'[]');}catch{return[];}}
function saveFearCustom_data(d){localStorage.setItem(FEAR_CUSTOM_KEY,JSON.stringify(d));}

function openFearAddForm(){
  const f=document.getElementById('fear-add-form');if(f)f.classList.add('open');
  const inp=document.getElementById('fear-add-name');if(inp)setTimeout(()=>inp.focus(),50);
}
function closeFearAddForm(){
  const f=document.getElementById('fear-add-form');if(f)f.classList.remove('open');
  ['fear-add-name','fear-add-reframe'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
}
function saveFearCustom(){
  const name=(document.getElementById('fear-add-name')||{}).value||'';
  if(!name.trim())return;
  const reframe=(document.getElementById('fear-add-reframe')||{}).value||'';
  const fears=getFearCustom();
  fears.push({id:Date.now().toString(36),name:name.trim(),reframe:reframe.trim(),added:todayISO(),resolved:false});
  saveFearCustom_data(fears);
  closeFearAddForm();
  renderCustomFears();
  updateFearCount();
}
function toggleCustomFearResolve(id,btn){
  const fears=getFearCustom();
  const f=fears.find(x=>x.id===id);if(!f)return;
  f.resolved=!f.resolved;
  saveFearCustom_data(fears);
  renderCustomFears();
  updateFearCount();
}
function deleteCustomFear(id){
  saveFearCustom_data(getFearCustom().filter(f=>f.id!==id));
  renderCustomFears();updateFearCount();
}
function renderCustomFears(){
  const cont=document.getElementById('fear-custom-list');if(!cont)return;
  const fears=getFearCustom();
  if(!fears.length){cont.innerHTML='';return;}
  cont.innerHTML=fears.map(f=>`
    <div class="fear-card${f.resolved?' resolved':''}" style="margin-bottom:8px">
      <div style="display:flex;align-items:flex-start;gap:8px">
        <div style="flex:1">
          <div class="fear-num" style="font-family:var(--font-mono);font-size:9px;color:var(--ink-ghost);letter-spacing:.1em;text-transform:uppercase;margin-bottom:3px"><span class="fear-custom-tag">custom</span>${f.added}</div>
          <div class="fear-name" style="font-size:13px;font-weight:500;color:var(--ink);margin-bottom:4px">${f.name}</div>
          ${f.reframe?`<div class="fear-reframe" style="font-size:12px;color:var(--ink-muted);line-height:1.6">${f.reframe}</div>`:''}
        </div>
        <button onclick="deleteCustomFear('${f.id}')" style="font-size:9px;color:var(--ink-ghost);background:none;border:none;cursor:pointer;padding:2px 4px;opacity:.5;transition:opacity .15s" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=.5">✕</button>
      </div>
      <div class="fear-card-actions">
        <button class="fear-resolve-btn ${f.resolved?'resolved':'unresolved'}" onclick="toggleCustomFearResolve('${f.id}',this)">${f.resolved?'resolved ✓':'mark resolved'}</button>
      </div>
    </div>`).join('');
}
function stampFearRevisit(){
  const d=todayISO();
  localStorage.setItem(FEAR_REVISIT_KEY,d);
  const el=document.getElementById('fear-last-revisit');
  if(el)el.textContent='last revisit: '+d;
}
function loadFearRevisitStamp(){
  const d=localStorage.getItem(FEAR_REVISIT_KEY);
  const el=document.getElementById('fear-last-revisit');
  if(el&&d)el.textContent='last revisit: '+d;
}

// ─── CHECKLIST DATE TARGETS ───────────────────────────────────────────────────
const CL_DATES_KEY='viktor-cl-dates-v1';
function getChecklistDates(){try{return JSON.parse(localStorage.getItem(CL_DATES_KEY)||'{}');}catch{return {};}}
function saveChecklistDates(d){localStorage.setItem(CL_DATES_KEY,JSON.stringify(d));}
function pickChecklistDate(key,btn){
  // Use a native date input popup
  const inp=document.createElement('input');
  inp.type='date';inp.style.position='fixed';inp.style.opacity='0';
  inp.style.top=btn.getBoundingClientRect().top+'px';
  inp.style.left=btn.getBoundingClientRect().left+'px';
  const dates=getChecklistDates();
  if(dates[key])inp.value=dates[key];
  document.body.appendChild(inp);
  inp.focus();inp.click();
  inp.addEventListener('change',()=>{
    const val=inp.value;
    if(val){
      dates[key]=val;saveChecklistDates(dates);
      btn.textContent=val;
      const today=todayISO();
      btn.className='cl-date-badge '+(val<today?'overdue':'set');
    }
    document.body.removeChild(inp);
  });
  inp.addEventListener('blur',()=>{setTimeout(()=>{if(document.body.contains(inp))document.body.removeChild(inp);},200);});
}

// ─── INIT FEAR REVISIT + CUSTOM FEARS ON SELF TAB LOAD ───────────────────────
const _origShowViktorFear=showViktor;
showViktor=function(){
  _origShowViktorFear();
  setTimeout(()=>{renderCustomFears();loadFearRevisitStamp();updateFearCount();},60);
};


// ═══════════════════════════════════════════════════════════════════════════
// V13 JS ADDITIONS
// ═══════════════════════════════════════════════════════════════════════════

// ── Patch: renderDonuts → also renders course bars + mini donuts ────────────
const _origRenderDonuts = renderDonuts;
renderDonuts = function() {
  // Original donuts fallback (hidden in v13 layout)
  const cont = document.getElementById('ov-donuts');
  if (cont) { cont.innerHTML = ''; }

  const courseMeta = {
    ap:      {abbr:'A&P',     color:'#2A7A5A'},
    fund:    {abbr:'Fund',    color:'#5A3A8A'},
    ha:      {abbr:'HA',      color:'#2A5A7A'},
    pharm:   {abbr:'Pharm',   color:'#8A2020'},
    medsurg: {abbr:'Med-S',   color:'#2A3A7A'},
    de:      {abbr:'German',  color:'#B8882A'}
  };

  // Course pulse bars (courses cell)
  const barsEl = document.getElementById('ov-course-bars');
  if (barsEl) {
    barsEl.innerHTML = '';
    projects.forEach(function(p) {
      const pg = getProjectProgress(p);
      const meta = courseMeta[p.id] || {abbr: p.id, color: p.color || 'var(--accent)'};
      const row = document.createElement('div');
      row.className = 'ov-bar-row';
      row.innerHTML = '<div class="ov-bar-dot" style="background:' + p.color + '"></div>' +
        '<div class="ov-bar-name">' + meta.abbr + '</div>' +
        '<div class="ov-bar-track"><div class="ov-bar-fill" style="width:' + pg.pct + '%;background:' + p.color + '"></div></div>' +
        '<div class="ov-bar-pct">' + pg.pct + '%</div>';
      row.onclick = function() { _backDest = 'home'; showProject(p.id); };
      barsEl.appendChild(row);
    });
  }

  // Mini donuts in readiness cell
  const miniEl = document.getElementById('ov-course-mini');
  if (miniEl) {
    miniEl.innerHTML = '';
    projects.forEach(function(p) {
      const pg = getProjectProgress(p);
      const R = 9, C = +(2 * Math.PI * R).toFixed(2);
      const offset = +(C * (1 - pg.pct / 100)).toFixed(2);
      const meta = courseMeta[p.id] || {abbr: p.id};
      const div = document.createElement('div');
      div.style.cssText = 'display:flex;align-items:center;gap:4px;cursor:pointer';
      div.innerHTML = '<svg width="22" height="22" viewBox="0 0 22 22">' +
        '<circle cx="11" cy="11" r="' + R + '" fill="none" stroke="rgba(107,94,74,.15)" stroke-width="2.5"/>' +
        '<circle cx="11" cy="11" r="' + R + '" fill="none" stroke="' + p.color + '" stroke-width="2.5" stroke-dasharray="' + C + '" stroke-dashoffset="' + offset + '" stroke-linecap="round" transform="rotate(-90 11 11)"/>' +
        '</svg><span style="font-family:var(--font-mono);font-size:8px;color:var(--text-muted)">' + meta.abbr + '</span>';
      div.onclick = function() { _backDest = 'home'; showProject(p.id); };
      miniEl.appendChild(div);
    });
  }

  // If neither new container exists, fall back to original rendering
  if (!barsEl && !miniEl) {
    _origRenderDonuts();
  }
};

// ── Patch: updateOverallProgress → also updates hero number + radial ring ──
const _origUpdateOverallProgress = updateOverallProgress;
updateOverallProgress = function() {
  _origUpdateOverallProgress();
  let total = 0, done = 0;
  projects.forEach(function(p) { const pg = getProjectProgress(p); total += pg.total; done += pg.done; });
  const pct = total ? Math.round(done / total * 100) : 0;
  const heroEl = document.getElementById('ov-readiness-hero');
  const ghostEl = document.getElementById('ov-ghost-num');
  if (heroEl) heroEl.textContent = pct;
  if (ghostEl) ghostEl.textContent = pct;
  // Update radial ring (circumference = 2π×30 ≈ 188.5)
  const ring = document.getElementById('ov-readiness-ring');
  if (ring) {
    const circumference = 188.5;
    const offset = circumference - (pct / 100) * circumference;
    ring.style.strokeDashoffset = offset.toFixed(2);
  }
};

// ── Focus lockbox updater (no-op — replaced by Daily Intention widget) ────
function updateFocusLockbox() {
  // Daily Intention loads on init; date is set there.
  // Nothing else to sync — old pomo bars removed.
}

// ── Patch buildOverview to call new components ──────────────────────────────
const _origBuildOverviewV13 = buildOverview;
buildOverview = function() {
  _origBuildOverviewV13();
  updateFocusLockbox();
  if (typeof pfUpdateUI === 'function') pfUpdateUI();
};

// ── Patch renderTodos → also updates tools list + lockbox ──────────────────
const _origRenderTodosV13 = renderTodos;
renderTodos = function() {
  _origRenderTodosV13();
  renderToolsTodos();
  updateFocusLockbox();
};

// ── Tools todo list renderer ───────────────────────────────────────────────
function renderToolsTodos() {
  const list = document.getElementById('tools-todo-list');
  if (!list) return;
  const todos = getTodos();
  const today = todayISO();
  const filtered = todos.filter(function(t) { return (t.date || today) === today; });
  list.innerHTML = '';
  if (!filtered.length) {
    list.innerHTML = '<li style="font-size:12px;color:var(--text-muted);font-style:italic;list-style:none;padding:4px 0">No tasks yet.</li>';
    return;
  }
  filtered.forEach(function(t) {
    const li = document.createElement('li');
    li.style.cssText = 'display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid var(--border);list-style:none';
    li.innerHTML = '<input type="checkbox" class="todo-cb"' + (t.done ? ' checked' : '') + '>' +
      '<span style="font-size:12px;flex:1;' + (t.done ? 'text-decoration:line-through;color:var(--text-muted)' : '') + '">' + t.text + '</span>';
    li.querySelector('input').onchange = function() {
      toggleTodo(t.id, this);
      renderToolsTodos();
      updateFocusLockbox();
    };
    list.appendChild(li);
  });
}

function toolsAddTodo() {
  const inp = document.getElementById('tools-todo-input');
  if (!inp || !inp.value.trim()) return;
  const todos = getTodos();
  todos.push({id: Date.now().toString(36), text: inp.value.trim(), done: false, date: getActiveTodoDate()});
  saveTodos(todos);
  inp.value = '';
  renderTodos();
}

// ── Inline pomodoro sync ──────────────────────────────────────────────────
const _origPfUpdateUI = pfUpdateUI;
pfUpdateUI = function() {
  _origPfUpdateUI();
  const mins = Math.floor(PF.remaining / 60), secs = PF.remaining % 60;
  const ts = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');

  // Tools inline time + mode
  const tEl = document.getElementById('tools-pomo-time');
  if (tEl) tEl.textContent = ts;
  const mEl = document.getElementById('tools-pomo-mode-lbl');
  if (mEl) mEl.textContent = PF_LABELS[PF.mode];

  // Tools start button
  const startBtn = document.getElementById('tools-pomo-start-btn');
  if (startBtn) {
    startBtn.textContent = PF.running ? 'Pause' : 'Start';
    startBtn.className = 'tools-pomo-start' + (PF.mode !== 'work' ? ' mode-' + PF.mode : '');
  }

  // Tools mode buttons
  document.querySelectorAll('.tools-pomo-mode-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.mode === PF.mode);
  });

  // Tools session dots
  const dotsEl = document.getElementById('tools-pomo-dots');
  if (dotsEl) dotsEl.querySelectorAll('.tools-pomo-dot').forEach(function(d, i) {
    d.classList.toggle('done', i < PF.sessions);
  });

  // Tools ring
  const ringFill = document.getElementById('tools-pomo-ring-fill');
  if (ringFill) {
    const tools_C = 2 * Math.PI * 22;
    const offset = tools_C * (1 - PF.remaining / PF_DUR[PF.mode]);
    ringFill.setAttribute('stroke-dashoffset', offset.toFixed(2));
    ringFill.style.stroke = PF_COLORS[PF.mode];
  }

  // Header mini button
  const mini = document.getElementById('hub-pomo-mini');
  if (mini) {
    mini.textContent = '⏱ ' + ts;
    mini.classList.toggle('running', PF.running);
  }
};

// ── Patch sgGoTo → show big tab title + counter ─────────────────────────────
const _origSgGoTo = sgGoTo;
sgGoTo = function(i) {
  _origSgGoTo(i);
  const tabNames = ['Professors','Clinical Instructor','Groupmates','Clinicals','Research','Exams','College Life','Mental Health','PH Culture','Technology','Career Path'];
  const tabColors = ['var(--gold)','var(--accent)','var(--ink-muted)','var(--teal)','#3a5a8a','var(--accent)','var(--gold-soft)','var(--gold)','var(--teal)','var(--teal)','var(--accent)'];

  const titleEl   = document.getElementById('sg-big-title');
  const counterEl = document.getElementById('sg-pos-counter');
  if (titleEl)   titleEl.textContent = tabNames[i] || '';
  if (counterEl) counterEl.textContent = (i + 1) + ' / 11';

  // Color the progress bar to match the tab
  const progressFill = document.querySelector('#view-survival .pv-progress-fill');
  if (progressFill) progressFill.style.background = tabColors[i] || 'var(--accent)';
};

// ── Patch showProject → set course color tokens ─────────────────────────────
const _origShowProjectColors = showProject;
showProject = function(projId) {
  _origShowProjectColors(projId);
  const proj = projects.find(function(p) { return p.id === projId; });
  if (!proj) return;
  const viewEl = document.getElementById('view-project');
  if (!viewEl) return;
  viewEl.setAttribute('data-course', projId);
  viewEl.style.setProperty('--course-color', proj.color || 'var(--accent)');
  // Compute a tinted background from the project color (v20: 12% tints)
  const bgMap = {
    '#2A7A5A': 'rgba(42,122,90,.12)',
    '#5A3A8A': 'rgba(90,58,138,.12)',
    '#2A5A7A': 'rgba(42,90,122,.12)',
    '#8A2020': 'rgba(138,32,32,.12)',
    '#2A3A7A': 'rgba(42,58,122,.12)',
    '#B8882A': 'rgba(184,136,42,.12)',
    '#6A3A10': 'rgba(106,58,16,.12)',
    '#8A2060': 'rgba(138,32,96,.12)',
    '#2A4A6A': 'rgba(42,74,106,.12)'
  };
  const bg = bgMap[proj.color] || 'rgba(184,78,44,.12)';
  viewEl.style.setProperty('--course-color-bg', bg);
};

// ── v41: color-spine patch retired — colors now applied inline in buildCoverageCards ──


// ─── DAILY INTENTION ────────────────────────────────────────────────────────
const INTENTION_KEY = 'viktor-intention-v1';
function getIntentionData(){ try{ return JSON.parse(localStorage.getItem(INTENTION_KEY)||'{}'); }catch{ return {}; } }
function saveIntention(val){
  const data = getIntentionData();
  data[todayISO()] = val;
  localStorage.setItem(INTENTION_KEY, JSON.stringify(data));
  const lbl = document.getElementById('ov-intention-saved');
  if(lbl){ lbl.textContent = 'saved'; clearTimeout(lbl._t); lbl._t = setTimeout(()=>{ lbl.textContent=''; }, 1500); }
}
function clearIntention(){
  const inp = document.getElementById('ov-intention-input');
  if(inp) inp.value = '';
  saveIntention('');
}
function loadIntention(){
  const data = getIntentionData();
  const inp = document.getElementById('ov-intention-input');
  if(inp) inp.value = data[todayISO()] || '';
  const dateEl = document.getElementById('ov-focus-date');
  if(dateEl){
    const d = new Date();
    dateEl.textContent = d.toLocaleDateString('en-PH',{weekday:'short',day:'numeric',month:'short'});
  }

  // restore declaration button state if already declared today
  const btn = document.getElementById('decl-save-btn');
  const saved = document.getElementById('ov-intention-saved');
  if(btn && hasDeclarationToday()){
    btn.textContent = 'Declared ✓';
    btn.style.color = 'var(--teal, #2A7A6A)';
    btn.style.borderColor = 'var(--teal, #2A7A6A)';
    btn.onclick = null;
    if(saved) saved.textContent = 'declared';
  }
}

// ─── RITUAL SWITCHER ─────────────────────────────────────────────────────────
function switchRitual(btn, panelId) {
  document.querySelectorAll('.ritual-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.ritual-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  const panel = document.getElementById(panelId);
  if (panel) panel.classList.add('active');
}

// ─── FEAR RESOLVED DIVIDER ─────────────────────────────────────────────────
function updateFearDivider(){
  const grid=document.getElementById('fear-grid');
  const divider=document.getElementById('fear-resolved-divider');
  if(!grid||!divider)return;
  const hasResolved=grid.querySelectorAll('.fear-card.resolved').length>0;
  divider.classList.toggle('visible',hasResolved);
  // push divider before first resolved card using order
  divider.style.order=hasResolved?'98':'0';
}

// ─── LANGUAGE PROFICIENCY RAIL ────────────────────────────────────────────
const LANG_LEVEL_KEY='viktor-lang-level-v1';
function getLangLevel(){try{return parseInt(localStorage.getItem(LANG_LEVEL_KEY)||'0');}catch{return 0;}}
function setLangLevel(level){
  localStorage.setItem(LANG_LEVEL_KEY,String(level));
  renderLangRail(level);
}
function renderLangRail(level){
  const nodes=document.querySelectorAll('.lang-rail-node');
  if(!nodes.length)return;
  nodes.forEach((node,i)=>{
    node.classList.remove('active','done');
    if(i<level)node.classList.add('done');
    else if(i===level)node.classList.add('active');
  });
  const progress=document.getElementById('lang-rail-progress');
  if(progress){
    const pct=level===0?0:(level/5)*100;
    progress.style.width=pct+'%';
  }
}
function initLangRail(){
  renderLangRail(getLangLevel());
}

// ─── PROFILE PULSE ────────────────────────────────────────────────────────
const SCHOOL_START_DATE='2026-06-15'; // update when you know your actual enrollment date
function updateProfilePulse(){
  // Checklist %
  const clLabel=document.getElementById('pv-cl-label');
  const ppCl=document.getElementById('pp-checklist-val');
  if(ppCl){
    if(clLabel){
      const m=clLabel.textContent.match(/(\d+)%/);
      ppCl.textContent=m?m[1]+'%':'0%';
      const pct=m?parseInt(m[1]):0;
      ppCl.style.color=pct>=80?'var(--teal)':pct>=40?'var(--gold)':'var(--ink)';
    }else{ppCl.textContent='0%';}
  }
  // Active (unresolved) fears
  const ppFears=document.getElementById('pp-fears-val');
  if(ppFears){
    const fstate=getFearState();
    const resolved=Object.values(fstate).filter(Boolean).length;
    const active=6-resolved;
    ppFears.textContent=active;
    ppFears.style.color=active>4?'var(--accent)':active>2?'var(--gold)':active>0?'var(--ink-muted)':'var(--teal)';
  }
  // Days to school
  const ppDays=document.getElementById('pp-days-val');
  if(ppDays){
    const target=new Date(SCHOOL_START_DATE);
    const today=new Date();
    today.setHours(0,0,0,0);
    const diff=Math.ceil((target-today)/(1000*60*60*24));
    if(diff>0){ppDays.textContent=diff;ppDays.style.color='var(--ink)';}
    else if(diff===0){ppDays.textContent='Today!';ppDays.style.color='var(--teal)';}
    else{ppDays.textContent='🎓';ppDays.style.color='var(--teal)';}
  }
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
// Called by router.js after all view HTML is fetched and injected into the DOM
window.initHub = function() {
  loadState();
  // Hoist overlay to body so position:fixed is always viewport-relative
  var _ro = document.getElementById('researcher-overlay');
  if(_ro && _ro.parentElement !== document.body) document.body.appendChild(_ro);
  showHubTab('home');
  buildDashboard();
  setTimeout(loadFearState,200);
  setTimeout(loadIntention,100);
  setTimeout(initLangRail,150);
  setTimeout(updateProfilePulse,300);
};

// ─── STUDY SYSTEM PIPELINE ───────────────────────────────────────────────────
const SS_STEPS = [
  { title: 'Read one concept actively', body: 'One section, not a chapter. Ask: why does this exist? What happens if a nurse gets this wrong? Clinical framing first, not academic framing.' },
  { title: 'Close the book. Wait 2 minutes. Do nothing.', body: 'Mandatory. The gap creates retrieval pressure. Without it you\'re copying, not learning. This 2-minute gap is worth more than the other 88 minutes.' },
  { title: 'Write everything from memory — notebook first, then Obsidian', body: 'Gaps in your writing = gaps in your understanding. That\'s data, not failure. Messy notebook first, then clean Obsidian note in your own voice.' },
  { title: 'Test yourself before the session ends', body: 'Cover your notes. Answer the core question from memory. Fix only the gaps you found — not the whole thing again. This one step is the difference between notes and memory.' },
  { title: 'Space: next day, day 3, day 7', body: 'Gizmo handles this automatically if you rate honestly. Day 0: test this session. Day 1: Gizmo before anything new. Day 7: weekly blurt of everything on one blank page.' }
];
function ssPipeSelect(i) {
  document.querySelectorAll('.ss-pipe-node').forEach(function(n,idx){ n.classList.toggle('active', idx===i); });
  var s = SS_STEPS[i];
  document.getElementById('ss-pipe-step-title').textContent = s.title;
  document.getElementById('ss-pipe-step-body').textContent = s.body;
  var inner = document.getElementById('ss-pipe-detail-inner');
  inner.style.animation = 'none'; inner.offsetHeight; inner.style.animation = '';
}

// ─── CONNECTION LOG (v37 override — replaces broken duplicate) ───────────────
// connAdd / connDelete / connRender already defined above at line ~7676
// This block only overrides the older broken version that used wrong keys
(function(){
  // Re-wire connAdd to use the correct CONN_KEY version
  window.connAdd = function(){
    var inp = document.getElementById('conn-input');
    var val = inp ? inp.value.trim() : '';
    if(!val) return;
    var arr = getConns();
    arr.unshift({id: Date.now().toString(36), chain: val, date: todayISO()});
    saveConns(arr);
    inp.value = '';
    connRender();
    updateConnFab();
  };
})();
// ─── COURSE FEATURE WIDGETS ──────────────────────────────────────────────────
function buildCourseFeature(proj) {
  const cont = document.getElementById('proj-feature');
  if (!cont) return;
  cont.innerHTML = '';
  const builders = { ap: apFeature, fund: fundFeature, ha: haFeature, pharm: pharmFeature, medsurg: medsurgFeature, de: deFeature };
  const fn = builders[proj.id];
  if (fn) cont.innerHTML = fn(proj);
}

// ── A&P: System Quick-Reference Cards ───────────────────────────────────────
function apFeature(proj) {
  const systems = [
    { name: 'Integumentary', focus: 'Skin layers, wound healing, pressure injury staging', tag: 'Layers → Function → Failure' },
    { name: 'Skeletal', focus: 'Bone types, joints, fracture classification, Ca²⁺/PO₄ balance', tag: 'Structure → Homeostasis' },
    { name: 'Muscular', focus: 'Contraction mechanism, NMJ, electrolyte roles (K⁺, Ca²⁺, Mg²⁺)', tag: 'Actin–Myosin → AP → Twitch' },
    { name: 'Nervous', focus: 'CNS/PNS, neurotransmitters, reflex arcs, autonomic divisions', tag: 'Impulse → Synapse → Response' },
    { name: 'Endocrine', focus: 'Hormone cascades, feedback loops, target organ effects', tag: 'Gland → Hormone → Effect' },
    { name: 'Cardiovascular', focus: 'Cardiac cycle, conduction system, BP regulation, hemodynamics', tag: 'Pump → Conduction → Flow' },
    { name: 'Respiratory', focus: 'Gas exchange, V/Q ratio, acid-base, O₂ dissociation curve', tag: 'Ventilation → Diffusion → Transport' },
    { name: 'Digestive', focus: 'Enzyme secretion, absorption sites, gut hormones, liver functions', tag: 'Mechanical → Chemical → Absorb' },
    { name: 'Urinary', focus: 'Nephron segments, filtration, electrolyte regulation, acid-base', tag: 'Filter → Reabsorb → Excrete' },
    { name: 'Reproductive', focus: 'Hormonal cycles, gametogenesis, fertilisation basics', tag: 'Cycle → Hormone → Gamete' },
    { name: 'Lymphatic System', focus: 'Lymph vessels, nodes, spleen, thymus — immunity types, innate vs adaptive, lymphatic drainage', tag: 'Innate → Adaptive → Memory' },
    { name: 'Tissues', focus: 'Epithelial types, connective tissue, muscle & nervous tissue, membranes', tag: 'Cell → Tissue → Organ' },
  ];
  const ACCENTS = [
    '30,100,73',   // teal
    '58,78,130',   // blue
    '154,122,26',  // gold
    '110,46,90',   // mauve
    '184,78,44',   // accent/rust
    '72,82,36',    // olive
    '30,100,73',   // teal again
    '42,90,122',   // ha-blue
    '154,122,26',  // gold again
    '110,46,90',   // mauve again
    '58,78,130',   // blue again
    '184,78,44',   // rust again
  ];
  const cards = systems.map((s,i) => `
    <div class="cf-ap-card" style="--card-accent-rgb:${ACCENTS[i%ACCENTS.length]}" onclick="cfScrollToSection(this,'${s.name}')">
      <div class="cf-ap-card-name">${s.name}</div>
      <div class="cf-ap-card-focus">${s.focus}</div>
      <div class="cf-ap-card-tag">→ ${s.tag}</div>
    </div>`).join('');
  return `<div class="cf-panel cf-panel-ap">
    <div class="cf-eyebrow">Body Systems — Study Focus</div>
    <div class="cf-ap-grid">${cards}</div>
    <div class="cf-ap-hint">Click any card to jump to that section in your checklist ↓</div>
  </div>`;
}

// ── Fundamentals: ADPIE Pipeline ────────────────────────────────────────────
function fundFeature(proj) {
  const steps = [
    { code: 'A', name: 'Assessment', desc: 'Collect subjective & objective data. No interpretation yet.' },
    { code: 'D', name: 'Diagnosis', desc: 'Identify nursing diagnoses from data — not medical diagnoses.' },
    { code: 'P', name: 'Planning', desc: 'Set measurable goals. SMART. Patient-centered.' },
    { code: 'I', name: 'Implementation', desc: 'Execute interventions. Independent, dependent, collaborative.' },
    { code: 'E', name: 'Evaluation', desc: 'Did the goal change? Reassess. Revise the plan.' }
  ];
  const nodes = steps.map((s,i) => `
    <div class="cf-adpie-node" onclick="cfAdpieSelect(this,${i})" data-i="${i}" ${i===0?'data-active="true"':''}>
      <div class="cf-adpie-code">${s.code}</div>
      <div class="cf-adpie-name">${s.name}</div>
    </div>
    ${i<4?'<div class="cf-adpie-arrow">→</div>':''}`).join('');
  const descs = steps.map((s,i) => `<div class="cf-adpie-desc ${i===0?'active':''}" data-i="${i}"><strong>${s.name}</strong> — ${s.desc}</div>`).join('');
  return `<div class="cf-panel cf-panel-fund">
    <div class="cf-eyebrow">Process Framework</div>
    <div class="cf-adpie-title">The ADPIE Loop — every clinical encounter</div>
    <div class="cf-adpie-pipe">${nodes}</div>
    <div class="cf-adpie-detail">${descs}</div>
    <div class="cf-fund-rule">Study every Fundamentals topic through this lens: given a patient, walk through all five steps.</div>
  </div>`;
}

// ── Health Assessment: Head-to-Toe Segmented Bar ────────────────────────────
function haFeature(proj) {
  const regions = [
    { name: 'Head', sub: 'Neuro · Eye · Ear · Nose · Throat', color: 'var(--c-ha)' },
    { name: 'Thorax', sub: 'Respiratory · Cardiac · Breast', color: 'var(--c-ha)' },
    { name: 'Abdomen', sub: 'GI · Genitourinary · Kidneys', color: 'var(--c-ha)' },
    { name: 'Extremities', sub: 'Musculoskeletal · Peripheral Vascular', color: 'var(--c-ha)' },
    { name: 'Vitals', sub: 'BP · HR · RR · SpO₂ · Temp', color: 'var(--gold)' }
  ];
  const segs = regions.map((r,i) => `
    <div class="cf-htt-seg" onclick="cfHttSelect(this,${i})" data-i="${i}" ${i===0?'data-active="true"':''} style="--seg-color:${r.color}">
      <div class="cf-htt-seg-name">${r.name}</div>
    </div>`).join('');
  const panels = regions.map((r,i) => `
    <div class="cf-htt-panel ${i===0?'active':''}" data-i="${i}">
      <div class="cf-htt-region">${r.name}</div>
      <div class="cf-htt-sub">${r.sub}</div>
      <div class="cf-htt-rule">Normal first. Memorize normal cold — abnormal only exists relative to it.</div>
    </div>`).join('');
  return `<div class="cf-panel cf-panel-ha">
    <div class="cf-eyebrow">Head-to-Toe Navigator</div>
    <div class="cf-htt-bar">${segs}</div>
    <div class="cf-htt-panels">${panels}</div>
  </div>`;
}

// ── Pharmacology: Drug Class Grid ───────────────────────────────────────────
function pharmFeature(proj) {
  const classes = [
    { name: 'Loop Diuretics', mech: 'Inhibit Na/K/Cl reabsorption → ↑urine', alert: 'K+' },
    { name: 'Beta Blockers', mech: 'Block β-adrenergic → ↓HR, ↓BP', alert: 'HR' },
    { name: 'ACE Inhibitors', mech: 'Block angiotensin converting enzyme', alert: 'K+/Creatinine' },
    { name: 'Opioids', mech: 'Bind μ-receptors → pain modulation', alert: 'Resp. depression' },
    { name: 'Anticoagulants', mech: 'Inhibit clotting cascade factors', alert: 'Bleeding' },
    { name: 'Corticosteroids', mech: 'Suppress immune/inflammatory response', alert: 'Blood glucose' },
    { name: 'Antidiabetics', mech: 'Enhance insulin action/release', alert: 'Hypoglycemia' },
    { name: 'Antibiotics', mech: 'Disrupt bacterial cell wall/protein synthesis', alert: 'Allergy/C.diff' },
    { name: 'Antiarrhythmics', mech: 'Alter cardiac conduction pathways', alert: 'QT interval' },
    { name: 'Bronchodilators', mech: 'Relax airway smooth muscle → ↑airflow', alert: 'Tremor/HR' },
    { name: 'Anticonvulsants', mech: 'Stabilize neuronal membranes', alert: 'Hepatotoxicity' },
    { name: 'Antipsychotics', mech: 'Block dopamine D2 receptors', alert: 'EPS/QTc' }
  ];
  const tiles = classes.map(c => `
    <div class="cf-drug-tile">
      <div class="cf-drug-name">${c.name}</div>
      <div class="cf-drug-mech">${c.mech}</div>
      <div class="cf-drug-alert">Monitor: ${c.alert}</div>
    </div>`).join('');
  return `<div class="cf-panel cf-panel-pharm">
    <div class="cf-eyebrow">Drug Class Reference Grid</div>
    <div class="cf-pharm-rule">Learn mechanism first — every effect, adverse effect, and nursing consideration derives from it.</div>
    <div class="cf-drug-grid">${tiles}</div>
  </div>`;
}

// ── Med-Surg: NCLEX Priority Matrix ─────────────────────────────────────────
function medsurgFeature(proj) {
  const tiers = [
    {
      level: 'T1', label: 'High-yield — master first', note: 'Most NCLEX questions',
      systems: [
        { name: 'Cardiovascular', key: 'Cardiovascular' },
        { name: 'Respiratory', key: 'Respiratory' },
        { name: 'Neurological', key: 'Neurological' },
        { name: 'Renal/Urinary', key: 'Renal' },
        { name: 'Endocrine', key: 'Endocrine' },
        { name: 'Shock & Sepsis', key: 'Shock' }
      ]
    },
    {
      level: 'T2', label: 'Core — study alongside T1', note: 'Frequently tested',
      systems: [
        { name: 'GI & Hepatic', key: 'GI' },
        { name: 'Hematology', key: 'Hematology' },
        { name: 'Immune/Integumentary', key: 'Immune' },
        { name: 'Musculoskeletal', key: 'Musculoskeletal' },
        { name: 'Fluid & Electrolytes', key: 'Fluid' }
      ]
    },
    {
      level: 'T3', label: 'Supporting — do not skip', note: 'Complete coverage',
      systems: [
        { name: 'Oncology', key: 'Oncology' },
        { name: 'Reproductive', key: 'Reproductive' },
        { name: 'Eye & Ear', key: 'Eye' },
        { name: 'Perioperative', key: 'Perioperative' }
      ]
    }
  ];
  const rows = tiers.map(t => {
    const chips = t.systems.map(s =>
      `<span class="cf-ms-sys-chip" onclick="cfScrollToSection(this,'${s.key}')">${s.name}</span>`
    ).join('');
    return `<div class="cf-ms-tier cf-ms-tier-${t.level.slice(1)}">
      <div class="cf-ms-tier-head">
        <span class="cf-ms-tier-badge">${t.level}</span>
        <span class="cf-ms-tier-label">${t.label}</span>
        <span class="cf-ms-tier-note">${t.note}</span>
      </div>
      <div class="cf-ms-tier-body">
        <div class="cf-ms-system-list">${chips}</div>
      </div>
    </div>`;
  }).join('');
  return `<div class="cf-panel cf-panel-ms">
    <div class="cf-eyebrow">NCLEX Priority Matrix</div>
    <div class="cf-ms-rule">Pathophysiology → Manifestations → Nursing Priorities. Every disorder, every time.</div>
    <div class="cf-ms-matrix">${rows}</div>
  </div>`;
}

// ── Deutsch: Language Journey — redesigned ──────────────────────────────────
function deFeature(proj) {
  const levels = [
    { code:'A0', lbl:'Now', title:'Zero — absolute start', sub:'where you are',
      rows:['Alphabet, pronunciation, basic phonetics','Numbers, days, months, colours (50 words)','Tools: Duolingo daily + Nicos Weg episodes 1–10','Goal: understand 20 common words by ear']},
    { code:'A1', lbl:'Beginner', title:'Basic survival phrases', sub:'~6 months',
      rows:['~800 core vocab words (Grundwortschatz)','Present tense + Nominative & Accusative cases','Tools: Nicos Weg A1, Duolingo checkpoint 1','Milestone: introduce yourself, order food, ask directions']},
    { code:'A2', lbl:'Basic', title:'Simple daily life', sub:'~12 months',
      rows:['~1500 words, Dative case, modal verbs','Past tense (Perfekt) for common verbs','Tools: Nicos Weg A2, Deutsche Welle Top-Thema','Milestone: handle routine transactions, describe past events']},
    { code:'B1', lbl:'Intermediate', title:'Think in German', sub:'~2–3 years',
      rows:['~3000 words, Genitive, subordinate clauses, Konjunktiv II','Start reading simple news (tagesschau 100 Sekunden)','Tools: Anki frequency deck, German YouTube podcasts','Milestone: Goethe B1 — required for nursing registration in DE']},
    { code:'B2', lbl:'Gate', title:'The immigration threshold', sub:'~4+ years',
      rows:['~5000 words, complex grammar, nuanced expression','Medical German: anatomy terms, patient communication basics','Target: 2029–2030 at 15 min/day consistency','Milestone: Goethe B2 — minimum for nursing licensure in Germany']},
    { code:'✓', lbl:'Germany', title:'Arrived — practice in context', sub:'2031 target',
      rows:['C1 working-level German for clinical settings','Berufssprachkurs (occupational language course)','Pass Kenntnisprüfung (competency exam) in German','You made it. The 15 minutes were worth it.']}
  ];
  const total = levels.length;
  const nodes = levels.map((l,i) => {
    const isFirst = i === 0;
    const connector = i < total-1 ? `<div class="cf-de-connector" data-ci="${i}"></div>` : '';
    return `<div class="cf-de-node${isFirst?' de-current':''}" data-i="${i}" onclick="deSelectLevel(this,${i})">
      <div class="cf-de-dot">${l.code}</div>
      <div class="cf-de-lbl">${l.lbl}</div>
      ${connector}
    </div>`;
  }).join('');
  const panels = levels.map((l,i) => `
    <div class="cf-de-card-body${i===0?' active':''}" data-i="${i}">
      <div class="cf-de-card-rows">${l.rows.map(r=>`<div class="cf-de-card-row">${r}</div>`).join('')}</div>
    </div>`).join('');
  const firstL = levels[0];
  return `<div class="cf-panel cf-panel-de">
    <div class="cf-eyebrow">Deutsch — click any level to explore</div>
    <div class="cf-de-journey">
      <div class="cf-de-nodes">${nodes}</div>
    </div>
    <div class="cf-de-card">
      <div class="cf-de-card-head">
        <div class="cf-de-card-level" id="de-card-level">${firstL.code}</div>
        <div class="cf-de-card-meta">
          <div class="cf-de-card-title" id="de-card-title">${firstL.title}</div>
          <div class="cf-de-card-sub" id="de-card-sub">${firstL.sub}</div>
        </div>
      </div>
      ${panels}
    </div>
    <div class="cf-de-stats">
      <div class="cf-de-stat"><div class="cf-de-stat-val">15</div><div class="cf-de-stat-label">min/day min</div></div>
      <div class="cf-de-stat-div"></div>
      <div class="cf-de-stat"><div class="cf-de-stat-val">4+</div><div class="cf-de-stat-label">years to B2</div></div>
      <div class="cf-de-stat-div"></div>
      <div class="cf-de-stat"><div class="cf-de-stat-val">2031</div><div class="cf-de-stat-label">target</div></div>
    </div>
    <div class="cf-de-rule">Consistency beats intensity. 15 min daily for a year > 3-hour weekly cramming. Build the habit now, not the skill.</div>
  </div>`;
}

// ── Helper: scroll to checklist section by name ──────────────────────────────
function cfScrollToSection(el, sectionName) {
  // highlight the trigger (pill or chip)
  document.querySelectorAll('.cf-sys-pill, .cf-ms-sys-chip, .cf-ap-card').forEach(p => p.classList.remove('active'));
  if (el && el.classList) {
    if (el.classList.contains('cf-sys-pill') || el.classList.contains('cf-ms-sys-chip') || el.classList.contains('cf-ap-card')) {
      el.classList.add('active');
    }
  }
  // find matching section header
  const headers = document.querySelectorAll('#proj-sections .cl-section-title');
  const key = sectionName.toLowerCase().replace(/[^a-z]/g, '');
  let target = null;
  for (const h of headers) {
    const txt = h.textContent.toLowerCase().replace(/[^a-z]/g, '');
    if (txt.includes(key.slice(0,6)) || key.includes(txt.slice(0,6))) {
      target = h.closest('.cl-section');
      break;
    }
  }
  if (!target) return;
  // auto-open the section
  const body = target.querySelector('.cl-section-body');
  const chev = target.querySelector('.chevron');
  if (body && !body.classList.contains('open')) {
    body.classList.add('open');
    if (chev) chev.classList.add('open');
  }
  // highlight
  target.style.outline = '2px solid var(--course-color, var(--accent))';
  target.style.outlineOffset = '2px';
  setTimeout(() => { target.style.outline = ''; target.style.outlineOffset = ''; }, 2200);
  // scroll to it — offset by header height (60px) so it doesn\'t go under the nav
  const top = target.getBoundingClientRect().top + window.scrollY - 80;
  window.scrollTo({ top, behavior: 'smooth' });
}
function cfAdpieSelect(el, i) {
  document.querySelectorAll('.cf-adpie-node').forEach(n => delete n.dataset.active);
  document.querySelectorAll('.cf-adpie-desc').forEach(d => d.classList.remove('active'));
  el.dataset.active = 'true';
  document.querySelectorAll(`.cf-adpie-desc[data-i="${i}"]`).forEach(d => d.classList.add('active'));
}
function cfHttSelect(el, i) {
  document.querySelectorAll('.cf-htt-seg').forEach(s => delete s.dataset.active);
  document.querySelectorAll('.cf-htt-panel').forEach(p => p.classList.remove('active'));
  el.dataset.active = 'true';
  document.querySelectorAll(`.cf-htt-panel[data-i="${i}"]`).forEach(p => p.classList.add('active'));
}
function deSelectLevel(el, i) {
  const DE_META = [
    {code:'A0',title:'Zero — absolute start',sub:'where you are'},
    {code:'A1',title:'Basic survival phrases',sub:'~6 months'},
    {code:'A2',title:'Simple daily life',sub:'~12 months'},
    {code:'B1',title:'Think in German',sub:'~2–3 years'},
    {code:'B2',title:'The immigration threshold',sub:'~4+ years'},
    {code:'✓',title:'Arrived — practice in context',sub:'2031 target'}
  ];
  document.querySelectorAll('.cf-de-node').forEach((n, idx) => {
    n.classList.remove('de-current','de-past','de-selected');
    if (idx < i) n.classList.add('de-past');
  });
  el.classList.add('de-selected');
  document.querySelectorAll('.cf-de-connector').forEach((c, idx) => {
    c.classList.toggle('de-filled', idx < i);
  });
  const meta = DE_META[i] || {};
  const lvlEl = document.getElementById('de-card-level');
  const titleEl = document.getElementById('de-card-title');
  const subEl = document.getElementById('de-card-sub');
  if (lvlEl) lvlEl.textContent = meta.code || '';
  if (titleEl) titleEl.textContent = meta.title || '';
  if (subEl) subEl.textContent = meta.sub || '';
  document.querySelectorAll('.cf-de-card-body').forEach(p => p.classList.remove('active'));
  const panel = document.querySelector('.cf-de-card-body[data-i="' + i + '"]');
  if (panel) panel.classList.add('active');
}

// Patch showProject to also call buildCourseFeature
const _origShowProjectV20 = showProject;
showProject = function(projId) {
  _origShowProjectV20(projId);
  const feat = document.getElementById('proj-feature');
  if (feat) feat.innerHTML = '';
  const proj = projects.find(p => p.id === projId);
  if (proj) buildCourseFeature(proj);
};
// ─── v38: ADVANCED CONNECTION LAB ────────────────────────────────────────────
const CONN_KEY_V2 = 'viktor-conns-v2';
function getConnsV2(){ try{ return JSON.parse(localStorage.getItem(CONN_KEY_V2)||'[]'); }catch{ return []; } }
function saveConnsV2(arr){ localStorage.setItem(CONN_KEY_V2, JSON.stringify(arr)); }

// Course color map for badges
const CONN_COURSE_COLORS = {
  'A&P':             {bg:'rgba(42,122,90,.35)',  txt:'#6dd9a0'},
  'Fundamentals':    {bg:'rgba(90,58,138,.35)',  txt:'#c8a8ff'},
  'Health Assessment':{bg:'rgba(42,90,122,.35)', txt:'#64b9e6'},
  'Health Assess.':  {bg:'rgba(42,90,122,.35)',  txt:'#64b9e6'},
  'Pharmacology':    {bg:'rgba(138,32,32,.4)',   txt:'#ff9494'},
  'Med-Surg':        {bg:'rgba(42,58,122,.35)',  txt:'#8ca5ff'},
  'Microbiology':    {bg:'rgba(106,58,16,.4)',   txt:'#f0a060'},
  'Maternal':        {bg:'rgba(138,32,96,.4)',   txt:'#f090c0'},
  'Psych':           {bg:'rgba(42,74,106,.4)',   txt:'#80b8d8'},
  'German':          {bg:'rgba(184,136,42,.35)', txt:'#ffd24a'},
};
const CONN_TYPE_COLORS = {
  'Mechanism':   'rgba(100,217,160,.7)',
  'Drug Link':   'rgba(255,148,148,.7)',
  'Clinical Sign':'rgba(140,165,255,.7)',
  'Priority':    'rgba(255,200,80,.7)',
  'Vocab':       'rgba(150,220,255,.7)',
  'Warning':     'rgba(255,120,80,.7)',
};

var _connFilter = 'all';
function connSetFilter(f, btn){
  _connFilter = f;
  document.querySelectorAll('.conn-filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  connRenderV2();
}

function connAddV2(){
  var inp = document.getElementById('conn-input');
  var from = document.getElementById('conn-from');
  var to = document.getElementById('conn-to');
  var type = document.getElementById('conn-type');
  var text = inp ? inp.value.trim() : '';
  if(!text) return;
  var arr = getConnsV2();
  arr.unshift({
    id: Date.now().toString(36),
    chain: text,
    from: from ? from.value : '',
    to: to ? to.value : '',
    type: type ? type.value : 'Mechanism',
    starred: false,
    conf: 3,
    date: todayISO()
  });
  if(arr.length > 300) arr.pop();
  saveConnsV2(arr);
  if(inp) inp.value = '';
  connRenderV2();
  connUpdateStats();
  updateConnFab();
}

function connToggleStar(id){
  var arr = getConnsV2();
  var item = arr.find(c=>c.id===id);
  if(item){ item.starred = !item.starred; saveConnsV2(arr); connRenderV2(); connUpdateStats(); }
}
function connDeleteV2(id){
  var arr = getConnsV2().filter(c=>c.id!==id);
  saveConnsV2(arr);
  connRenderV2(); connUpdateStats(); updateConnFab();
}
function connSetConf(id, val){
  var arr = getConnsV2();
  var item = arr.find(c=>c.id===id);
  if(item){ item.conf=val; saveConnsV2(arr); connRenderV2(); }
}

function connRenderV2(){
  var cont = document.getElementById('conn-list');
  if(!cont) return;
  var arr = getConnsV2();

  // filter
  var filtered = arr.filter(function(c){
    if(_connFilter==='all') return true;
    if(_connFilter==='starred') return c.starred;
    return c.from===_connFilter || c.to===_connFilter;
  });

  if(!filtered.length){
    cont.innerHTML = '<div class="conn-empty">' + (_connFilter==='all' ? 'No chains yet. Add your first cross-subject connection above.' : 'No chains matching this filter.') + '</div>';
    return;
  }

  cont.innerHTML = filtered.map(function(c){
    var fromC = CONN_COURSE_COLORS[c.from]||{bg:'rgba(255,255,255,.1)',txt:'rgba(255,255,255,.6)'};
    var toC   = CONN_COURSE_COLORS[c.to]  ||{bg:'rgba(255,255,255,.1)',txt:'rgba(255,255,255,.6)'};
    var typeColor = CONN_TYPE_COLORS[c.type]||'rgba(255,255,255,.4)';
    var fromBadge = c.from ? '<span class="conn-item-from" style="background:'+fromC.bg+';color:'+fromC.txt+'">'+c.from+'</span>' : '';
    var toBadge   = c.to   ? '<span class="conn-item-to"   style="background:'+toC.bg  +';color:'+toC.txt  +'">'+c.to  +'</span>' : '';
    var arrow     = (c.from && c.to) ? '<span class="conn-item-arrow">→</span>' : '';
    var typeBadge = c.type ? '<span class="conn-item-type" style="color:'+typeColor+';border-color:'+typeColor.replace('.7)','.3)')+'">'+c.type+'</span>' : '';
    var starClass = c.starred ? 'on' : '';
    var dots = '';
    for(var i=1;i<=5;i++){
      dots += '<span class="conn-conf-dot'+(i<=c.conf?' filled':'')+'" onclick="connSetConf(\''+c.id+'\','+i+')" style="cursor:pointer" title="Set confidence '+i+'"></span>';
    }
    var dateShort = c.date ? c.date.slice(5) : '';
    return '<div class="conn-item'+(c.starred?' starred':'')+'">' +
      '<div class="conn-item-head">' +
        fromBadge + arrow + toBadge + typeBadge +
        '<button class="conn-item-star '+starClass+'" onclick="connToggleStar(\''+c.id+'\')" title="Star">⭐</button>' +
        '<button class="conn-item-del" onclick="connDeleteV2(\''+c.id+'\')" title="Delete">✕</button>' +
      '</div>' +
      '<div class="conn-chain-text">'+c.chain.replace(/</g,'&lt;')+'</div>' +
      '<div class="conn-item-foot">' +
        '<div class="conn-conf-dots" title="Click a dot to set confidence">'+dots+'</div>' +
        '<span style="font-family:var(--font-mono);font-size:8px;letter-spacing:.06em;color:rgba(255,255,255,.22);margin-left:6px">confidence</span>' +
        '<span class="conn-item-date">'+dateShort+'</span>' +
      '</div>' +
    '</div>';
  }).join('');
}

function connUpdateStats(){
  var arr = getConnsV2();
  var today = todayISO();
  var todayCount = arr.filter(c=>c.date===today).length;
  var starCount = arr.filter(c=>c.starred).length;
  var pairs = new Set();
  arr.forEach(c=>{ if(c.from) pairs.add(c.from); if(c.to) pairs.add(c.to); });
  var el = function(id){ return document.getElementById(id); };
  if(el('cstat-total')) el('cstat-total').textContent = arr.length;
  if(el('cstat-starred')) el('cstat-starred').textContent = starCount;
  if(el('cstat-today')) el('cstat-today').textContent = todayCount;
  if(el('cstat-pairs')) el('cstat-pairs').textContent = pairs.size;
}

function toggleConnOverlay(){
  var ov = document.getElementById('conn-overlay');
  if(!ov) return;
  var isOpen = ov.classList.contains('open');
  ov.classList.toggle('open', !isOpen);
  if(!isOpen){ connRenderV2(); connUpdateStats(); }
}
function updateConnFab(){
  var fab = document.getElementById('conn-fab');
  if(!fab) return;
  var arr = getConnsV2();
  fab.classList.toggle('has-entries', arr.length > 0);
  fab.title = arr.length > 0 ? 'Connection Lab — ' + arr.length + ' chain' + (arr.length===1?'':'s') : 'Connection Lab';
}
setTimeout(function(){ connRenderV2(); connUpdateStats(); updateConnFab(); }, 200);

// ─── v37: CHANGE 2 — Session Log dashboard panel ────────────────────────────
function slogDashAdd(){
  var inp = document.getElementById('slog-dash-inp');
  if(!inp || !inp.value.trim()) return;
  var log = getSessionLog();
  log.unshift({id: Date.now().toString(36), date: todayISO(), concept: inp.value.trim(), method: 'Active recall', conf: 3});
  if(log.length > 200) log.pop();
  saveSessionLog(log);
  inp.value = '';
  renderSlogDash();
  renderLiveStrip(); // update sessions count
}
function renderSlogDash(){
  var cont = document.getElementById('slog-dash-list');
  if(!cont) return;
  var log = getSessionLog();
  if(!log.length){
    cont.innerHTML = '<div class="slog-dash-empty">No sessions yet — log one below.</div>';
    return;
  }
  cont.innerHTML = log.slice(0,4).map(function(s){
    var dots = '';
    for(var i=0;i<5;i++) dots += '<span class="'+(i<s.conf?'filled':'')+'"></span>';
    var dateShort = s.date ? s.date.slice(5) : '—';
    return '<div class="slog-dash-item"><span class="slog-dash-date">'+dateShort+'</span><span class="slog-dash-concept">'+s.concept+'</span><span class="slog-dash-conf">'+dots+'</span></div>';
  }).join('');
}

// ─── v37: CHANGE 3 — Live strip ──────────────────────────────────────────────
function renderLiveStrip(){
  // Date
  var now = new Date();
  var dateEl = document.getElementById('live-date');
  var wdEl = document.getElementById('live-weekday');
  if(dateEl) dateEl.textContent = now.toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'});
  if(wdEl) wdEl.textContent = now.toLocaleDateString('en-PH',{weekday:'long'});

  // Streak
  var streakEl = document.getElementById('live-streak');
  if(streakEl) streakEl.textContent = computeCurrentStreak(getStreakData());

  // Days to enrollment
  var daysEl = document.getElementById('live-days');
  var daysSubEl = document.getElementById('live-days-sub');
  var target = new Date('2026-07-21');
  now.setHours(0,0,0,0);
  var diff = Math.ceil((target - now) / (1000*60*60*24));
  if(daysEl){
    if(diff > 0){ daysEl.textContent = diff; if(daysSubEl) daysSubEl.textContent = 'days until Jul 21'; }
    else if(diff === 0){ daysEl.textContent = '🎓'; if(daysSubEl) daysSubEl.textContent = 'First day!'; }
    else{ daysEl.textContent = '🎓'; if(daysSubEl) daysSubEl.textContent = 'You\'re in school!'; }
  }

  // Sessions this week
  var sessEl = document.getElementById('live-sessions');
  if(sessEl){
    var log = getSessionLog();
    var weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    var weekStart = weekAgo.getFullYear()+'-'+String(weekAgo.getMonth()+1).padStart(2,'0')+'-'+String(weekAgo.getDate()).padStart(2,'0');
    var count = log.filter(function(s){ return s.date >= weekStart; }).length;
    sessEl.textContent = count;
  }
}

// ─── v37: CHANGE 4 — Streak type coding ─────────────────────────────────────
var _streakActiveType = 'study';
function setStreakType(btn, type){
  _streakActiveType = type;
  document.querySelectorAll('.streak-type-btn').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
}

// Override getStreakData / saveStreakData to support typed entries
const STREAK_TYPED_KEY = 'viktor-streak-typed-v1';
function getStreakTyped(){ try{ return JSON.parse(localStorage.getItem(STREAK_TYPED_KEY)||'{}'); }catch{ return {}; } }
function saveStreakTyped(d){ localStorage.setItem(STREAK_TYPED_KEY, JSON.stringify(d)); }

// Override buildStreakGrid to show types
const _origBuildStreakGrid = buildStreakGrid;
buildStreakGrid = function(){
  var cont = document.getElementById('streak-grid');
  if(!cont) return;
  var data = getStreakData();
  var typed = getStreakTyped();
  var today = todayISO();
  cont.innerHTML = '';
  for(var i=27; i>=0; i--){
    var d = new Date(); d.setDate(d.getDate()-i);
    var iso = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    var dot = document.createElement('div');
    var isDone = data.includes(iso);
    var isToday = iso === today;
    var typeClass = isDone && typed[iso] ? ' type-'+typed[iso] : '';
    var isRecent = isDone && i<=6 && !isToday;
    dot.className = 'streak-dot'+(isDone?' done':'')+typeClass+(isToday&&isDone?' today-dot today':(isToday?' today':''))+(isRecent&&!typeClass?' recent':'');
    dot.title = iso + (typed[iso] ? ' · '+typed[iso] : '');
    dot.onclick = (function(isoVal){ return function(){ toggleStreakDayTyped(isoVal, this); }; })(iso);
    cont.appendChild(dot);
  }
  var cnt = document.getElementById('streak-count');
  if(cnt) cnt.textContent = computeCurrentStreak(data);
  renderLiveStrip();
};

function toggleStreakDayTyped(iso, dot){
  var data = getStreakData();
  var typed = getStreakTyped();
  if(data.includes(iso)){
    // If already this type, toggle off; else switch type
    if(typed[iso] === _streakActiveType){
      data = data.filter(function(d){ return d !== iso; });
      delete typed[iso];
      dot.classList.remove('done','type-study','type-german','type-light','today-dot');
    } else {
      typed[iso] = _streakActiveType;
      dot.className = dot.className.replace(/type-\w+/g,'');
      dot.classList.add('type-'+_streakActiveType);
    }
  } else {
    data.push(iso);
    typed[iso] = _streakActiveType;
    dot.classList.add('done','type-'+_streakActiveType);
  }
  saveStreakData(data);
  saveStreakTyped(typed);
  dot.title = iso + (typed[iso] ? ' · '+typed[iso] : '');
  var cnt = document.getElementById('streak-count');
  if(cnt) cnt.textContent = computeCurrentStreak(data);
  renderLiveStrip();
}

// ─── v37: Patch buildOverview to also refresh new components ─────────────────
const _origBuildOverviewV37 = buildOverview;
buildOverview = function(){
  _origBuildOverviewV37();
  renderLiveStrip();
  renderSlogDash();
};

// ─── v37: Patch logPomoSession to also refresh session log panel ──────────────
const _origLogPomoSession = logPomoSession;
logPomoSession = function(task){
  _origLogPomoSession(task);
  renderSlogDash();
  renderLiveStrip();
};

// ─── v37: Patch slogAddManual to also refresh dash panel ─────────────────────
const _origSlogAddManual = slogAddManual;
slogAddManual = function(){
  _origSlogAddManual();
  renderSlogDash();
  renderLiveStrip();
};

// Init
setTimeout(function(){ renderLiveStrip(); renderSlogDash(); updateConnFab(); }, 200);
;
