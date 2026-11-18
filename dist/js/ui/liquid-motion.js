// Cosmetic-only motion. No storage writes, layout changes or blocked interactions.
const running=new Set();
export function motionAllowed(root=globalThis.document?.documentElement,view=globalThis.window) {
  return root?.dataset.glass==='full'&&root.dataset.motion!=='reduced'&&globalThis.document?.visibilityState!=='hidden'&&!view?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}
function animate(node,frames,options={}) {
  if(!motionAllowed()||typeof node?.animate!=='function')return null;
  const animation=node.animate(frames,{duration:360,easing:'cubic-bezier(.2,.8,.2,1)',...options});
  running.add(animation);const clear=()=>running.delete(animation);animation.finished?.then(clear,clear);return animation;
}
export function enterScreen(node) {
  if(!motionAllowed()||!node)return;
  const expressive=document.documentElement.dataset.glassMotion!=='gentle';
  const cards=[...(node.querySelectorAll?.(':scope > .page-heading, :scope > .panel, :scope > .simple-home-grid, :scope > .section-tabs, :scope > .social-profile, :scope > .profile-content')||[])].slice(0,6);
  const targets=cards.length?cards:[node];
  targets.forEach((card,i)=>animate(card,[{opacity:.15,transform:`translateY(${expressive?18:7}px) scale(${expressive?.975:.995})`},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:expressive?430:230,delay:i*(expressive?32:12)}));
}
export function enterDialog(node) {
  const expressive=document.documentElement.dataset.glassMotion!=='gentle';
  animate(node,[{opacity:0,transform:'translateY(24px) scale(.94)'},{opacity:1,transform:expressive?'translateY(-2px) scale(1.008)':'translateY(0) scale(1)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:expressive?410:240});
}
export function pulseSaved(node) {
  animate(node,[{opacity:.4,transform:'scale(.98)'},{opacity:1,transform:'scale(1.015)'},{opacity:1,transform:'scale(1)'}],{duration:390});
}
export function stopLiquidMotion() {
  for(const animation of running)animation.cancel();running.clear();
  document.querySelectorAll?.('.liquid-ripple').forEach(node=>node.remove());
  document.querySelectorAll?.('[data-glass-tracking]').forEach(node=>{node.style.removeProperty('--shine-x');node.style.removeProperty('--shine-y');delete node.dataset.glassTracking;});
}
export function installLiquidMotion() {
  const media=window.matchMedia?.('(prefers-reduced-motion: reduce)');
  media?.addEventListener?.('change',()=>{if(!motionAllowed())stopLiquidMotion();});
  document.addEventListener('visibilitychange',()=>{document.documentElement.dataset.appHidden=String(document.visibilityState==='hidden');if(document.visibilityState==='hidden')stopLiquidMotion();});
  window.addEventListener('appearance-changed',()=>{if(!motionAllowed()||document.documentElement.dataset.glassMotion==='gentle')stopLiquidMotion();});
  let pending=null,frame=0,lastSurface=null;
  document.addEventListener('pointermove',event=>{
    if(event.pointerType!=='mouse'||!motionAllowed()||document.documentElement.dataset.glassMotion==='gentle'||document.documentElement.dataset.glassIntensity==='subtle')return;
    const surface=event.target?.closest?.('.primary,.secondary,.workout-choice,.panel,.profile-post');
    if(!surface||!globalThis.requestAnimationFrame)return;
    pending={surface,x:event.clientX,y:event.clientY};if(frame)return;
    frame=requestAnimationFrame(()=>{
      frame=0;if(!pending||!motionAllowed())return;
      const {surface,x,y}=pending;pending=null;if(!surface.isConnected)return;
      if(lastSurface&&lastSurface!==surface){lastSurface.style.removeProperty('--shine-x');lastSurface.style.removeProperty('--shine-y');delete lastSurface.dataset.glassTracking;}
      const box=surface.getBoundingClientRect();if(!box.width||!box.height)return;
      surface.style.setProperty('--shine-x',`${Math.max(0,Math.min(100,(x-box.left)/box.width*100))}%`);
      surface.style.setProperty('--shine-y',`${Math.max(0,Math.min(100,(y-box.top)/box.height*100))}%`);surface.dataset.glassTracking='true';lastSurface=surface;
    });
  },{passive:true});
  document.addEventListener('pointerout',event=>{
    if(lastSurface&&!lastSurface.contains(event.relatedTarget)){lastSurface.style.removeProperty('--shine-x');lastSurface.style.removeProperty('--shine-y');delete lastSurface.dataset.glassTracking;lastSurface=null;}
  },{passive:true});
  const userDetails=new WeakSet();
  document.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key)){const summary=event.target?.closest?.('summary');if(summary?.parentElement)userDetails.add(summary.parentElement);}});
  document.addEventListener('pointerdown',event=>{
    const summary=event.target?.closest?.('summary');if(summary?.parentElement)userDetails.add(summary.parentElement);
    const button=event.target?.closest?.('button');if(!button||button.disabled||!motionAllowed())return;
    const expressive=document.documentElement.dataset.glassMotion!=='gentle';
    animate(button,[{transform:'scale(1)'},{transform:'scale(.96)'},{transform:expressive?'scale(1.025)':'scale(1)'},{transform:'scale(1)'}],{duration:expressive?340:190});
    if(!expressive||typeof button.append!=='function')return;
    const box=button.getBoundingClientRect(),ripple=document.createElement('span');
    ripple.className='liquid-ripple';ripple.setAttribute('aria-hidden','true');
    const size=Math.max(box.width,box.height)*2;ripple.style.width=ripple.style.height=size+'px';
    ripple.style.left=(event.clientX-box.left-size/2)+'px';ripple.style.top=(event.clientY-box.top-size/2)+'px';
    button.querySelectorAll('.liquid-ripple').forEach(node=>node.remove());button.append(ripple);
    const effect=animate(ripple,[{opacity:.4,transform:'scale(.08)'},{opacity:0,transform:'scale(1)'}],{duration:560});
    if(effect?.finished)effect.finished.then(()=>ripple.remove(),()=>ripple.remove());else ripple.remove();
  },{passive:true});
  document.addEventListener('toggle',event=>{
    const detail=event.target;if(!userDetails.has(detail))return;userDetails.delete(detail);
    if(detail.open&&motionAllowed())[...detail.children].filter(child=>child.tagName!=='SUMMARY').slice(0,4).forEach(child=>animate(child,[{opacity:.1,transform:'translateY(-5px)'},{opacity:1,transform:'translateY(0)'}],{duration:240}));
  },true);
}
