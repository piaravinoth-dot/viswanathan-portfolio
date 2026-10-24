
(()=>{'use strict';
const W=3200,H=2500;
const stops=[
{id:'peacock',x:370,y:660,name:'Peacock India',logo:'P',period:'2015–2016 · Internship',title:'Where the story began.',short:'My first steps into professional creative work — learning how ideas become finished visuals.',detail:'The internship introduced me to the fundamentals of commercial production and the discipline behind professional design. It was the starting point for everything that followed.',link:'',tone:'#b17a64'},
{id:'ad2pro',x:650,y:410,name:'Ad2pro Media',logo:'A',period:'2016–2018 · Graphic design',title:'Learning the craft at scale.',short:'Working in a professional production environment turned design from an interest into a repeatable discipline.',detail:'At Ad2pro Media Solutions I gained experience in layout, production quality, deadlines and team workflows — lessons that still inform how I build creative systems.',link:'',tone:'#67839a'},
{id:'ipac',x:940,y:910,name:'I-PAC',logo:'I',period:'2018–2019 · Political design',title:'Design under real pressure.',short:'My work entered political communication, where clarity, speed and audience understanding matter.',detail:'As a senior graphic designer with I-PAC, I worked within high-pressure political communications where the message must survive different formats, audiences and tight turnaround times.',link:'/work/nation-building',tone:'#66895f'},
{id:'namo',x:1210,y:600,name:'NaMo Campaign',logo:'N',period:'2019 · Political communication',title:'Stories designed for scale.',short:'Campaign work expanded my understanding of visual systems and the power of consistent public communication.',detail:'Moving into NaMo campaign work strengthened the connection between design, strategy and operations. Visual communication became more than single posters: it became an evolving system.',link:'/work/nation-building',tone:'#a47f58'},
{id:'smartmind',x:1570,y:1160,name:'Smart Mind Strategies',logo:'S',period:'2022–present · Founder',title:'From designer to creative lead.',short:'I founded Smart Mind Strategies and began taking responsibility for both creative direction and execution.',detail:'Building a studio meant combining visual judgment with planning, leadership, collaboration and consistent quality across different types of creative work.',link:'/work/telangana-manifesto',tone:'#7f7cba'},
{id:'content',x:1850,y:800,name:'Content Studio',logo:'C',period:'2026 · Product design',title:'Making information useful.',short:'A shared news-and-content workspace grew from the operational challenges I had seen first-hand.',detail:'Content Studio brings together source discovery, translation, editorial organization and team workflows. It marked a shift from making communication to building the system behind it.',link:'/work/content-studio',tone:'#4b9b89'},
{id:'intelligence',x:2140,y:1450,name:'Social Media Intelligence',logo:'SI',period:'2026 · Analytics UX',title:'Turning scattered signals into clarity.',short:'I explored how teams can better understand performance without drowning in fragmented dashboards.',detail:'The product case study focuses on comparing social activity, designing readable metrics, and making complex reporting easier to navigate and act on.',link:'/work/social-media-intelligence',tone:'#5f91c2'},
{id:'aistudio',x:2450,y:1090,name:'AI Design Studio',logo:'AI',period:'2026 · Creative technology',title:'What if the tool felt like a studio?',short:'Creative production and product design came together in an AI-assisted editing workflow.',detail:'AI Design Studio explores generation, refinement and export as an editable creative process — not just a one-click image generator. It represents my approach to human-centered creative technology.',link:'/work/ai-design-studio',tone:'#9b76aa'},
{id:'clip',x:2870,y:1870,name:'Clip Studio',logo:'CL',period:'2026 · Product building',title:'Building for everyday creators.',short:'A hybrid video utility brought together link handling, formats, quality choices and quick editing.',detail:'Clip Studio brings creator workflows into one place. I am continuing to expand my work across product design, useful software and interactive experiences. The journey is still evolving.',link:'/work/clip-studio',tone:'#c38a57'}
];
const $=id=>document.getElementById(id);const world=$('mapWorld'),pinRoot=$('mapPins'),svg=$('mapSVG'),route=$('routeBlue'),core=$('routeCore'),outline=$('routeOutline'),progress=$('routeProgress'),card=$('storyCard'),body=$('storyBody'),extra=$('storyExtra'),more=$('moreBtn'),toneDefault='#b17a64';
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
let current=0,sound=false,audio=null,travelToken=0,gestureStart=null;
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
function camera(){
 const s=stops[current],vw=innerWidth,vh=innerHeight;
 const scale=vw<=680?.78:vw<=1050?.88:1.01;
 const ax=vw*(vw<=680?.5:.56),ay=vh*(vw<=680?(vh<680?.29:.31):.38);
 const tx=ax-s.x*scale,ty=ay-s.y*scale;
 world.style.transform='translate3d('+tx+'px,'+ty+'px,0) scale('+scale+')';
 const next=stops[Math.min(current+1,stops.length-1)],prev=stops[Math.max(0,current-1)];
 const dx=(current===stops.length-1?s.x-prev.x:next.x-s.x),dy=(current===stops.length-1?s.y-prev.y:next.y-s.y);
 const angle=Math.atan2(dy,dx)*180/Math.PI+90;
 $('compassNeedle').style.transform='rotate('+angle+'deg)';
}
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
 $('storyLogo').textContent=s.logo;$('storyLogo').style.background=s.tone;
 $('storyCompany').textContent=s.name;$('storyDate').textContent=s.period;
 $('storyTitle').textContent=s.title;$('storySummary').textContent=s.short;$('storyDetail').textContent=s.detail;
 $('storyCounter').textContent=String(current+1).padStart(2,'0')+' / 09';$('stopNumber').textContent=(current+1)+' / 9';
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
 // Exact curve length proportional to travelled milestone positions.
 const len=route.getTotalLength();
 const sections=stops.length-1;
 const v=(current/sections)*len;
 progress.style.strokeDasharray=v+' '+len;
}
function selectStop(index){
 const next=clamp(index,0,stops.length-1);
 if(current===next){return}
 current=next;travelToken++;
 camera();renderStory();drawTravelProgress();beep();
}
function init(){
 drawCity();
 const d=routePath(stops);[outline,route,core,progress].forEach(p=>p.setAttribute('d',d));
 makePins();current=0;camera();renderStory();drawTravelProgress();
 $('prevBtn').addEventListener('click',()=>selectStop(current-1));
 $('nextBtn').addEventListener('click',()=>selectStop(current+1));
 more.addEventListener('click',()=>{
  const opening=extra.hidden;extra.hidden=!opening;more.setAttribute('aria-expanded',String(opening));more.innerHTML=(opening?'Read less':'Read more')+' <span aria-hidden="true">'+(opening?'⌃':'⌄')+'</span>';
 });
 const soundBtn=$('soundBtn'),themeBtn=$('themeBtn');
 soundBtn.addEventListener('click',()=>{sound=!sound;soundBtn.setAttribute('aria-pressed',String(sound));soundBtn.setAttribute('aria-label',sound?'Mute navigation sound':'Enable navigation sound');if(sound)beep()});
 themeBtn.addEventListener('click',()=>{const daytime=document.body.classList.toggle('day');themeBtn.setAttribute('aria-pressed',String(daytime));themeBtn.setAttribute('aria-label',daytime?'Switch to nighttime map':'Switch to daytime map')});
 addEventListener('resize',camera,{passive:true});
 document.addEventListener('keydown',e=>{if(e.altKey||e.metaKey||e.ctrlKey||/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||''))return;
  if(e.key==='ArrowRight'){e.preventDefault();selectStop(current+1)}
  if(e.key==='ArrowLeft'){e.preventDefault();selectStop(current-1)}
 });
 const app=$('app');
 app.addEventListener('touchstart',e=>{if(e.target.closest('button,a,.story-card,.bottom-dock,.topbar,.stop-nav'))return;const t=e.changedTouches[0];gestureStart={x:t.clientX,y:t.clientY}},{passive:true});
 app.addEventListener('touchend',e=>{if(!gestureStart)return;const t=e.changedTouches[0],dx=t.clientX-gestureStart.x,dy=t.clientY-gestureStart.y;gestureStart=null;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.3)selectStop(current+(dx<0?1:-1))},{passive:true});
 // Users can choose stops directly without requiring the swipe gesture.
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();