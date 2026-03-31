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
  return`<div class="chart-pills" style="margin:0 16px 12px">${tabsHTML}</div>
    <div class="modal-body">${items}</div>`;
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
