const $=s=>document.querySelector(s),body=document.body,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let introDone=false,audio=null,sound=false,poll=null;
for(let i=0;i<65;i++){const el=document.createElement('i');el.className='star';el.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*70}%;width:${Math.random()*1.3+.5}px;height:${Math.random()*1.3+.5}px;animation-delay:${Math.random()*6}s`;$('#stars').append(el)}
function tone(freq,duration,type='sine',gain=.035){if(!sound||!audio)return;const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);o.frequency.exponentialRampToValueAtTime(freq*.4,audio.currentTime+duration);g.gain.setValueAtTime(gain,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration)}
$('#sound').addEventListener('click',async()=>{sound=!sound;const music=$('#music');try{if(sound){audio ||= new AudioContext();await audio.resume();music.volume=.32;await music.play();tone(350,.2)}else music.pause()}catch{sound=false;music.pause()}$('#sound .sound-on').hidden=!sound;$('#sound .sound-off').hidden=sound;$('#sound').setAttribute('aria-pressed',String(sound));const label=sound?'Turn music and sound off':'Turn music and sound on';$('#sound').setAttribute('aria-label',label);$('#sound').title=label});
const canvas=$('#fireworks'),ctx=canvas.getContext('2d'),fuse=$('#fuse-track'),fuseBurn=$('#fuse-burn'),ember=$('#ember'),rocketImage=$('#rocket img');
const fuseLength=fuse.getTotalLength();let scale=1,started=0,raf=0,phase='loading',launchRect=null,titlePoints=[],titleRect=null,titleCache=null,embers=[],lastFrame=0;
const ease=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
function dimensions(){scale=Math.min(devicePixelRatio||1,innerWidth<600?1.5:2);canvas.width=Math.round(innerWidth*scale);canvas.height=Math.round(innerHeight*scale);ctx.setTransform(scale,0,0,scale,0,0)}
function makeTitle(){
 titleRect=$('#particle-title').getBoundingClientRect();
 const w=Math.ceil(titleRect.width),h=Math.ceil(titleRect.height),mask=document.createElement('canvas');mask.width=w;mask.height=h;
 const c=mask.getContext('2d',{willReadFrequently:true}),split=innerWidth<600,lines=split?['Happy','Diwali']:['Happy Diwali'],align='center',textX=w/2;
 let fontSize=lines.length===2?Math.min(86,w*.31,h*.46):Math.min(148,w*.14,h*.8);
 c.textAlign=align;c.textBaseline='middle';c.font=`800 ${fontSize}px Outfit, Arial, sans-serif`;
 while(Math.max(...lines.map(line=>c.measureText(line).width))>w*.92){fontSize-=1;c.font=`800 ${fontSize}px Outfit, Arial, sans-serif`}
 c.fillStyle='#fff';const linePositions=lines.map((line,i)=>({line,y:h/2+(i-(lines.length-1)/2)*fontSize*1.02}));
 for(const row of linePositions)c.fillText(row.line,textX,row.y);
 const pixels=c.getImageData(0,0,w,h).data;titlePoints=[];
 for(let i=0;i<9000&&titlePoints.length<520;i++){const x=Math.random()*w,y=Math.random()*h;if(pixels[(Math.floor(y)*w+Math.floor(x))*4+3]>200){const angle=Math.random()*Math.PI*2,speed=60+Math.random()*190;titlePoints.push({x,y,tx:titleRect.left+x,ty:titleRect.top+y,dx:Math.cos(angle)*speed,dy:Math.sin(angle)*speed,delay:Math.random()*.25,twinkle:Math.random()*6.28})}}
 titleCache=document.createElement('canvas');titleCache.width=Math.ceil(w*scale);titleCache.height=Math.ceil(h*scale);
 const cache=titleCache.getContext('2d');cache.scale(scale,scale);cache.textAlign=align;cache.textBaseline='middle';cache.font=c.font;
 const gold=cache.createLinearGradient(0,h*.15,0,h*.9);gold.addColorStop(0,'#ffe5fc');gold.addColorStop(.38,'#ffb7e7');gold.addColorStop(.68,'#f46acb');gold.addColorStop(1,'#bd36a4');
 cache.fillStyle=gold;cache.shadowColor='#eb5cce66';cache.shadowBlur=14;
 for(const row of linePositions)cache.fillText(row.line,textX,row.y);
 cache.shadowBlur=0;cache.strokeStyle='#ffe0fb66';cache.lineWidth=.5;for(const row of linePositions)cache.strokeText(row.line,textX,row.y);
}
function sparkle(x,y,size,opacity=1){
 ctx.save();ctx.globalAlpha=Math.max(0,opacity);ctx.translate(x,y);ctx.shadowColor='#fb78de';ctx.shadowBlur=size*2;
 ctx.strokeStyle='#ffd4f6';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(-size,0);ctx.lineTo(size,0);ctx.moveTo(0,-size*1.35);ctx.lineTo(0,size*1.35);ctx.stroke();
 ctx.strokeStyle='#fff2ff';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(-size*.38,-size*.38);ctx.lineTo(size*.38,size*.38);ctx.moveTo(size*.38,-size*.38);ctx.lineTo(-size*.38,size*.38);ctx.stroke();ctx.restore();
}
function clearFrame(){ctx.setTransform(scale,0,0,scale,0,0);ctx.clearRect(0,0,innerWidth,innerHeight)}
function flyingRocket(progress){const p=Math.pow(progress,1.45),x0=launchRect.left+launchRect.width/2,y0=launchRect.top,x=x0,y=y0+(innerHeight*.28-y0)*p,k=1-.4*p,w=launchRect.width*k,h=launchRect.height*k;
 ctx.save();ctx.translate(x,y);ctx.rotate(-.035*Math.sin(progress*Math.PI));const tail=ctx.createLinearGradient(0,h*.24,0,h*.65);tail.addColorStop(0,'#fff7b9');tail.addColorStop(.2,'#ffbd43');tail.addColorStop(1,'#ff7a1000');ctx.fillStyle=tail;ctx.beginPath();ctx.moveTo(-w*.025,h*.24);ctx.lineTo(w*.025,h*.24);ctx.lineTo((Math.random()-.5)*w*.08,h*(.5+Math.random()*.18));ctx.closePath();ctx.fill();ctx.drawImage(rocketImage,0,0,rocketImage.naturalWidth,rocketImage.naturalHeight*.5,-w/2,0,w,h*.5);ctx.restore();
 for(let i=0;i<4;i++)embers.push({x:x+(Math.random()-.5)*6,y:y+h*.27,vx:(Math.random()-.5)*.6,vy:.5+Math.random()*2,life:.7+Math.random()*.3,size:Math.random()*1.4+.4});
}
function renderTitle(elapsed,now){
 const origin={x:innerWidth*.5,y:innerHeight*.28};
 if(elapsed>=2.95){
  ctx.drawImage(titleCache,titleRect.left,titleRect.top,titleRect.width,titleRect.height);
  if(!reduced&&titlePoints.length){for(let i=0;i<9;i++){const p=titlePoints[(Math.floor(now/1400)*13+i*59)%titlePoints.length],pulse=Math.pow(Math.max(0,Math.sin(now*.002+p.twinkle)),7);if(pulse>.05)sparkle(p.tx,p.ty,2.2+pulse*3.5,pulse*.9)}}return;
 }
 const fill=Math.max(0,Math.min(1,(elapsed-.9)/1.8));ctx.globalAlpha=ease(fill);ctx.drawImage(titleCache,titleRect.left,titleRect.top,titleRect.width,titleRect.height);ctx.globalAlpha=1;
 for(let i=0;i<titlePoints.length;i++){
  const p=titlePoints[i],scatter=Math.min(elapsed/.7,1),q=ease(Math.max(0,Math.min(1,(elapsed-.58-p.delay)/2.1))),sx=origin.x+p.dx*(1-Math.pow(1-scatter,2)),sy=origin.y+p.dy*(1-Math.pow(1-scatter,2)),x=sx+(p.tx-sx)*q,y=sy+(p.ty-sy)*q;
  const alpha=Math.min(1,elapsed*5)*(1-Math.max(0,(elapsed-2.3)/.65));if(alpha<=0)continue;
  const angle=Math.atan2(y-origin.y,x-origin.x),length=(1-q)*(7+Math.abs(p.dx)*.06)+2;
  ctx.globalAlpha=alpha*.7;ctx.strokeStyle=i%3===0?'#fff1ff':'#ee90e1';ctx.lineWidth=i%4===0?1.2:.6;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-Math.cos(angle)*length,y-Math.sin(angle)*length);ctx.stroke();
  if(i%19===0)sparkle(x,y,1.6+Math.sin(now*.008+p.twinkle)*1.1,alpha);
 }ctx.globalAlpha=1;
}
function drawEmbers(dt){embers=embers.filter(p=>p.life>0);ctx.strokeStyle='#ffd89a';ctx.lineWidth=.7;for(const p of embers){ctx.strokeStyle=p.color||'#ffd89a';p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.018*dt;p.life-=.021*dt;ctx.globalAlpha=Math.max(0,p.life);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx*3,p.y-p.vy*3);ctx.stroke()}ctx.globalAlpha=1}
function reveal(){if(introDone)return;introDone=true;body.classList.add('formed','revealed');$('#intro-copy').hidden=true;$('#release-panel').hidden=false;$('#share-panel').hidden=false;$('#skip').hidden=true;$('#replay').hidden=false;requestAnimationFrame(()=>{dimensions();makeTitle();if(reduced){clearFrame();renderTitle(4,performance.now())}});refreshSky();if(!poll)poll=setInterval(()=>{if(!document.hidden&&introDone)refreshSky()},15000)}
function frame(now){raf=requestAnimationFrame(frame);if(document.hidden||now-lastFrame<(phase==='formed'?32:14))return;const dt=Math.min((now-lastFrame)/16.67,2);lastFrame=now;clearFrame();const elapsed=now-started;
 if(phase==='fuse'){
  const progress=Math.min(elapsed/3000,1),remaining=fuseLength*(1-progress),point=fuse.getPointAtLength(remaining);fuseBurn.style.strokeDasharray=`${remaining} ${fuseLength}`;ember.setAttribute('transform',`translate(${point.x},${point.y})`);const rect=$('#fuse-svg').getBoundingClientRect(),x=rect.left+point.x/400*rect.width,y=rect.top+point.y/800*rect.height;for(let i=0;i<2;i++)embers.push({x,y,vx:(Math.random()-.5)*2.2,vy:-Math.random()*2,life:.5+Math.random()*.5,size:Math.random()+.5});if(progress===1){launchRect=$('#rocket').getBoundingClientRect();body.classList.add('launched','zoomed');phase='flight';tone(700,1.2,'sawtooth',.018)}
 }else if(phase==='flight'){
  const progress=Math.min((elapsed-3000)/1700,1);flyingRocket(progress);if(progress===1){phase='forming';tone(70,.6,'triangle',.08)}
 }else{
  const age=phase==='formed'?4:(elapsed-4700)/1000;renderTitle(age,now);if(age>1.1)body.classList.add('formed');if(age>=2.95&&phase!=='formed'){phase='formed';reveal()}
 }drawEmbers(dt);
}
function intro(){if(raf)cancelAnimationFrame(raf);introDone=false;phase='fuse';body.className='';$('#greeting').hidden=false;$('#release-panel').hidden=true;$('#release-panel').classList.remove('success');$('#launch-success').hidden=true;$('#form-status').textContent='';$('#share-panel').hidden=true;$('#sky-count').hidden=true;$('#intro-copy').hidden=false;$('#skip').hidden=false;$('#replay').hidden=true;$('#rocket').style.visibility='';embers=[];fuseBurn.style.strokeDasharray=`${fuseLength} ${fuseLength}`;dimensions();makeTitle();started=performance.now();lastFrame=started;if(reduced){phase='formed';body.classList.add('launched','zoomed');reveal();clearFrame();renderTitle(4,started);return}raf=requestAnimationFrame(frame)}
$('#skip').addEventListener('click',()=>{phase='formed';body.classList.add('launched','zoomed');reveal();if(reduced){clearFrame();renderTitle(4,performance.now())}});$('#replay').addEventListener('click',intro);
let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{dimensions();makeTitle();for(const node of $('#lanterns').children)positionLantern(node,hash(node.dataset.lanternId),Number(node.dataset.skySlot),node.classList.contains('mine'));if(reduced){clearFrame();renderTitle(4,performance.now())}},150)});
let visitor;try{visitor=localStorage.getItem('diwali-visitor');if(!/^[a-f0-9-]{36}$/i.test(visitor||'')){visitor=crypto.randomUUID();localStorage.setItem('diwali-visitor',visitor)}}catch{visitor=crypto.randomUUID()}
const visibleIds=new Set();let allLanterns=[],myId=null,skyReady=false;
function hash(str){let n=0;for(const c of str)n=(n*31+c.charCodeAt(0))>>>0;return n}
function positionLantern(el,seed,index,mine=false){
 const columns=innerWidth<600?4:7,rows=28/columns,slot=(index*11)%28;
 const random=n=>((Math.imul(seed^(n*374761393),668265263)>>>0)%1000)/1000;
 const compact=innerWidth<600,size=mine?(compact?58:84):(compact?30:42)+random(6)*(compact?16:26),duration=110+random(7)*40;
 const margin=Math.min(innerWidth*.18,110),x=margin+((slot%columns)+.2+random(1)*.6)/columns*(innerWidth-2*margin);
 const y=innerHeight*.625-size*.85;
 const endX=x+(innerWidth*.5-x)*.12,endY=-size;
 const age=(Math.floor(slot/columns)+.15+random(8)*.7)/rows;
 el.dataset.skySlot=String(index);
 el.style.cssText=`--start-x:${x}px;--start-y:${y}px;--end-x:${endX}px;--end-y:${endY}px;--size:${size}px;--duration:${duration}s;--delay:${mine?0:-age*duration}s;--rotation:${-3+random(9)*6}deg`;

}
function addLantern(record,mine=false){
 if(visibleIds.has(record.id))return;
 const limit=innerWidth<600?14:28;if($('#lanterns').children.length>=limit){const old=$('#lanterns').firstElementChild;visibleIds.delete(old.dataset.lanternId);old.remove()}
 const occupied=new Set([...$('#lanterns').children].map(node=>Number(node.dataset.skySlot)));let slot=0;while(occupied.has(slot))slot++;
 visibleIds.add(record.id);
 const h=hash(record.id),el=document.createElement('div');
 el.className='lantern'+(mine?' mine':'');el.dataset.lanternId=record.id;
 el.setAttribute('role','img');el.setAttribute('aria-label',record.name+'’s lantern');el.title=record.name+'’s Diwali wish';
 positionLantern(el,h,slot,mine);
 const img=document.createElement('img');img.src='/assets/lantern.webp';img.alt='';img.width=600;img.height=657;
 const tag=document.createElement('span');tag.className='tag';tag.textContent=record.name;el.append(img,tag);$('#lanterns').append(el);
 if($('#lanterns').children.length>(innerWidth<600?14:28)){const first=$('#lanterns').firstElementChild;visibleIds.delete(first.dataset.lanternId);first.remove()}
}
function updateSkyCount(total){
 if(!Number.isSafeInteger(total)||total<0){$('#sky-count').hidden=true;return}
 const copy=$('#sky-count-copy');copy.replaceChildren();
 const number=document.createElement('strong');number.textContent=new Intl.NumberFormat('en-IN').format(total);
 const label=document.createElement('span');label.textContent=total===1?'lantern lighting our sky':'lanterns lighting our sky';
 copy.append(number,document.createTextNode(' '),label);$('#sky-count').hidden=false;
}
async function refreshSky(){try{const response=await fetch('/api/lanterns',{cache:'no-store'});const data=await response.json();if(!response.ok)throw Error(data.error||'The shared sky is unavailable.');const selected=data.lanterns.slice(0,innerWidth<600?14:28),activeIds=new Set(selected.map(l=>l.id));for(const node of [...$('#lanterns').children])if(!activeIds.has(node.dataset.lanternId)){visibleIds.delete(node.dataset.lanternId);node.remove()}skyReady=true;allLanterns=data.lanterns;for(const record of selected)addLantern(record,record.id===myId);updateSkyCount(data.total)}catch{$('#sky-count').hidden=true;skyReady=false}}
function showLaunchSuccess(name,existing){
 $('#name').blur();const panel=$('#release-panel');panel.classList.add('success');$('#launch-success').hidden=false;
 $('#success-name').textContent='A LIGHT FROM '+name;
 $('#success-message').textContent=existing?'Your wish is still glowing. Here it is again.':'One more wish. One brighter sky.';
 $('#form-status').textContent='';
 if(!reduced){const launched=$('#lanterns .mine'),rect=launched?.getBoundingClientRect(),x=rect?rect.left+rect.width/2:innerWidth*.18,y=rect?rect.top+rect.height/2:innerHeight*.6;for(let i=0;i<70;i++){const angle=Math.random()*Math.PI*2,speed=1+Math.random()*3;embers.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-.8,life:.7+Math.random()*.6,size:1,color:i%3===0?'#fff0ff':'#f59cdd'})}}
 tone(700,.4,'sine',.025);
}
$('#lantern-form').addEventListener('submit',async event=>{
 event.preventDefault();const button=$('#release'),buttonText=button.querySelector('span');button.disabled=true;buttonText.textContent='Launching';$('#form-status').textContent='';
 try{const response=await fetch('/api/lanterns',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:$('#name').value,visitor})});const data=await response.json();if(!response.ok)throw Error(data.error||'Could not release your lantern. Please try again.');
 myId=data.lantern.id;
 if(visibleIds.has(myId)){const old=[...$('#lanterns').children].find(x=>x.dataset.lanternId===myId);if(old)old.remove();visibleIds.delete(myId)}
 addLantern(data.lantern,true);$('#name').value=data.lantern.name;showLaunchSuccess(data.lantern.name,data.existing);await refreshSky();
 }catch(error){$('#form-status').textContent=error.message}finally{button.disabled=false;buttonText.textContent='Launch'}
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

Promise.all([document.fonts.load('800 80px Outfit'),document.fonts.load('400 16px "Work Sans"'),rocketImage.decode().catch(()=>{}),new Promise(resolve=>{const image=new Image();image.onload=resolve;image.onerror=resolve;image.src='/assets/terrace.webp'})]).then(()=>{$('#loading').hidden=true;intro()});

addEventListener('scroll',()=>{if(!titleRect)return;const next=$('#particle-title').getBoundingClientRect(),dx=next.left-titleRect.left,dy=next.top-titleRect.top;for(const point of titlePoints){point.tx+=dx;point.ty+=dy}titleRect=next;if(reduced&&introDone){clearFrame();renderTitle(4,performance.now())}},{passive:true});
