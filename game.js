const names=["JOHNNY", "TAEYONG", "YUTA", "KUN", "DOYOUNG", "TEN", "JAEHYUN", "WINWIN", "JUNGWOO", "MARK", "XIAOJUN", "HENDERY", "RENJUN", "JENO", "HAECHAN", "JAEMIN", "YANGYANG", "CHENLE", "JISUNG", "SION", "RIKU", "YUSHI", "JAEHEE", "RYO", "SAKUYA"];
const $=id=>document.getElementById(id),W=8;let board=[],rows=6,stage=0,selected=-1,history=[],stock={hint:3,shuffle:1,undo:5},initial=0,steps=0,start=Date.now(),completed=false,drag=null;
let pendingShatters=[];
let shakingMember=null,shakeUntil=0,shakeGeneration=0;
const stages=[{name:'进阶 · 80 块',rows:10,kinds:10},{name:'挑战 · 112 块',rows:14,kinds:10},{name:'极限 · 128 块',rows:16,kinds:10}];
function aligned(b,a,c){if(a===c||b[a]===null||b[a]!==b[c])return false;let d;if(Math.floor(a/W)===Math.floor(c/W))d=a<c?1:-1;else if(a%W===c%W)d=a<c?W:-W;else return false;for(let i=a+d;i!==c;i+=d)if(b[i]!==null)return false;return true}
function shift(b,i,dx,dy){return BrickEngine.shift(b,i,dx,dy,W,rows)}
function pair(b){const p=BrickEngine.taps(b,W,rows)[0];return p?p.removed[0]:null}
function findMove(){const direct=BrickEngine.taps(board,W,rows)[0];if(direct)return {p:direct.removed[0]};for(let i=0;i<board.length;i++)if(board[i]!==null)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])for(let n=1;n<Math.max(W,rows);n++){const op=BrickEngine.move(board,i,dx,dy,n,W,rows);if(!op.moved)break;if(op.removed.length)return {i,dx,dy,n:op.moved};if(op.moved<n)break}return null}
function save(){history.push(board.slice());if(history.length>150)history.shift()}
function msg(t){$('status').textContent=t}
function render(){flushShatters();clearPath();const el=$('board');el.innerHTML='';board.forEach((m,i)=>{const cell=document.createElement('div');cell.className='cell';if(m!==null){let t=document.createElement('button');t.className='tile'+(selected===i?' selected':'');t.dataset.index=i;t.dataset.member=m;t.setAttribute('aria-label',names[m]+'，第'+(Math.floor(i/W)+1)+'行第'+(i%W+1)+'列');t.innerHTML='<img draggable="false" src="assets/member-'+m+'.jpg" alt=""><span>NCT</span>';t.onclick=e=>{if(e.detail===0)choose(i)};cell.appendChild(t)}el.appendChild(cell)});const left=board.filter(x=>x!==null).length;$('remaining').textContent=left;$('progress').style.width=(100*(initial-left)/initial)+'%';$('undo').disabled=!history.length||stock.undo===0;updateTools();$('win').hidden=left!==0;if(left===0){completed=true;$('winText').textContent='用时 '+$('timer').textContent+' · '+steps+' 次操作';$('next').textContent=stage===2?'再挑战一次 →':'下一关 →';msg('这一盒宝藏，都是你的了 ✦')}applySameMemberShake();}
function resolveFrom(b,indices){const before=b.slice(),pairs=BrickEngine.resolve(b,indices,W,rows);for(const pair of pairs)for(const index of pair)pendingShatters.push({index,member:before[index]});return pairs.map(p=>p[0])}
function flushShatters(){
 if(!pendingShatters.length)return;
 const pending=pendingShatters;pendingShatters=[];
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const el=$('board'),wrap=el.parentElement,box=wrap.getBoundingClientRect();
 let layer=$('shatterLayer');if(!layer){layer=document.createElement('div');layer.id='shatterLayer';layer.setAttribute('aria-hidden','true');wrap.appendChild(layer)}
 for(const {index,member} of pending){
  const cell=el.children[index];if(!cell)continue;const rect=cell.getBoundingClientRect(),left=rect.left-box.left,top=rect.top-box.top,size=rect.width;
  const flash=document.createElement('div');flash.className='match-flash';flash.style.cssText='left:'+left+'px;top:'+top+'px;width:'+size+'px;height:'+size+'px';layer.appendChild(flash);
  const ring=document.createElement('div');ring.className='match-ring';ring.style.cssText=flash.style.cssText;layer.appendChild(ring);
  const count=4,piece=size/count;
  for(let y=0;y<count;y++)for(let x=0;x<count;x++){
   const shard=document.createElement('div');shard.className='photo-shard';
   const vx=(x-1.5)*(8+Math.random()*9),vy=(y-1.5)*(8+Math.random()*8)-12;
   shard.style.cssText='left:'+(left+x*piece)+'px;top:'+(top+y*piece)+'px;width:'+(piece+.6)+'px;height:'+(piece+.6)+'px;background-image:url(assets/member-'+member+'.jpg);background-size:'+size+'px '+size+'px;background-position:'+(-x*piece)+'px '+(-y*piece)+'px;--sx:'+vx+'px;--sy:'+vy+'px;--rot:'+(Math.random()*160-80)+'deg;animation-duration:'+(450+Math.random()*160)+'ms;animation-delay:'+(Math.random()*35)+'ms';layer.appendChild(shard);
   setTimeout(()=>shard.remove(),700);
  }
  setTimeout(()=>{flash.remove();ring.remove();},700);
 }
}
function updateTools(){for(const key of ['hint','shuffle','undo']){const btn=$(key);btn.querySelector('.count').textContent=stock[key];if(key!=='undo')btn.disabled=completed||stock[key]===0;}}
function applySameMemberShake(){
 const active=Date.now()<shakeUntil;
 for(const t of $('board').querySelectorAll('.tile')){
  const img=t.querySelector('img'),same=active&&Number(t.dataset.member)===shakingMember;
  img.classList.toggle('same-member-shake',same);t.classList.toggle('same-member-glow',same);
 }
}
function shakeSameMembers(member){
 if(member===null||member===undefined)return;
 shakingMember=member;shakeUntil=Date.now()+650;const generation=++shakeGeneration;
 for(const img of $('board').querySelectorAll('.same-member-shake'))img.classList.remove('same-member-shake');
 void $('board').offsetWidth;applySameMemberShake();
 setTimeout(()=>{if(generation===shakeGeneration){shakeUntil=0;applySameMemberShake()}},660);
}
function choose(i){
 if(completed)return;
 shakeSameMembers(board[i]);
 const b=board.slice(),removed=resolveFrom(b,[i]);
 if(removed.length){save();board=b;steps++;selected=-1;render();if(!completed)msg('自动消除了 1 对头像 ✦');return;}
 selected=selected===i?-1:i;render();if(selected>=0)availablePaths(i);else clearPath();msg(selected>=0?names[board[i]]+' · 同款晃动，沿蓝色路径拖动':'沿蓝色路径拖动，数字表示格数');
}
function move(i,dx,dy,count){
 let b=board,at=i,moved=0,removed=[];
 for(let n=0;n<count;n++){
  const next=shift(b,at,dx,dy);if(!next)break;
  at+=dx+dy*W;moved++;
  removed=resolveFrom(next,[at]);b=next;
  if(removed.length)break;
 }
 if(!moved){msg('这个方向没有空位，换一个方向试试');return false;}
 if(!removed.length){msg('未配对，方块已回到原位');return false;}
 save();board=b;selected=-1;steps++;render();
 if(!completed)msg('消除了手指拖动的这 1 对头像 ✦');return true;
}
// Delegate capture to the board so a tile disappearing cannot interrupt a gesture.
function pathLayer(){let layer=$('dragPath');if(!layer){layer=document.createElementNS('http://www.w3.org/2000/svg','svg');layer.id='dragPath';layer.setAttribute('aria-hidden','true');$('board').parentElement.appendChild(layer)}return layer}
function clearPath(){const layer=$('dragPath');if(layer)layer.replaceChildren()}
function drawPaths(i,routes,blocked=false){
 const el=$('board'),layer=pathLayer(),box=el.getBoundingClientRect(),wrap=el.parentElement.getBoundingClientRect();
 layer.style.left=(box.left-wrap.left)+'px';layer.style.top=(box.top-wrap.top)+'px';layer.setAttribute('width',box.width);layer.setAttribute('height',box.height);layer.setAttribute('viewBox','0 0 '+box.width+' '+box.height);
 const origin=el.children[i].getBoundingClientRect(),size=origin.width,pitch=size+(parseFloat(getComputedStyle(el).columnGap)||0),cx=origin.left-box.left+size/2,cy=origin.top-box.top+size/2;
 let markup='<defs><marker id="routeArrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L6,3.5 L0,7" fill="none" stroke="#527b00" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>';
 for(const r of routes){
  const color=r.blocked?'#e65362':'#527b00',distance=r.n*pitch,ex=cx+r.dx*distance,ey=cy+r.dy*distance;
  for(let step=1;step<=r.n;step++){const x=cx+r.dx*step*pitch,y=cy+r.dy*step*pitch;markup+='<rect x="'+(x-size/2+2)+'" y="'+(y-size/2+2)+'" width="'+(size-4)+'" height="'+(size-4)+'" rx="5" fill="'+color+'" fill-opacity=".16" stroke="'+color+'" stroke-width="2" stroke-dasharray="4 3"/>'}
  if(r.n>0){markup+='<path d="M'+cx+','+cy+' L'+ex+','+ey+'" stroke="white" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M'+cx+','+cy+' L'+ex+','+ey+'" stroke="'+color+'" stroke-width="3" fill="none" stroke-dasharray="5 5" marker-end="url(#routeArrow)"/>';markup+='<circle cx="'+ex+'" cy="'+ey+'" r="10" fill="'+color+'" stroke="white" stroke-width="2"/><text x="'+ex+'" y="'+(ey+3.5)+'" text-anchor="middle" fill="white" font-size="10" font-weight="700">'+r.n+'</text>'}
  if(r.blocked){const x=ex+r.dx*size*.33,y=ey+r.dy*size*.33;markup+='<circle cx="'+x+'" cy="'+y+'" r="8" fill="white" stroke="#e65362" stroke-width="2"/><path d="M'+(x-3)+','+(y-3)+' l6,6 m0,-6 l-6,6" stroke="#e65362" stroke-width="2"/>'}
 }
 markup+='<circle cx="'+cx+'" cy="'+cy+'" r="5" fill="#527b00" stroke="white" stroke-width="2"/>';layer.innerHTML=markup;
}
function availablePaths(i){
 const routes=[];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){let b=board,at=i,n=0;for(let k=0;k<Math.max(W,rows);k++){const next=shift(b,at,dx,dy);if(!next)break;b=next;at+=dx+dy*W;n++}if(n)routes.push({dx,dy,n})}
 if(routes.length)drawPaths(i,routes);else clearPath();
}
function clearDragPreview(){for(const t of $('board').querySelectorAll('.tile')){t.style.transform='';t.style.zIndex='';t.classList.remove('dragging')} $('board').classList.remove('is-dragging');clearPath()}
function returnDragPreview(){
 const el=$('board');el.classList.remove('is-dragging');el.classList.add('is-returning');
 void el.offsetWidth;
 for(const t of el.querySelectorAll('.tile')){t.style.transform='';t.style.zIndex='';t.classList.remove('dragging')}
 clearPath();setTimeout(()=>el.classList.remove('is-returning'),230);
}
function dragPreview(d,distance){
 let values=board.slice(),ids=board.map((v,i)=>v===null?null:i),at=d.i,progress=distance/d.pitch;
 let reachable=0;let positions=new Map();ids.forEach((id,p)=>{if(id!==null)positions.set(id,p)});
 for(let step=0;step<Math.ceil(progress);step++){
  const next=BrickEngine.shift(values,at,d.dx,d.dy,W,rows);if(!next)break;reachable=step+1;
  const nextIds=BrickEngine.shift(ids,at,d.dx,d.dy,W,rows),fraction=Math.min(1,progress-step);
  for(let p=0;p<nextIds.length;p++){const id=nextIds[p];if(id!==null){const from=ids.indexOf(id);positions.set(id,from+(p-from)*fraction)}}
  const destination=at+d.dx+d.dy*W;
  if(fraction>=.25&&BrickEngine.resolve(next.slice(),[destination],W,rows).length){drawPaths(d.i,[{dx:d.dx,dy:d.dy,n:step+1}]);return step+1;}
  if(fraction<1)break;values=next;ids=nextIds;at=destination;
 }
 drawPaths(d.i,[{dx:d.dx,dy:d.dy,n:reachable,blocked:reachable<Math.ceil(progress)}]);
 for(const t of $('board').querySelectorAll('.tile')){
  const source=Number(t.dataset.index),to=positions.get(source);if(to===undefined)continue;
  // Every shift is along one locked axis, including partially travelled cells.
  const delta=to-source,px=d.dx?delta*d.pitch:0,py=d.dy?delta/W*d.pitch:0;
  t.style.transform='translate('+px+'px,'+py+'px)';t.style.zIndex=(delta||source===d.i)?'10':'';
 }
 return 0;
}
function setupDrag(){
 const el=$('board');
 el.onpointerdown=e=>{
  if(completed||drag||e.isPrimary===false||(e.pointerType==='mouse'&&e.button!==0))return;
  const tile=e.target.closest('.tile');if(!tile)return;
  e.preventDefault();el.classList.remove('is-returning');const cell=tile.parentElement.getBoundingClientRect(),gap=parseFloat(getComputedStyle(el).columnGap)||0;
  drag={i:Number(tile.dataset.index),pointer:e.pointerId,x:e.clientX,y:e.clientY,pitch:cell.width+gap,active:false,committed:false,dx:0,dy:0};
  shakeSameMembers(board[drag.i]);tile.focus({preventScroll:true});el.setPointerCapture(e.pointerId);tile.classList.add('dragging');availablePaths(drag.i);
 };
 el.onpointermove=e=>{
  const d=drag;if(!d||d.pointer!==e.pointerId||d.committed)return;
  const x=e.clientX-d.x,y=e.clientY-d.y;
  if(!d.active){if(Math.max(Math.abs(x),Math.abs(y))<5)return;d.active=true;d.horizontal=Math.abs(x)>=Math.abs(y);el.classList.add('is-dragging')}
  const delta=d.horizontal?x:y;d.dx=d.horizontal?Math.sign(delta):0;d.dy=d.horizontal?0:Math.sign(delta);d.distance=Math.abs(delta);
  if(!d.dx&&!d.dy){clearDragPreview();return}
  e.preventDefault();const matchAt=dragPreview(d,d.distance);
  if(matchAt){d.committed=true;clearDragPreview();move(d.i,d.dx,d.dy,matchAt)}
 };
 el.onpointerup=e=>{
  const d=drag;if(!d||d.pointer!==e.pointerId)return;drag=null;e.preventDefault();
  if(el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId);
  if(d.committed){clearDragPreview();return}
  if(!d.active){clearDragPreview();choose(d.i);return}
  if(d.dx||d.dy){
   const count=Math.max(1,Math.floor(d.distance/d.pitch+.75)),result=BrickEngine.move(board,d.i,d.dx,d.dy,count,W,rows);
   if(result.removed.length){clearDragPreview();move(d.i,d.dx,d.dy,count)}
   else{returnDragPreview();msg('未配对，方块已回到原位')}
  }else returnDragPreview();
 };
 const cancel=e=>{if(drag&&drag.pointer===e.pointerId){drag=null;clearDragPreview()}};
 el.onpointercancel=cancel;el.onlostpointercapture=cancel;
}
function fillSolvable(){
 const units=[[0,1,2,4,6,8,9,14],[9,12,13,14,15,17,18],[3,5,7,10,11,16],[19,20,21,22,23,24]],pool=[];
 const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 for(const unit of units){let picked=0;for(const member of shuffle(unit.slice())){if(!pool.includes(member)){pool.push(member);if(++picked===2)break}}}
 for(const member of shuffle(names.map((_,i)=>i)))if(pool.length<10&&!pool.includes(member))pool.push(member);
 shuffle(pool);return challengeBoards[stage].board.map(v=>v===null?null:pool[v]);
}
function init(s){stage=s;rows=stages[s].rows;board=fillSolvable();initial=board.length;selected=-1;history=[];stock={hint:3,shuffle:1,undo:5};steps=0;start=Date.now();completed=false;$('levelSelect').value=String(s);$('stageNum').textContent=String(s+1).padStart(2,'0');$('stageName').textContent=stages[s].name;$('timer').textContent='00:00';render();msg('本局随机10人 · 开局仅 '+(BrickEngine.taps(board,W,rows).length/2)+' 组直连，规划拖动顺序再出手')}
$('undo').onclick=()=>{if(history.length&&stock.undo){stock.undo--;board=history.pop();completed=false;selected=-1;steps++;render();msg('已撤回上一步 · 剩余 '+stock.undo+' 次')}};
$('hint').onclick=()=>{if(completed||!stock.hint)return;const m=findMove();if(!m){msg('没有可直接消除的路线，试试移动腾位、撤回或洗牌');return}stock.hint--;updateTools();document.querySelectorAll('.hint').forEach(t=>t.classList.remove('hint'));if(m.i===undefined){m.p.forEach(i=>document.querySelector('[data-index="'+i+'"]').classList.add('hint'));msg('发光头像已经对齐，轻点其中一张即可消除')}else{document.querySelector('[data-index="'+m.i+'"]').classList.add('hint');msg('将发光头像向'+(m.dx===1?'右':m.dx===-1?'左':m.dy===1?'下':'上')+'拖动 '+m.n+' 格，即可自动消除')}};
$('shuffle').onclick=()=>{if(completed||!stock.shuffle)return;save();stock.shuffle--;const values=board.filter(v=>v!==null);let fallback=board.slice();for(let tries=0;tries<100;tries++){for(let i=values.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[values[i],values[j]]=[values[j],values[i]]}let k=0;board=board.map(v=>v===null?null:values[k++]);if(findMove())break;if(tries===99)board=fallback}selected=-1;steps++;render();msg('已随机重排剩余头像 · 本关洗牌已用完')};
$('restart').onclick=()=>{if(steps&&!completed){if(!confirm('重新开始本关？当前进度将清空。'))return}init(stage)};$('next').onclick=()=>init((stage+1)%3);$('levelSelect').onchange=e=>{const target=Number(e.target.value);if(steps&&!completed&&!confirm('切换难度？当前进度将清空。')){e.target.value=String(stage);return}init(target)};$('help').onclick=()=>$('dialog').showModal();$('close').onclick=$('gotit').onclick=()=>$('dialog').close();setInterval(()=>{if(!completed){const s=Math.floor((Date.now()-start)/1000);$('timer').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}},1000);setupDrag();init(1);
