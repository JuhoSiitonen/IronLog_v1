// ═══════════════════════════════════════════════════════════════════
// TIMER MANAGEMENT (timestamp-based — survives phone sleep)
// ═══════════════════════════════════════════════════════════════════
function startElapsed(){
  clearInterval(A._elapsedInterval);
  A._elapsedInterval=setInterval(()=>{
    A.elapsed=Math.floor((Date.now()-A.sessionStart)/1000);
    const el=document.getElementById('elapsed-txt');
    if(el)el.textContent=`${t('block_label')} ${BLOCKS[A.blockIdx].id} · ${t('home_day')} ${A.activeDayId} · ${fmtTime(A.elapsed)}`;
  },1000);
}
function stopElapsed(){clearInterval(A._elapsedInterval);A.elapsed=0;}

function startRest(secs){
  if(!secs)return;
  clearInterval(A._restInterval);
  A._restEndTime=Date.now()+secs*1000;
  A.restTimer=secs;
  refreshRestBar();
  A._restInterval=setInterval(tickRest,250);
}
function tickRest(){
  const remaining=Math.ceil((A._restEndTime-Date.now())/1000);
  if(remaining>0){
    A.restTimer=remaining;
    refreshRestBar();
  }else{
    clearInterval(A._restInterval);
    A.restTimer=null;
    A._restEndTime=null;
    refreshRestBar();
  }
}
function skipRest(){clearInterval(A._restInterval);A.restTimer=null;A._restEndTime=null;refreshRestBar();}
function refreshRestBar(){
  const bar=document.getElementById('rest-bar');
  if(!bar)return;
  if(A.restTimer!==null&&A.restTimer>0){
    bar.classList.add('visible');
    const el=bar.querySelector('#rest-time');
    if(el)el.textContent=`${t('workout_rest')} · ${fmtTime(A.restTimer)}`;
  }else{
    bar.classList.remove('visible');
  }
}
// Sync timers when page becomes visible again (after phone sleep)
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible'){
    if(A._restEndTime)tickRest();
    if(A.sessionStart){
      A.elapsed=Math.floor((Date.now()-A.sessionStart)/1000);
      const el=document.getElementById('elapsed-txt');
      const blk=BLOCKS[A.blockIdx];
      if(el&&blk)el.textContent=`${t('block_label')} ${blk.id} · ${t('home_day')} ${A.activeDayId} · ${fmtTime(A.elapsed)}`;
    }
  }
});
