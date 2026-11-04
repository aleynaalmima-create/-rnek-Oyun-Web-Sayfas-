(() => {
  const calmQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let quiet = calmQuery.matches;
  const motion = document.createElement('button');
  motion.type = 'button'; motion.className = 'motion-switch';
  function setQuiet(value) {
    quiet = value; reduced = value;
    document.body.classList.toggle('calm-mode', value);
    motion.setAttribute('aria-pressed', String(value));
    motion.textContent = value ? '◌ Sakin mod açık' : '✳ Hareketi azalt';
    if (value) {
      document.getAnimations().forEach(a => a.cancel());
      document.querySelectorAll('.pack-fly,.pack-confetti,.spark,.page-particle').forEach(el=>el.remove());
    }
  }
  motion.addEventListener('click', () => setQuiet(!quiet));
  calmQuery.addEventListener('change', e => setQuiet(e.matches));
  document.querySelector('header').append(motion); setQuiet(quiet);

  const toast = document.createElement('div'); toast.className = 'expedition-toast';
  toast.setAttribute('role','status'); toast.setAttribute('aria-live','polite');
  document.body.append(toast); let toastTimer;
  function say(text) {
    toast.textContent=text; toast.classList.add('shown');
    clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove('shown'),3200);
  }
  function burst(element, symbols=['✦','✳','·']) {
    if (quiet) return;
    const r=element.getBoundingClientRect();
    for(let i=0;i<14;i++) {
      const el=document.createElement('span'); el.className='page-particle';
      el.textContent=symbols[i%symbols.length]; el.setAttribute('aria-hidden','true');
      el.style.left=(r.left+r.width/2)+'px'; el.style.top=(r.top+r.height/2)+'px';
      document.body.append(el);
      const angle=Math.PI*2*i/14, distance=50+Math.random()*70;
      const animation=el.animate([{transform:'translate(-50%,-50%) scale(.5)',opacity:1},
        {transform:`translate(calc(-50% + ${Math.cos(angle)*distance}px),calc(-50% + ${Math.sin(angle)*distance}px)) rotate(120deg) scale(1.2)`,opacity:0}],
        {duration:750+Math.random()*350,easing:'ease-out'});
      animation.onfinish=()=>el.remove();
    }
  }

 
  const passport=document.createElement('div'); passport.className='trail-passport';
  passport.innerHTML='<span aria-hidden="true">⚑</span><span class="trail-label">Keşif rotası</span><b>0 / 4</b>';
  passport.setAttribute('aria-label','Keşfedilen bölüm sayısı'); document.body.append(passport);
  const sectionList=[...document.querySelectorAll('.story,.rules,.pack,.finale')];
  const visited=new Set();
  if ('IntersectionObserver' in window) {
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      const element=entry.target;
      if(sectionList.includes(element)) {
        visited.add(element); passport.querySelector('b').textContent=visited.size+' / 4';
        passport.classList.toggle('complete',visited.size===4);
      }
      if(!quiet && !element.classList.contains('already-revealed')) {
        element.animate([{opacity:.35,transform:'translateY(26px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,easing:'cubic-bezier(.2,.8,.2,1)'});
      }
      element.classList.add('already-revealed'); observer.unobserve(element);
    }),{threshold:.12});
    sectionList.forEach(section=>observer.observe(section));
  }

 
  const title=document.querySelector('h1');
  const walker=document.createTreeWalker(title,NodeFilter.SHOW_TEXT);
  const texts=[]; while(walker.nextNode()) if(!walker.currentNode.parentElement.closest('.asterisk')) texts.push(walker.currentNode);
  let letterIndex=0;
  texts.forEach(node=>{
    const fragment=document.createDocumentFragment();
    [...node.textContent].forEach(char=>{
      if(char===' ') {fragment.append(' ');return;}
      const letter=document.createElement('span'); letter.className='play-letter'; letter.textContent=char;
      fragment.append(letter);
      if(!quiet) letter.animate([{opacity:0,transform:'translateY(45px) rotate(9deg)'},{opacity:1,transform:'translateY(0) rotate(0)'}],{duration:700,delay:letterIndex++*35,fill:'backwards',easing:'cubic-bezier(.2,.8,.2,1)'});
      letter.addEventListener('pointerenter',()=>{
        if(quiet)return;
        letter.getAnimations().forEach(a=>a.cancel());
        letter.animate([{transform:'translateY(0)'},{transform:'translateY(-14px) rotate(-8deg)',offset:.4},{transform:'translateY(0)'}],{duration:500,easing:'ease-out'});
      });
    }); node.replaceWith(fragment);
  });
  const sticker=document.querySelector('.sticker');
  const cheer=document.createElement('button'); cheer.type='button'; cheer.className=sticker.className;
  cheer.innerHTML=sticker.innerHTML; cheer.setAttribute('aria-label','Takımına moral ver'); sticker.replaceWith(cheer);
  let cheerIndex=0;
  cheer.addEventListener('click',()=>{
    say(['Takım ruhu +1. Bir el de arkadaşına uzat!','Yavaş ama birlikte. Zirve kaçmıyor!','Düştük mü? Evet. Pes ettik mi? Hayır!'][cheerIndex++%3]);
    burst(cheer);
    if(!quiet) cheer.animate([{transform:'rotate(13deg) scale(1)'},{transform:'rotate(-8deg) scale(1.15)'},{transform:'rotate(13deg) scale(1)'}],{duration:500});
  });
  const landscape=document.querySelector('.landscape');
  const mountainLayers=[...landscape.querySelector('svg').children].filter(el=>el.tagName.toLowerCase()==='path' && ['#c5c9e4','#e4a7a2','#f5e8d2'].includes(el.getAttribute('fill')));
  document.querySelector('.hero').addEventListener('pointermove',e=>{
    if(quiet || e.pointerType==='touch' || e.target.closest('.scout'))return;
    const r=landscape.getBoundingClientRect(), fraction=(e.clientX-r.left)/r.width-.5;
    mountainLayers.forEach((layer,i)=>layer.style.translate=(fraction*(i===0?16:9))+'px 0');
  });
  document.querySelector('.hero').addEventListener('pointerleave',()=>mountainLayers.forEach(layer=>layer.style.translate='0 0'));
  mountainLayers.forEach(layer=>layer.classList.add('mountain-layer'));

  const ticker=document.querySelector('.ticker'); ticker.removeAttribute('aria-hidden');
  ticker.querySelector('span').setAttribute('aria-hidden','true');
  const tickerToggle=document.createElement('button'); tickerToggle.className='ticker-toggle'; tickerToggle.type='button';
  tickerToggle.textContent='Ⅱ'; tickerToggle.setAttribute('aria-label','Kayan yazıyı duraklat'); tickerToggle.setAttribute('aria-pressed','false');
  tickerToggle.addEventListener('click',()=>{
    const paused=ticker.classList.toggle('ticker-paused'); tickerToggle.textContent=paused?'▶':'Ⅱ';
    tickerToggle.setAttribute('aria-pressed',String(paused)); tickerToggle.setAttribute('aria-label',paused?'Kayan yazıyı oynat':'Kayan yazıyı duraklat');
  }); ticker.append(tickerToggle);

  const photo=document.querySelector('.photo-note');
  const photoButton=document.createElement('button'); photoButton.type='button'; photoButton.className='note-turn'; photoButton.textContent='Keşif notunu çevir ↻';
  photo.append(photoButton);
  const note=photo.querySelector(':scope > span'); let noteIndex=0;
  const notes=[['“Biraz daha ileride kamp kurarız.”','— Her maceranın başında söylenen o cümle'],['“İpi kim aldı?”','— Çanta hazırlığı neden önemlidir, bir örnek.'],['“Manzara çok iyi. Aşağı bakmasak mı?”','— Yükseklikle yeni tanışan bir izci.'],['“Son bir deneme daha.”','— Arkadaşlarla geçen güzel bir akşam.']];
  photoButton.addEventListener('click',()=>{
    const next=notes[++noteIndex%notes.length]; note.replaceChildren(document.createTextNode(next[0]));
    const small=document.createElement('small');small.textContent=next[1];note.append(small);
    if(!quiet) note.animate([{opacity:0,transform:'translateX(15px)'},{opacity:1,transform:'translateX(0)'}],{duration:400});
  });
  photo.addEventListener('pointermove',e=>{
    if(quiet || e.pointerType==='touch')return;
    const r=photo.getBoundingClientRect();
    photo.style.setProperty('--note-tilt',(((e.clientX-r.left)/r.width-.5)*5)+'deg');
  });photo.addEventListener('pointerleave',()=>photo.style.setProperty('--note-tilt','-2deg'));

  const tips=['Önce güvenli bir yerde dur, ardından arkadaşına yardım et. Acele etmek her zaman daha hızlı ilerlemek demek değil.','Staminanı takip et ve tırmanış arasında mola ver. Bir sonraki hamle için biraz enerji bırak.','Aynı gün rotayı yeniden denemek, zor geçitleri öğrenmek için iyi bir fırsat.'];
  document.querySelectorAll('.rule-grid article').forEach((card,i)=>{
    const toggle=document.createElement('button');toggle.type='button';toggle.className='tip-toggle';toggle.textContent='İzci ipucunu aç +';toggle.setAttribute('aria-expanded','false');
    const detail=document.createElement('p');detail.className='secret-tip';detail.id='scout-tip-'+i;detail.hidden=true;detail.textContent=tips[i];
    toggle.setAttribute('aria-controls',detail.id);card.append(toggle,detail);
    toggle.addEventListener('click',()=>{
      const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));detail.hidden=!open;
      toggle.textContent=open?'İpucunu kapat −':'İzci ipucunu aç +';card.classList.toggle('tip-open',open);
      if(open&&!quiet) { detail.animate([{opacity:0,transform:'translateY(-8px)'},{opacity:1,transform:'translateY(0)'}],{duration:350}); burst(card.querySelector('.rule-icon'),['·','+']); }
    });
  });

  const finale=document.querySelector('.finale');
  const summit=document.createElement('div');summit.className='summit-game';
  summit.innerHTML='<div class="summit-art" aria-hidden="true"><svg viewBox="0 0 280 170"><path d="M10 165 140 18 270 165" fill="#384f39"/><path d="m140 18-44 50 36-9 17 13 10-16 24 11Z" fill="#f2f0df"/><path d="M140 21V0" stroke="#293c2d" stroke-width="3"/><path class="summit-flag" d="M143 1h48l-9 11 9 11h-48Z" fill="#f2d67d"/></svg><span class="summit-stamp">ZİRVEYE ULAŞILDI ✓</span></div><button type="button" class="summit-button">Zirveye bayrağını dik ⚑</button><p class="summit-message" role="status">Bu küçük zirve senin. Bir kutlama molası ver.</p>';
  finale.querySelector('h2').after(summit);
  const summitButton=summit.querySelector('button');
  summitButton.addEventListener('click',()=>{
    summit.classList.add('conquered');
    summit.querySelector('.summit-message').textContent='Başardık! Şimdi bu macerayı arkadaşlarınla yaşama zamanı.';
    summitButton.textContent='Birlikte başardık! Tekrar kutla ✦';burst(summit.querySelector('.summit-art'),['⚑','✦','✳']);
    if(!quiet) summit.querySelector('.summit-flag').animate([{transform:'translateY(35px)',opacity:0},{transform:'translateY(0)',opacity:1}],{duration:650,easing:'cubic-bezier(.2,.8,.2,1)'});
  });

  const campButton=document.createElement('button');campButton.type='button';campButton.className='camp-button';
  campButton.innerHTML='<span aria-hidden="true">🔥</span><span>Kamp ateşinde bir mola</span>';let campIndex=0;
  campButton.addEventListener('click',()=>{
    say(['Bir nefes al. Zirve yarın da orada olacak.','Marshmallow hazır. Hikâyeni anlatma sırası sende.','Bugünün en iyi manzarası: buraya birlikte gelmek.'][campIndex++%3]);burst(campButton,['·','✦']);
  });document.querySelector('footer').append(campButton);
})();
