"use strict";
(() => {
  const key = "noeon-theme", media = window.matchMedia("(prefers-color-scheme: dark)");
  let preference = "auto";
  try { const value=localStorage.getItem(key); if(["auto","light","dark"].includes(value))preference=value; } catch {}
  function apply() {
    const dark=preference==="dark" || (preference==="auto" && media.matches);
    document.documentElement.dataset.theme=dark?"dark":"light";
    document.documentElement.style.colorScheme=dark?"dark":"light";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content",dark?"#070c17":"#f3f6fb");
    window.dispatchEvent(new Event("noeon-theme-change"));
  }
  window.NoeonTheme={get:()=>preference,set(value){
    if(!["auto","light","dark"].includes(value))return;
    preference=value;try{localStorage.setItem(key,value);}catch{} apply();
  },toggle(){this.set(document.documentElement.dataset.theme==="dark"?"light":"dark");}};
  media.addEventListener("change",()=>{if(preference==="auto")apply();});
  window.addEventListener("storage",event=>{if(event.key===key){preference=["light","dark"].includes(event.newValue)?event.newValue:"auto";apply();}});
  apply();
})();
