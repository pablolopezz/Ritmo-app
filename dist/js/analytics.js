// Only the public production web has analytics. Native apps, local previews
// and other hosts keep working without contacting an analytics service.
export function startAnalytics({window:win,document:doc,navigator:nav}) {
  if(win.location.protocol!=='https:'||win.location.hostname!=='ritmo-app-plum.vercel.app')return false;
  if(win.Capacitor?.isNativePlatform?.()||nav.onLine===false)return false;
  if(nav.globalPrivacyControl||nav.doNotTrack==='1'||win.doNotTrack==='1')return false;
  if(doc.querySelector('script[data-ritmo-analytics]'))return false;

  win.va=win.va||function(){(win.vaq=win.vaq||[]).push(arguments);};
  // Count the app as one page. Never include query strings, hash routes,
  // form values, record IDs, health data or custom event properties.
  win.va('beforeSend',event=>event?.type==='pageview'
    ?{type:'pageview',url:win.location.origin+'/'}:null);
  const script=doc.createElement('script');
  script.src='/_vercel/insights/script.js';
  script.defer=true;
  script.dataset.ritmoAnalytics='true';
  // A blocked script or unavailable connection must never block the app.
  script.addEventListener('error',()=>script.remove(),{once:true});
  doc.head.append(script);
  return true;
}

if(typeof window!=='undefined')startAnalytics({window,document,navigator});
