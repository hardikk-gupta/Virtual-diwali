document.documentElement.classList.replace('no-js','js');
const $=s=>document.querySelector(s),body=document.body,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let introDone=false,audio=null,sound=false,poll=null;
// Canvas colours come from the page tokens (hex twins; see style.css).
const token=name=>getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const ink=token('--canvas-ink')||'#f2eadd',spark1=token('--canvas-spark-1')||'#fff9db',spark2=token('--canvas-spark-2')||'#ffcf66',spark3=token('--canvas-spark-3')||'#ff8a00';
function tone(freq,duration,type='sine',gain=.035){if(!sound||!audio)return;const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);o.frequency.exponentialRampToValueAtTime(freq*.4,audio.currentTime+duration);g.gain.setValueAtTime(gain,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration)}
$('#sound').addEventListener('click',async()=>{sound=!sound;const music=$('#music');try{if(sound){audio ||= new AudioContext();await audio.resume();music.volume=.32;await music.play();tone(350,.2)}else music.pause()}catch{sound=false;music.pause()}$('#sound .sound-on').hidden=!sound;$('#sound .sound-off').hidden=sound;$('#sound').setAttribute('aria-pressed',String(sound));const label=sound?'Turn music and sound off':'Turn music and sound on';$('#sound').setAttribute('aria-label',label);$('#sound').title=label});
const canvas=$('#fireworks'),ctx=canvas.getContext('2d'),fuse=$('#fuse-track'),fuseBurn=$('#fuse-burn'),ember=$('#ember'),rocketImage=$('#rocket img');
const fuseLength=fuse.getTotalLength();let scale=1,started=0,raf=0,phase='loading',launchRect=null,titlePoints=[],titleRect=null,titleCache=null,embers=[],lastFrame=0;
const ease=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
function dimensions(){scale=Math.min(devicePixelRatio||1,innerWidth<600?1.5:2);canvas.width=Math.round(innerWidth*scale);canvas.height=Math.round(innerHeight*scale);ctx.setTransform(scale,0,0,scale,0,0)}
function makeTitle(){
 titleRect=$('#particle-title').getBoundingClientRect();
 const w=Math.ceil(titleRect.width),h=Math.ceil(titleRect.height),mask=document.createElement('canvas');mask.width=w;mask.height=h;
 const c=mask.getContext('2d',{willReadFrequently:true}),line='Happy Diwali';
 let fontSize=parseFloat(getComputedStyle($('#particle-title')).fontSize)||96;
 const face=size=>`400 ${size}px Gloock, Georgia, serif`;
 c.textAlign='center';c.textBaseline='alphabetic';c.font=face(fontSize);
 while(c.measureText(line).width>w*.98&&fontSize>24){fontSize-=1;c.font=face(fontSize)}
 const baseline=h*.8;
 c.fillStyle=ink;c.fillText(line,w/2,baseline);
 const pixels=c.getImageData(0,0,w,h).data;titlePoints=[];
 for(let i=0;i<9000&&titlePoints.length<520;i++){const x=Math.random()*w,y=Math.random()*h;if(pixels[(Math.floor(y)*w+Math.floor(x))*4+3]>200){const angle=Math.random()*Math.PI*2,speed=60+Math.random()*190;titlePoints.push({x,y,tx:titleRect.left+x,ty:titleRect.top+y,dx:Math.cos(angle)*speed,dy:Math.sin(angle)*speed,delay:Math.random()*.25,twinkle:Math.random()*6.28})}}
 titleCache=document.createElement('canvas');titleCache.width=Math.ceil(w*scale);titleCache.height=Math.ceil(h*scale);
 const cache=titleCache.getContext('2d');cache.scale(scale,scale);cache.textAlign='center';cache.textBaseline='alphabetic';cache.font=c.font;
 cache.fillStyle=ink;cache.fillText(line,w/2,baseline);
}
function sparkle(x,y,size,opacity=1){
 ctx.save();ctx.globalAlpha=Math.max(0,opacity);ctx.translate(x,y);
 ctx.strokeStyle=spark2;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(-size,0);ctx.lineTo(size,0);ctx.moveTo(0,-size*1.35);ctx.lineTo(0,size*1.35);ctx.stroke();
 ctx.strokeStyle=spark1;ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(-size*.38,-size*.38);ctx.lineTo(size*.38,size*.38);ctx.moveTo(size*.38,-size*.38);ctx.lineTo(-size*.38,size*.38);ctx.stroke();ctx.restore();
}
function clearFrame(){ctx.setTransform(scale,0,0,scale,0,0);ctx.clearRect(0,0,innerWidth,innerHeight)}
// The shell climbs to the exact point where the title rests, slowing toward its apex, while the camera tilts up with it.
const FLIGHT=3200,burstPoint=()=>({x:titleRect.left+titleRect.width/2,y:titleRect.top+titleRect.height*.55});
function flyingRocket(progress){const p=1-Math.pow(1-progress,2.2),b=burstPoint(),x0=launchRect.left+launchRect.width/2,y0=launchRect.top,x=x0+(b.x-x0)*p,y=y0+(b.y-launchRect.height*.15-y0)*p,k=1-.45*p,w=launchRect.width*k,h=launchRect.height*k;
 ctx.save();ctx.translate(x,y);ctx.rotate(-.035*Math.sin(progress*Math.PI));const tail=ctx.createLinearGradient(0,h*.24,0,h*.65);tail.addColorStop(0,'#fff7b9');tail.addColorStop(.2,'#ffbd43');tail.addColorStop(1,'#ff7a1000');ctx.fillStyle=tail;ctx.beginPath();ctx.moveTo(-w*.025,h*.24);ctx.lineTo(w*.025,h*.24);ctx.lineTo((Math.random()-.5)*w*.08,h*(.5+Math.random()*.18));ctx.closePath();ctx.fill();ctx.drawImage(rocketImage,0,0,rocketImage.naturalWidth,rocketImage.naturalHeight*.5,-w/2,0,w,h*.5);ctx.restore();
 for(let i=0;i<4;i++)embers.push({x:x+(Math.random()-.5)*6,y:y+h*.27,vx:(Math.random()-.5)*.6,vy:.5+Math.random()*2,life:.7+Math.random()*.3,size:Math.random()*1.4+.4});
}
function renderTitle(elapsed,now){
 const origin=burstPoint();
 if(elapsed>=2.95){
  // Formed: the title rests in solid ink; nothing keeps twinkling.
  ctx.drawImage(titleCache,titleRect.left,titleRect.top,titleRect.width,titleRect.height);return;
 }
 const fill=Math.max(0,Math.min(1,(elapsed-.9)/1.8));ctx.globalAlpha=ease(fill);ctx.drawImage(titleCache,titleRect.left,titleRect.top,titleRect.width,titleRect.height);ctx.globalAlpha=1;
 for(let i=0;i<titlePoints.length;i++){
  const p=titlePoints[i],scatter=Math.min(elapsed/.7,1),q=ease(Math.max(0,Math.min(1,(elapsed-.58-p.delay)/2.1))),sx=origin.x+p.dx*(1-Math.pow(1-scatter,2)),sy=origin.y+p.dy*(1-Math.pow(1-scatter,2)),x=sx+(p.tx-sx)*q,y=sy+(p.ty-sy)*q;
  const alpha=Math.min(1,elapsed*5)*(1-Math.max(0,(elapsed-2.3)/.65));if(alpha<=0)continue;
  const angle=Math.atan2(y-origin.y,x-origin.x),length=(1-q)*(7+Math.abs(p.dx)*.06)+2;
  ctx.globalAlpha=alpha*.7;ctx.strokeStyle=i%3===0?spark1:spark2;ctx.lineWidth=i%4===0?1.2:.6;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-Math.cos(angle)*length,y-Math.sin(angle)*length);ctx.stroke();
  if(i%19===0)sparkle(x,y,1.6+Math.sin(now*.008+p.twinkle)*1.1,alpha);
 }ctx.globalAlpha=1;
}
// The shell bursts: a ring of ember sparks from the title's centre; the letters then gather in place.
function burst(){if(reduced)return;const b=burstPoint();for(let i=0;i<110;i++){const angle=Math.random()*Math.PI*2,speed=1.6+Math.random()*4.2;embers.push({x:b.x,y:b.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-.4,life:.8+Math.random()*.6,size:1,color:i%4===0?spark1:i%4===1?spark3:spark2})}}
function drawEmbers(dt){embers=embers.filter(p=>p.life>0);ctx.strokeStyle=spark2;ctx.lineWidth=.7;for(const p of embers){ctx.strokeStyle=p.color||spark2;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.018*dt;p.life-=.021*dt;ctx.globalAlpha=Math.max(0,p.life);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*3,p.y-p.vy*3);ctx.stroke()}ctx.globalAlpha=1}
function reveal(){if(introDone)return;introDone=true;body.classList.add('formed','revealed');$('#intro-copy').hidden=true;$('#skip').hidden=true;$('#replay').hidden=false;requestAnimationFrame(()=>{dimensions();makeTitle();if(reduced){clearFrame();renderTitle(4,performance.now())}});startSky();refreshSky();if(!poll)poll=setInterval(()=>{if(!document.hidden&&introDone)refreshSky()},15000)}
function frame(now){raf=requestAnimationFrame(frame);if(document.hidden||now-lastFrame<(phase==='formed'?32:14))return;const dt=Math.min((now-lastFrame)/16.67,2);lastFrame=now;clearFrame();const elapsed=now-started;
 if(phase==='fuse'){
  const progress=Math.min(elapsed/3000,1),remaining=fuseLength*(1-progress),point=fuse.getPointAtLength(remaining);fuseBurn.style.strokeDasharray=`${remaining} ${fuseLength}`;ember.setAttribute('transform',`translate(${point.x},${point.y})`);const rect=$('#fuse-svg').getBoundingClientRect(),x=rect.left+point.x/400*rect.width,y=rect.top+point.y/800*rect.height;for(let i=0;i<2;i++)embers.push({x,y,vx:(Math.random()-.5)*2.2,vy:-Math.random()*2,life:.5+Math.random()*.5,size:Math.random()+.5});if(progress===1){launchRect=$('#rocket').getBoundingClientRect();body.classList.add('launched','zoomed');phase='flight';tone(700,1.2,'sawtooth',.018)}
 }else if(phase==='flight'){
  const progress=Math.min((elapsed-3000)/FLIGHT,1);flyingRocket(progress);if(progress===1){phase='forming';tone(70,.6,'triangle',.08);burst()}
 }else{
  const age=phase==='formed'?4:(elapsed-3000-FLIGHT)/1000;renderTitle(age,now);if(age>1.1)body.classList.add('formed');if(age>=2.95&&phase!=='formed'){phase='formed';reveal()}
 }drawEmbers(dt);
}
function intro(){if(raf)cancelAnimationFrame(raf);introDone=false;phase='fuse';body.className='';$('#greeting').hidden=false;$('#release-panel').classList.remove('success');$('#launch-success').hidden=true;$('#form-status').textContent='';$('#intro-copy').hidden=false;$('#skip').hidden=false;$('#replay').hidden=true;$('#rocket').style.visibility='';embers=[];stopSky();fuseBurn.style.strokeDasharray=`${fuseLength} ${fuseLength}`;dimensions();makeTitle();started=performance.now();lastFrame=started;if(reduced){phase='formed';body.classList.add('launched','zoomed');reveal();clearFrame();renderTitle(4,started);return}raf=requestAnimationFrame(frame)}
$('#skip').addEventListener('click',()=>{phase='formed';body.classList.add('launched','zoomed');reveal();if(reduced){clearFrame();renderTitle(4,performance.now())}});$('#replay').addEventListener('click',intro);

/* ===================== Lantern sky =====================
   Each lantern is born inside open sky (never from the rooftop, never behind the
   greeting or the card), ignites slowly, rises and recedes toward a vanishing point
   that sits far above the top edge: we only ever see the lower part of the "V".
   Screen position = VP + (birth - VP) / depth, so size and convergence come from one
   perspective model. Births are chosen so no two lanterns overlap at any point of
   their remaining flight, and a name is never in the sky twice at the same time. */
let visitor;try{visitor=localStorage.getItem('diwali-visitor');if(!/^[a-f0-9-]{36}$/i.test(visitor||'')){visitor=crypto.randomUUID();localStorage.setItem('diwali-visitor',visitor)}}catch{visitor=crypto.randomUUID()}
const skyLayer=$('#lanterns'),myLayer=$('#my-lantern-layer'),LANTERN_RATIO=657/600;
const sky={running:false,raf:0,time:0,last:0,nextSpawn:0,spawned:0,active:[],records:new Map(),queue:[]};
let myId=null;
const normalName=name=>name.normalize('NFC').trim().toLocaleLowerCase();
const smooth=x=>x<=0?0:x>=1?1:x*x*(3-2*x);
function geometry(){
 const w=innerWidth,h=innerHeight,roof=Math.max(h,w*.9),wall=h*.94;
 return{w,h,vpx:w/2,vpy:-.06*h,skyline:wall-(.522-.3)*roof};
}
function maxActive(){return innerWidth<600?7:innerWidth<1024?12:16}
function depth(L,t){const age=t-L.born;if(age<=0)return 1;return 1+L.rate*(age-L.ease*(1-Math.exp(-age/L.ease)))}
function pose(L,t,g){
 const z=depth(L,t),k=1/z,age=Math.max(0,t-L.born);
 const vx=g.vpx+L.drift*g.w,x=vx+(L.x0*g.w-vx)*k+Math.sin(age*.21+L.phase)*5*k,y=g.vpy+(L.y0*g.h-g.vpy)*k;
 return{x,y,k,rot:Math.sin(age*.27+L.phase)*2.4};
}
function box(L,p,pad=10){
 const w=L.s0*p.k,h=w*LANTERN_RATIO,lw=Math.min(L.labelW,L.s0*2.2)*p.k,half=Math.max(w,lw)/2;
 return{l:p.x-half-pad,r:p.x+half+pad,t:p.y-h/2-pad,b:p.y+h/2+L.fs*p.k*.9+pad};
}
const hit=(a,b)=>a.l<b.r&&a.r>b.l&&a.t<b.b&&a.b>b.t;
// Far away = small: a lantern fades out between depth scale .48 and .4 (about 12s), then is
// gone, so distant lanterns never pile up near the vanishing point.
const FAR=.4,FADING=.48,distanceFade=k=>smooth((k-FAR)/(FADING-FAR));
const gone=(L,p)=>p.k<FAR||box(L,p,0).b<-4;
function blocked(){
 const out=[];
 for(const sel of ['#greeting','#release-panel','.footer-bar','.controls','#intro-copy']){
  const el=$(sel);if(!el||el.hidden||el.closest('[hidden]'))continue;
  const r=el.getBoundingClientRect();if(r.width&&r.height)out.push({l:r.left-12,r:r.right+12,t:r.top-12,b:r.bottom+12});
 }
 return out;
}
function collidesInFlight(C,others,t,g){
 for(const A of others){
  for(let i=0;i<80;i++){
   const at=t+i*1.5,pc=pose(C,at,g);if(gone(C,pc)||pc.k<FADING)break;
   const pa=pose(A,at,g);if(gone(A,pa)||pa.k<FADING)break;
   if(hit(box(C,pc),box(A,pa)))return true;
  }
 }
 return false;
}
function makeLantern(record,opts={}){
 const compact=innerWidth<600,tablet=innerWidth<1024,mine=!!opts.mine||record.id===myId;
 const s0=opts.size||(compact?44+Math.random()*16:tablet?54+Math.random()*20:62+Math.random()*28);
 const fs=mine&&opts.size?Math.max(13,s0*.13):Math.max(11,Math.min(13,s0*.16));
 return{id:record.id,name:record.name,key:normalName(record.name),mine,s0,fs,labelW:record.name.length*fs*.62+fs*1.4,
  x0:.5,y0:.5,born:sky.time,rate:opts.rate||(.022+Math.random()*.008),ease:opts.ease||6,phase:Math.random()*6.28,drift:opts.mine?0:(Math.random()-.5)*.36,el:null,dying:0};
}
function findBirth(L,g){
 const zones=blocked(),top=Math.max(64,$('.topbar').getBoundingClientRect().bottom+8),bottom=g.skyline-12;
 const others=[...sky.active.filter(a=>!a.dying),...(sky.mine?[sky.mine]:[])];let best=null,bestScore=-1;
 for(let tries=0;tries<48;tries++){
  const w=L.s0,h=w*LANTERN_RATIO+L.fs*.9,half=Math.max(w,Math.min(L.labelW,w*2.2))/2;
  const minX=half+8,maxX=g.w-half-8,minY=top+h/2,maxY=bottom-h/2;if(maxX<=minX||maxY<=minY)return null;
  const x=minX+Math.random()*(maxX-minX),y=minY+(maxY-minY)*Math.sqrt(Math.random());
  L.x0=x/g.w;L.y0=y/g.h;const p=pose(L,L.born,g),b=box(L,p,0);
  if(zones.some(z=>hit(b,z)))continue;
  if(collidesInFlight(L,others,sky.time,g))continue;
  let score=1e9;for(const o of others){const q=pose(o,sky.time,g);score=Math.min(score,Math.hypot(q.x-x,q.y-y))}
  if(score>bestScore){bestScore=score;best={x0:L.x0,y0:L.y0}}
  if(tries>10&&best)break;
 }
 if(!best)return null;L.x0=best.x0;L.y0=best.y0;return L;
}
function lanternElement(L){
 const el=document.createElement('div');el.className='lantern'+(L.mine?' mine':'');
 el.style.setProperty('--w',L.s0+'px');el.style.setProperty('--fs',L.fs+'px');
 el.setAttribute('role','img');el.setAttribute('aria-label',L.name+'’s lantern');el.title=L.name+'’s Diwali wish';
 const img=document.createElement('img');img.src='/resources/images/lantern.webp';img.alt='';img.width=600;img.height=657;img.decoding='async';
 const tag=document.createElement('span');tag.className='lantern-name';tag.textContent=L.name;
 el.append(img,tag);return el;
}
let quiet=null;
function quietZone(){const r=$('#greeting').getBoundingClientRect();return r.width?{l:r.left,r:r.right,t:r.top,b:r.bottom}:null}
function render(L,g){
 const p=pose(L,sky.time,g),age=sky.time-L.born;
 let alpha=reduced?.9:smooth(age/4.5)*distanceFade(p.k);
 // Lanterns drifting behind the greeting soften so the words stay readable.
 if(quiet&&!L.mine){const b=box(L,p,0),w=Math.max(0,Math.min(b.r,quiet.r)-Math.max(b.l,quiet.l)),h=Math.max(0,Math.min(b.b,quiet.b)-Math.max(b.t,quiet.t));alpha*=1-.62*smooth(w*h/((b.r-b.l)*(b.b-b.t))*1.6)}
 if(L.dying)alpha*=1-smooth((sky.time-L.dying)/1.6);
 L.el.style.opacity=alpha.toFixed(3);
 L.el.style.transform=`translate3d(${(p.x-L.s0/2).toFixed(1)}px,${(p.y-L.s0*LANTERN_RATIO/2).toFixed(1)}px,0) rotate(${p.rot.toFixed(2)}deg) scale(${p.k.toFixed(4)})`;
 return p;
}
function nextRecord(){
 const inSky=new Set(sky.active.map(a=>a.key));if(sky.mine)inSky.add(sky.mine.key);
 for(let i=0;i<sky.queue.length;i++){
  const id=sky.queue[i],record=sky.records.get(id);if(!record)continue;
  if(inSky.has(normalName(record.name))||(sky.mine&&record.id===sky.mine.id))continue;
  sky.queue.splice(i,1);sky.queue.push(id);return record;
 }
 return null;
}
function spawn(g){
 const record=nextRecord();if(!record)return false;
 const L=findBirth(makeLantern(record),g);if(!L)return false;
 L.el=lanternElement(L);skyLayer.append(L.el);sky.active.push(L);sky.spawned++;render(L,g);return true;
}
function tick(now){
 sky.raf=requestAnimationFrame(tick);
 const dt=Math.min(.1,Math.max(0,(now-sky.last)/1000));sky.last=now;if(document.hidden)return;sky.time+=dt;
 const g=geometry();quiet=quietZone();
 for(const L of [...sky.active,...(sky.mine?[sky.mine]:[])]){
  const p=render(L,g);
  if(gone(L,p)||(L.dying&&sky.time-L.dying>1.7)){L.el.remove();if(L===sky.mine)sky.mine=null;else sky.active.splice(sky.active.indexOf(L),1)}
 }
 // Lanterns already fading into the distance no longer hold a place in the sky.
 const lit=sky.active.filter(L=>!L.dying&&pose(L,sky.time,g).k>=FADING).length;
 if(sky.time>=sky.nextSpawn&&lit<maxActive()&&sky.active.length<maxActive()+6){
  const ok=spawn(g);
  // Refill quickly whenever the sky is thin, so it never empties between waves.
  const thin=lit<maxActive()*.7;
  sky.nextSpawn=sky.time+(ok?(thin?1.6+Math.random()*1.2:2.8+Math.random()*2.4):.6);
 }
}
function startSky(){
 if(sky.running)return;sky.running=true;sky.nextSpawn=sky.time+.6;
 if(reduced){layoutStill();return}
 sky.last=performance.now();sky.raf=requestAnimationFrame(tick);
}
function stopSky(){
 sky.running=false;cancelAnimationFrame(sky.raf);
 for(const L of sky.active)L.el.remove();if(sky.mine)sky.mine.el.remove();
 sky.active=[];sky.mine=null;sky.spawned=0;
}
function layoutStill(){
 if(!sky.running)return;const g=geometry();quiet=quietZone();
 for(const L of sky.active)L.el.remove();sky.active=[];
 for(let i=0;i<maxActive()*2&&sky.active.length<maxActive();i++)spawn(g);
}
function launchMine(record){
 const g=geometry(),compact=innerWidth<600;
 if(sky.mine)sky.mine.el.remove();
 const L=makeLantern(record,{mine:true,size:compact?84:116,rate:.026,ease:8});
 L.x0=.5;L.y0=.5;L.born=sky.time;
 for(const A of sky.active){if(A.dying)continue;if(A.key===L.key||A.id===L.id||collidesInFlight(L,[A],sky.time,g))A.dying=sky.time}
 L.el=lanternElement(L);myLayer.append(L.el);sky.mine=L;render(L,g);
 if(reduced){L.el.style.opacity='1'}
 return L;
}
function syncRecords(list){
 const fresh=[],ids=new Set();
 for(const record of list){ids.add(record.id);if(!sky.records.has(record.id))fresh.push(record.id);sky.records.set(record.id,record)}
 for(const id of [...sky.records.keys()])if(!ids.has(id))sky.records.delete(id);
 sky.queue=sky.queue.filter(id=>ids.has(id));
 // Newest wishes are first in line; the rest keep their rotation order.
 sky.queue=[...fresh.filter(id=>!sky.queue.includes(id)),...sky.queue];
 for(const L of sky.active)if(!ids.has(L.id)&&!L.dying)L.dying=sky.time;
 if(reduced&&sky.running&&fresh.length)layoutStill();
}
// The poster's foot changes height (form to success, errors); keep the drawn title on its box.
if('ResizeObserver' in window)new ResizeObserver(()=>{if(!titleRect)return;const r=$('#particle-title').getBoundingClientRect();if(Math.abs(r.top-titleRect.top)<1&&Math.abs(r.width-titleRect.width)<1)return;makeTitle();if(reduced){clearFrame();renderTitle(4,performance.now())}}).observe($('.poster'));
let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{dimensions();makeTitle();if(reduced){clearFrame();renderTitle(4,performance.now());layoutStill()}},150)});
function updateSkyCount(total){
 if(!Number.isSafeInteger(total)||total<0){$('#sky-count').hidden=true;return}
 const copy=$('#sky-count-copy');copy.replaceChildren();
 const number=document.createElement('strong');number.textContent=new Intl.NumberFormat('en-IN').format(total);
 const label=document.createElement('span');label.className='count-label';label.textContent=total===1?'lantern in our sky':'lanterns in our sky';
 copy.append(number,label);$('#sky-count').hidden=false;
}
async function refreshSky(){try{const response=await fetch('/api/lanterns',{cache:'no-store'});const data=await response.json();if(!response.ok)throw Error(data.error||'The shared sky is unavailable.');syncRecords(data.lanterns);updateSkyCount(data.total)}catch{$('#sky-count').hidden=true}}
function showLaunchSuccess(name,existing){
 $('#name').blur();const panel=$('#release-panel');panel.classList.add('success');$('#launch-success').hidden=false;
 $('#success-name').textContent=name+', your light is in the sky.';
 $('#success-message').textContent=existing?'Your wish is still glowing. Here it is again.':'One more wish. One brighter sky.';
 $('#form-status').textContent='';
 if(!reduced){const x=innerWidth/2,y=innerHeight/2;for(let i=0;i<60;i++){const angle=Math.random()*Math.PI*2,speed=.8+Math.random()*2.4;embers.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-.6,life:.7+Math.random()*.6,size:1,color:i%3===0?spark1:spark3})}if(phase==='formed'&&!raf)raf=requestAnimationFrame(frame)}
 tone(700,.4,'sine',.025);
}
$('#lantern-form').addEventListener('submit',async event=>{
 event.preventDefault();const button=$('#release'),buttonText=button.querySelector('span');
 const value=$('#name').value.trim();if(value.length<2){$('#form-status').textContent='Please enter at least 2 letters.';$('#name').focus();return}
 button.disabled=true;buttonText.textContent='Launching…';$('#form-status').textContent='';
 try{const response=await fetch('/api/lanterns',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:value,visitor})});const data=await response.json();if(!response.ok)throw Error(data.error||'Could not release your lantern. Please try again.');
 myId=data.lantern.id;sky.records.set(data.lantern.id,data.lantern);if(!sky.queue.includes(myId))sky.queue.push(myId);
 launchMine(data.lantern);$('#name').value=data.lantern.name;showLaunchSuccess(data.lantern.name,data.existing);await refreshSky();
 }catch(error){$('#form-status').textContent=error.message}finally{button.disabled=false;buttonText.textContent='Launch lantern'}
});
const shareDialog=$('#share-dialog');
function shareData(){return{title:'Happy Diwali!',text:'A little light, a lot of wishes. Happy Diwali! Come leave a lantern in our shared sky.',url:location.origin+'/diwali'}}
function openShareOptions(){
 const data=shareData(),message=data.text+'\n'+data.url;
 $('#share-whatsapp').href='https://wa.me/?text='+encodeURIComponent(message);
 $('#share-telegram').href='https://t.me/share/url?url='+encodeURIComponent(data.url)+'&text='+encodeURIComponent(data.text);
 $('#share-email').href='mailto:?subject='+encodeURIComponent(data.title)+'&body='+encodeURIComponent(message);
 $('#copy-feedback').textContent='';$('#copy-share-link span').textContent='Copy link';
 if(!shareDialog.open)shareDialog.showModal();
}
$('#share').addEventListener('click',async()=>{
 const button=$('#share');$('#share-status').textContent='';button.disabled=true;
 try{if(typeof navigator.share==='function'){try{await navigator.share(shareData())}catch(error){if(error.name!=='AbortError')openShareOptions()}}else openShareOptions()}
 finally{button.disabled=false}
});
$('#close-share').addEventListener('click',()=>shareDialog.close());
shareDialog.addEventListener('click',event=>{if(event.target!==shareDialog)return;const r=shareDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)shareDialog.close()});
$('#copy-share-link').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(shareData().url);$('#copy-share-link span').textContent='Copied';$('#copy-feedback').textContent='Link copied. Paste it into any conversation.'}catch{$('#copy-feedback').textContent='You can copy the address from your browser.'}});

const nameField=$('#name'),visualViewport=window.visualViewport;
let viewportBaseline=Math.max(innerHeight,visualViewport?.height||0),keyboardFrame=0;
function updateKeyboardLayout(){
 const mobile=matchMedia('(max-width:600px)').matches||(navigator.maxTouchPoints>0&&innerWidth<1000);
 const height=visualViewport?.height||innerHeight,top=visualViewport?.offsetTop||0,focused=document.activeElement===nameField;
 if(!focused&&viewportBaseline-height<120)viewportBaseline=Math.max(viewportBaseline,innerHeight,height);
 const keyboardOpen=mobile&&viewportBaseline-height>120,editing=mobile&&(focused||keyboardOpen);
 document.documentElement.style.setProperty('--visual-height',height+'px');
 document.documentElement.style.setProperty('--visual-top',top+'px');
 body.classList.toggle('editing-name',editing);
 body.classList.toggle('keyboard-active',editing&&(keyboardOpen||height<580));
 $('#share-panel').inert=editing;
}
function scheduleKeyboardLayout(){cancelAnimationFrame(keyboardFrame);keyboardFrame=requestAnimationFrame(updateKeyboardLayout)}
nameField.addEventListener('focus',updateKeyboardLayout);
nameField.addEventListener('blur',()=>setTimeout(updateKeyboardLayout,100));
visualViewport?.addEventListener('resize',scheduleKeyboardLayout);
visualViewport?.addEventListener('scroll',scheduleKeyboardLayout);
addEventListener('resize',scheduleKeyboardLayout);
addEventListener('orientationchange',()=>{viewportBaseline=innerHeight;setTimeout(updateKeyboardLayout,200)});
updateKeyboardLayout();

Promise.all([document.fonts.load('400 80px Gloock'),document.fonts.load('400 16px Geist'),rocketImage.decode().catch(()=>{}),new Promise(resolve=>{const image=new Image();image.onload=resolve;image.onerror=resolve;image.src='/resources/images/rooftop-sky.webp'})]).then(()=>{$('#loading').hidden=true;intro()});

addEventListener('scroll',()=>{if(!titleRect)return;const next=$('#particle-title').getBoundingClientRect(),dx=next.left-titleRect.left,dy=next.top-titleRect.top;for(const point of titlePoints){point.tx+=dx;point.ty+=dy}titleRect=next;if(reduced&&introDone){clearFrame();renderTitle(4,performance.now())}},{passive:true});
