"use strict";
(() => {
  const key = "noeon-theme", styleKey = "noeon-style", styles = ["paper","notebook"], media = window.matchMedia("(prefers-color-scheme: dark)");
  let preference = "auto", look = "paper";
  try { const value=localStorage.getItem(styleKey); if(styles.includes(value))look=value; } catch {}
  try { const value=localStorage.getItem(key); if(["auto","light","dark"].includes(value))preference=value; } catch {}
  function apply() {
    const dark=preference==="dark" || (preference==="auto" && media.matches);
    document.documentElement.dataset.theme=dark?"dark":"light";
    document.documentElement.dataset.style=look;
    document.documentElement.style.colorScheme=dark?"dark":"light";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content",dark?"#0e1420":look==="notebook"?"#fbfcfd":"#ffffff");
    window.dispatchEvent(new Event("noeon-theme-change"));
  }
  window.NoeonTheme={get:()=>preference,set(value){
    if(!["auto","light","dark"].includes(value))return;
    preference=value;try{localStorage.setItem(key,value);}catch{} apply();
  },toggle(){this.set(document.documentElement.dataset.theme==="dark"?"light":"dark");},
    getStyle:()=>look,setStyle(value){ if(!styles.includes(value))return; look=value;try{localStorage.setItem(styleKey,value);}catch{} apply(); }};
  media.addEventListener("change",()=>{if(preference==="auto")apply();});
  window.addEventListener("storage",event=>{if(event.key===styleKey&&styles.includes(event.newValue)){look=event.newValue;apply();}if(event.key===key){preference=["light","dark"].includes(event.newValue)?event.newValue:"auto";apply();}});
  apply();
})();
