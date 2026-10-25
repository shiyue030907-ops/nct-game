(function(root){
function shift(b,i,dx,dy,w,h){if(b[i]==null)return null;let chain=[i],x=i%w,y=Math.floor(i/w);for(;;){x+=dx;y+=dy;if(x<0||x>=w||y<0||y>=h)return null;let n=y*w+x;if(b[n]===null){let out=b.slice(),e=n;for(let k=chain.length-1;k>=0;k--){out[e]=out[chain[k]];e=chain[k]}out[i]=null;return out}chain.push(n)}}
function resolve(b,indices,w,h){let removed=[];for(const i of indices){if(b[i]===null)continue;for(const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]]){let x=i%w+dx,y=Math.floor(i/w)+dy;while(x>=0&&x<w&&y>=0&&y<h){let j=y*w+x;if(b[j]!==null){if(b[j]===b[i]){removed.push([i,j]);b[i]=b[j]=null}break}x+=dx;y+=dy}if(b[i]===null)return removed}}return removed}
function move(b,i,dx,dy,count,w,h){const original=b;let at=i,moved=0,removed=[];for(let n=0;n<count;n++){let next=shift(b,at,dx,dy,w,h);if(!next)break;at+=dx+dy*w;moved++;removed=resolve(next,[at],w,h);b=next;if(removed.length)break}return {board:removed.length?b:original,moved,removed,at:removed.length?at:i,committed:removed.length>0}}
function taps(b,w,h){let moves=[];for(let i=0;i<b.length;i++)if(b[i]!==null){let next=b.slice(),removed=resolve(next,[i],w,h);if(removed.length)moves.push({i,board:next,removed})}return moves}
const api={shift,resolve,move,taps};if(typeof module!=='undefined')module.exports=api;else root.BrickEngine=api;
})(typeof window==='undefined'?{}:window);
