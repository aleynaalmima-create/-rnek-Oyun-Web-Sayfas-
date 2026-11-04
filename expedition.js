(() => {
  const root=document.documentElement;
  let dark=false;
  try { dark=localStorage.getItem('peak-theme')==='night'; } catch {}
  const toggle=document.createElement('button');toggle.type='button';toggle.className='daynight-switch';
  toggle.innerHTML='<span class="theme-scenery" aria-hidden="true"><span class="theme-star star-a">✦</span><span class="theme-star star-b">·</span><span class="theme-star star-c">✧</span><span class="theme-orb"></span><span class="theme-cloud"></span></span><span class="theme-label"></span>';
  document.body.append(toggle);
  const stars=document.createElement('div');stars.className='night-sky';stars.setAttribute('aria-hidden','true');
  for(let i=0;i<30;i++){const star=document.createElement('i');star.style.cssText=`left:${(i*37.3)%100}%;top:${(i*23.7)%94}%;--delay:${i%7}s;--size:${i%3+1}px`;stars.append(star);}
  document.querySelector('.hero').prepend(stars);
  function applyTheme(){
    root.dataset.theme=dark?'night':'day';toggle.setAttribute('aria-pressed',String(dark));
    toggle.setAttribute('aria-label',dark?'Gündüz moduna geç':'Gece moduna geç');
    toggle.querySelector('.theme-label').textContent=dark?'Gece':'Gündüz';
    document.querySelector('meta[name="theme-color"]').content=dark?'#182a30':'#f2f0df';
    try{localStorage.setItem('peak-theme',dark?'night':'day');}catch{}
  }
  applyTheme();
  const section=document.createElement('section');section.className='climb-section section';section.id='mini-oyun';
  section.innerHTML=`<div class="section-label">KEŞİF MOLASI / KÜÇÜK BİR OYUN</div><div class="climb-heading"><h2>Bir adım daha.<br><em>Zirve senin.</em></h2><p>İzcini kayalıklardan yukarı taşı, yıldızları topla ve bayrağa ulaş. Düştüğünde son ulaştığın yüksek platformdan devam edersin.<small>PEAK'ten esinlenen bağımsız bir mini oyun.</small></p></div><div class="climb-shell"><div class="climb-hud"><span>⚑ <b id="climb-height">0</b>%</span><span>✦ <b id="climb-stars">0</b>/13</span><span>Düşüş: <b id="climb-falls">0</b></span></div><div class="climb-viewport"><canvas width="800" height="460" tabindex="0" aria-label="Tırmanış mini oyunu. Sol ve sağ oklarla hareket et, boşluk veya yukarı okla zıpla. P ile duraklat.">Bu oyun için canvas destekleyen bir tarayıcı gerekiyor.</canvas><div class="climb-overlay"><span class="climb-overlay-icon" aria-hidden="true">⚑</span><h3 id="climb-title">Ufak bir tırmanış?</h3><p id="climb-desc">13 platform. Bir izci. Son bir deneme daha.</p><button type="button" id="climb-start">Macerayı başlat ↗</button></div></div><div class="climb-controls"><div class="climb-touch"><button type="button" data-control="left" aria-label="Sola hareket et">←</button><button type="button" data-control="right" aria-label="Sağa hareket et">→</button><button type="button" data-control="jump" aria-label="Zıpla">↑ Zıpla</button></div><span class="climb-key-help">← → hareket · ↑ / Boşluk zıpla · P mola</span><button type="button" id="climb-pause" disabled>Mola ver Ⅱ</button><button type="button" id="climb-reset">Baştan ↺</button></div><p class="climb-live" role="status" aria-live="polite">Başlamak için Macerayı başlat düğmesine bas.</p></div>`;
  document.querySelector('.finale').before(section);
  const canvas=section.querySelector('canvas'),ctx=canvas.getContext('2d'),game=new PeakClimbEngine();
  const overlay=section.querySelector('.climb-overlay'),start=section.querySelector('#climb-start'),pause=section.querySelector('#climb-pause');
  const title=section.querySelector('#climb-title'),desc=section.querySelector('#climb-desc'),live=section.querySelector('.climb-live');
  const input={left:false,right:false,jump:false};let running=false,raf=0,last=0,checkpoint=0,fallCount=0,previousScore=-1;
  const clearInput=()=>{input.left=input.right=input.jump=false;section.querySelectorAll('[data-control]').forEach(b=>b.classList.remove('held'));};
  function resize(){const dpr=Math.min(devicePixelRatio||1,2);canvas.width=800*dpr;canvas.height=460*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
  function draw(){
    const p=game.player,camera=Math.max(0,Math.min(820,p.y-235));
    const sky=ctx.createLinearGradient(0,0,0,460);sky.addColorStop(0,dark?'#122a3d':'#bedad8');sky.addColorStop(1,dark?'#34424f':'#f0e5c9');ctx.fillStyle=sky;ctx.fillRect(0,0,800,460);
    ctx.fillStyle=dark?'#f3e7bd':'#f5d389';ctx.beginPath();ctx.arc(690,65,25,0,Math.PI*2);ctx.fill();
    if(dark){ctx.fillStyle='#172d40';ctx.beginPath();ctx.arc(701,57,23,0,Math.PI*2);ctx.fill();ctx.fillStyle='#e6e6ca';for(let i=0;i<30;i++)ctx.fillRect((i*137)%800,(i*61)%250,2,2);}
    ctx.fillStyle=dark?'#344655':'#aabbb8';ctx.beginPath();ctx.moveTo(0,460);ctx.lineTo(0,330);ctx.lineTo(170,100-camera*.04);ctx.lineTo(330,320);ctx.lineTo(530,60-camera*.04);ctx.lineTo(800,360);ctx.lineTo(800,460);ctx.fill();
    ctx.fillStyle=dark?'#283d40':'#859a82';ctx.beginPath();ctx.moveTo(0,460);ctx.lineTo(170,310);ctx.lineTo(380,430);ctx.lineTo(690,220);ctx.lineTo(800,350);ctx.lineTo(800,460);ctx.fill();
    ctx.save();ctx.translate(0,-camera);
    game.platforms.forEach((q,i)=>{
      if(q.y-camera < -30 || q.y-camera>500)return;
      ctx.fillStyle=dark?'#58674d':'#89945d';ctx.beginPath();ctx.roundRect(q.x,q.y,q.w,18,6);ctx.fill();ctx.fillStyle=dark?'#9eab79':'#b8c18b';ctx.fillRect(q.x+4,q.y,q.w-8,4);
      ctx.fillStyle=dark?'#b8c19e':'#4b5b3c';ctx.font='10px sans-serif';if(i)ctx.fillText(String(i),q.x+10,q.y+13);
      if(i&&!game.stars.has(i)){ctx.fillStyle='#f4cf63';ctx.font='24px Georgia';ctx.textAlign='center';ctx.fillText('✦',q.x+q.w/2,q.y-17);ctx.textAlign='left';}
    });
    const summit=game.platforms.at(-1);ctx.strokeStyle='#e1d9ac';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(summit.x+110,summit.y);ctx.lineTo(summit.x+110,summit.y-65);ctx.stroke();ctx.fillStyle='#e86540';ctx.beginPath();ctx.moveTo(summit.x+112,summit.y-65);ctx.lineTo(summit.x+153,summit.y-55);ctx.lineTo(summit.x+112,summit.y-42);ctx.fill();
    ctx.fillStyle='#293c2d';ctx.fillRect(p.x+3,p.y+23,5,7);ctx.fillRect(p.x+15,p.y+23,5,7);
    ctx.fillStyle='#e86540';ctx.beginPath();ctx.roundRect(p.x,p.y+5,p.w,20,5);ctx.fill();ctx.fillStyle='#6a794b';ctx.fillRect(p.x-5,p.y+8,7,15);
    ctx.fillStyle='#e3bc7d';ctx.beginPath();ctx.arc(p.x+11,p.y+1,10,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3b5034';ctx.fillRect(p.x-2,p.y-9,26,5);ctx.fillRect(p.x+3,p.y-16,16,9);ctx.fillStyle='#293c2d';ctx.fillRect(p.x+14,p.y-1,2,2);
    ctx.restore();
    section.querySelector('#climb-height').textContent=Math.round(game.checkpoint/13*100);
    if(previousScore!==game.stars.size){section.querySelector('#climb-stars').textContent=game.stars.size;previousScore=game.stars.size;}
    section.querySelector('#climb-falls').textContent=game.falls;
  }
  function stop(reason='pause'){
    running=false;cancelAnimationFrame(raf);clearInput();pause.disabled=true;overlay.hidden=false;
    if(reason==='win'){title.textContent='Zirveye ulaştın!';desc.textContent=game.stars.size+' yıldız topladın. Şimdi bir kutlama molası.';start.textContent='Yeniden tırman ↺';live.textContent='Tebrikler! Zirveye ulaştın.';section.classList.add('climb-won');}
    else{title.textContent='Küçük bir mola.';desc.textContent='İzcin seni burada bekliyor. Hazır olunca devam et.';start.textContent='Tırmanışa devam ↗';live.textContent='Oyun duraklatıldı.';}
  }
  function frame(time){
    if(!running)return;const dt=last?Math.min((time-last)/1000,.03):0;last=time;game.step(dt,input);draw();
    if(game.checkpoint!==checkpoint){checkpoint=game.checkpoint;live.textContent=checkpoint+'. platforma ulaştın. Yeni dönüş noktan hazır.';}
    if(game.falls!==fallCount){fallCount=game.falls;live.textContent='Sorun yok! Son platformundan devam.';}
    if(game.won){stop('win');return;}raf=requestAnimationFrame(frame);
  }
  function reset(){game.reset();checkpoint=fallCount=0;previousScore=-1;section.classList.remove('climb-won');draw();}
  start.addEventListener('click',()=>{if(game.won)reset();overlay.hidden=true;running=true;last=0;pause.disabled=false;clearInput();live.textContent='Tırmanış başladı. Oklarla ilerle, boşlukla zıpla.';canvas.focus({preventScroll:true});raf=requestAnimationFrame(frame);});
  pause.addEventListener('click',()=>stop());
  section.querySelector('#climb-reset').addEventListener('click',()=>{stop();reset();title.textContent='Yeni bir macera.';desc.textContent='Başlangıç kampındasın. Hazır mısın?';start.textContent='Macerayı başlat ↗';});
  const keyMap={ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',ArrowUp:'jump',w:'jump',W:'jump',' ':'jump'};
  canvas.addEventListener('keydown',e=>{if(keyMap[e.key]){e.preventDefault();if(running)input[keyMap[e.key]]=true;}if((e.key==='p'||e.key==='P')&&running){e.preventDefault();stop();}});
  canvas.addEventListener('keyup',e=>{if(keyMap[e.key]){e.preventDefault();input[keyMap[e.key]]=false;}});
  canvas.addEventListener('blur',clearInput);
  section.querySelectorAll('[data-control]').forEach(b=>{
    b.addEventListener('pointerdown',e=>{e.preventDefault();if(!running)return;input[b.dataset.control]=true;b.classList.add('held');b.setPointerCapture(e.pointerId);});
    const release=()=>{input[b.dataset.control]=false;b.classList.remove('held');};
    b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);b.addEventListener('lostpointercapture',release);
    b.addEventListener('keydown',e=>{if((e.key===' '||e.key==='Enter')&&running){e.preventDefault();input[b.dataset.control]=true;}});
    b.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();release();}});b.addEventListener('blur',release);
  });
  addEventListener('blur',()=>{if(running)stop();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)stop();});
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{if(!entries[0].isIntersecting&&running)stop();},{threshold:0}).observe(section);
  toggle.addEventListener('click',()=>{dark=!dark;applyTheme();if(!running)draw();});
  addEventListener('resize',resize);resize();
})();
