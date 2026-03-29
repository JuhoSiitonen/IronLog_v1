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
    const lw=getLastWeight(alt.id);
    const cls='swap-item'+(isActive?' active':inUse?' in-use':' available');
    const click=inUse||isActive?'':`onclick="doSwap('${esc(exId)}','${esc(muscle)}','${esc(alt.id)}')"`;
    const altName=t(alt.id)||esc(alt.name);
    const label=isActive?`✓ ${altName}`:altName;
    const status=isActive?`<div style="font-size:10px;color:#9090b0">${t('workout_current')}</div>`:inUse?`<div style="font-size:10px;color:#9090b0">${t('workout_in_use')}</div>`:'';
    const altCue=t('cue_'+alt.id)||esc(alt.cues);
    const cueRow=(!inUse&&!isActive)?`<div class="swap-cue">💡 ${altCue}</div>`:'';
    items+=`<div class="${cls}" ${click}>
      <div class="swap-row">
        <div>
          <div style="font-weight:700;font-size:14px;color:${isActive?'#d4a846':'#f2f0ea'}">${label}</div>
          <div style="font-size:11px;color:#9090b0;margin-top:2px">${alt.sets} ${t('workout_sets')} · ${alt.repRange[0]}–${alt.repRange[1]} ${t('workout_reps')}</div>
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
    repRange:libEx.repRange,
    cues:libEx.cues
  };
  swapExercise(oldId,newEx);
}
function closeSwap(){
  const m=document.getElementById('swap-modal');
  if(m)m.remove();
  A.swapTarget=null;
}
