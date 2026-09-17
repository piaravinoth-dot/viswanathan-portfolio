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

  const io=!reduce?new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible','in');io.unobserve(e.target)}}),{threshold:.06,rootMargin:'0px 0px -2% 0px'}):null;
  q('.motion-reveal,.motion-stagger,.reveal').forEach(el=>{if(reduce)el.classList.add('is-visible','in');else io.observe(el)});

  const topbar=document.querySelector('.topbar');
  const updateProgress=(y=scrollY)=>{const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);progress.style.transform=`scaleX(${Math.min(1,y/max)})`;if(topbar)topbar.classList.toggle('is-scrolled',y>18)};
  updateProgress();

  let lenis=null;
  const startLenis=()=>{
    if(reduce||!fine||!window.Lenis){addEventListener('scroll',()=>updateProgress(scrollY),{passive:true});return;}
    lenis=new Lenis({
      duration:.68,
      easing:t=>1-Math.pow(1-t,4),
      smoothWheel:true,
      wheelMultiplier:1.38,
      touchMultiplier:1.1
    });
    lenis.on('scroll',e=>updateProgress(e.scroll));
    const raf=time=>{lenis.raf(time);requestAnimationFrame(raf)};requestAnimationFrame(raf);
    document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const target=document.querySelector(a.getAttribute('href'));if(!target)return;e.preventDefault();lenis.scrollTo(target,{offset:-72,duration:.72})}));
  };

  if(!reduce&&fine){
    if(window.Lenis)startLenis();
    else{
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/lenis@1.1.20/dist/lenis.min.js';
      s.async=true;
      s.onload=startLenis;
      s.onerror=()=>addEventListener('scroll',()=>updateProgress(scrollY),{passive:true});
      document.head.appendChild(s);
    }
  }else addEventListener('scroll',()=>updateProgress(scrollY),{passive:true});

  if(reduce||!fine)return;

  q('.motion-link,nav a').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();const x=(e.clientX-r.left-r.width/2)*.1;const y=(e.clientY-r.top-r.height/2)*.13;el.style.transform=`translate3d(${x}px,${y-1}px,0)`});el.addEventListener('pointerleave',()=>el.style.transform='')});

  q('.motion-card').forEach(el=>el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.setProperty('--card-x',`${e.clientX-r.left}px`);el.style.setProperty('--card-y',`${e.clientY-r.top}px`)}));

  q('.motion-tilt').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;el.style.transform=`perspective(1000px) rotateY(${x*2.2}deg) rotateX(${-y*1.8}deg) translateY(-2px)`});el.addEventListener('pointerleave',()=>el.style.transform='')});

  const hero=document.querySelector('.hero');const heroTitle=document.querySelector('.hero h1');const portrait=document.querySelector('.portrait');
  if(hero&&heroTitle){let ticking=false;const parallax=()=>{const r=hero.getBoundingClientRect();const y=Math.max(-1,Math.min(1,-r.top/Math.max(1,r.height)));heroTitle.style.transform=`translate3d(0,${y*9}px,0)`;if(portrait)portrait.style.transform=`translate3d(0,${y*-4}px,0)`;ticking=false};addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(parallax)}},{passive:true});}
})();