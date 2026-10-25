
(()=>{'use strict';
const W=3200,H=2500;
const stops=[
 {
  "id": "peacock",
  "x": 370,
  "y": 660,
  "name": "Peacock India",
  "logo": "P",
  "period": "2015–2016 · Design intern",
  "title": "Where the story began.",
  "short": "I discovered how ideas become production-ready visuals through my first professional design experience.",
  "detail": "My internship introduced me to concept development, layouts, image editing and the discipline of delivering commercial visual work.",
  "link": "",
  "tone": "#b17a64",
  "type": "experience"
 },
 {
  "id": "ad2pro",
  "x": 650,
  "y": 410,
  "name": "Ad2pro Media Solutions",
  "logo": "A",
  "period": "2016–2018 · Graphic designer",
  "title": "Craft became a discipline.",
  "short": "Working with commercial brands strengthened my typography, accuracy and design-production skills.",
  "detail": "At Ad2pro Media Solutions I created digital and print advertising for clients in Australia and New Zealand, learning brand requirements, revision workflows and production specifications.",
  "link": "",
  "tone": "#67839a",
  "type": "experience"
 },
 {
  "id": "ipac",
  "x": 940,
  "y": 910,
  "name": "I-PAC",
  "logo": "I",
  "period": "2018–2019 · Senior graphic designer",
  "title": "Design under real pressure.",
  "short": "Political communication taught me to turn complex campaign briefs into clear visual messages.",
  "detail": "At I-PAC I worked with content and campaign teams across digital, editorial, presentation and field formats, building speed without losing clarity.",
  "link": "/work/nation-building",
  "tone": "#66895f",
  "type": "experience"
 },
 {
  "id": "namo",
  "x": 1210,
  "y": 600,
  "name": "Nation with NaMo",
  "logo": "N",
  "period": "From 2019 · Campaign design",
  "title": "Stories designed for scale.",
  "short": "Campaign work made me think in systems: visual direction, messages, teams and real-world delivery.",
  "detail": "My experience with Nation with NaMo deepened my approach to creative direction and multi-format political communication. The next part of this map is different: the products I created, not employers.",
  "link": "/work/nation-building",
  "tone": "#a47f58",
  "type": "experience"
 },
 {
  "id": "aistudio",
  "x": 1440,
  "y": 1120,
  "name": "AI Design Studio",
  "logo": "AI",
  "period": "2026 · Product I created",
  "title": "From designing to building.",
  "short": "I explored an editable AI-assisted creative workspace designed around real production workflows.",
  "detail": "AI Design Studio brings image generation, refinement, layer control, review and export into one product experience. This marks the transition from my employment journey to independently created products.",
  "link": "/work/ai-design-studio",
  "tone": "#9b76aa",
  "type": "product"
 },
 {
  "id": "content",
  "x": 1740,
  "y": 800,
  "name": "Content Studio",
  "logo": "C",
  "period": "2026 · Product I created",
  "title": "Making information useful.",
  "short": "A practical content-operations workspace grew out of the challenges I had experienced in campaign production.",
  "detail": "Content Studio combines news and video discovery, source filtering, translation, content creation and team workflows into a focused product.",
  "link": "/work/content-studio",
  "tone": "#4b9b89",
  "type": "product"
 },
 {
  "id": "intelligence",
  "x": 1980,
  "y": 1370,
  "name": "Social Media Intelligence",
  "logo": "SI",
  "period": "2026 · Product I created",
  "title": "Signals became understanding.",
  "short": "I designed an experience to turn scattered social-platform metrics into clear, usable information.",
  "detail": "Social Media Intelligence explores performance comparisons, account reporting and data storytelling, with a focus on reducing dashboard complexity.",
  "link": "/work/social-media-intelligence",
  "tone": "#5f91c2",
  "type": "product"
 },
 {
  "id": "tracker",
  "x": 2250,
  "y": 980,
  "name": "Content Tracker",
  "logo": "CT",
  "period": "2026 · Product I created",
  "title": "From posts to a clear record.",
  "short": "A simpler way to collect, organize and revisit published content across social channels.",
  "detail": "Content Tracker focuses on team submission and tracking of published Facebook, Instagram and X links. It reduces manual searching and operational friction.",
  "link": "/work/content-tracker",
  "tone": "#ad7056",
  "type": "product"
 },
 {
  "id": "splitmate",
  "x": 2530,
  "y": 1610,
  "name": "SplitMate",
  "logo": "SM",
  "period": "2026 · Product I created",
  "title": "Small interactions. Real value.",
  "short": "A mobile-first experience for managing shared expenses with a focus on clarity and privacy.",
  "detail": "SplitMate is a private two-person expense application built around flexible splits, balances and settlements without unnecessary complexity.",
  "link": "/work/splitmate",
  "tone": "#65916e",
  "type": "product"
 },
 {
  "id": "clip",
  "x": 2870,
  "y": 1870,
  "name": "Clip Studio",
  "logo": "CL",
  "period": "2026 · Product I created",
  "title": "Building for everyday creators.",
  "short": "A hybrid media utility brought together quality choices, supported video links and quick editing.",
  "detail": "Clip Studio combines supported downloads, format selection, history and Quick Clip in one workflow. The journey continues through product building and creative technology.",
  "link": "/work/clip-studio",
  "tone": "#c38a57",
  "type": "product"
 }
];
const $=id=>document.getElementById(id);const world=$('mapWorld'),pinRoot=$('mapPins'),svg=$('mapSVG'),route=$('routeBlue'),core=$('routeCore'),outline=$('routeOutline'),progress=$('routeProgress'),card=$('storyCard'),body=$('storyBody'),extra=$('storyExtra'),more=$('moreBtn'),toneDefault='#b17a64';
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let current=0,sound=false,audio=null,gestureStart=null;
let pathLength=0,stopDistances=[],cameraDistance=0,targetDistance=0,cameraVelocity=0,cameraBank=0;
let cameraFrame=0,previousFrame=0,arriveTimer=0,wheelAt=0;
const marker=$('heroMarker'),pointer=marker.querySelector('.hero-arrow'),compassNeedle=$('compassNeedle');
const lerp=(a,b,t)=>a+(b-a)*t;
function seeded(n){let x=Math.sin(n*79.71+17.13)*43758.5453;return x-Math.floor(x)}
function drawCity(){
 const ns='http://www.w3.org/2000/svg';
 const add=(parent,tag,attrs)=>{const el=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,String(v)));parent.append(el);return el};
 const parks=$('parks'),blocks=$('blocks'),roads=$('roadGrid');
 const parkCoords=[[0,200,510,490],[1070,350,330,270],[2520,160,650,580],[360,1840,640,540],[2600,2010,380,360]];
 parkCoords.forEach(([x,y,w,h],i)=>{add(parks,'rect',{x,y,width:w,height:h,rx:140,fill:i%2?'#1e3025':'#233428',opacity:'.7'})});
 for(let row=0;row<15;row++){
 for(let col=0;col<20;col++){
 const x=col*165+8,y=row*169+9,n=row*31+col;
 const w=146,h=146;
 add(blocks,'rect',{x,y,width:w,height:h,rx:2,fill:seeded(n)<.3?'#252629':'#292a2c',stroke:'#323335','stroke-width':2});
 if(seeded(n+7)>.21){
  const split=seeded(n+19)>.5;
  if(split){add(blocks,'rect',{x:x+14,y:y+13,width:55,height:55,fill:'#303133'});add(blocks,'rect',{x:x+80,y:y+13,width:52,height:55,fill:'#313234'});add(blocks,'rect',{x:x+14,y:y+80,width:118,height:52,fill:'#2e3031'})}
  else{add(blocks,'rect',{x:x+13,y:y+12,width:117,height:62,fill:'#303132'});add(blocks,'rect',{x:x+13,y:y+83,width:53,height:50,fill:'#313234'});add(blocks,'rect',{x:x+77,y:y+83,width:53,height:50,fill:'#313234'})}
 }
 }
 }
 for(let i=0;i<20;i++){const x=i*165;add(roads,'line',{x1:x,y1:0,x2:x,y2:H,stroke:'#363739','stroke-width':10})}
 for(let i=0;i<16;i++){const y=i*169;add(roads,'line',{x1:0,y1:y,x2:W,y2:y,stroke:'#37383a','stroke-width':10})}
 const diagonals=[[0,330,2100,2290],[840,0,3150,1980],[0,1560,1650,0]];
 diagonals.forEach(v=>{add(roads,'line',{x1:v[0],y1:v[1],x2:v[2],y2:v[3],stroke:'#1b1c1e','stroke-width':30});add(roads,'line',{x1:v[0],y1:v[1],x2:v[2],y2:v[3],stroke:'#3c3c3e','stroke-width':9})});
 add(roads,'path',{d:'M0 1330 Q780 1320 1490 1470 T3200 1530',stroke:'#68592d','stroke-width':22,fill:'none',opacity:'.55'});
}
function routePath(points){
 let d='M '+points[0].x+' '+points[0].y;
 for(let i=0;i<points.length-1;i++){
  const p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)];
  const c1x=p1.x+(p2.x-p0.x)/6,c1y=p1.y+(p2.y-p0.y)/6,c2x=p2.x-(p3.x-p1.x)/6,c2y=p2.y-(p3.y-p1.y)/6;
  d+=' C '+c1x+' '+c1y+' '+c2x+' '+c2y+' '+p2.x+' '+p2.y;
 }
 return d;
}
function makePins(){
 stops.forEach((s,i)=>{
  const b=document.createElement('button');b.type='button';b.className='map-pin';b.dataset.index=i;
  b.style.left=s.x+'px';b.style.top=s.y+'px';b.style.setProperty('--pin-tone',s.tone);
  b.setAttribute('aria-label','Go to stop '+(i+1)+': '+s.name);b.innerHTML='<span class="pin-round"><span>'+s.logo+'</span></span><span class="pin-label">'+s.name+'</span>';
  b.addEventListener('click',()=>selectStop(i));pinRoot.append(b);
 });
}

function measureRoute(){
 pathLength=route.getTotalLength();stopDistances=[0];let lower=0;
 for(let i=1;i<stops.length-1;i++){
  let best=Infinity,bestAt=lower;
  for(let d=lower+3;d<pathLength;d+=12){
   const p=route.getPointAtLength(d),error=(p.x-stops[i].x)**2+(p.y-stops[i].y)**2;
   if(error<best){best=error;bestAt=d}
  }
  for(let d=Math.max(lower,bestAt-12);d<=Math.min(pathLength,bestAt+12);d++){
   const p=route.getPointAtLength(d),error=(p.x-stops[i].x)**2+(p.y-stops[i].y)**2;
   if(error<best){best=error;bestAt=d}
  }
  stopDistances.push(bestAt);lower=bestAt;
 }
 stopDistances.push(pathLength);
}
function drawCamera(){
 const vw=innerWidth,vh=innerHeight,mobile=vw<=680;
 const pos=clamp(cameraDistance,0,pathLength);
 const point=route.getPointAtLength(pos);
 const before=route.getPointAtLength(Math.max(0,pos-28));
 const after=route.getPointAtLength(Math.min(pathLength,pos+28));
 const slope=Math.atan2(after.y-before.y,after.x-before.x)*180/Math.PI;
 const desiredBank=reducedMotion.matches?0:clamp(-slope*.045,-3.6,3.6);
 cameraBank=lerp(cameraBank,desiredBank,.16);
 const moving=Math.abs(targetDistance-pos)>2||Math.abs(cameraVelocity)>9;
 const baseZoom=mobile?(vw<380?.71:.77):vw<=1050?.87:1.01;
 const speedZoom=reducedMotion.matches?0:clamp(Math.abs(cameraVelocity)/4300,0,.07);
 const zoom=baseZoom*(1-speedZoom);
 const anchorX=vw*(mobile?.5:.56),anchorY=vh*(mobile?(vh<680?.29:.31):.38);
 // Route stays under the stationary position pointer while the city moves.
 world.style.transform='translate3d('+anchorX+'px,'+anchorY+'px,0) rotate('+cameraBank.toFixed(3)+'deg) scale('+zoom.toFixed(4)+') translate3d('+(-point.x).toFixed(2)+'px,'+(-point.y).toFixed(2)+'px,0)';
 pointer.style.transform='rotate('+(slope+cameraBank+90).toFixed(2)+'deg)';
 compassNeedle.style.transform='rotate('+(slope+cameraBank+90).toFixed(2)+'deg)';
 marker.classList.toggle('is-moving',moving);
 drawTravelProgress();
}
function animateCamera(timestamp){
 cameraFrame=0;
 if(document.hidden){cameraDistance=targetDistance;cameraVelocity=0;previousFrame=0;drawCamera();return}
 if(reducedMotion.matches){cameraDistance=targetDistance;cameraVelocity=0;previousFrame=0;drawCamera();return}
 const dt=previousFrame?clamp((timestamp-previousFrame)/1000,.001,.032):.016;
 previousFrame=timestamp;
 // Damped spring: retargets without interruption, preserving camera momentum.
 const force=(targetDistance-cameraDistance)*39-cameraVelocity*12.5;
 cameraVelocity+=force*dt;cameraDistance+=cameraVelocity*dt;
 if(Math.abs(targetDistance-cameraDistance)<.8&&Math.abs(cameraVelocity)<3){
  cameraDistance=targetDistance;cameraVelocity=0;previousFrame=0;
  drawCamera();marker.classList.remove('is-moving');
  marker.classList.remove('has-arrived');void marker.offsetWidth;marker.classList.add('has-arrived');
  clearTimeout(arriveTimer);arriveTimer=setTimeout(()=>marker.classList.remove('has-arrived'),750);
  return;
 }
 drawCamera();cameraFrame=requestAnimationFrame(animateCamera);
}
function camera(){drawCamera()}
function startCamera(){if(!cameraFrame){previousFrame=0;cameraFrame=requestAnimationFrame(animateCamera)}}
function beep(){
 if(!sound)return;
 try{
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return;
  if(!audio)audio=new AC();
  if(audio.state==='suspended')audio.resume();
  const osc=audio.createOscillator(),gain=audio.createGain(),t=audio.currentTime;
  osc.type='sine';osc.frequency.setValueAtTime(540,t);osc.frequency.exponentialRampToValueAtTime(820,t+.09);
  gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(.055,t+.018);gain.gain.exponentialRampToValueAtTime(.0001,t+.13);
  osc.connect(gain);gain.connect(audio.destination);osc.start(t);osc.stop(t+.14);
 }catch{}
}
function renderStory(){
 const s=stops[current];
 card.style.setProperty('--stop-tone',s.tone);
 if(!reducedMotion.matches){
  body.getAnimations().forEach(a=>a.cancel());
  body.animate([{opacity:.48,transform:'translate3d(0,10px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],{duration:450,easing:'cubic-bezier(.16,1,.3,1)'});
 }
 $('storyLogo').textContent=s.logo;$('storyLogo').style.background=s.tone;
 $('storyCompany').textContent=s.name;$('storyDate').textContent=s.period;
 $('storyPhase').textContent=s.type==='experience'?'EMPLOYMENT EXPERIENCE':'INDEPENDENTLY CREATED PRODUCT';
 $('storyTitle').textContent=s.title;$('storySummary').textContent=s.short;$('storyDetail').textContent=s.detail;
 $('storyCounter').textContent=String(current+1).padStart(2,'0')+' / '+String(stops.length).padStart(2,'0');$('stopNumber').textContent=(current+1)+' / '+stops.length;
 const link=$('caseLink');
 if(s.link){link.hidden=false;link.href=s.link;link.textContent='Explore related case study ↗'}
 else{link.hidden=true;link.removeAttribute('href')}
 extra.hidden=true;more.setAttribute('aria-expanded','false');more.innerHTML='Read more <span aria-hidden="true">⌄</span>';body.scrollTop=0;
 $('prevBtn').disabled=current===0;$('nextBtn').disabled=current===stops.length-1;
 $('nextBtn').innerHTML=current===stops.length-1?'Last stop ✓':'Next stop <span aria-hidden="true">→</span>';
 document.querySelectorAll('.map-pin').forEach((b,i)=>{if(i===current)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
  card.animate([{opacity:.78,transform:'translateY(9px)'},{opacity:1,transform:'translateY(0)'}],{duration:350,easing:'ease-out'});
 }
}

function drawTravelProgress(){
 const v=clamp(cameraDistance,0,pathLength);
 progress.style.strokeDasharray=v+' '+pathLength;
 progress.style.strokeDashoffset='0';
}
function selectStop(index){
 const next=clamp(index,0,stops.length-1);
 if(current===next)return;
 current=next;targetDistance=stopDistances[current];
 renderStory();beep();
 if(reducedMotion.matches){cameraDistance=targetDistance;cameraVelocity=0;drawCamera()}
 else startCamera();
}
function init(){
 drawCity();
 const d=routePath(stops);[outline,route,core,progress].forEach(p=>p.setAttribute('d',d));
 makePins();measureRoute();current=0;targetDistance=stopDistances[0];cameraDistance=targetDistance;
 camera();renderStory();marker.classList.add('has-arrived');
 setTimeout(()=>marker.classList.remove('has-arrived'),750);
 $('prevBtn').addEventListener('click',()=>selectStop(current-1));
 $('nextBtn').addEventListener('click',()=>selectStop(current+1));
 more.addEventListener('click',()=>{
  const opening=extra.hidden;extra.hidden=!opening;more.setAttribute('aria-expanded',String(opening));more.innerHTML=(opening?'Read less':'Read more')+' <span aria-hidden="true">'+(opening?'⌃':'⌄')+'</span>';
 });
 const soundBtn=$('soundBtn'),themeBtn=$('themeBtn');
 soundBtn.addEventListener('click',()=>{sound=!sound;soundBtn.setAttribute('aria-pressed',String(sound));soundBtn.setAttribute('aria-label',sound?'Mute navigation sound':'Enable navigation sound');if(sound)beep()});
 themeBtn.addEventListener('click',()=>{const daytime=document.body.classList.toggle('day');themeBtn.setAttribute('aria-pressed',String(daytime));themeBtn.setAttribute('aria-label',daytime?'Switch to nighttime map':'Switch to daytime map')});
 addEventListener('resize',camera,{passive:true});
 document.addEventListener('visibilitychange',()=>{
  if(document.hidden){cancelAnimationFrame(cameraFrame);cameraFrame=0;cameraDistance=targetDistance;cameraVelocity=0;previousFrame=0;drawCamera()}
 });
 reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches){cancelAnimationFrame(cameraFrame);cameraFrame=0;cameraDistance=targetDistance;cameraVelocity=0;previousFrame=0;drawCamera()}});
 // Trackpad and mouse wheel: one deliberate wheel gesture = one stop.
 window.addEventListener('wheel',e=>{
  if(e.target.closest('.story-card')||e.ctrlKey||e.metaKey)return;
  if(Math.abs(e.deltaY)<12||Math.abs(e.deltaY)<Math.abs(e.deltaX))return;
  e.preventDefault();const now=performance.now();if(now-wheelAt<850)return;
  wheelAt=now;selectStop(current+(e.deltaY>0?1:-1));
 },{passive:false});
 document.addEventListener('keydown',e=>{if(e.altKey||e.metaKey||e.ctrlKey||/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||''))return;
  if(e.key==='ArrowRight'){e.preventDefault();selectStop(current+1)}
  if(e.key==='ArrowLeft'){e.preventDefault();selectStop(current-1)}
  if(e.key==='Home'){e.preventDefault();selectStop(0)}
  if(e.key==='End'){e.preventDefault();selectStop(stops.length-1)}
 });
 const app=$('app');
 app.addEventListener('touchstart',e=>{if(e.target.closest('button,a,.story-card,.bottom-dock,.topbar,.stop-nav'))return;const t=e.changedTouches[0];gestureStart={x:t.clientX,y:t.clientY}},{passive:true});
 app.addEventListener('touchend',e=>{if(!gestureStart)return;const t=e.changedTouches[0],dx=t.clientX-gestureStart.x,dy=t.clientY-gestureStart.y;gestureStart=null;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.3)selectStop(current+(dx<0?1:-1))},{passive:true});
 // Users can choose stops directly without requiring the swipe gesture.
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();