// ═══════════════════════════════════════════════════════════════════
// STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════════
// Sessions needed per block = frequency × 2 (roughly 2 weeks of training)
function sessionsPerBlock(){
  const p=getProfile();
  return p?(p.freq*2):6;
}
function initAndGetBlockIdx(){
  if(!BLOCKS.length)return 0;
  const saved=ls.get(SK.blockIdx);
  if(saved!==null&&saved>=0&&saved<BLOCKS.length)return saved;
  ls.set(SK.blockIdx,0);
  return 0;
}
function getBlockSessionCount(){
  const idx=initAndGetBlockIdx();
  if(!BLOCKS.length)return 0;
  const blockId=BLOCKS[idx].id;
  // Count sessions done in current block (by matching blockId)
  return A.history.filter(h=>h.blockId===blockId).length;
}
function getSessionsUntilSwap(){
  return Math.max(0,sessionsPerBlock()-getBlockSessionCount());
}
function advanceBlockIfNeeded(){
  if(!BLOCKS.length)return 0;
  if(getBlockSessionCount()>=sessionsPerBlock()){
    const next=(initAndGetBlockIdx()+1)%BLOCKS.length;
    ls.set(SK.blockIdx,next);
    return next;
  }
  return initAndGetBlockIdx();
}
function getNextDayId(){return ls.get(SK.nextDay)||"A";}
function advanceCustomProgram(){
  const prog=getCustomProgram();
  if(!prog||!prog.workouts.length)return;
  prog.sessionsDone=(prog.sessionsDone||0)+1;
  const entry=prog.workouts[prog.currentIdx%prog.workouts.length];
  if(prog.sessionsDone>=entry.sessions){
    prog.currentIdx=(prog.currentIdx+1)%prog.workouts.length;
    prog.sessionsDone=0;
  }
  saveCustomProgramToLS(prog);
}
function getHistory(){return ls.get(SK.history)||[];}
function getLastWeight(id){const w=(ls.get(SK.weights)||{})[id];return w!==undefined?w:null;}
function saveWeight(id,w,libId){const ws=ls.get(SK.weights)||{};ws[id]=w;if(libId)ws[libId]=w;ls.set(SK.weights,ws);}
function advanceDay(cur){
  const p=getProfile();
  const dayIds=BLOCKS.length>0?BLOCKS[0].days.map(d=>d.id):["A","B","C"];
  const idx=dayIds.indexOf(cur);
  ls.set(SK.nextDay,dayIds[(idx+1)%dayIds.length]);
}
function getExerciseHistory(id,libId){
  return getHistory().map(s=>s.exercises&&s.exercises.find(e=>e.id===id||(libId&&e.libId===libId))).filter(Boolean).slice(-5);
}
function shouldIncrease(id,topRep,libId){
  const h=getExerciseHistory(id,libId);
  return h.length>0&&h[h.length-1].sets.every(s=>parseInt(s.reps)>=topRep);
}
function getExercisesWithHistory(){
  const seen=new Map();
  A.history.forEach(s=>{
    (s.exercises||[]).forEach(ex=>{
      if(!ex.libId||seen.has(ex.libId))return;
      if((ex.sets||[]).some(st=>parseFloat(st.weight)>0))seen.set(ex.libId,true);
    });
  });
  return[...seen.keys()];
}
function getProgressData(libId){
  const points=[];
  let isTime=false;
  A.history.forEach(s=>{
    const ex=(s.exercises||[]).find(e=>e.libId===libId);
    if(!ex)return;
    const wts=(ex.sets||[]).map(st=>parseFloat(st.weight)||0).filter(w=>w>0);
    if(wts.length){
      points.push({date:s.date,max:Math.max(...wts)});
      return;
    }
    const secs=(ex.sets||[]).map(st=>parseFloat(st.secs)||0).filter(v=>v>0);
    if(secs.length){isTime=true;points.push({date:s.date,max:Math.max(...secs)});}
  });
  points.isTime=isTime;
  return points;
}
function renderProgressChart(libId){
  const data=getProgressData(libId);
  if(!data.length)return`<div style="text-align:center;color:#9090b0;font-size:13px;padding:20px 0">${t('chart_no_data')}</div>`;
  const unit=data.isTime?'s':'kg';
  const W=390,H=200,ml=45,mr=15,mt=15,mb=30;
  const pw=W-ml-mr,ph=H-mt-mb;
  if(data.length===1){
    const cx=ml+pw/2,cy=mt+ph/2;
    return`<svg viewBox="0 0 ${W} ${H}" width="100%" height="200" style="display:block">
      <circle cx="${cx}" cy="${cy}" r="5" fill="#d4a846"/>
      <text x="${cx}" y="${cy-14}" text-anchor="middle" fill="#f2f0ea" font-size="14" font-weight="700">${data[0].max}${unit}</text>
      <text x="${cx}" y="${cy+20}" text-anchor="middle" fill="#9090b0" font-size="10">${fmtDate(data[0].date)}</text>
    </svg>`;
  }
  const maxes=data.map(d=>d.max);
  let yMin=Math.min(...maxes),yMax=Math.max(...maxes);
  if(yMax-yMin<5){const mid=(yMin+yMax)/2;yMin=mid-2.5;yMax=mid+2.5;}
  yMin=Math.floor(yMin/5)*5;yMax=Math.ceil(yMax/5)*5;
  if(yMax<=yMin)yMax=yMin+5;
  const yRange=yMax-yMin;
  function x(i){return ml+(i/(data.length-1))*pw;}
  function y(v){return mt+ph-(((v-yMin)/yRange)*ph);}
  const pts=data.map((d,i)=>`${x(i).toFixed(1)},${y(d.max).toFixed(1)}`);
  const line=pts.join(' ');
  const area=`${pts.join(' ')} ${x(data.length-1).toFixed(1)},${(mt+ph).toFixed(1)} ${ml.toFixed(1)},${(mt+ph).toFixed(1)}`;
  // Y-axis: 4-5 ticks
  const tickCount=4;
  let gridLines='',yLabels='';
  for(let i=0;i<=tickCount;i++){
    const val=yMin+(yRange*i/tickCount);
    const yy=y(val);
    gridLines+=`<line x1="${ml}" y1="${yy.toFixed(1)}" x2="${W-mr}" y2="${yy.toFixed(1)}" stroke="#1c1c2e" stroke-dasharray="4,4"/>`;
    yLabels+=`<text x="${ml-6}" y="${(yy+3).toFixed(1)}" text-anchor="end" fill="#9090b0" font-size="10">${Math.round(val)}${unit}</text>`;
  }
  // X-axis: max 6 labels
  let xLabels='';
  const maxLabels=Math.min(6,data.length);
  const step=Math.max(1,Math.floor((data.length-1)/(maxLabels-1)));
  for(let i=0;i<data.length;i+=step){
    xLabels+=`<text x="${x(i).toFixed(1)}" y="${H-4}" text-anchor="middle" fill="#9090b0" font-size="9">${fmtDate(data[i].date)}</text>`;
  }
  if((data.length-1)%step!==0){
    xLabels+=`<text x="${x(data.length-1).toFixed(1)}" y="${H-4}" text-anchor="middle" fill="#9090b0" font-size="9">${fmtDate(data[data.length-1].date)}</text>`;
  }
  const dots=data.map((d,i)=>`<circle cx="${x(i).toFixed(1)}" cy="${y(d.max).toFixed(1)}" r="3.5" fill="#d4a846" stroke="#10101a" stroke-width="2"/>`).join('');
  return`<svg viewBox="0 0 ${W} ${H}" width="100%" height="200" style="display:block">
    <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d4a846" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#d4a846" stop-opacity="0"/>
    </linearGradient></defs>
    ${gridLines}
    <polygon points="${area}" fill="url(#cg)"/>
    <polyline points="${line}" fill="none" stroke="#d4a846" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}
    ${yLabels}
    ${xLabels}
  </svg>`;
}
function isThisISOWeek(dateStr){
  const d=new Date(dateStr),now=new Date();
  const day=now.getDay();
  const mon=new Date(now);
  mon.setDate(now.getDate()+(day===0?-6:1-day));
  mon.setHours(0,0,0,0);
  return d>=mon;
}
function fmtTime(s){return`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}
function fmtDate(iso){return new Date(iso).toLocaleDateString(getLang()==='fi'?'fi-FI':'en-GB',{day:'numeric',month:'short'});}
function today(){return new Date().toLocaleDateString(getLang()==='fi'?'fi-FI':'en-GB',{weekday:'short',day:'numeric',month:'short'});}

// ═══════════════════════════════════════════════════════════════════
// APP STATE  (single mutable object — we call render() after changes)
// ═══════════════════════════════════════════════════════════════════
const A={
  view:"home",
  blockIdx:initAndGetBlockIdx(),
  activeDayId:getNextDayId(),
  previewBlockIdx:initAndGetBlockIdx(),
  history:getHistory(),
  // Workout session
  sessionExercises:[],
  sessionSets:{},      // {exId:[{reps,weight,done,editing}]}
  sessionStart:null,
  elapsed:0,
  restTimer:null,
  completedSession:null,
  swapTarget:null,
  _addExMuscle:null,
  isCustomSession:false,
  isCustomProgramSession:false,
  // Custom workout builder
  customExercises:[],  // [{libId,muscle,sets,repRange,type,holdSec}]
  customMuscle:null,
  customTab:'build',
  customWorkoutName:'',
  savedWorkouts:getSavedWorkouts(),
  // History/chart
  chartExercise:null,
  _openSessions:new Set(),
  // Internal timers
  _elapsedInterval:null,
  _restInterval:null,
  _restEndTime:null,
};
