(function(){
  if(window.__rebFeatureUpgradesLoaded)return;
  window.__rebFeatureUpgradesLoaded=true;

  function byId(id){return document.getElementById(id);}
  function safeNum(v,fallback){var n=parseFloat(v);return isFinite(n)?n:(fallback||0);}
  function dayKeyFor(w,d){return 'w'+w+'d'+d;}
  function getWeek(){return window.dash&&typeof dash.week==='number'?dash.week:0;}
  function getDay(){return window.dash&&typeof dash.day==='number'?dash.day:0;}
  function save(){
    try{ if(typeof saveAllLogs==='function')saveAllLogs(); }catch(e){}
  }
  function rerender(){
    try{
      var app=byId('app');
      if(app&&typeof renderDashboard==='function'&&window.allWeeks&&allWeeks.length){renderDashboard(app);}
      else if(typeof render==='function'){render();}
    }catch(e){}
  }

  var css=[
    '.coach-review-card,.overload-panel,.manual-feature-bar{background:linear-gradient(135deg,rgba(18,48,83,.96),rgba(8,22,42,.96));border:1px solid rgba(126,152,188,.24);border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.18)}',
    '.coach-review-card{padding:18px;margin:18px 0}',
    '.coach-review-hd{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:14px}',
    '.coach-review-kicker,.manual-feature-kicker{font-size:10px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--steel3,#7E98BC)}',
    '.coach-review-title{font-size:18px;font-weight:800;color:var(--white,#F0F4FF);margin-top:4px}',
    '.coach-readiness{min-width:76px;text-align:center;border-radius:16px;padding:10px;background:rgba(58,95,150,.22);border:1px solid rgba(126,152,188,.24)}',
    '.coach-readiness-val{font-size:24px;font-weight:900;color:var(--white,#F0F4FF);line-height:1}',
    '.coach-readiness-lbl{font-size:10px;text-transform:uppercase;color:var(--muted,#89A2C2);margin-top:4px}',
    '.coach-review-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}',
    '.coach-review-stat{padding:11px;border-radius:14px;background:rgba(5,8,15,.34);border:1px solid rgba(126,152,188,.14)}',
    '.coach-review-stat-val{font-size:16px;font-weight:900;color:var(--white,#F0F4FF)}',
    '.coach-review-stat-lbl{font-size:10px;color:var(--muted,#89A2C2);margin-top:3px}',
    '.coach-action-list{display:grid;gap:8px}',
    '.coach-action{display:grid;grid-template-columns:10px 1fr;gap:10px;padding:12px;border-radius:14px;background:rgba(5,8,15,.28);border:1px solid rgba(126,152,188,.13)}',
    '.coach-action-dot{width:9px;height:9px;border-radius:50%;margin-top:5px;background:#7E98BC}.coach-action.high .coach-action-dot{background:#4ECCA3}.coach-action.medium .coach-action-dot{background:#C9A96E}',
    '.coach-action-title{font-size:13px;font-weight:800;color:var(--white,#F0F4FF)}.coach-action-body,.coach-review-foot{font-size:12px;line-height:1.55;color:var(--muted,#89A2C2);margin-top:4px}',
    '.coach-adjust-card{margin-top:10px;padding:13px;border-radius:14px;border:1px solid rgba(78,204,163,.22);background:rgba(78,204,163,.08)}',
    '.coach-adjust-title{font-size:13px;font-weight:900;color:var(--white,#F0F4FF)}.coach-adjust-body{font-size:12px;color:var(--muted,#89A2C2);line-height:1.5;margin-top:4px}',
    '.coach-adjust-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.coach-adjust-btn,.manual-feature-btn{border:1px solid rgba(126,152,188,.28);background:rgba(58,95,150,.36);color:var(--white,#F0F4FF);border-radius:12px;padding:10px 14px;font:inherit;font-size:12px;font-weight:800;cursor:pointer}.coach-adjust-reset{background:transparent;color:var(--steel3,#7E98BC)}',
    '.overload-panel{padding:12px;margin:10px 0 12px;border-radius:14px}.overload-panel.empty{opacity:.9}.overload-top{display:flex;justify-content:space-between;gap:8px;align-items:center}.overload-title{font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.12em;color:var(--steel3,#7E98BC)}',
    '.overload-badge{font-size:10px;font-weight:900;border-radius:999px;padding:5px 8px;background:rgba(78,204,163,.14);color:#4ECCA3}.overload-badge.hold{background:rgba(201,169,110,.14);color:#C9A96E}',
    '.overload-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:10px 0}.overload-stat{border-radius:12px;background:rgba(5,8,15,.28);padding:8px}.overload-stat-val{font-size:12px;font-weight:900;color:var(--white,#F0F4FF)}.overload-stat-lbl{font-size:9px;color:var(--muted,#89A2C2);margin-top:3px}',
    '.overload-target{font-size:12px;color:var(--white,#F0F4FF);line-height:1.45}.overload-note{font-size:11px;color:var(--muted,#89A2C2);line-height:1.45;margin-top:5px}',
    '.manual-feature-bar{padding:14px;margin:12px 0;display:flex;align-items:center;justify-content:space-between;gap:12px}.manual-feature-copy{font-size:12px;color:var(--muted,#89A2C2);line-height:1.45;margin-top:3px}',
    '.analytics-card{background:linear-gradient(135deg,rgba(12,30,56,.98),rgba(6,12,24,.98));border:1px solid rgba(126,152,188,.24);border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.18);padding:18px;margin:18px 0}',
    '.analytics-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px}.analytics-kicker{font-size:10px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:var(--steel3,#7E98BC)}.analytics-title{font-size:19px;font-weight:900;color:var(--white,#F0F4FF);margin-top:4px}.analytics-sub{font-size:12px;line-height:1.5;color:var(--muted,#89A2C2);margin-top:5px}.analytics-score{min-width:82px;text-align:center;border-radius:16px;padding:10px;border:1px solid rgba(78,204,163,.22);background:rgba(78,204,163,.08)}.analytics-score b{display:block;font-size:24px;line-height:1;color:var(--white,#F0F4FF)}.analytics-score span{display:block;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.08em;color:#4ECCA3;margin-top:5px}',
    '.analytics-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:14px 0}.analytics-stat{padding:11px;border-radius:14px;background:rgba(5,8,15,.34);border:1px solid rgba(126,152,188,.14)}.analytics-stat-val{font-size:16px;font-weight:900;color:var(--white,#F0F4FF)}.analytics-stat-lbl{font-size:10px;color:var(--muted,#89A2C2);line-height:1.3;margin-top:4px}',
    '.analytics-section{margin-top:14px;padding-top:14px;border-top:1px solid rgba(126,152,188,.16)}.analytics-section-title{font-size:10px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:var(--steel3,#7E98BC);margin-bottom:10px}.analytics-split{display:grid;grid-template-columns:1fr 1fr;gap:10px}.analytics-mini{border-radius:14px;background:rgba(5,8,15,.28);border:1px solid rgba(126,152,188,.13);padding:12px}.analytics-mini-title{font-size:12px;font-weight:900;color:var(--white,#F0F4FF);margin-bottom:8px}.analytics-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid rgba(126,152,188,.1);font-size:12px;color:var(--silver,#B8C8DC)}.analytics-row:last-child{border-bottom:none}.analytics-row strong{color:var(--white,#F0F4FF)}.analytics-row span{color:var(--muted,#89A2C2);font-size:11px}',
    '.analytics-bars{display:grid;gap:8px}.analytics-bar-row{display:grid;grid-template-columns:46px 1fr 52px;align-items:center;gap:8px;font-size:11px;color:var(--muted,#89A2C2)}.analytics-track{height:7px;border-radius:999px;background:rgba(126,152,188,.14);overflow:hidden}.analytics-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#3A5F96,#4ECCA3)}.analytics-empty{font-size:12px;line-height:1.5;color:var(--muted,#89A2C2);padding:12px;border-radius:14px;background:rgba(5,8,15,.25);border:1px dashed rgba(126,152,188,.2)}',
    '.swap-choice-grid,.saved-meal-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.entry-card,.saved-meal-btn{border:1px solid rgba(126,152,188,.22);background:rgba(18,48,83,.76);color:inherit;border-radius:16px;padding:14px;text-align:left;font:inherit;cursor:pointer}.entry-card-title,.saved-meal-name{font-size:14px;font-weight:900;color:var(--white,#F0F4FF)}.entry-card-copy,.saved-meal-meta{font-size:12px;line-height:1.45;color:var(--muted,#89A2C2);margin-top:6px}.entry-card-meta{font-size:11px;font-weight:900;color:var(--steel3,#7E98BC);margin-top:12px;text-transform:uppercase;letter-spacing:.08em}',
    '.modal-section-lbl{font-size:10px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:var(--steel3,#7E98BC);margin:4px 0 8px}.save-fav-row{display:flex;align-items:center;gap:8px;margin:12px 0;color:var(--muted,#89A2C2);font-size:12px}',
    '@media(max-width:620px){.coach-review-grid,.overload-grid,.swap-choice-grid,.saved-meal-grid,.analytics-grid,.analytics-split{grid-template-columns:1fr}.coach-review-hd,.manual-feature-bar,.analytics-head{flex-direction:column;align-items:stretch}.analytics-bar-row{grid-template-columns:40px 1fr 46px}}'
  ].join('\n');
  var style=document.createElement('style');style.textContent=css;document.head.appendChild(style);

  var oldSave=window.saveAllLogs;
  if(typeof oldSave==='function'){
    window.saveAllLogs=function(){
      try{
        localStorage.setItem('rb_saved_meals',JSON.stringify((window.dash&&dash.savedMeals)||[]));
        localStorage.setItem('rb_cal_offset',String((window.dash&&dash.calOffset)||0));
      }catch(e){}
      return oldSave.apply(this,arguments);
    };
  }
  var oldLoad=window.loadAllLogs;
  if(typeof oldLoad==='function'){
    window.loadAllLogs=function(){
      var out=oldLoad.apply(this,arguments);
      try{
        if(window.dash){
          var saved=localStorage.getItem('rb_saved_meals');
          if(saved)dash.savedMeals=JSON.parse(saved);
          var off=parseInt(localStorage.getItem('rb_cal_offset'),10);
          if(isFinite(off))dash.calOffset=off;
        }
      }catch(e){}
      return out;
    };
    try{window.loadAllLogs();}catch(e){}
  }

  var oldGetTodayNutrition=window.getTodayNutrition;
  if(typeof oldGetTodayNutrition==='function'){
    window.getTodayNutrition=function(){
      var n=oldGetTodayNutrition.apply(this,arguments);
      if(n&&window.dash&&dash.calOffset){
        n.target=Math.max(900,(n.target||0)+dash.calOffset);
      }
      return n;
    };
  }

  function getWeeklyCoachReview(weekIndex){
    var wk=(window.allWeeks&&allWeeks[weekIndex])||{};
    var plannedSessions=0,doneSessions=0,plannedMeals=0,eatenMeals=0,plannedCals=0,loggedCals=0;
    (wk.trainingPlan||[]).forEach(function(day,di){
      if(day.exercises&&day.exercises.length){
        plannedSessions++;
        if(window.dash&&dash.adherence&&dash.adherence['train-w'+weekIndex+'d'+di])doneSessions++;
      }
    });
    (wk.mealPlan||[]).forEach(function(day,di){
      var log=(window.dash&&dash.nutritionLogs&&dash.nutritionLogs[dayKeyFor(weekIndex,di)])||{eaten:{}};
      (day.meals||[]).forEach(function(meal,mi){
        plannedMeals++;plannedCals+=meal.calories||0;
        if(log.eaten&&log.eaten[mi]){eatenMeals++;loggedCals+=meal.calories||0;}
      });
    });
    var adherence=plannedSessions?Math.round(doneSessions/plannedSessions*100):0;
    var mealAdherence=plannedMeals?Math.round(eatenMeals/plannedMeals*100):0;
    var calAdherence=plannedCals?Math.round(loggedCals/plannedCals*100):0;
    var meas=(window.dash&&dash.measurements&&dash.measurements[weekIndex])||{};
    var prev=(window.dash&&dash.measurements&&dash.measurements[weekIndex-1])||{};
    var weight=safeNum(meas.weight),prevWeight=safeNum(prev.weight);
    var weightDelta=(weight&&prevWeight)?Math.round((weight-prevWeight)*10)/10:null;
    var sleep=[],energy=[],stress=[],sets=0,volume=0;
    for(var d=0;d<7;d++){
      var key=dayKeyFor(weekIndex,d);
      var sl=window.dash&&dash.sleepLogs&&dash.sleepLogs[key]; if(sl&&sl.hours)sleep.push(safeNum(sl.hours));
      var ml=window.dash&&dash.morningLogs&&dash.morningLogs[key]; if(ml&&ml.energy)energy.push(safeNum(ml.energy)); if(ml&&ml.stress)stress.push(safeNum(ml.stress));
    }
    Object.keys((window.dash&&dash.workoutLogs)||{}).forEach(function(k){
      if(k.indexOf('w'+weekIndex+'d')!==0)return;
      (dash.workoutLogs[k]||[]).forEach(function(set){
        var wt=safeNum(set.weight),reps=safeNum(set.reps);
        if(wt||reps)sets++;
        if(wt&&reps)volume+=wt*reps;
      });
    });
    function avg(vals){return vals.length?vals.reduce(function(a,b){return a+b;},0)/vals.length:null;}
    var avgSleep=avg(sleep),avgEnergy=avg(energy),avgStress=avg(stress);
    var parts=[adherence,mealAdherence||50,avgSleep?Math.min(100,Math.round(avgSleep/8*100)):60,avgEnergy?Math.round(avgEnergy/5*100):60,avgStress?Math.max(20,Math.round((6-avgStress)/5*100)):60];
    var readiness=Math.round(parts.reduce(function(a,b){return a+b;},0)/parts.length);
    var actions=[];
    if(adherence>=80)actions.push({level:'high',title:'Progress training load',body:'Adherence is strong. Next similar sessions should aim for one extra clean rep or a small load increase.'});
    else if(plannedSessions)actions.push({level:'medium',title:'Protect consistency first',body:'Training adherence is '+adherence+'%. Complete the planned sessions before increasing volume.'});
    if(mealAdherence<60)actions.push({level:'medium',title:'Improve nutrition signal',body:'Only '+mealAdherence+'% of planned meals are marked eaten. Aim for 80% logging so calorie changes are based on useful data.'});
    if(avgSleep&&avgSleep<6.5)actions.push({level:'low',title:'Prioritise recovery',body:'Average sleep is '+Math.round(avgSleep*10)/10+'h. Hold intensity steady and protect recovery.'});
    if(avgStress&&avgStress>=4)actions.push({level:'low',title:'Watch recovery pressure',body:'Stress is trending high. Keep the plan, but use lower RPE targets where needed.'});
    if(weightDelta===null)actions.push({level:'low',title:'Log weekly weight',body:'Add this week and last week weight measurements to unlock calorie adjustment advice.'});
    if(sets>0)actions.push({level:'high',title:'Track overload from logged sets',body:'You have '+sets+' logged sets this week. Use the best clean set as the target to beat next time.'});
    if(!actions.length)actions.push({level:'low',title:'Build the first data loop',body:'Complete workouts, mark meals eaten, and add sleep or weight data to unlock sharper coaching.'});
    return {readiness:readiness,adherence:adherence,mealAdherence:mealAdherence,calAdherence:calAdherence,weightDelta:weightDelta,avgSleep:avgSleep,avgEnergy:avgEnergy,avgStress:avgStress,sets:sets,volume:volume,actions:actions.slice(0,4)};
  }
  window.getWeeklyCoachReview=getWeeklyCoachReview;

  function getCalorieAdjustment(review){
    if(!review||review.weightDelta===null||review.mealAdherence<80)return {delta:0,title:'',body:''};
    var goal=(window.form&&form.goal)||'maintain';
    if(goal==='lose'){
      if(review.weightDelta>-0.2)return {delta:-150,title:'Adaptive calorie adjustment',body:'Food logging is consistent, but weight loss has stalled. Reduce the daily target slightly and reassess next week.'};
      if(review.weightDelta<-1)return {delta:100,title:'Adaptive calorie adjustment',body:'Weight is dropping quickly. Add a small amount back to protect performance and recovery.'};
    }
    if(goal==='gain'){
      if(review.weightDelta<0.2)return {delta:150,title:'Adaptive calorie adjustment',body:'Logging is consistent, but gain is slow. Add calories around training to support muscle growth.'};
      if(review.weightDelta>0.7)return {delta:-100,title:'Adaptive calorie adjustment',body:'Weight is rising quickly. Pull calories back slightly to keep the gain leaner.'};
    }
    if(goal==='maintain'&&Math.abs(review.weightDelta)>0.5)return {delta:review.weightDelta>0?-100:100,title:'Adaptive calorie adjustment',body:'Weight is drifting away from maintenance. Use a small calorie correction and review again next week.'};
    return {delta:0,title:'',body:''};
  }
  window.getCalorieAdjustment=getCalorieAdjustment;

  function renderWeeklyCoachReview(weekIndex){
    var review=getWeeklyCoachReview(weekIndex),rec=getCalorieAdjustment(review),off=(window.dash&&dash.calOffset)||0;
    var wt=review.weightDelta===null?'--':(review.weightDelta>0?'+':'')+review.weightDelta+'kg';
    var sleep=review.avgSleep?Math.round(review.avgSleep*10)/10+'h':'--';
    var stress=review.avgStress?Math.round(review.avgStress*10)/10+'/5':'--';
    var html='<div class="coach-review-card"><div class="coach-review-hd"><div><div class="coach-review-kicker">Weekly coach review</div><div class="coach-review-title">Week '+(weekIndex+1)+' adjustment signals</div></div><div class="coach-readiness"><div class="coach-readiness-val">'+review.readiness+'%</div><div class="coach-readiness-lbl">Ready</div></div></div>';
    html+='<div class="coach-review-grid"><div class="coach-review-stat"><div class="coach-review-stat-val">'+review.adherence+'%</div><div class="coach-review-stat-lbl">Training complete</div></div><div class="coach-review-stat"><div class="coach-review-stat-val">'+review.mealAdherence+'%</div><div class="coach-review-stat-lbl">Meals logged</div></div><div class="coach-review-stat"><div class="coach-review-stat-val">'+wt+'</div><div class="coach-review-stat-lbl">Weight change</div></div><div class="coach-review-stat"><div class="coach-review-stat-val">'+sleep+'</div><div class="coach-review-stat-lbl">Avg sleep</div></div><div class="coach-review-stat"><div class="coach-review-stat-val">'+stress+'</div><div class="coach-review-stat-lbl">Stress</div></div><div class="coach-review-stat"><div class="coach-review-stat-val">'+review.sets+'</div><div class="coach-review-stat-lbl">Sets logged</div></div></div><div class="coach-action-list">';
    review.actions.forEach(function(a){html+='<div class="coach-action '+a.level+'"><div class="coach-action-dot"></div><div><div class="coach-action-title">'+a.title+'</div><div class="coach-action-body">'+a.body+'</div></div></div>';});
    if(rec.delta&&rec.delta!==off){html+='<div class="coach-adjust-card"><div class="coach-adjust-title">'+rec.title+'</div><div class="coach-adjust-body">'+rec.body+'</div><div class="coach-adjust-actions"><button class="coach-adjust-btn" id="apply-cal-adjust">Set '+(rec.delta>0?'+':'')+rec.delta+' kcal</button>'+(off?'<button class="coach-adjust-btn coach-adjust-reset" id="reset-cal-adjust">Reset target</button>':'')+'</div></div>';}
    else if(off){html+='<div class="coach-adjust-card"><div class="coach-adjust-title">Adaptive target active</div><div class="coach-adjust-body">Your daily calorie target is adjusted by '+(off>0?'+':'')+off+' kcal from the original plan.</div><div class="coach-adjust-actions"><button class="coach-adjust-btn coach-adjust-reset" id="reset-cal-adjust">Reset target</button></div></div>';}
    html+='</div><div class="coach-review-foot">Recommendations use logged meals, workouts, sleep and measurements. More data makes the next adjustment sharper.</div></div>';
    return html;
  }
  window.renderWeeklyCoachReview=renderWeeklyCoachReview;

  var oldProgress=window.renderProgressTab;
  if(typeof oldProgress==='function'){
    window.renderProgressTab=function(){
      return renderProgressAnalytics()+oldProgress.apply(this,arguments)+renderWeeklyCoachReview(getWeek());
    };
  }

  function fmt(n,suffix){
    if(n===null||typeof n==='undefined'||!isFinite(n))return '--';
    var rounded=Math.abs(n)>=100?Math.round(n):Math.round(n*10)/10;
    return String(rounded)+(suffix||'');
  }
  function fmtPace(minPerKm){
    if(!minPerKm||!isFinite(minPerKm))return '--';
    var mins=Math.floor(minPerKm),secs=Math.round((minPerKm-mins)*60);
    if(secs===60){mins++;secs=0;}
    return mins+':'+String(secs).padStart(2,'0')+'/km';
  }
  function workoutEntries(){
    var entries=[];
    Object.keys((window.dash&&dash.workoutLogs)||{}).forEach(function(key){
      var p=parseWorkoutKey(key);if(!p)return;
      (dash.workoutLogs[key]||[]).forEach(function(set,si){
        var wt=safeNum(set.weight),reps=safeNum(set.reps);
        if(!wt&&!reps)return;
        entries.push({key:key,w:p.w,d:p.d,ex:p.ex,set:si,exercise:set.exercise||'',name:cleanExerciseName(set.exercise||''),weight:wt,reps:reps,volume:wt*reps,e1rm:(wt&&reps)?wt*(1+reps/30):0});
      });
    });
    entries.sort(function(a,b){return a.w===b.w?(a.d===b.d?a.ex-b.ex:a.d-b.d):a.w-b.w;});
    return entries;
  }
  function cardioEntries(){
    var entries=[];
    Object.keys((window.dash&&dash.cardioLogs)||{}).forEach(function(key){
      var m=key.match(/w(\d+)d(\d+)/),w=m?+m[1]:0,d=m?+m[2]:0;
      (dash.cardioLogs[key]||[]).forEach(function(log){
        var duration=safeNum(log.duration),distance=safeNum(log.distance),type=log.type||'Cardio';
        if(!duration)return;
        entries.push({w:w,d:d,type:type,duration:duration,distance:distance,pace:distance?duration/distance:null,calories:safeNum(log.calories)});
      });
    });
    entries.sort(function(a,b){return a.w===b.w?a.d-b.d:a.w-b.w;});
    return entries;
  }
  function progressAnalyticsData(){
    var sets=workoutEntries(),cardio=cardioEntries(),weekCount=(window.allWeeks&&allWeeks.length)||0;
    var volumeByWeek={},setsByWeek={},sessionsByWeek={},exerciseBest={},prs=[];
    sets.forEach(function(s){
      volumeByWeek[s.w]=(volumeByWeek[s.w]||0)+s.volume;
      setsByWeek[s.w]=(setsByWeek[s.w]||0)+1;
      sessionsByWeek['w'+s.w+'d'+s.d]=true;
      if(s.name){
        var prev=exerciseBest[s.name];
        if(!prev||s.e1rm>prev.e1rm||(!s.e1rm&&s.weight>prev.weight)){
          var isPr=!!prev&&(s.e1rm>prev.e1rm||s.weight>prev.weight);
          exerciseBest[s.name]={label:s.exercise.split('\u2014')[0].split('\u2013')[0].trim(),weight:s.weight,reps:s.reps,e1rm:s.e1rm,w:s.w,d:s.d};
          if(isPr)prs.push(exerciseBest[s.name]);
        }
      }
    });
    var planned=0,done=0,currentWeek=getWeek();
    (window.allWeeks||[]).forEach(function(wk,wi){
      (wk.trainingPlan||[]).forEach(function(day,di){
        if(day.exercises&&day.exercises.length){planned++;if(window.dash&&dash.adherence&&dash.adherence['train-w'+wi+'d'+di])done++;}
      });
    });
    var bodySeries=Object.keys((window.dash&&dash.measurements)||{}).sort(function(a,b){return +a-+b;}).map(function(k){var m=dash.measurements[k]||{};return{w:+k,weight:safeNum(m.weight),waist:safeNum(m.waist),bodyfat:safeNum(m.bodyfat),steps:safeNum(m.steps)};});
    var runSessions=cardio.filter(function(c){return (c.type||'').toLowerCase().indexOf('running')>=0&&c.distance&&c.duration;});
    var bestPace=runSessions.reduce(function(best,c){return !best||c.pace<best.pace?c:best;},null);
    var latestPace=runSessions.length?runSessions[runSessions.length-1]:null;
    var totalDistance=cardio.reduce(function(a,c){return a+(c.distance||0);},0);
    var currentVolume=volumeByWeek[currentWeek]||0,previousVolume=volumeByWeek[currentWeek-1]||0;
    var topExercises=Object.keys(exerciseBest).map(function(k){return exerciseBest[k];}).sort(function(a,b){return (b.e1rm||b.weight)-(a.e1rm||a.weight);}).slice(0,4);
    var latestBody=bodySeries.length?bodySeries[bodySeries.length-1]:null,firstBody=bodySeries.length?bodySeries[0]:null;
    return{sets:sets,cardio:cardio,weekCount:weekCount,volumeByWeek:volumeByWeek,setsByWeek:setsByWeek,sessionCount:Object.keys(sessionsByWeek).length,planned:planned,done:done,adherence:planned?Math.round(done/planned*100):0,currentVolume:currentVolume,previousVolume:previousVolume,volumeDelta:previousVolume?Math.round((currentVolume-previousVolume)/previousVolume*100):null,prs:prs.slice(-5).reverse(),topExercises:topExercises,bodySeries:bodySeries,latestBody:latestBody,firstBody:firstBody,bestPace:bestPace,latestPace:latestPace,totalDistance:totalDistance};
  }
  function renderWeekBars(volumeByWeek,weekCount){
    var weeks=[],max=0;
    for(var i=0;i<Math.max(weekCount,1);i++){var v=volumeByWeek[i]||0;weeks.push({w:i,val:v});max=Math.max(max,v);}
    if(!max)return '<div class="analytics-empty">Log sets with weight and reps to see weekly training volume.</div>';
    return '<div class="analytics-bars">'+weeks.map(function(x){var pct=Math.max(4,Math.round(x.val/max*100));return '<div class="analytics-bar-row"><span>W'+(x.w+1)+'</span><div class="analytics-track"><div class="analytics-fill" style="width:'+pct+'%"></div></div><strong>'+fmt(x.val,'kg')+'</strong></div>';}).join('')+'</div>';
  }
  function renderProgressAnalytics(){
    var data=progressAnalyticsData();
    var bodyDelta=(data.latestBody&&data.firstBody&&data.latestBody.weight&&data.firstBody.weight)?Math.round((data.latestBody.weight-data.firstBody.weight)*10)/10:null;
    var waistDelta=(data.latestBody&&data.firstBody&&data.latestBody.waist&&data.firstBody.waist)?Math.round((data.latestBody.waist-data.firstBody.waist)*10)/10:null;
    var scoreParts=[data.adherence||0,data.sets.length?80:25,data.cardio.length?75:35,data.bodySeries.length>=2?80:35];
    var score=Math.round(scoreParts.reduce(function(a,b){return a+b;},0)/scoreParts.length);
    var html='<div class="analytics-card"><div class="analytics-head"><div><div class="analytics-kicker">Progress analytics</div><div class="analytics-title">Performance dashboard</div><div class="analytics-sub">Strength, conditioning and body trend signals from the data logged so far.</div></div><div class="analytics-score"><b>'+score+'%</b><span>Data depth</span></div></div>';
    html+='<div class="analytics-grid">';
    html+='<div class="analytics-stat"><div class="analytics-stat-val">'+data.adherence+'%</div><div class="analytics-stat-lbl">Training adherence</div></div>';
    html+='<div class="analytics-stat"><div class="analytics-stat-val">'+fmt(data.currentVolume,'kg')+'</div><div class="analytics-stat-lbl">Week volume</div></div>';
    html+='<div class="analytics-stat"><div class="analytics-stat-val">'+data.sets.length+'</div><div class="analytics-stat-lbl">Logged sets</div></div>';
    html+='<div class="analytics-stat"><div class="analytics-stat-val">'+fmtPace(data.bestPace&&data.bestPace.pace)+'</div><div class="analytics-stat-lbl">Best run pace</div></div>';
    html+='</div>';
    html+='<div class="analytics-section"><div class="analytics-section-title">Training load</div><div class="analytics-split"><div class="analytics-mini"><div class="analytics-mini-title">Weekly volume</div>'+renderWeekBars(data.volumeByWeek,data.weekCount)+'</div><div class="analytics-mini"><div class="analytics-mini-title">Strength highlights</div>';
    if(data.topExercises.length){data.topExercises.forEach(function(ex){html+='<div class="analytics-row"><strong>'+ex.label+'</strong><span>'+fmt(ex.weight,'kg')+' x '+fmt(ex.reps,'')+(ex.e1rm?' - e1RM '+fmt(ex.e1rm,'kg'):'')+'</span></div>';});}
    else html+='<div class="analytics-empty">Save workout sets to unlock exercise PBs and estimated 1RM.</div>';
    html+='</div></div></div>';
    html+='<div class="analytics-section"><div class="analytics-section-title">Conditioning and body</div><div class="analytics-split"><div class="analytics-mini"><div class="analytics-mini-title">Cardio trend</div>';
    html+='<div class="analytics-row"><strong>Total distance</strong><span>'+fmt(data.totalDistance,'km')+'</span></div><div class="analytics-row"><strong>Latest run pace</strong><span>'+fmtPace(data.latestPace&&data.latestPace.pace)+'</span></div><div class="analytics-row"><strong>Cardio sessions</strong><span>'+data.cardio.length+'</span></div>';
    html+='</div><div class="analytics-mini"><div class="analytics-mini-title">Body trend</div>';
    html+='<div class="analytics-row"><strong>Weight change</strong><span>'+(bodyDelta===null?'--':(bodyDelta>0?'+':'')+bodyDelta+'kg')+'</span></div><div class="analytics-row"><strong>Waist change</strong><span>'+(waistDelta===null?'--':(waistDelta>0?'+':'')+waistDelta+'cm')+'</span></div><div class="analytics-row"><strong>Latest steps</strong><span>'+(data.latestBody&&data.latestBody.steps?fmt(data.latestBody.steps,''):'--')+'</span></div>';
    html+='</div></div></div>';
    if(data.prs.length){html+='<div class="analytics-section"><div class="analytics-section-title">Recent PRs</div>';data.prs.forEach(function(pr){html+='<div class="analytics-row"><strong>'+pr.label+'</strong><span>Week '+(pr.w+1)+' - '+fmt(pr.weight,'kg')+' x '+fmt(pr.reps,'')+'</span></div>';});html+='</div>';}
    html+='</div>';
    return html;
  }
  window.renderProgressAnalytics=renderProgressAnalytics;

  function cleanExerciseName(ex){return String(ex||'').split('\u2014')[0].split('\u2013')[0].split('(')[0].trim().toLowerCase();}
  function parseWorkoutKey(k){var m=String(k||'').match(/w(\d+)d(\d+)ex(\d+)/);return m?{w:+m[1],d:+m[2],ex:+m[3]}:null;}
  function bestSet(sets){var best=null;(sets||[]).forEach(function(s){var wt=safeNum(s.weight),reps=safeNum(s.reps);if(!wt&&!reps)return;var score=wt*100+reps;if(!best||score>best.score)best={weight:wt,reps:reps,score:score};});return best;}
  function historyFor(ex,currentKey){
    var name=cleanExerciseName(ex),cur=parseWorkoutKey(currentKey),hist=[];
    Object.keys((window.dash&&dash.workoutLogs)||{}).forEach(function(k){
      if(k===currentKey)return;
      var p=parseWorkoutKey(k);if(!p||!cur)return;
      if(p.w>cur.w||(p.w===cur.w&&p.d>=cur.d))return;
      var logs=dash.workoutLogs[k]||[],loggedName=logs[0]&&logs[0].exercise?cleanExerciseName(logs[0].exercise):'';
      if(loggedName&&loggedName!==name)return;
      var b=bestSet(logs);if(b)hist.push({key:k,best:b});
    });
    hist.sort(function(a,b){var pa=parseWorkoutKey(a.key),pb=parseWorkoutKey(b.key);return pa.w===pb.w?pa.d-pb.d:pa.w-pb.w;});
    return hist;
  }
  function renderOverloadPanel(ex,currentKey){
    var hist=historyFor(ex,currentKey),last=hist[hist.length-1],target='Log today as your baseline',note='After one logged session, ReBourne will suggest the next overload target.',status='empty';
    if(last){
      var b=last.best,status2='progress';
      if(b.weight&&b.reps>=8){target='Try '+(Math.round((b.weight+2.5)*2)/2)+'kg for '+Math.max(5,b.reps-2)+' clean reps';note='You hit a strong rep count last time, so a small load increase is the next step.';}
      else if(b.weight){target='Repeat '+b.weight+'kg and aim for '+(b.reps+1)+' reps';note='Build reps first. Increase load once the top reps are clean.';}
      else{target='Beat last session by 1 clean rep';note='No load was logged, so progression is rep based for now.';}
      if(hist.length>=2&&Math.abs(b.score-hist[hist.length-2].best.score)<1){status2='hold';note='Progress has been flat across two logs. Hold the target and focus on form, tempo and range.';}
      status=status2;
      var best=hist.reduce(function(a,h){return !a||h.best.score>a.score?h.best:a;},null);
      var html='<div class="overload-panel"><div class="overload-top"><div class="overload-title">Progressive overload</div><div class="overload-badge '+status+'">'+(status==='hold'?'Hold':'Progress')+'</div></div><div class="overload-grid"><div class="overload-stat"><div class="overload-stat-val">'+(b.weight?b.weight+'kg x '+b.reps:b.reps+' reps')+'</div><div class="overload-stat-lbl">Last best set</div></div><div class="overload-stat"><div class="overload-stat-val">'+(best&&best.weight?best.weight+'kg x '+best.reps:'--')+'</div><div class="overload-stat-lbl">Exercise PB</div></div><div class="overload-stat"><div class="overload-stat-val">'+hist.length+'</div><div class="overload-stat-lbl">Logs</div></div></div><div class="overload-target"><strong>Today:</strong> '+target+'</div><div class="overload-note">'+note+'</div></div>';
      return html;
    }
    return '<div class="overload-panel empty"><div class="overload-top"><div class="overload-title">Progressive overload</div><div class="overload-badge">Baseline</div></div><div class="overload-target"><strong>'+target+'</strong></div><div class="overload-note">'+note+'</div></div>';
  }

  function injectOverloadPanels(){
    if(!window.allWeeks||!window.dash||dash.tab!=='training')return;
    var wk=allWeeks[dash.week]||{},day=(wk.trainingPlan||[])[dash.day]||{};
    var rows=document.querySelectorAll('.ex-row');
    rows.forEach(function(row,i){
      if(row.querySelector('.overload-panel'))return;
      var ex=(day.exercises||[])[i];if(!ex)return;
      var wrap=row.querySelector('.ex-log-wrap');
      if(!wrap)return;
      var tmp=document.createElement('div');tmp.innerHTML=renderOverloadPanel(ex,'w'+dash.week+'d'+dash.day+'ex'+i);
      wrap.parentNode.insertBefore(tmp.firstChild,wrap);
    });
  }

  function addManualEntryBars(){
    if(!window.dash)return;
    if((dash.tab==='today'||dash.tab==='nutrition')&&!document.querySelector('.manual-feature-bar')){
      var host=document.querySelector('.today-section')||document.querySelector('.nutrition-summary')||document.querySelector('.day-nav');
      if(!host)return;
      var bar=document.createElement('div');bar.className='manual-feature-bar';
      bar.innerHTML='<div><div class="manual-feature-kicker">Meal logging</div><div class="manual-feature-copy">Add a meal manually and ReBourne will estimate the macros automatically.</div></div><button class="manual-feature-btn" id="feature-add-meal">Add manual meal</button>';
      host.parentNode.insertBefore(bar,host.nextSibling);
      var btn=byId('feature-add-meal');if(btn)btn.onclick=function(){showAddMealModal();};
    }
  }

  function applyManualMealAdd(key,newMeal){
    var m=String(key||'').match(/add-w(\d+)d(\d+)/),wi=m?+m[1]:getWeek(),di=m?+m[2]:getDay();
    if(!window.allWeeks||!allWeeks[wi])return false;
    if(!allWeeks[wi].mealPlan)allWeeks[wi].mealPlan=[];
    if(!allWeeks[wi].mealPlan[di])allWeeks[wi].mealPlan[di]={day:(window.DAYS&&DAYS[di])||'',meals:[]};
    if(!allWeeks[wi].mealPlan[di].meals)allWeeks[wi].mealPlan[di].meals=[];
    allWeeks[wi].mealPlan[di].meals.push(newMeal);
    var mi=allWeeks[wi].mealPlan[di].meals.length-1,dKey=dayKeyFor(wi,di);
    if(!dash.nutritionLogs[dKey])dash.nutritionLogs[dKey]={eaten:{}};
    if(!dash.nutritionLogs[dKey].eaten)dash.nutritionLogs[dKey].eaten={};
    dash.nutritionLogs[dKey].eaten[mi]=true;
    save();return true;
  }
  function applyMealSwap(originalMeal,key,newMeal){
    var parts=String(key||'').match(/w(\d+)d(\d+)m(\d+)/);if(!parts||!window.allWeeks)return false;
    var wi=+parts[1],di=+parts[2],mi=+parts[3];
    if(allWeeks[wi]&&allWeeks[wi].mealPlan&&allWeeks[wi].mealPlan[di]){newMeal.type=originalMeal.type;allWeeks[wi].mealPlan[di].meals[mi]=newMeal;save();return true;}
    return false;
  }
  function showAddMealModal(){showManualMealModal({type:'SNACK',name:'Manual meal',calories:420,protein:30,carbs:45,fat:14},'add-w'+getWeek()+'d'+getDay());}
  window.showAddMealModal=showAddMealModal;

  function rememberSavedMeal(meal){
    if(!meal||!meal.name||!window.dash)return;
    if(!dash.savedMeals)dash.savedMeals=[];
    var key=meal.name.toLowerCase().replace(/\s+/g,' ').trim();
    dash.savedMeals=dash.savedMeals.filter(function(m){return (m.name||'').toLowerCase().replace(/\s+/g,' ').trim()!==key;});
    dash.savedMeals.unshift({type:meal.type||'SNACK',name:meal.name,calories:meal.calories||0,protein:meal.protein||0,carbs:meal.carbs||0,fat:meal.fat||0,notes:meal.notes||''});
    if(dash.savedMeals.length>18)dash.savedMeals=dash.savedMeals.slice(0,18);
  }
  function fillManualMealFromSaved(meal){
    ['type','name','desc'].forEach(function(){});
    var typeEl=byId('manual-meal-type'),nameEl=byId('manual-meal-name'),descEl=byId('manual-meal-desc');
    if(typeEl&&meal.type)typeEl.value=meal.type;if(nameEl)nameEl.value=meal.name||'';if(descEl)descEl.value=meal.notes||'';
    [['manual-calories','calories'],['manual-protein','protein'],['manual-carbs','carbs'],['manual-fat','fat']].forEach(function(p){var el=byId(p[0]);if(el)el.value=Math.round(safeNum(meal[p[1]]));});
  }
  function closeModalSafe(){try{if(typeof closeModal==='function')closeModal();else{var o=byId('modal-overlay');if(o)o.remove();}}catch(e){}}
  function openSwapChoiceModal(originalMeal,key){
    closeModalSafe();
    var overlay=document.createElement('div');overlay.className='modal-overlay';overlay.id='modal-overlay';
    overlay.innerHTML='<div class="modal"><div class="modal-hd"><div><div class="modal-title">Swap '+(originalMeal.type||'meal')+'</div><div style="font-size:11px;color:var(--muted);margin-top:2px">'+(originalMeal.name||'')+'</div></div><button class="modal-close" id="modal-x">&times;</button></div><div class="modal-body"><div class="swap-choice-grid"><button id="swap-ai-choice" class="entry-card"><div class="entry-card-title">AI-generated meal</div><div class="entry-card-copy">Find a similar alternative that keeps calories and macros close.</div><div class="entry-card-meta">Generate swap</div></button><button id="swap-manual-choice" class="entry-card"><div class="entry-card-title">Manual meal input</div><div class="entry-card-copy">Type what you ate. ReBourne estimates calories, protein, carbs and fats.</div><div class="entry-card-meta">Enter meal</div></button></div></div></div>';
    document.body.appendChild(overlay);
    var mx=byId('modal-x');if(mx)mx.onclick=closeModalSafe;overlay.onclick=function(e){if(e.target===overlay)closeModalSafe();};
    var ai=byId('swap-ai-choice');if(ai)ai.onclick=function(){closeModalSafe();if(window.__rebOldSwapMealDirect)return window.__rebOldSwapMealDirect(originalMeal,key);};
    var manual=byId('swap-manual-choice');if(manual)manual.onclick=function(){showManualMealModal(originalMeal,key);};
  }
  window.openSwapChoiceModal=openSwapChoiceModal;

  function manualMealFallback(name,desc,originalMeal){
    var txt=(name+' '+desc).toLowerCase(),base=originalMeal||{calories:520,protein:35,carbs:55,fat:18};
    var calories=safeNum(base.calories,520),protein=safeNum(base.protein,35),carbs=safeNum(base.carbs,55),fat=safeNum(base.fat,18);
    if(txt.indexOf('salad')>=0){calories-=120;carbs-=20;fat-=4;}
    if(txt.indexOf('pizza')>=0||txt.indexOf('burger')>=0){calories+=180;fat+=12;carbs+=18;}
    if(txt.indexOf('rice')>=0||txt.indexOf('pasta')>=0||txt.indexOf('wrap')>=0){carbs+=25;calories+=110;}
    if(txt.indexOf('chicken')>=0||txt.indexOf('turkey')>=0||txt.indexOf('tuna')>=0){protein+=18;calories+=80;}
    if(txt.indexOf('protein')>=0||txt.indexOf('whey')>=0){protein+=25;calories+=120;}
    if(txt.indexOf('oil')>=0||txt.indexOf('avocado')>=0||txt.indexOf('cheese')>=0){fat+=12;calories+=120;}
    return{calories:Math.max(150,Math.round(calories)),protein:Math.max(5,Math.round(protein)),carbs:Math.max(5,Math.round(carbs)),fat:Math.max(3,Math.round(fat))};
  }
  async function estimateManualMacros(originalMeal){
    var name=((byId('manual-meal-name')||{}).value||'Manual meal').trim(),desc=((byId('manual-meal-desc')||{}).value||'').trim(),btn=byId('manual-estimate'),macros=null;
    if(btn){btn.disabled=true;btn.textContent='Estimating...';}
    try{
      var prompt='Estimate nutrition macros for this meal. Meal name: '+name+'. Details: '+desc+'. Return ONLY valid JSON: {"calories":0,"protein":0,"carbs":0,"fat":0}. Use grams for protein/carbs/fat.';
      var res=typeof apiMessage==='function'?await apiMessage({model:'claude-haiku-4-5-20251001',max_tokens:160,messages:[{role:'user',content:prompt}]}):await fetch('/api/message',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:160,messages:[{role:'user',content:prompt}]})});
      if(res.ok){var data=await res.json(),blocks=Array.isArray(data.content)?data.content:[],text=(blocks.find(function(b){return b.type==='text';})||{}).text||'',s=text.indexOf('{'),e=text.lastIndexOf('}');if(s>=0&&e>s)macros=JSON.parse(text.slice(s,e+1));}
    }catch(e){}
    if(!macros)macros=manualMealFallback(name,desc,originalMeal);
    [['manual-calories','calories'],['manual-protein','protein'],['manual-carbs','carbs'],['manual-fat','fat']].forEach(function(p){var el=byId(p[0]);if(el)el.value=Math.round(safeNum(macros[p[1]]));});
    if(btn){btn.disabled=false;btn.textContent='Regenerate macros';}
  }
  async function saveManualMeal(originalMeal,key){
    var name=((byId('manual-meal-name')||{}).value||'Manual meal').trim();
    if(!byId('manual-calories')||!byId('manual-calories').value)await estimateManualMacros(originalMeal);
    var typeEl=byId('manual-meal-type'),fav=byId('manual-save-fav'),desc=byId('manual-meal-desc');
    var newMeal={type:typeEl?typeEl.value:(originalMeal.type||'SNACK'),name:name,calories:parseInt((byId('manual-calories')||{}).value,10)||0,protein:parseInt((byId('manual-protein')||{}).value,10)||0,carbs:parseInt((byId('manual-carbs')||{}).value,10)||0,fat:parseInt((byId('manual-fat')||{}).value,10)||0,manual:true,notes:(desc&&desc.value.trim())||''};
    if(key&&key.indexOf('add-')===0&&(!fav||fav.checked))rememberSavedMeal(newMeal);
    var ok=key&&key.indexOf('add-')===0?applyManualMealAdd(key,newMeal):applyMealSwap(originalMeal,key,newMeal);
    if(ok){closeModalSafe();rerender();}
  }
  function showManualMealModal(originalMeal,key){
    closeModalSafe();
    var isAdd=String(key||'').indexOf('add-')===0,savedHtml='';
    if(isAdd&&window.dash&&dash.savedMeals&&dash.savedMeals.length){
      savedHtml+='<div class="modal-section-lbl">Saved meals</div><div class="saved-meal-grid">';
      dash.savedMeals.slice(0,6).forEach(function(meal,i){savedHtml+='<button class="saved-meal-btn" id="saved-meal-'+i+'"><div class="saved-meal-name">'+meal.name+'</div><div class="saved-meal-meta">'+meal.calories+' kcal &bull; P:'+meal.protein+' C:'+meal.carbs+' F:'+meal.fat+'</div></button>';});
      savedHtml+='</div>';
    }
    var overlay=document.createElement('div');overlay.className='modal-overlay';overlay.id='modal-overlay';
    overlay.innerHTML='<div class="modal"><div class="modal-hd"><div><div class="modal-title">'+(isAdd?'Add manual meal':'Manual meal input')+'</div><div style="font-size:11px;color:var(--muted);margin-top:2px">Macros will be estimated automatically.</div></div><button class="modal-close" id="modal-x">&times;</button></div><div class="modal-body">'+savedHtml+(isAdd?'<div class="field"><label>Meal type</label><select id="manual-meal-type"><option>BREAKFAST</option><option>LUNCH</option><option>DINNER</option><option selected>SNACK</option><option>POST-WORKOUT</option></select></div>':'')+'<div class="field"><label>Meal name</label><input type="text" id="manual-meal-name" placeholder="e.g. Chicken burrito bowl"></div><div class="field"><label>What was in it?</label><textarea id="manual-meal-desc" placeholder="Add ingredients, portion sizes, brands or restaurant details if you know them."></textarea><div class="field-hint">More detail gives a better estimate. You can edit the generated numbers before saving.</div></div><button class="swap-btn" id="manual-estimate">Generate macros</button><div class="modal-macros" style="margin-top:14px"><div class="modal-macro"><input type="number" id="manual-calories" placeholder="0" style="text-align:center;font-weight:800"><div class="modal-macro-lbl">Kcal</div></div><div class="modal-macro"><input type="number" id="manual-protein" placeholder="0" style="text-align:center;font-weight:800"><div class="modal-macro-lbl">Protein g</div></div><div class="modal-macro"><input type="number" id="manual-carbs" placeholder="0" style="text-align:center;font-weight:800"><div class="modal-macro-lbl">Carbs g</div></div><div class="modal-macro"><input type="number" id="manual-fat" placeholder="0" style="text-align:center;font-weight:800"><div class="modal-macro-lbl">Fat g</div></div></div>'+(isAdd?'<label class="save-fav-row"><input type="checkbox" id="manual-save-fav" checked> Save to my meals</label>':'')+'<button class="log-btn" id="manual-save">'+(isAdd?'Add meal and mark eaten':'Save manual meal')+'</button></div></div>';
    document.body.appendChild(overlay);
    var mx=byId('modal-x');if(mx)mx.onclick=closeModalSafe;overlay.onclick=function(e){if(e.target===overlay)closeModalSafe();};
    if(isAdd&&window.dash&&dash.savedMeals){dash.savedMeals.slice(0,6).forEach(function(meal,i){var btn=byId('saved-meal-'+i);if(btn)btn.onclick=function(){fillManualMealFromSaved(meal);};});}
    var est=byId('manual-estimate');if(est)est.onclick=function(){estimateManualMacros(originalMeal);};
    var saveBtn=byId('manual-save');if(saveBtn)saveBtn.onclick=function(){saveManualMeal(originalMeal,key);};
  }
  window.showManualMealModal=showManualMealModal;

  if(typeof window.swapMealDirect==='function'&&!window.__rebOldSwapMealDirect){
    window.__rebOldSwapMealDirect=window.swapMealDirect;
    window.swapMealDirect=function(originalMeal,key){openSwapChoiceModal(originalMeal,key);};
  }
  if(typeof window.swapMeal==='function'&&!window.__rebOldSwapMeal){
    window.__rebOldSwapMeal=window.swapMeal;
    window.swapMeal=function(originalMeal,key){openSwapChoiceModal(originalMeal,key);};
  }

  var oldBind=window.bindDashTab;
  if(typeof oldBind==='function'){
    window.bindDashTab=function(){
      var out=oldBind.apply(this,arguments);
      injectOverloadPanels();
      addManualEntryBars();
      var apply=byId('apply-cal-adjust');
      if(apply)apply.onclick=function(){dash.calOffset=getCalorieAdjustment(getWeeklyCoachReview(getWeek())).delta||0;save();rerender();};
      var reset=byId('reset-cal-adjust');
      if(reset)reset.onclick=function(){dash.calOffset=0;save();rerender();};
      var add1=byId('today-add-meal'),add2=byId('nutrition-add-meal');
      if(add1)add1.onclick=function(){showAddMealModal();};
      if(add2)add2.onclick=function(){showAddMealModal();};
      return out;
    };
  }

  setTimeout(function(){rerender();},0);
})();
