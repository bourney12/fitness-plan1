(function(){
  if(window.__rebProgressAnalyticsLoaded)return;
  window.__rebProgressAnalyticsLoaded=true;

  function byId(id){return document.getElementById(id);}
  function n(v,fallback){var x=parseFloat(v);return isFinite(x)?x:(fallback||0);}
  function week(){return window.dash&&typeof dash.week==='number'?dash.week:0;}
  function dayKey(w,d){return 'w'+w+'d'+d;}
  function cleanExerciseName(ex){return String(ex||'').split('\u2014')[0].split('\u2013')[0].split('(')[0].trim();}
  function parseWorkoutKey(key){var m=String(key||'').match(/w(\d+)d(\d+)ex(\d+)/);return m?{w:+m[1],d:+m[2],ex:+m[3]}:null;}
  function rerender(){
    try{
      var app=byId('app');
      if(app&&typeof renderDashboard==='function'&&window.allWeeks&&allWeeks.length)renderDashboard(app);
    }catch(e){}
  }

  var css=[
    '.analytics-card{background:linear-gradient(135deg,rgba(12,30,56,.98),rgba(6,12,24,.98));border:1px solid rgba(126,152,188,.24);border-radius:18px;box-shadow:0 18px 40px rgba(0,0,0,.18);padding:18px;margin:18px 0}',
    '.analytics-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px}.analytics-kicker{font-size:10px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:var(--steel3,#7E98BC)}.analytics-title{font-size:19px;font-weight:900;color:var(--white,#F0F4FF);margin-top:4px}.analytics-sub{font-size:12px;line-height:1.5;color:var(--muted,#89A2C2);margin-top:5px}.analytics-score{min-width:82px;text-align:center;border-radius:16px;padding:10px;border:1px solid rgba(78,204,163,.22);background:rgba(78,204,163,.08)}.analytics-score b{display:block;font-size:24px;line-height:1;color:var(--white,#F0F4FF)}.analytics-score span{display:block;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.08em;color:#4ECCA3;margin-top:5px}',
    '.analytics-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:14px 0}.analytics-stat{padding:11px;border-radius:14px;background:rgba(5,8,15,.34);border:1px solid rgba(126,152,188,.14)}.analytics-stat-val{font-size:16px;font-weight:900;color:var(--white,#F0F4FF)}.analytics-stat-lbl{font-size:10px;color:var(--muted,#89A2C2);line-height:1.3;margin-top:4px}',
    '.analytics-section{margin-top:14px;padding-top:14px;border-top:1px solid rgba(126,152,188,.16)}.analytics-section-title{font-size:10px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:var(--steel3,#7E98BC);margin-bottom:10px}.analytics-split{display:grid;grid-template-columns:1fr 1fr;gap:10px}.analytics-mini{border-radius:14px;background:rgba(5,8,15,.28);border:1px solid rgba(126,152,188,.13);padding:12px}.analytics-mini-title{font-size:12px;font-weight:900;color:var(--white,#F0F4FF);margin-bottom:8px}',
    '.analytics-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid rgba(126,152,188,.1);font-size:12px;color:var(--silver,#B8C8DC)}.analytics-row:last-child{border-bottom:none}.analytics-row strong{color:var(--white,#F0F4FF)}.analytics-row span{color:var(--muted,#89A2C2);font-size:11px;text-align:right}',
    '.analytics-bars{display:grid;gap:8px}.analytics-bar-row{display:grid;grid-template-columns:46px 1fr 52px;align-items:center;gap:8px;font-size:11px;color:var(--muted,#89A2C2)}.analytics-track{height:7px;border-radius:999px;background:rgba(126,152,188,.14);overflow:hidden}.analytics-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#3A5F96,#4ECCA3)}.analytics-empty{font-size:12px;line-height:1.5;color:var(--muted,#89A2C2);padding:12px;border-radius:14px;background:rgba(5,8,15,.25);border:1px dashed rgba(126,152,188,.2)}',
    '@media(max-width:620px){.analytics-grid,.analytics-split{grid-template-columns:1fr}.analytics-head{flex-direction:column;align-items:stretch}.analytics-bar-row{grid-template-columns:40px 1fr 46px}}'
  ].join('\n');
  var style=document.createElement('style');
  style.textContent=css;
  document.head.appendChild(style);

  function fmt(value,suffix){
    if(value===null||typeof value==='undefined'||!isFinite(value))return '--';
    var rounded=Math.abs(value)>=100?Math.round(value):Math.round(value*10)/10;
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
      var parsed=parseWorkoutKey(key);
      if(!parsed)return;
      (dash.workoutLogs[key]||[]).forEach(function(set,setIndex){
        var weight=n(set.weight),reps=n(set.reps);
        if(!weight&&!reps)return;
        entries.push({
          key:key,w:parsed.w,d:parsed.d,ex:parsed.ex,set:setIndex,
          exercise:set.exercise||'',label:cleanExerciseName(set.exercise||'Exercise'),
          weight:weight,reps:reps,volume:weight*reps,e1rm:(weight&&reps)?weight*(1+reps/30):0
        });
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
        var duration=n(log.duration),distance=n(log.distance),type=log.type||'Cardio';
        if(!duration)return;
        entries.push({w:w,d:d,type:type,duration:duration,distance:distance,pace:distance?duration/distance:null,calories:n(log.calories)});
      });
    });
    entries.sort(function(a,b){return a.w===b.w?a.d-b.d:a.w-b.w;});
    return entries;
  }
  function analyticsData(){
    var sets=workoutEntries(),cardio=cardioEntries(),weekCount=(window.allWeeks&&allWeeks.length)||0;
    var volumeByWeek={},sessions={},exerciseBest={},prs=[];
    sets.forEach(function(set){
      volumeByWeek[set.w]=(volumeByWeek[set.w]||0)+set.volume;
      sessions['w'+set.w+'d'+set.d]=true;
      var key=set.label.toLowerCase();
      var prev=exerciseBest[key];
      if(!prev||set.e1rm>prev.e1rm||(!set.e1rm&&set.weight>prev.weight)){
        var isPr=!!prev&&(set.e1rm>prev.e1rm||set.weight>prev.weight);
        exerciseBest[key]={label:set.label,weight:set.weight,reps:set.reps,e1rm:set.e1rm,w:set.w,d:set.d};
        if(isPr)prs.push(exerciseBest[key]);
      }
    });
    var planned=0,done=0;
    (window.allWeeks||[]).forEach(function(planWeek,wi){
      (planWeek.trainingPlan||[]).forEach(function(session,di){
        if(session.exercises&&session.exercises.length){
          planned++;
          if(window.dash&&dash.adherence&&dash.adherence['train-w'+wi+'d'+di])done++;
        }
      });
    });
    var bodySeries=Object.keys((window.dash&&dash.measurements)||{}).sort(function(a,b){return +a-+b;}).map(function(key){
      var measurement=dash.measurements[key]||{};
      return {w:+key,weight:n(measurement.weight),waist:n(measurement.waist),bodyfat:n(measurement.bodyfat),steps:n(measurement.steps)};
    });
    var runs=cardio.filter(function(entry){return (entry.type||'').toLowerCase().indexOf('running')>=0&&entry.distance&&entry.duration;});
    var bestPace=runs.reduce(function(best,run){return !best||run.pace<best.pace?run:best;},null);
    var latestPace=runs.length?runs[runs.length-1]:null;
    var topExercises=Object.keys(exerciseBest).map(function(key){return exerciseBest[key];}).sort(function(a,b){return (b.e1rm||b.weight)-(a.e1rm||a.weight);}).slice(0,4);
    return {
      sets:sets,cardio:cardio,weekCount:weekCount,volumeByWeek:volumeByWeek,
      adherence:planned?Math.round(done/planned*100):0,planned:planned,done:done,
      currentVolume:volumeByWeek[week()]||0,topExercises:topExercises,prs:prs.slice(-5).reverse(),
      bodySeries:bodySeries,latestBody:bodySeries.length?bodySeries[bodySeries.length-1]:null,firstBody:bodySeries.length?bodySeries[0]:null,
      bestPace:bestPace,latestPace:latestPace,totalDistance:cardio.reduce(function(sum,entry){return sum+(entry.distance||0);},0)
    };
  }
  function weekBars(volumeByWeek,weekCount){
    var weeks=[],max=0;
    for(var i=0;i<Math.max(weekCount,1);i++){var value=volumeByWeek[i]||0;weeks.push({week:i,value:value});max=Math.max(max,value);}
    if(!max)return '<div class="analytics-empty">Log sets with weight and reps to see weekly training volume.</div>';
    return '<div class="analytics-bars">'+weeks.map(function(item){
      var width=Math.max(4,Math.round(item.value/max*100));
      return '<div class="analytics-bar-row"><span>W'+(item.week+1)+'</span><div class="analytics-track"><div class="analytics-fill" style="width:'+width+'%"></div></div><strong>'+fmt(item.value,'kg')+'</strong></div>';
    }).join('')+'</div>';
  }
  function renderProgressAnalytics(){
    var data=analyticsData();
    var bodyDelta=(data.latestBody&&data.firstBody&&data.latestBody.weight&&data.firstBody.weight)?Math.round((data.latestBody.weight-data.firstBody.weight)*10)/10:null;
    var waistDelta=(data.latestBody&&data.firstBody&&data.latestBody.waist&&data.firstBody.waist)?Math.round((data.latestBody.waist-data.firstBody.waist)*10)/10:null;
    var scoreParts=[data.adherence||0,data.sets.length?80:25,data.cardio.length?75:35,data.bodySeries.length>=2?80:35];
    var score=Math.round(scoreParts.reduce(function(sum,value){return sum+value;},0)/scoreParts.length);
    var html='<div class="analytics-card"><div class="analytics-head"><div><div class="analytics-kicker">Progress analytics</div><div class="analytics-title">Performance dashboard</div><div class="analytics-sub">Strength, conditioning and body trend signals from the data logged so far.</div></div><div class="analytics-score"><b>'+score+'%</b><span>Data depth</span></div></div>';
    html+='<div class="analytics-grid">';
    html+='<div class="analytics-stat"><div class="analytics-stat-val">'+data.adherence+'%</div><div class="analytics-stat-lbl">Training adherence</div></div>';
    html+='<div class="analytics-stat"><div class="analytics-stat-val">'+fmt(data.currentVolume,'kg')+'</div><div class="analytics-stat-lbl">Week volume</div></div>';
    html+='<div class="analytics-stat"><div class="analytics-stat-val">'+data.sets.length+'</div><div class="analytics-stat-lbl">Logged sets</div></div>';
    html+='<div class="analytics-stat"><div class="analytics-stat-val">'+fmtPace(data.bestPace&&data.bestPace.pace)+'</div><div class="analytics-stat-lbl">Best run pace</div></div>';
    html+='</div><div class="analytics-section"><div class="analytics-section-title">Training load</div><div class="analytics-split"><div class="analytics-mini"><div class="analytics-mini-title">Weekly volume</div>'+weekBars(data.volumeByWeek,data.weekCount)+'</div><div class="analytics-mini"><div class="analytics-mini-title">Strength highlights</div>';
    if(data.topExercises.length){data.topExercises.forEach(function(exercise){html+='<div class="analytics-row"><strong>'+exercise.label+'</strong><span>'+fmt(exercise.weight,'kg')+' x '+fmt(exercise.reps,'')+(exercise.e1rm?' - e1RM '+fmt(exercise.e1rm,'kg'):'')+'</span></div>';});}
    else html+='<div class="analytics-empty">Save workout sets to unlock exercise PBs and estimated 1RM.</div>';
    html+='</div></div></div><div class="analytics-section"><div class="analytics-section-title">Conditioning and body</div><div class="analytics-split"><div class="analytics-mini"><div class="analytics-mini-title">Cardio trend</div>';
    html+='<div class="analytics-row"><strong>Total distance</strong><span>'+fmt(data.totalDistance,'km')+'</span></div><div class="analytics-row"><strong>Latest run pace</strong><span>'+fmtPace(data.latestPace&&data.latestPace.pace)+'</span></div><div class="analytics-row"><strong>Cardio sessions</strong><span>'+data.cardio.length+'</span></div>';
    html+='</div><div class="analytics-mini"><div class="analytics-mini-title">Body trend</div><div class="analytics-row"><strong>Weight change</strong><span>'+(bodyDelta===null?'--':(bodyDelta>0?'+':'')+bodyDelta+'kg')+'</span></div><div class="analytics-row"><strong>Waist change</strong><span>'+(waistDelta===null?'--':(waistDelta>0?'+':'')+waistDelta+'cm')+'</span></div><div class="analytics-row"><strong>Latest steps</strong><span>'+(data.latestBody&&data.latestBody.steps?fmt(data.latestBody.steps,''):'--')+'</span></div></div></div></div>';
    if(data.prs.length){html+='<div class="analytics-section"><div class="analytics-section-title">Recent PRs</div>';data.prs.forEach(function(pr){html+='<div class="analytics-row"><strong>'+pr.label+'</strong><span>Week '+(pr.w+1)+' - '+fmt(pr.weight,'kg')+' x '+fmt(pr.reps,'')+'</span></div>';});html+='</div>';}
    html+='</div>';
    return html;
  }
  window.renderProgressAnalytics=renderProgressAnalytics;

  function install(){
    if(typeof window.renderProgressTab!=='function'||window.__rebProgressAnalyticsWrapped)return;
    window.__rebProgressAnalyticsWrapped=true;
    var oldProgress=window.renderProgressTab;
    window.renderProgressTab=function(){
      var base=oldProgress.apply(this,arguments);
      return renderProgressAnalytics()+base;
    };
    setTimeout(rerender,0);
  }
  install();
  setTimeout(install,250);
})();
