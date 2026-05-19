(function(){
  if(window.__rebReadinessHabitsLoaded)return;
  window.__rebReadinessHabitsLoaded=true;

  function byId(id){return document.getElementById(id);}
  function num(v,fallback){var n=parseFloat(v);return isFinite(n)?n:(fallback||0);}
  function getWeek(){return window.dash&&typeof dash.week==='number'?dash.week:0;}
  function getDay(){return window.dash&&typeof dash.day==='number'?dash.day:0;}
  function dKey(w,d){return 'w'+w+'d'+d;}
  function save(){
    try{if(typeof saveAllLogs==='function')saveAllLogs();}catch(e){}
  }
  function rerender(){
    try{
      var app=byId('app');
      if(app&&typeof renderDashboard==='function'&&window.allWeeks&&allWeeks.length)renderDashboard(app);
    }catch(e){}
  }

  var css=[
    '.readiness-card,.streak-card{background:linear-gradient(135deg,rgba(13,31,57,.98),rgba(5,10,20,.98));border:1px solid rgba(126,152,188,.24);border-radius:18px;padding:16px;margin:16px 0;box-shadow:0 18px 40px rgba(0,0,0,.18)}',
    '.readiness-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:14px}.readiness-kicker,.streak-kicker{font-size:10px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:var(--steel3,#7E98BC)}.readiness-title,.streak-title{font-size:18px;font-weight:900;color:var(--white,#F0F4FF);margin-top:4px}.readiness-copy{font-size:12px;line-height:1.5;color:var(--muted,#89A2C2);margin-top:5px}',
    '.readiness-score{min-width:88px;text-align:center;border-radius:16px;padding:10px;background:rgba(78,204,163,.08);border:1px solid rgba(78,204,163,.22)}.readiness-score.warn{background:rgba(201,169,110,.08);border-color:rgba(201,169,110,.28)}.readiness-score.low{background:rgba(255,107,107,.08);border-color:rgba(255,107,107,.24)}.readiness-score b{display:block;font-size:26px;line-height:1;color:var(--white,#F0F4FF)}.readiness-score span{display:block;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.08em;color:#4ECCA3;margin-top:5px}.readiness-score.warn span{color:#C9A96E}.readiness-score.low span{color:#FF8A8A}',
    '.readiness-grid,.streak-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0}.readiness-stat,.streak-item{border-radius:14px;background:rgba(5,8,15,.34);border:1px solid rgba(126,152,188,.14);padding:11px}.readiness-stat-val,.streak-val{font-size:16px;font-weight:900;color:var(--white,#F0F4FF)}.readiness-stat-lbl,.streak-lbl{font-size:10px;color:var(--muted,#89A2C2);margin-top:4px;line-height:1.35}',
    '.readiness-actions{display:grid;gap:8px;margin-top:12px}.readiness-action{display:grid;grid-template-columns:10px 1fr;gap:10px;padding:11px;border-radius:14px;background:rgba(5,8,15,.28);border:1px solid rgba(126,152,188,.13)}.readiness-dot{width:9px;height:9px;border-radius:50%;margin-top:5px;background:#7E98BC}.readiness-action.primary .readiness-dot{background:#4ECCA3}.readiness-action.caution .readiness-dot{background:#C9A96E}.readiness-action.recover .readiness-dot{background:#FF8A8A}.readiness-action-title{font-size:13px;font-weight:900;color:var(--white,#F0F4FF)}.readiness-action-body{font-size:12px;color:var(--muted,#89A2C2);line-height:1.45;margin-top:3px}',
    '.readiness-sliders{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.readiness-slider{padding:12px;border-radius:14px;background:rgba(5,8,15,.26);border:1px solid rgba(126,152,188,.13)}.readiness-slider label{display:flex;justify-content:space-between;gap:10px;font-size:10px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:var(--steel3,#7E98BC);margin-bottom:8px}.readiness-slider input{width:100%;accent-color:#5B7DB5}.readiness-save{width:100%;margin-top:12px;border:none;border-radius:14px;padding:12px 14px;background:linear-gradient(135deg,#3A5F96,#5B7DB5);color:var(--white,#F0F4FF);font:inherit;font-size:12px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}',
    '.streak-card{margin-top:16px}.streak-note{font-size:12px;color:var(--muted,#89A2C2);line-height:1.5;margin-top:8px}',
    '@media(max-width:620px){.readiness-grid,.streak-grid,.readiness-sliders{grid-template-columns:1fr 1fr}.readiness-head{flex-direction:column}.readiness-score{width:100%}}'
  ].join('\n');
  var style=document.createElement('style');
  style.textContent=css;
  document.head.appendChild(style);

  function dayHasTraining(w,d){
    var wk=(window.allWeeks||[])[w]||{};
    var session=(wk.trainingPlan||[])[d]||{};
    return !!(session.exercises&&session.exercises.length);
  }
  function dayMeals(w,d){
    var wk=(window.allWeeks||[])[w]||{};
    var day=(wk.mealPlan||[])[d]||{};
    return day.meals||[];
  }
  function morningLog(w,d){
    return ((window.dash&&dash.morningLogs)||{})[dKey(w,d)]||{};
  }
  function sleepLog(w,d){
    return ((window.dash&&dash.sleepLogs)||{})[dKey(w,d)]||{};
  }
  function readinessData(w,d){
    var ml=morningLog(w,d),sl=sleepLog(w,d);
    var sleep=num(sl.hours,0),energy=num(ml.energy,0),stress=num(ml.stress,0),soreness=num(ml.soreness,0),rhr=num(ml.rhr,0);
    var scoreParts=[];
    if(sleep)scoreParts.push(Math.min(100,Math.round(sleep/8*100)));
    if(energy)scoreParts.push(Math.round(energy/5*100));
    if(stress)scoreParts.push(Math.max(15,Math.round((6-stress)/5*100)));
    if(soreness)scoreParts.push(Math.max(15,Math.round((6-soreness)/5*100)));
    if(rhr)scoreParts.push(rhr<=60?90:(rhr<=70?75:(rhr<=80?55:35)));
    var score=scoreParts.length?Math.round(scoreParts.reduce(function(a,b){return a+b;},0)/scoreParts.length):58;
    var status=score>=75?'Ready':score>=55?'Caution':'Recover';
    return {score:score,status:status,sleep:sleep,energy:energy,stress:stress,soreness:soreness,rhr:rhr};
  }
  function streakLength(testFn){
    var total=(window.allWeeks||[]).length*7,streak=0;
    for(var i=0;i<total;i++){
      var index=total-1-i,w=Math.floor(index/7),d=index%7;
      if(testFn(w,d))streak++;
      else if(streak>0)break;
    }
    return streak;
  }
  function streakData(){
    var train=streakLength(function(w,d){return !dayHasTraining(w,d)||!!(dash.adherence&&dash.adherence['train-w'+w+'d'+d]);});
    var meals=streakLength(function(w,d){
      var meals=dayMeals(w,d),log=((dash.nutritionLogs||{})[dKey(w,d)]||{}).eaten||{};
      return meals.length&&meals.filter(function(_,i){return log[i];}).length>=Math.ceil(meals.length*.75);
    });
    var sleep=streakLength(function(w,d){return num((dash.sleepLogs||{})[dKey(w,d)]&&dash.sleepLogs[dKey(w,d)].hours,0)>=7;});
    var checkin=streakLength(function(w,d){
      var ml=morningLog(w,d);
      return !!(ml.energy||ml.stress||ml.soreness||ml.rhr);
    });
    return {train:train,meals:meals,sleep:sleep,checkin:checkin};
  }
  function actionItems(data,w,d){
    var items=[],meals=dayMeals(w,d),mealLog=((dash.nutritionLogs||{})[dKey(w,d)]||{}).eaten||{},eaten=meals.filter(function(_,i){return mealLog[i];}).length;
    if(data.score>=75)items.push({type:'primary',title:'Train as planned',body:'Readiness is strong. Push the prescribed session and log your best working sets.'});
    else if(data.score>=55)items.push({type:'caution',title:'Keep the session, trim the edge',body:'Use the plan, but keep one rep in reserve and avoid chasing a new personal best today.'});
    else items.push({type:'recover',title:'Prioritise recovery today',body:'Consider a lighter session, extra mobility, and an earlier night before pushing intensity again.'});
    if(!data.sleep)items.push({type:'caution',title:'Add sleep data',body:'Sleep is the strongest missing signal for today. Add bedtime and wake time to sharpen the recommendation.'});
    if(meals.length&&eaten<Math.ceil(meals.length*.5))items.push({type:'caution',title:'Log your first meals',body:'Mark eaten meals or add a manual meal so the nutrition guidance has a useful signal.'});
    if(data.energy&&!data.stress)items.push({type:'primary',title:'Complete the check-in',body:'Stress and soreness make the recommendation much more accurate.'});
    return items.slice(0,4);
  }
  function renderReadinessCard(){
    var w=getWeek(),d=getDay(),data=readinessData(w,d),scoreClass=data.score>=75?'':(data.score>=55?' warn':' low');
    var html='<div class="readiness-card"><div class="readiness-head"><div><div class="readiness-kicker">Today readiness</div><div class="readiness-title">'+data.status+' for the day</div><div class="readiness-copy">A simple recommendation from sleep, stress, soreness, energy and resting heart rate.</div></div><div class="readiness-score'+scoreClass+'"><b>'+data.score+'%</b><span>'+data.status+'</span></div></div>';
    html+='<div class="readiness-grid">';
    html+='<div class="readiness-stat"><div class="readiness-stat-val">'+(data.sleep?data.sleep+'h':'--')+'</div><div class="readiness-stat-lbl">Sleep</div></div>';
    html+='<div class="readiness-stat"><div class="readiness-stat-val">'+(data.energy||'--')+'</div><div class="readiness-stat-lbl">Energy</div></div>';
    html+='<div class="readiness-stat"><div class="readiness-stat-val">'+(data.stress||'--')+'</div><div class="readiness-stat-lbl">Stress</div></div>';
    html+='<div class="readiness-stat"><div class="readiness-stat-val">'+(data.soreness||'--')+'</div><div class="readiness-stat-lbl">Soreness</div></div>';
    html+='</div><div class="readiness-actions">';
    actionItems(data,w,d).forEach(function(item){html+='<div class="readiness-action '+item.type+'"><div class="readiness-dot"></div><div><div class="readiness-action-title">'+item.title+'</div><div class="readiness-action-body">'+item.body+'</div></div></div>';});
    html+='</div><div class="readiness-sliders"><div class="readiness-slider"><label>Energy <span id="rh-energy-val">'+(data.energy||3)+'</span></label><input id="rh-energy" type="range" min="1" max="5" value="'+(data.energy||3)+'"></div><div class="readiness-slider"><label>Stress <span id="rh-stress-val">'+(data.stress||3)+'</span></label><input id="rh-stress" type="range" min="1" max="5" value="'+(data.stress||3)+'"></div><div class="readiness-slider"><label>Soreness <span id="rh-soreness-val">'+(data.soreness||3)+'</span></label><input id="rh-soreness" type="range" min="1" max="5" value="'+(data.soreness||3)+'"></div><div class="readiness-slider"><label>Resting HR <span id="rh-rhr-val">'+(data.rhr||60)+'</span></label><input id="rh-rhr" type="range" min="40" max="100" value="'+(data.rhr||60)+'"></div></div><button id="rh-save" class="readiness-save">Save readiness</button></div>';
    return html;
  }
  function renderStreakCard(){
    var s=streakData();
    return '<div class="streak-card"><div class="streak-kicker">Consistency streaks</div><div class="streak-title">Build the compounding habits</div><div class="streak-grid"><div class="streak-item"><div class="streak-val">'+s.train+'</div><div class="streak-lbl">Training days held</div></div><div class="streak-item"><div class="streak-val">'+s.meals+'</div><div class="streak-lbl">Nutrition days logged</div></div><div class="streak-item"><div class="streak-val">'+s.sleep+'</div><div class="streak-lbl">7h sleep days</div></div><div class="streak-item"><div class="streak-val">'+s.checkin+'</div><div class="streak-lbl">Check-ins complete</div></div></div><div class="streak-note">Streaks are based on logged behaviour, so the app can nudge the user before momentum drops.</div></div>';
  }
  function bindReadiness(){
    ['energy','stress','soreness','rhr'].forEach(function(k){
      var input=byId('rh-'+k),label=byId('rh-'+k+'-val');
      if(input&&label)input.oninput=function(){label.textContent=input.value;};
    });
    var saveBtn=byId('rh-save');
    if(saveBtn)saveBtn.onclick=function(){
      var key=dKey(getWeek(),getDay());
      if(!dash.morningLogs)dash.morningLogs={};
      if(!dash.morningLogs[key])dash.morningLogs[key]={};
      dash.morningLogs[key].energy=num((byId('rh-energy')||{}).value,3);
      dash.morningLogs[key].stress=num((byId('rh-stress')||{}).value,3);
      dash.morningLogs[key].soreness=num((byId('rh-soreness')||{}).value,3);
      dash.morningLogs[key].rhr=num((byId('rh-rhr')||{}).value,60);
      save();
      rerender();
    };
  }
  function install(){
    if(typeof window.renderTodayTab==='function'&&!window.__rebReadinessTodayWrapped){
      window.__rebReadinessTodayWrapped=true;
      var oldToday=window.renderTodayTab;
      window.renderTodayTab=function(){
        return renderReadinessCard()+oldToday.apply(this,arguments);
      };
    }
    if(typeof window.renderProgressTab==='function'&&!window.__rebReadinessProgressWrapped){
      window.__rebReadinessProgressWrapped=true;
      var oldProgress=window.renderProgressTab;
      window.renderProgressTab=function(){
        return oldProgress.apply(this,arguments)+renderStreakCard();
      };
    }
    if(typeof window.bindDashTab==='function'&&!window.__rebReadinessBindWrapped){
      window.__rebReadinessBindWrapped=true;
      var oldBind=window.bindDashTab;
      window.bindDashTab=function(){
        oldBind.apply(this,arguments);
        bindReadiness();
      };
    }
    setTimeout(function(){
      bindReadiness();
      if(window.allWeeks&&allWeeks.length)rerender();
    },0);
  }
  install();
  setTimeout(install,250);
})();
