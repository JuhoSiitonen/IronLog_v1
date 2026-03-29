// ═══════════════════════════════════════════════════════════════════
// HTML BUILDERS
// ═══════════════════════════════════════════════════════════════════
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

function buildSetRowHTML(ex,si,set){
  const repLabel=set.reps?set.reps:(ex.repRange[0]===ex.repRange[1]?`${ex.repRange[0]}`:`${ex.repRange[0]}–${ex.repRange[1]}`);
  const isPlaceholder=!set.reps;
  const isEditing=set.editing===true;

  // Set number cell
  const numCell=set.done&&!isEditing
    ?`<div class="set-num done">✓</div>`
    :`<div class="set-num">${si+1}</div>`;

  // Reps cell
  let repsCell;
  if(!set.done||isEditing){
    const cls='rep-btn'+(isPlaceholder?'':' has-val')+(isEditing?' editing':'');
    repsCell=`<button id="rep-btn-${ex.id}-${si}" class="${cls}" onclick="cycleReps('${ex.id}',${si},[${ex.repRange}])">${repLabel}</button>`;
  }else{
    repsCell=`<div class="rep-display">${esc(set.reps)}</div>`;
  }

  // KG cell
  let kgCell;
  if(!set.done||isEditing){
    const cls='kg-inp'+(isEditing?' editing':'');
    kgCell=`<input id="kg-inp-${ex.id}-${si}" class="${cls}" type="number" placeholder="kg" value="${esc(set.weight)}"
      oninput="updateKg('${ex.id}',${si},this.value)">`;
  }else{
    kgCell=`<div class="kg-display">${esc(set.weight)}kg</div>`;
  }

  // Action cell
  let actionCell;
  if(isEditing){
    const dim=set.reps?'':'dim';
    actionCell=`<button id="chk-btn-${ex.id}-${si}" class="btn-check ${dim}" onclick="saveEdit('${ex.id}',${si})" ${set.reps?'':'disabled'}>✓</button>`;
  }else if(!set.done){
    const dim=set.reps?'':'dim';
    actionCell=`<button id="chk-btn-${ex.id}-${si}" class="btn-check ${dim}" onclick="markSetDone('${ex.id}',${si})" ${set.reps?'':'disabled'}>✓</button>`;
  }else{
    // Done — double-tap emoji to enter edit mode
    // Use a tap counter approach for mobile double-tap
    actionCell=`<button class="btn-emoji" id="emoji-btn-${ex.id}-${si}" onclick="handleEmojiTap('${ex.id}',${si})">💪🏻</button>`;
  }

  return`${numCell}${repsCell}${kgCell}${actionCell}`;
}

function bindSetRowEvents(ex,idx){
  // kg input — bind imperatively since we can't use oninput with escaped IDs safely
  const kgEl=document.getElementById(`kg-inp-${ex.id}-${idx}`);
  if(kgEl){
    kgEl.oninput=function(){updateKg(ex.id,idx,this.value);};
  }
}

// Double-tap detection for emoji button
const _tapTimers={};
function handleEmojiTap(exId,idx){
  const key=`${exId}-${idx}`;
  if(_tapTimers[key]){
    clearTimeout(_tapTimers[key]);
    delete _tapTimers[key];
    enterEditMode(exId,idx);
  }else{
    _tapTimers[key]=setTimeout(()=>{delete _tapTimers[key];},350);
  }
}

function buildExerciseCard(ex,ei){
  const sets=A.sessionSets[ex.id]||[];
  const exDone=sets.length>0&&sets.every(s=>s.done);
  const bump=shouldIncrease(ex.id,ex.repRange[1],ex.libId);
  const prev=getExerciseHistory(ex.id,ex.libId);
  const lastS=prev.length?prev[prev.length-1]:null;
  const wts=lastS?lastS.sets.map(s=>parseFloat(s.weight)||0).filter(w=>w>0):[];
  const lastW=wts.length?Math.max(...wts):0;
  const lastR=lastS&&lastS.sets.length?Math.round(lastS.sets.reduce((a,s)=>a+(parseInt(s.reps)||0),0)/lastS.sets.length):0;

  const bumpBadge=bump&&!exDone?`<span class="badge" style="background:#d4a84622;color:#d4a846">${t('workout_load')}</span>`:'';
  const swapBtn=exDone?'':`<button class="btn-swap" onclick="openSwap('${ex.id}','${ex.muscle}')">${t('workout_swap')}</button>`;
  const doneIcon=exDone?'<span style="color:#d4a846">✓ </span>':'';
  const cueText=t('cue_'+(ex.libId||''))||esc(ex.cues);
  const lastInfo=lastW>0
    ?`<div class="last-info">${t('workout_last')} <span style="color:#f2f0ea;font-weight:600">${lastW}kg × ~${lastR} ${t('workout_reps')}</span>${bump?` <span style="color:#d4a846;font-weight:700">${t('workout_try')} ${Math.round(lastW*1.025*2)/2}kg</span>`:''}</div>`
    :'';

  let setsHTML='';
  sets.forEach((set,si)=>{
    setsHTML+=`<div id="set-row-${ex.id}-${si}" class="set-grid">${buildSetRowHTML(ex,si,set)}</div>`;
  });

  return`
  <div class="card ex-card" style="animation-delay:${ei*0.04}s;opacity:${exDone?0.45:1}" id="ex-card-${ex.id}">
    <div class="ex-header">
      <div class="ex-title-area">
        <div class="ex-title">${doneIcon}${ex.ms?`<a href="https://www.muscleandstrength.com/exercises/${ex.ms}.html" target="_blank" rel="noopener" class="ex-name-link">${esc(t(ex.libId||ex.name))} <span class="ex-video-icon">▶</span></a>`:esc(t(ex.libId||ex.name))}<span class="mtag">${esc(t('muscle_'+ex.muscle))}</span></div>
        <div class="ex-meta">${ex.sets} ${t('workout_sets')} · ${ex.repRange[0]}–${ex.repRange[1]} ${t('workout_reps')}</div>
      </div>
      <div class="ex-actions">${bumpBadge}${swapBtn}</div>
    </div>
    <div class="cue-box">💡 ${cueText}</div>
    ${lastInfo}
    <div class="set-col-hdr"><span>${t('workout_col_set')}</span><span>${t('workout_col_reps')}</span><span>${t('workout_col_kg')}</span><span></span></div>
    <div class="hint-text">${t('workout_hint_edit')}</div>
    ${setsHTML}
  </div>`;
}
