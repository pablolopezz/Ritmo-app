// Preferences stay separate from nutrition/training records and accept safe values only.
export const defaultAppearance=()=>({theme:'dark',glass:'full',background:'default',accent:'#a7edc5',textSize:'normal',motion:'system',start:'home',backgroundMode:'solid',gradientEnd:'#26394d',gradientAngle:135,pattern:'none',cardColor:'auto',corners:'rounded',shadow:'soft',spacing:'comfortable',font:'system',buttonStyle:'solid',buttonShape:'rounded',opacity:'auto',blur:20,logoMode:'accent',logoColor:'#a7edc5',logoTile:'auto',logoSize:42,logoShape:'soft',buttonHeight:50,borderWidth:1,contentWidth:1280,lineHeight:1.6,textWeight:400,glassBehavior:'keep',spaceTint:'linked',glassIntensity:'strong',glassMotion:'expressive'});
const hex=value=>typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value);
export function normalizeAppearance(raw={}) {
  const d=defaultAppearance();
  return {theme:['dark','light'].includes(raw.theme)?raw.theme:d.theme,glass:['full','reduced'].includes(raw.glass)?raw.glass:d.glass,
    background:raw.background==='default'||hex(raw.background)?raw.background.toLowerCase():d.background,
    accent:hex(raw.accent)?raw.accent.toLowerCase():d.accent,textSize:['normal','large','extra'].includes(raw.textSize)?raw.textSize:d.textSize,
    motion:['system','reduced'].includes(raw.motion)?raw.motion:d.motion,start:['home','train','menu'].includes(raw.start)?raw.start:d.start,
    backgroundMode:['solid','gradient'].includes(raw.backgroundMode)?raw.backgroundMode:d.backgroundMode,
    gradientEnd:hex(raw.gradientEnd)?raw.gradientEnd.toLowerCase():d.gradientEnd,gradientAngle:Number.isInteger(raw.gradientAngle)&&raw.gradientAngle>=0&&raw.gradientAngle<=360?raw.gradientAngle:d.gradientAngle,
    pattern:['none','dots','grid'].includes(raw.pattern)?raw.pattern:d.pattern,cardColor:raw.cardColor==='auto'||hex(raw.cardColor)?raw.cardColor.toLowerCase():d.cardColor,
    corners:['square','soft','rounded','pill'].includes(raw.corners)?raw.corners:d.corners,shadow:['none','soft','deep'].includes(raw.shadow)?raw.shadow:d.shadow,
    spacing:['compact','comfortable','airy'].includes(raw.spacing)?raw.spacing:d.spacing,font:['system','rounded','serif','mono'].includes(raw.font)?raw.font:d.font,
    buttonStyle:['solid','outline'].includes(raw.buttonStyle)?raw.buttonStyle:d.buttonStyle,buttonShape:['square','rounded','pill'].includes(raw.buttonShape)?raw.buttonShape:d.buttonShape,
    opacity:raw.opacity==='auto'||(Number.isInteger(raw.opacity)&&raw.opacity>=70&&raw.opacity<=100)?raw.opacity:d.opacity,blur:Number.isInteger(raw.blur)&&raw.blur>=0&&raw.blur<=32?raw.blur:d.blur,
    logoMode:['accent','custom'].includes(raw.logoMode)?raw.logoMode:d.logoMode,logoColor:hex(raw.logoColor)?raw.logoColor.toLowerCase():d.logoColor,
    logoTile:['auto','none'].includes(raw.logoTile)?raw.logoTile:d.logoTile,logoSize:[32,42,52,64].includes(raw.logoSize)?raw.logoSize:d.logoSize,logoShape:['square','soft','circle'].includes(raw.logoShape)?raw.logoShape:d.logoShape,
    buttonHeight:[44,50,58,64].includes(raw.buttonHeight)?raw.buttonHeight:d.buttonHeight,borderWidth:[0,1,2,3].includes(raw.borderWidth)?raw.borderWidth:d.borderWidth,
    contentWidth:[900,1120,1280,1440].includes(raw.contentWidth)?raw.contentWidth:d.contentWidth,lineHeight:[1.4,1.6,1.9].includes(raw.lineHeight)?raw.lineHeight:d.lineHeight,textWeight:[400,500,600].includes(raw.textWeight)?raw.textWeight:d.textWeight,glassBehavior:['keep','free'].includes(raw.glassBehavior)?raw.glassBehavior:d.glassBehavior,spaceTint:['linked','neutral'].includes(raw.spaceTint)?raw.spaceTint:d.spaceTint,glassIntensity:['subtle','strong'].includes(raw.glassIntensity)?raw.glassIntensity:d.glassIntensity,glassMotion:['gentle','expressive'].includes(raw.glassMotion)?raw.glassMotion:d.glassMotion};
}
export function readAppearance(storage) {
  try {
    let extras={};try {extras=JSON.parse(storage.getItem('ritmo-personalization')||'{}')||{};}catch { /* Keep valid legacy preferences. */ }
    return normalizeAppearance({...extras,theme:extras.theme??storage.getItem('theme'),glass:extras.glass??storage.getItem('ritmo-glass')});
  } catch {return defaultAppearance();}
}
export function currentAppearance() {
  const d=document.documentElement.dataset,raw={};
  for(const key of Object.keys(defaultAppearance()))raw[key]=['gradientAngle','blur','logoSize','buttonHeight','borderWidth','contentWidth','lineHeight','textWeight'].includes(key)?(d[key]===undefined?undefined:Number(d[key])):key==='opacity'&&d[key]!==undefined&&d[key]!=='auto'?Number(d[key]):d[key];
  return normalizeAppearance(raw);
}
const rgb=color=>[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));
export function mixColor(a,b,ratio) {return '#'+rgb(a).map((v,i)=>Math.round(v+(rgb(b)[i]-v)*ratio).toString(16).padStart(2,'0')).join('');}
function luminance(color) {return rgb(color).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);}
export function contrastRatio(a,b) {const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
export function contrastText(color) {return contrastRatio(color,'#ffffff')>contrastRatio(color,'#000000')?'#ffffff':'#000000';}
export function readableAccent(color,surface) {
  if(contrastRatio(color,surface)>=4.5)return color;
  const target=rgb(contrastText(surface)),source=rgb(color);
  for(let step=1;step<=20;step++) {
    const adjusted='#'+source.map((v,i)=>Math.round(v+(target[i]-v)*step/20).toString(16).padStart(2,'0')).join('');
    if(contrastRatio(adjusted,surface)>=4.5)return adjusted;
  }
  return contrastText(surface);
}
export function appearancePalette(preferences) {
  const p=normalizeAppearance(preferences),light=p.theme==='light',linked=p.spaceTint==='linked';
  const base=light?'#ffffff':'#192326',baseBackground=light?'#f3f6f5':'#11191c';
  const surface=p.cardColor==='auto'?(linked?mixColor(base,p.accent,light?.06:.1):base):p.cardColor;
  const background=p.background==='default'?(linked?mixColor(baseBackground,p.accent,light?.09:.12):baseBackground):p.background;
  return {text:contrastText(surface),muted:readableAccent('#849493',surface),input:mixColor(surface,contrastText(surface),.065),background,surface,
    accent:readableAccent(p.accent,surface),button:p.accent,buttonText:contrastText(p.accent),pageText:contrastText(background),pageAccent:readableAccent(p.accent,background)};
}
export function applyAppearance(preferences,{persist=true,emit=true}={}) {
  const p=normalizeAppearance(preferences);
  // Reject unsafe CSS values rather than partially applying untrusted preferences.
  for(const [key,value] of Object.entries(preferences))if(key in p&&(typeof p[key]==='number'?p[key]!==Number(value):p[key]!==String(value).toLowerCase()))throw new Error('Preferencia de apariencia no válida.');
  const previous=currentAppearance(),root=document.documentElement,palette=appearancePalette(p);
  Object.assign(root.dataset,p);
  root.dataset.customBackground=String(p.background!=='default'||p.backgroundMode!=='solid'||p.cardColor!=='auto');
  for(const [key,value] of Object.entries({'--bg':palette.background,'--accent':palette.accent,'--protein':palette.accent,'--button-bg':palette.button,'--button-text':palette.buttonText,'--accent-text':palette.buttonText,'--page-text':palette.pageText,'--page-accent':palette.pageAccent,'--panel':palette.surface,'--text':palette.text,'--muted':palette.muted,'--input':palette.input,'--sidebar':palette.surface,'--line':mixColor(palette.surface,palette.text,.18),'--soft-accent':mixColor(palette.surface,palette.accent,.14)}))root.style.setProperty(key,value);
  // Liquid Glass stays translucent with custom colors; automatic never means opaque.
  const strong=p.glassIntensity==='strong';
  const alpha=p.opacity==='auto'?(p.theme==='light'?(strong?.56:.7):(strong?.45:.62)):p.opacity/100;
  const blended=mixColor(palette.background,palette.surface,alpha);
  root.style.setProperty('--glass-surface',`rgba(${rgb(palette.surface).join(',')},${alpha})`);
  root.style.setProperty('--glass-header',`rgba(${rgb(palette.surface).join(',')},${Math.min(.9,Math.max(.68,alpha))})`);
  root.style.setProperty('--glass-text',contrastText(blended));root.style.setProperty('--glass-muted',readableAccent('#849493',blended));root.style.setProperty('--glass-accent',readableAccent(p.accent,blended));
  const linked=p.spaceTint==='linked',spaceSurface=linked?mixColor(palette.surface,p.accent,.12):palette.surface;
  const spaceComposite=mixColor(palette.background,spaceSurface,alpha),ringEnd=linked?mixColor(p.accent,palette.background,.38):palette.accent;
  for(const [key,value] of Object.entries({
    '--space-color':p.accent,'--space-ring-end':ringEnd,'--space-surface':spaceSurface,
    '--space-glass-surface':`rgba(${rgb(spaceSurface).join(',')},${alpha})`,
    '--space-text':contrastText(spaceComposite),'--space-muted':readableAccent('#849493',spaceComposite),'--space-accent':readableAccent(p.accent,spaceComposite),
    '--space-glow':linked?`radial-gradient(ellipse at 8% 8%,rgba(${rgb(p.accent).join(',')},.28),transparent 55%),radial-gradient(ellipse at 90% 70%,rgba(${rgb(ringEnd).join(',')},.16),transparent 50%)`:'none'
  }))root.style.setProperty(key,value);
  const highlight=mixColor(p.accent,'#ffffff',.8),glassText=contrastText(blended);
  // Keep combined specular layers inside the text contrast budget.
  let shineBudget=.5;
  while(shineBudget>0&&contrastRatio(glassText,mixColor(blended,highlight,shineBudget))<4.5)shineBudget=Math.max(0,shineBudget-.01);
  const highlightAlpha=Math.min(p.theme==='light'?(strong?.45:.3):(strong?.22:.12),shineBudget*.35);
  const specularAlpha=Math.min(strong?.34:.16,shineBudget*.65);
  root.style.setProperty('--glass-highlight',`rgba(${rgb(highlight).join(',')},${highlightAlpha})`);
  root.style.setProperty('--glass-specular',`rgba(${rgb(highlight).join(',')},${specularAlpha})`);
  root.style.setProperty('--glass-primary-specular',palette.buttonText==='#ffffff'?'rgba(0,0,0,.12)':'rgba(255,255,255,.44)');
  root.style.setProperty('--glass-border',`rgba(${rgb(highlight).join(',')},${p.theme==='light'?(strong?.78:.6):(strong?.48:.28)})`);
  // Inner controls use the same material, with a denser tint for small text.
  const controlAlpha=Math.max(.82,alpha),fieldAlpha=Math.max(.92,alpha);
  const controlComposite=mixColor(palette.background,palette.surface,controlAlpha),fieldComposite=mixColor(palette.background,palette.surface,fieldAlpha);
  for(const [key,value] of Object.entries({
    '--glass-control':`rgba(${rgb(palette.surface).join(',')},.46)`,
    '--glass-control-text':contrastText(controlComposite),
    '--glass-field':`rgba(${rgb(palette.surface).join(',')},.78)`,
    '--glass-field-text':contrastText(fieldComposite),
    '--glass-placeholder':readableAccent('#849493',fieldComposite),
    '--glass-primary':`rgba(${rgb(p.accent).join(',')},.96)`,
    '--glass-ring':`rgba(${rgb(p.accent).join(',')},.3)`
  }))root.style.setProperty(key,value);
  const fonts={system:'system-ui, -apple-system, "Segoe UI", sans-serif',rounded:'ui-rounded, "Arial Rounded MT Bold", system-ui, sans-serif',serif:'Georgia, "Times New Roman", serif',mono:'ui-monospace, "SFMono-Regular", Consolas, monospace'};
  const radius={square:2,soft:10,rounded:18,pill:28}[p.corners],buttonRadius={square:2,rounded:12,pill:999}[p.buttonShape];
  const shadow={none:'none',soft:'0 8px 28px #00000012',deep:'0 18px 48px #00000035'}[p.shadow];
  root.style.setProperty('--personal-font',fonts[p.font]);root.style.setProperty('--personal-radius',radius+'px');root.style.setProperty('--personal-button-radius',buttonRadius+'px');root.style.setProperty('--personal-shadow',shadow);
  root.style.setProperty('--personal-padding',({compact:18,comfortable:24,airy:32})[p.spacing]+'px');root.style.setProperty('--personal-blur',p.blur+'px');
  const background=p.backgroundMode==='gradient'?`linear-gradient(${p.gradientAngle}deg,${palette.background},${p.gradientEnd})`:palette.background;
  root.style.setProperty('--personal-background',background);
  const patternColor=palette.pageText==='#ffffff'?'#ffffff10':'#00000010';
  const pattern={none:'none',dots:`radial-gradient(${patternColor} 1px,transparent 1px)`,grid:`linear-gradient(${patternColor} 1px,transparent 1px),linear-gradient(90deg,${patternColor} 1px,transparent 1px)`}[p.pattern];
  root.style.setProperty('--personal-pattern',pattern);
  const rawLogo=p.logoMode==='custom'?p.logoColor:p.accent,logo=p.logoTile==='none'?readableAccent(rawLogo,palette.surface):rawLogo;
  root.style.setProperty('--logo-color',logo);root.style.setProperty('--logo-background',p.logoTile==='none'?'transparent':contrastText(logo));
  root.style.setProperty('--logo-size',p.logoSize+'px');root.style.setProperty('--logo-radius',({square:0,soft:12,circle:999})[p.logoShape]+'px');
  for(const [key,value] of Object.entries({'--personal-button-height':p.buttonHeight+'px','--personal-border-width':p.borderWidth+'px','--personal-content-width':p.contentWidth+'px','--personal-line-height':String(p.lineHeight),'--personal-text-weight':String(p.textWeight)}))root.style.setProperty(key,value);
  const favicon=document.querySelector('link[rel="icon"]');if(favicon)favicon.href=brandFavicon(logo);
  document.querySelector('meta[name="theme-color"]').content=palette.background;
  let persisted=true;
  if(persist) {
    try {localStorage.setItem('ritmo-personalization',JSON.stringify(p));localStorage.setItem('theme',p.theme);localStorage.setItem('ritmo-glass',p.glass);}
    catch {persisted=false;}
  }
  if(emit)window.dispatchEvent(new CustomEvent('appearance-changed',{detail:{...p,persisted,previous:persist?previous:null}}));
  return persisted;
}

// Tab icon follows the chosen accent; installed launcher icons remain system-managed.
export function brandFavicon(color) {
  if(!hex(color))throw new Error('Color de logo no válido.');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144"><rect width="144" height="144" rx="32" fill="${contrastText(color)}"/><path d="M33 112V92C33 56.65 61.65 28 97 28H110M68 110V94C68 77.43 81.43 64 98 64H103" fill="none" stroke="${color}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  return 'data:image/svg+xml,'+encodeURIComponent(svg);
}

export function preserveGlass(next,current) {
  const p=normalizeAppearance(next),previous=normalizeAppearance(current);
  return {...p,glassBehavior:previous.glassBehavior,glass:previous.glassBehavior==='keep'?'full':p.glass};
}
