// ═══════════════════════════════════════════════════════════════════
// SWAP MODAL
// ═══════════════════════════════════════════════════════════════════
function openSwap(exId,muscle){
  A.swapTarget={exId,muscle};
  const alts=LIBRARY[muscle]||[];
  // Current session exercise IDs (to detect "in use")
  const currentIds=A.sessionExercises.map(e=>e.libId||e.id);
  const currentEx=A.sessionExercises.find(e=>e.id===exId);
  const currentLibId=currentEx?(currentEx.libId||currentEx.id):'';
  let items='';
  alts.forEach(alt=>{
    const isActive=alt.id===currentLibId;
    const inUse=!isActive&&currentIds.includes(alt.id);
    const lw=alt.type==='time'?null:getLastWeight(alt.id);
    const cls='swap-item'+(isActive?' active':inUse?' in-use':' available');
    const click=inUse||isActive?'':`onclick="doSwap('${esc(exId)}','${esc(muscle)}','${esc(alt.id)}')"`;
    const altName=t(alt.id)||esc(alt.name);
    const label=isActive?`✓ ${altName}`:altName;
    const status=isActive?`<div style="font-size:10px;color:#9090b0">${t('workout_current')}</div>`:inUse?`<div style="font-size:10px;color:#9090b0">${t('workout_in_use')}</div>`:'';
    const altCue=t('cue_'+alt.id)||esc(alt.cues);
    const cueRow=(!inUse&&!isActive)?`<div class="swap-cue">💡 ${altCue}</div>`:'';
    const metaLine=alt.type==='time'
      ?`${alt.sets} ${t('workout_sets')} · ${alt.holdSec}${t('workout_sec')} ${t('workout_col_time').toLowerCase()}`
      :`${alt.sets} ${t('workout_sets')} · ${alt.repRange[0]}–${alt.repRange[1]} ${t('workout_reps')}`;
    items+=`<div class="${cls}" ${click}>
      <div class="swap-row">
        <div>
          <div style="font-weight:700;font-size:14px;color:${isActive?'#d4a846':'#f2f0ea'}">${label}</div>
          <div style="font-size:11px;color:#9090b0;margin-top:2px">${metaLine}</div>
        </div>
        <div style="text-align:right">${lw?`<div style="font-size:12px;font-weight:700;color:#d4a846">${lw}kg</div>`:''}${status}</div>
      </div>${cueRow}
    </div>`;
  });
  const modal=document.createElement('div');
  modal.className='modal-overlay';
  modal.id='swap-modal';
  modal.innerHTML=`
    <div class="modal-sheet">
      <div class="modal-hdr">
        <div>
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:20px">${t('workout_swap_title')}</div>
          <div style="font-size:12px;color:#9090b0;margin-top:2px">${t('workout_muscle')} <span style="color:#d4a846;font-weight:700">${esc(t('muscle_'+muscle))}</span></div>
        </div>
        <button class="btn-back" style="width:44px;height:44px;font-size:20px;display:flex;align-items:center;justify-content:center" onclick="closeSwap()">✕</button>
      </div>
      <div class="modal-body">${items}</div>
    </div>`;
  document.body.appendChild(modal);
}
// Swap handler: builds a proper session exercise from library entry
function doSwap(oldId,muscle,libId){
  const libEx=LIBRARY[muscle].find(x=>x.id===libId);
  if(!libEx)return;
  const oldEx=A.sessionExercises.find(e=>e.id===oldId);
  // Build a new exercise with a unique session ID
  const bn=oldId.match(/^b(\d+)/);
  const blockNum=bn?bn[1]:'0';
  const newEx={
    id:`b${blockNum}_${libId.replace('lib_','')}`,
    libId:libId,
    name:libEx.name,
    muscle:muscle,
    sets:libEx.sets,
    repRange:libEx.repRange||[0,0],
    type:libEx.type||null,
    holdSec:libEx.holdSec||null,
    cues:libEx.cues,
    ms:libEx.ms||null
  };
  swapExercise(oldId,newEx);
}
function closeSwap(){
  const m=document.getElementById('swap-modal');
  if(m)m.remove();
  A.swapTarget=null;
}

// ═══════════════════════════════════════════════════════════════════
// ADD EXERCISE MODAL
// ═══════════════════════════════════════════════════════════════════
function openAddExercise(){
  const muscles=Object.keys(LIBRARY);
  if(!A._addExMuscle||!LIBRARY[A._addExMuscle])A._addExMuscle=muscles[0];
  const modal=document.createElement('div');
  modal.className='modal-overlay';
  modal.id='add-ex-modal';
  modal.innerHTML=`
    <div class="modal-sheet">
      <div class="modal-hdr">
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:20px">${t('workout_add_ex_title')}</div>
        <button class="btn-back" style="width:44px;height:44px;font-size:20px;display:flex;align-items:center;justify-content:center" onclick="closeAddExercise()">✕</button>
      </div>
      <div id="add-ex-body">${_renderAddExBody()}</div>
    </div>`;
  document.body.appendChild(modal);
}

function _renderAddExBody(){
  const muscles=Object.keys(LIBRARY);
  const muscle=A._addExMuscle||muscles[0];
  const currentIds=new Set(A.sessionExercises.map(e=>e.libId||e.id));
  const tabsHTML=muscles.map(m=>
    `<button class="chart-pill${muscle===m?' active':''}" onclick="_switchAddExMuscle('${m}')">${esc(t('muscle_'+m))}</button>`
  ).join('');
  const items=(LIBRARY[muscle]||[]).map(ex=>{
    const inUse=currentIds.has(ex.id);
    const lw=ex.type==='time'?null:getLastWeight(ex.id);
    const meta=ex.type==='time'
      ?`${ex.sets} ${t('workout_sets')} · ${ex.holdSec}${t('workout_sec')} ${t('workout_col_time').toLowerCase()}`
      :`${ex.sets} ${t('workout_sets')} · ${ex.repRange[0]}–${ex.repRange[1]} ${t('workout_reps')}`;
    const cue=t('cue_'+ex.id)||esc(ex.cues);
    return`<div class="swap-item${inUse?' in-use':' available'}" ${inUse?'':` onclick="addExerciseToSession('${esc(ex.id)}')"` }>
      <div class="swap-row">
        <div>
          <div style="font-weight:700;font-size:14px;color:#f2f0ea">${esc(t(ex.id)||ex.name)}</div>
          <div style="font-size:11px;color:#9090b0;margin-top:2px">${meta}</div>
        </div>
        <div style="text-align:right">
          ${lw?`<div style="font-size:12px;font-weight:700;color:#d4a846">${lw}kg</div>`:''}
          ${inUse?`<div style="font-size:10px;color:#9090b0">${t('workout_in_use')}</div>`:''}
        </div>
      </div>
      ${!inUse?`<div class="swap-cue">💡 ${cue}</div>`:''}
    </div>`;
  }).join('');
  const createBtn=`<div style="padding:12px 16px;border-top:1px solid #1c1c2e">
    <button class="btn-ghost" style="width:100%;color:#d4a846;border-color:#d4a84644" onclick="openCreateExercise()">+ ${t('custom_ex_create')}</button>
  </div>`;
  return`<div class="chart-pills" style="margin:0 16px 12px">${tabsHTML}</div>
    <div class="modal-body">${items}</div>
    ${createBtn}`;
}

function _switchAddExMuscle(muscle){
  A._addExMuscle=muscle;
  const body=document.getElementById('add-ex-body');
  if(body)body.innerHTML=_renderAddExBody();
}

function closeAddExercise(){
  const m=document.getElementById('add-ex-modal');
  if(m)m.remove();
}

// ═══════════════════════════════════════════════════════════════════
// CREATE CUSTOM EXERCISE MODAL
// ═══════════════════════════════════════════════════════════════════
let _cexType='reps';

function openCreateExercise(){
  _cexType='reps';
  const muscles=Object.keys(LIBRARY);
  const ns='width:68px;padding:6px 8px;background:#0e0e1a;border:1px solid #1c1c2e;border-radius:8px;color:#f2f0ea;font-size:14px;text-align:center';
  const is='width:100%;box-sizing:border-box;background:transparent;border:none;color:#f2f0ea;font-size:15px;outline:none;font-family:inherit';
  const muscleOpts=muscles.map(m=>`<option value="${esc(m)}">${esc(t('muscle_'+m))}</option>`).join('');
  const modal=document.createElement('div');
  modal.className='modal-overlay';
  modal.id='create-ex-modal';
  modal.innerHTML=`
    <div class="modal-sheet">
      <div class="modal-hdr">
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:20px">${t('custom_ex_create')}</div>
        <button class="btn-back" style="width:44px;height:44px;font-size:20px;display:flex;align-items:center;justify-content:center" onclick="closeCreateExercise()">✕</button>
      </div>
      <div class="modal-body" style="padding:4px 16px 24px">
        <div class="sec-title">${t('custom_ex_name')} *</div>
        <div class="card" style="padding:10px 14px;margin-bottom:14px">
          <input id="cex-name" type="text" placeholder="${t('custom_ex_name_placeholder')}" style="${is}">
        </div>
        <div class="sec-title">${t('custom_ex_muscle')} *</div>
        <div class="card" style="padding:8px 14px;margin-bottom:14px">
          <select id="cex-muscle" style="width:100%;background:#10101a;border:none;color:#f2f0ea;font-size:14px;padding:4px 0;outline:none">${muscleOpts}</select>
        </div>
        <div class="sec-title">${t('custom_ex_type')}</div>
        <div style="display:flex;gap:8px;margin-bottom:14px">
          <button id="cex-type-reps" class="btn-primary" style="flex:1" onclick="_cexSetType('reps')">${t('custom_ex_type_reps')}</button>
          <button id="cex-type-time" class="btn-ghost" style="flex:1" onclick="_cexSetType('time')">${t('custom_ex_type_time')}</button>
        </div>
        <div id="cex-reps-section">
          <div style="display:flex;gap:12px;margin-bottom:14px;align-items:flex-end">
            <div>
              <div class="sec-title">${t('custom_ex_sets')}</div>
              <input id="cex-sets" type="number" min="1" max="10" value="3" style="${ns}">
            </div>
            <div style="flex:1">
              <div class="sec-title">${t('custom_ex_rep_range')}</div>
              <div style="display:flex;align-items:center;gap:8px">
                <input id="cex-rep-lo" type="number" min="1" max="50" value="8" style="${ns}">
                <span style="color:#9090b0">–</span>
                <input id="cex-rep-hi" type="number" min="1" max="50" value="12" style="${ns}">
              </div>
            </div>
          </div>
        </div>
        <div id="cex-time-section" style="display:none">
          <div style="display:flex;gap:12px;margin-bottom:14px;align-items:flex-end">
            <div>
              <div class="sec-title">${t('custom_ex_sets')}</div>
              <input id="cex-sets-time" type="number" min="1" max="10" value="3" style="${ns}">
            </div>
            <div>
              <div class="sec-title">${t('custom_ex_hold')}</div>
              <input id="cex-hold" type="number" min="1" max="300" value="30" style="${ns}">
            </div>
          </div>
        </div>
        <div class="sec-title">${t('custom_ex_cues')}</div>
        <div class="card" style="padding:10px 14px;margin-bottom:14px">
          <textarea id="cex-cues" placeholder="${t('custom_ex_cues_placeholder')}" style="${is};resize:none;min-height:56px;line-height:1.5"></textarea>
        </div>
        <div class="sec-title">${t('custom_ex_url')}</div>
        <div class="card" style="padding:10px 14px;margin-bottom:20px">
          <input id="cex-url" type="url" placeholder="${t('custom_ex_url_placeholder')}" style="${is}">
        </div>
        <button class="btn-primary" onclick="saveCustomExercise()">${t('custom_ex_save')}</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

function _cexSetType(type){
  _cexType=type;
  const rb=document.getElementById('cex-type-reps');
  const tb=document.getElementById('cex-type-time');
  if(rb)rb.className=type==='reps'?'btn-primary':'btn-ghost';
  if(tb)tb.className=type==='time'?'btn-primary':'btn-ghost';
  const rs=document.getElementById('cex-reps-section');
  const ts=document.getElementById('cex-time-section');
  if(rs)rs.style.display=type==='reps'?'':'none';
  if(ts)ts.style.display=type==='time'?'':'none';
}

function saveCustomExercise(){
  const name=(document.getElementById('cex-name').value||'').trim();
  const muscle=document.getElementById('cex-muscle').value;
  if(!name||!muscle)return;
  const cues=(document.getElementById('cex-cues').value||'').trim();
  const rawUrl=(document.getElementById('cex-url').value||'').trim();
  const url=/^https?:\/\/.+/.test(rawUrl)?rawUrl:'';
  let sets,repRange,holdSec,type=_cexType;
  if(type==='reps'){
    sets=Math.max(1,Math.min(10,parseInt(document.getElementById('cex-sets').value)||3));
    const lo=Math.max(1,parseInt(document.getElementById('cex-rep-lo').value)||8);
    const hi=Math.max(lo,parseInt(document.getElementById('cex-rep-hi').value)||12);
    repRange=[lo,hi];holdSec=null;
  }else{
    type='time';
    sets=Math.max(1,Math.min(10,parseInt(document.getElementById('cex-sets-time').value)||3));
    holdSec=Math.max(1,parseInt(document.getElementById('cex-hold').value)||30);
    repRange=[0,0];
  }
  const ex={id:'custom_'+Date.now(),name,muscle,type,sets,repRange,holdSec,cues,url,custom:true};
  const lib=getCustomExLibrary();
  lib.push(ex);
  saveCustomExLibrary(lib);
  if(LIBRARY[muscle]&&!LIBRARY[muscle].find(e=>e.id===ex.id))LIBRARY[muscle].push(ex);
  Object.values(T).forEach(lang=>{lang[ex.id]=ex.name;if(ex.cues)lang['cue_'+ex.id]=ex.cues;});
  closeCreateExercise();
  // Refresh add-ex modal if open (creating during a workout), else full re-render
  const addExBody=document.getElementById('add-ex-body');
  if(addExBody){A._addExMuscle=ex.muscle;addExBody.innerHTML=_renderAddExBody();}
  else render();
}

function closeCreateExercise(){
  const m=document.getElementById('create-ex-modal');
  if(m)m.remove();
}

function deleteCustomExercise(id){
  if(!confirm(t('custom_ex_delete_confirm')))return;
  saveCustomExLibrary(getCustomExLibrary().filter(e=>e.id!==id));
  Object.keys(LIBRARY).forEach(m=>{LIBRARY[m]=LIBRARY[m].filter(e=>e.id!==id);});
  Object.values(T).forEach(lang=>{delete lang[id];delete lang['cue_'+id];});
  render();
}
