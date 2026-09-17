(()=>{
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine=window.matchMedia('(pointer:fine)').matches;
  document.documentElement.classList.add('motion-ready');
  const progress=document.createElement('div');progress.id='vg-scroll-progress';document.body.appendChild(progress);
  const q=s=>Array.from(document.querySelectorAll(s));
  const revealSelectors=['.section-head','.belief','.step','.timeline article','.cap','.row','.job','.tool-tile-v2','.feature','.project','.lab-card','.contact-card','.snapshot>div','.proof>div','.proof article','.footer-cta-inner','.cta h2','.cta-links','.practice-card'];
  q(revealSelectors.join(',')).forEach(el=>el.classList.add('motion-reveal'));
  q('.beliefs,.process,.practice-grid,.skills,.tools-matrix-v2,.capabilities,.feature-grid,.archive,.lab-grid').forEach(el=>el.classList.add('motion-stagger'));
  q('.belief,.step,.cap,.practice-card,.tool-card,.tool-tile-v2,.feature,.project,.lab-card,.contact-card').forEach(el=>el.classList.add('motion-card'));
  q('.btn,.cta a,.footer-cta a,.practice-link,.lab-link,.contact-link,.quick-contact a').forEach(el=>el.classList.add('motion-link'));
  q('.portrait,.feature,.project-frame').forEach(el=>el.classList.add('motion-tilt'));
  const io=!reduce?new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible','in');io.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -6% 0px'}):null;
  q('.motion-reveal,.motion-stagger,.reveal').forEach(el=>{if(reduce)el.classList.add('is-visible','in');else io.observe(el)});
  const topbar=document.querySelector('.topbar');
  const updateProgress=()=>{const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);const p=Math.min(1,scrollY/max);progress.style.transform=`scaleX(${p})`;if(topbar)topbar.classList.toggle('is-scrolled',scrollY>18)};
  addEventListener('scroll',updateProgress,{passive:true});updateProgress();
  if(reduce||!fine)return;
  // premium inertial wheel scrolling
  let current=scrollY,target=scrollY,raf=0,lastNative=performance.now();
  const maxScroll=()=>Math.max(0,document.documentElement.scrollHeight-innerHeight);
  const loop=()=>{const d=target-current;current+=d*.115;if(Math.abs(d)<.35){current=target;raf=0}else raf=requestAnimationFrame(loop);scrollTo(0,current)};
  addEventListener('wheel',e=>{if(e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;const scroller=e.target.closest('[data-native-scroll],textarea,select');if(scroller)return;e.preventDefault();target=Math.max(0,Math.min(maxScroll(),target+e.deltaY*1.02));if(!raf){current=scrollY;raf=requestAnimationFrame(loop)}},{passive:false});
  addEventListener('mousedown',()=>{target=scrollY;current=scrollY});
  addEventListener('keydown',e=>{if(['PageDown','PageUp','Home','End','ArrowDown','ArrowUp',' '].includes(e.key)){target=scrollY;current=scrollY}});
  // magnetic links/buttons
  q('.motion-link,nav a').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();const x=(e.clientX-r.left-r.width/2)*.12;const y=(e.clientY-r.top-r.height/2)*.18;el.style.transform=`translate3d(${x}px,${y-2}px,0)`});el.addEventListener('pointerleave',()=>el.style.transform='')});
  // card spotlight
  q('.motion-card').forEach(el=>el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.setProperty('--card-x',`${e.clientX-r.left}px`);el.style.setProperty('--card-y',`${e.clientY-r.top}px`)}));
  // subtle tilt only on larger visual cards
  q('.motion-tilt').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;el.style.transform=`perspective(1000px) rotateY(${x*3.2}deg) rotateX(${-y*2.6}deg) translateY(-3px)`});el.addEventListener('pointerleave',()=>el.style.transform='')});
  // page-specific parallax
  const hero=document.querySelector('.hero');const heroTitle=document.querySelector('.hero h1');const portrait=document.querySelector('.portrait');
  if(hero&&heroTitle){let ticking=false;const parallax=()=>{const r=hero.getBoundingClientRect();const y=Math.max(-1,Math.min(1,-r.top/Math.max(1,r.height)));heroTitle.style.transform=`translate3d(0,${y*20}px,0)`;if(portrait)portrait.style.transform=`translate3d(0,${y*-10}px,0)`;ticking=false};addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(parallax)}},{passive:true});}
})();
