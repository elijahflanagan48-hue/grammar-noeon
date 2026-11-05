import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const nodes=new Map();
function node(){return {hidden:false,attrs:{},children:[],get textContent(){return (this._text||'')+this.children.map(n=>n.textContent||'').join('');},set textContent(v){this._text=String(v);},setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];},append(n){n.parent=this;this.children.push(n);},remove(){this.parent.children=this.parent.children.filter(n=>n!==this);},dataset:{}};}
for(const name of ['bell','results','profile']){const n=node();n.id=name==='bell'?'notification-link':name;n.textContent=name==='bell'?'':name==='results'?'Результаты':'Профиль';nodes.set(name,n);}
let requested=0,resolve;
const ctx={account:{user:{id:'teacher',role:'teacher'}},location:{hash:'#home'},app:{innerHTML:''},
 document:{querySelector(s){return s==='#notification-link'?nodes.get('bell'):s.includes('results')?nodes.get('results'):s.includes('profile')?nodes.get('profile'):null;},querySelectorAll(s){return s==='[data-nav]'?[nodes.get('results'),nodes.get('profile')]:[...nodes.values()].flatMap(n=>n.children);},createElement(){return node();}},
 accountRequest(){requested++;return new Promise(r=>resolve=r);}};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(new URL('../notifications.js',import.meta.url),'utf8'),ctx);
ctx.updateNotificationBadges(123);
assert.equal(nodes.get('results').children[0].textContent,'99+');
assert.ok(nodes.get('bell').attrs['aria-label'].includes('99+'));
assert.ok(nodes.get('bell').attrs['aria-description'].includes('123'));
assert.equal(nodes.get('results').attrs['aria-label'],'Результаты99+');
assert.equal(nodes.get('profile').children.length,0);
ctx.updateNotificationBadges(0);
assert.equal(nodes.get('bell').children.length,0);
assert.equal(nodes.get('bell').attrs['aria-label'],'Уведомления');
const first=ctx.refreshNotifications();
const duplicate=ctx.refreshNotifications();
assert.equal(requested,1,'no parallel polls for same owner');
ctx.account.user={id:'student',role:'student'};
resolve({items:[],unreadCount:9});
await Promise.all([first,duplicate]);
assert.equal(nodes.get('results').children.length,0,'late former account response ignored');
ctx.updateNotificationBadges(2);
assert.equal(nodes.get('profile').children[0].textContent,'2');
ctx.account.user=null;
await ctx.refreshNotifications();
assert.equal(nodes.get('bell').hidden,true);
assert.equal(nodes.get('profile').children.length,0,'logout clears private counters');
console.log('Notification UI: badge roles, zero/99+, accessibility, in-flight deduplication, stale owner response and logout clearing passed.');
