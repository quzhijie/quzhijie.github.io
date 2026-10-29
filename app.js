'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],R=window.RESEARCH,P=window.PUBLICATIONS;
const byId=Object.fromEntries(P.map(p=>[p.id,p]));
const params=new URLSearchParams(location.search);
let lang=params.get('lang')==='zh'?'zh':'en',theme=R.themes[params.get('theme')]?params.get('theme'):'all',scale=params.has('scale')?Math.max(0,Math.min(R.scales.length-1,Number(params.get('scale'))||0)):1,selected=null;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let paused=reduced.matches;
const C={en:{position:'Assistant Professor · Astronomy, Tsinghua University',contact:'Contact ↗',team:'Team','map-title':'The cosmic ecosystem',themes:'RESEARCH THEMES',all:'All themes',pause:'Pause',play:'Resume',schematic:'Conceptual illustration · not observed data · not to scale',back:'← Overview',explore:'EXPLORE THIS SCALE',methods:'OBSERVATIONAL METHODS',method:'OBSERVATIONAL METHOD',instruments:'INSTRUMENTS',usedFor:'USED FOR',related:'SELECTED RELATED WORK',morePapers:'All {n} related papers ↗',detail:'Explore this research theme',full:'All publications · complete CV list ↗',zoom:'Zoom inward →',overview:'Gas, galaxies<br>and everything between.',overviewDesc:'Galaxies grow by exchanging gas with their surroundings, and we follow this exchange on four scales, from the cosmic web to the Solar System. Select a theme to filter the map, or a region to read more.',observables:'Observational windows',published:'Published',preprint:'Preprint',themeHint:'One paper can connect several themes.',review:'Topic assignments and research descriptions are a draft for review.',bubblesSource:'Background: eROSITA discovery ↗',epTitle:'AWARDED PROGRAM · EINSTEIN PROBE',ep:'Cycle 3 · PI. “Deciphering the Outflow and ISM/CGM Interplay toward the Galactic Center.” Observations are planned.'},zh:{position:'清华大学天文系 · 助理教授',contact:'联系 ↗',team:'团队','map-title':'宇宙生态系统',themes:'研究主题',all:'全部主题',pause:'暂停',play:'继续',schematic:'概念示意 · 非观测图像 · 不按真实比例',back:'← 全景',explore:'探索当前尺度',methods:'观测方法',method:'观测方法',instruments:'观测设备',usedFor:'适用主题',related:'相关代表工作',morePapers:'全部 {n} 篇相关论文 ↗',detail:'深入了解这一研究主题',full:'全部论文 · 当前 CV 完整列表 ↗',zoom:'进入下一尺度 →',overview:'气体、星系，<br>和它们之间的宇宙。',overviewDesc:'星系靠与周围交换气体而成长，我们在四个尺度上追踪这种交换，从宇宙网一直到太阳系。选择主题可筛选地图，点击区域可查看详情。',observables:'观测窗口',published:'已发表',preprint:'预印本',themeHint:'同一篇工作可以关联多个主题。',review:'主题归类与研究介绍为待审核草稿。',bubblesSource:'背景：eROSITA 气泡发现 ↗',epTitle:'已获批项目 · EINSTEIN PROBE',ep:'Cycle 3 · PI。“Deciphering the Outflow and ISM/CGM Interplay toward the Galactic Center”。观测仍在计划中。'}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ix=()=>lang==='en'?0:1,txt=k=>C[lang][k];
// The publications page lists every paper attached to a node (?node=id).
function moreLink(n){return `<a class="all-index more-papers" data-total="${n.papers.length}" href="publications.html?node=${n.id}${lang==='zh'?'&lang=zh':''}">${txt('morePapers').replace('{n}',n.papers.length)}</a>`;}
function themeURL(t){return `theme-${t}.html${lang==='zh'?'?lang=zh':''}`;}
function currentNodes(){return R.nodes.filter(n=>n.scale===scale&&(theme==='all'||n.tags.includes(theme)));}
function visible(id){return currentNodes().some(n=>n.id===id);}
function paperLink(id){const p=byId[id];if(!p)return '';const a=p.authors.slice(0,2).map(s=>s.split(' ').at(-1)).join(', ');return `<a class="paper" href="${esc(p.url)}" target="_blank" rel="noopener"><div class="paper-meta">${esc(a)} et al. · ${p.year} · ${esc(p.journal)}${p.volume?' '+esc(p.volume):''} · ${txt(p.status==='published'?'published':'preprint')}</div><h4>${esc(p.title)}</h4></a>`;}
// Keep only non-default state in the address, so the default view stays a clean URL.
function syncURL(){if(location.protocol==='file:')return;const q=new URLSearchParams();if(scale!==1)q.set('scale',String(scale));if(theme!=='all')q.set('theme',theme);if(lang!=='en')q.set('lang',lang);const s=q.toString();history.replaceState(null,'',location.pathname+(s?'?'+s:'')+(selected?'#'+selected:''));}
function renderPanel(){
 const n=R.nodes.find(n=>n.id===selected),th=R.themes[theme],accent=n?n.color:th?th.color:'#8ad2dd';
 $('#inspector').style.setProperty('--accent',accent);$('#reset').hidden=!n;$('#panel-number').textContent=`0${scale+1} / ${n?(lang==='en'?'FIELD NOTES':'探索笔记'):(lang==='en'?'OVERVIEW':'全景')}`;
 $('#all-index-footer').href=`publications.html${lang==='zh'?'?lang=zh':''}`;$('#all-index-footer').textContent=txt('full');
 $('#panel-content').innerHTML=panelHTML(scale,n);$('#panel-content').scrollTop=0;fitPanel();
 if(!reduced.matches)$('#panel-content').animate([{opacity:.3},{opacity:1}],{duration:220});
}
// Every panel has the same shape: kicker, title, text, then divided sections, then the action buttons.
function panelHTML(s,n){
 const i=ix(),th=R.themes[theme],sc=R.scales[s];
 const section=(h,body)=>`<div class="panel-divider"><h3>${h}</h3>${body}</div>`;
 const chips=(tags,link)=>`<div class="phase-tags${link?'':' method-tags'}">${tags.map(t=>link?`<a href="${themeURL(t)}"><span>${esc(R.themes[t].short[i])} ↗</span></a>`:`<span>${esc(R.themes[t].short[i])}</span>`).join('')}</div>`;
 const themeLink=t=>`<a class="detail-link" href="${themeURL(t)}"><span>${txt('detail')}</span><span>↗</span></a>`;
 let kicker=esc(sc.title[i].toUpperCase()),title,desc,body='',actions='',note='';
 if(n){
  title=n.title[i];desc=n.description[i];
  if(n.method)kicker+=` · ◇ ${txt('method')}`;
  if(n.project)body+=`<div class="project-callout"><strong>${txt('epTitle')}</strong>${txt('ep')} <a href="https://www.mpe.mpg.de/7540556/news20201210" target="_blank" rel="noopener">${txt('bubblesSource')}</a></div>`;
  if(n.instruments)body+=section(txt('instruments'),`<p class="method-instruments">${esc(n.instruments[i])}</p>`);
  // Methods explain a technique, so their themes are plain labels rather than links to theme pages.
  body+=section(txt('themes'),chips(n.method||theme==='all'?n.tags:[theme],!n.method));
  const papers=n.method||theme==='all'?n.papers:n.papers.filter(id=>byId[id]?.tags.includes(theme));
  if(papers.length)body+=section(txt('related'),papers.slice(0,4).map(paperLink).join('')+moreLink(n));
  if(n.zoom!==undefined)actions+=`<button class="detail-link zoom-in" data-zoom="${n.zoom}"><span>${txt('zoom')}</span><span>＋</span></button>`;
  if(!n.method)actions+=themeLink(theme==='all'?n.tags[0]:theme);
 }else{
  // Each scale has its own introduction; a chosen theme filters the lists and adds its own link.
  title=sc.headline[i];desc=sc.intro[i];if(th)kicker+=` · ${esc(th.short[i].toUpperCase())}`;
  const here=R.nodes.filter(n=>n.scale===s&&(theme==='all'||n.tags.includes(theme)));
  const item=n=>`<button data-node="${n.id}"${n.method?' class="method-item"':''}><span>${n.method?'◇ ':''}${esc(n.label[i])}</span><span>↗</span></button>`,objs=here.filter(n=>!n.method),meths=here.filter(n=>n.method);
  body+=section(txt('explore'),`<div class="region-list">${objs.map(item).join('')}</div>`);
  if(meths.length)body+=section(txt('methods'),`<div class="region-list">${meths.map(item).join('')}</div>`);
  if(th)actions+=themeLink(theme);
  note=`<p class="scale-note">${txt('overviewDesc')}</p>`;
 }
 return `<p class="panel-kicker">${kicker}</p><h2>${title}</h2><p class="panel-description">${desc}</p>${body}${actions?`<div class="panel-actions">${actions}</div>`:''}${note}`;
}
function fitPanel(){
 const panel=$('#inspector'),content=$('#panel-content'),fits=()=>content.scrollHeight<=content.clientHeight+1;
 panel.classList.remove('compact','condensed','minimal','scrolls');content.querySelectorAll('.paper').forEach(p=>p.classList.remove('fit-hidden'));
 if(innerWidth<=760)return fitMore(); // phones scroll the page, so the panel shows everything
 // Desktop panels all use the compact spacing. Panels of one kind share a fit level: the four scale
 // overviews together, and all field notes together (every region and method under the current theme),
 // set by whichever needs the most room, so moving between them never changes the layout. The level
 // stops at 'condensed' ('minimal' would hide the lists and sections); field notes first show fewer
 // papers (at least one), and a panel that is still too tall scrolls.
 panel.classList.add('compact');
 const hidePapers=()=>{const ps=[...content.querySelectorAll('.paper')];while(!fits()&&ps.length>1)ps.pop().classList.add('fit-hidden');};
 const html=content.innerHTML,group=selected?R.nodes.filter(n=>theme==='all'||n.tags.includes(theme)).map(n=>panelHTML(n.scale,n)):R.scales.map((_,s)=>panelHTML(s,null));
 let condensed=false;
 for(const h of group){content.innerHTML=h;hidePapers();if(!fits()){condensed=true;panel.classList.add('condensed');break;}}
 content.innerHTML=html;hidePapers();panel.classList.toggle('scrolls',!fits());
 fitMore();
}
// Web fonts change line breaks after first layout; refit once they arrive.
document.fonts?.ready.then(()=>fitPanel());
// The link to the full list appears only when the panel shows fewer papers than the node has.
function fitMore(){const m=$('#panel-content .more-papers');if(m)m.hidden=$$('#panel-content .paper:not(.fit-hidden)').length>=+m.dataset.total;}
const shortLabels={filaments:['Filaments','宇宙纤维'],groups:['Groups','星系群'],quasar:['Quasars','类星体'],target:['Galaxy','星系'],inflow:['Accretion','吸积'],hot:['Hot CGM','热 CGM'],feedback:['Feedback','反馈'],cool:['Clouds','气体云'],galaxy:['Disk & halo','盘–晕'],
'mw-hot':['Hot gas','热气体'],heliosphere:['Solar wind','太阳风'],'qso-nebula':['QSO nebula','类星体星云'],'m-surveys':['Surveys','红移巡天'],'m-forest':['IGM absorption','星系际吸收'],'m-abs':['UV absorption','紫外吸收'],'m-ifu':['IFU','积分视场'],'m-xsz':['X-ray & SZ','X 射线/SZ'],'m-hi':['H I 21 cm','H I 21 cm'],'m-allsky':['All-sky abs.','全天吸收'],'m-xlines':['X-ray lines','X 射线谱线'],'m-monitor':['X-ray archive','X 射线档案'],magnetosphere:['Magnetosheath','磁鞘'],'sightline-out':['Look outward','向外看'],bubbles:['Bubbles','银心气泡'],'warm-disk':['Warm disk','暖气体盘'],'local-group':['Local Group','本星系群']};
function positionHotspots(){
 // Use measured button widths so labels remain inside the scene on every screen.
 const scene=$('#scene'),sw=scene.clientWidth,sh=scene.clientHeight,mobile=innerWidth<=760;
 const placed=[],railEl=$('.filter-rail'),sr=scene.getBoundingClientRect(),rr=railEl.getBoundingClientRect(),rail=$('#theme-filters').hidden?null:{l:rr.left-sr.left,r:rr.right-sr.left,t:rr.top-sr.top,b:rr.bottom-sr.top};
 const objects=$$('#hotspots button');
 objects.forEach((b,index)=>{b.classList.remove('short');const n=R.nodes.find(n=>n.id===b.dataset.node);let [x,y]=n.xy;let bw=b.offsetWidth;const bh=b.offsetHeight;
  if(!mobile && sh<650 && x<40 && y<60)y=56;
  let px=Math.max(bw/2+10,Math.min(sw-bw/2-10,sw*x/100)),py=Math.max(65+bh/2,Math.min(sh-95-bh/2,sh*y/100));
  if(n.id==='local-group'){const m=m31Inset(sw,sh);px=Math.max(bw/2+10,Math.min(sw-bw/2-10,m.x));py=Math.max(65+bh/2,m.y-m.R*.26-14-bh/2);}
  // Keep labels clear of the theme panel and of labels already placed.
  const box=()=>({l:px-bw/2,r:px+bw/2,t:py-bh/2,b:py+bh/2}),hit=(a,c)=>a.l<c.r+6&&c.l<a.r+6&&a.t<c.b+6&&c.t<a.b+6;
  const clampX=x=>Math.max(bw/2+10,Math.min(sw-bw/2-10,x)),clampY=y=>Math.max(65+bh/2,Math.min(sh-95-bh/2,y)),free=()=>![...(rail?[rail]:[]),...placed].some(c=>hit(box(),c));
  for(let k=0;k<8&&!free();k++){const other=[...(rail?[rail]:[]),...placed].find(c=>hit(box(),c));
   if(other===rail){px=clampX(rail.r+bw/2+10);continue;}
   // try below, above, right and left of the label in the way
   const x0=px,y0=py,tries=[[x0,other.b+bh/2+8],[x0,other.t-bh/2-8],[other.r+bw/2+8,y0],[other.l-bw/2-8,y0]];
   let moved=false;for(const [tx,ty] of tries){px=clampX(tx);py=clampY(ty);if(free()){moved=true;break;}}
   if(!moved){
    // fall back to a small spiral of nearby slots around where the label started
    search:for(const r of [1,2,3])for(const [dx,dy] of [[0,r],[0,-r],[r,0],[-r,0],[r,r],[-r,r],[r,-r],[-r,-r]]){px=clampX(x0+dx*(bw*.55+8));py=clampY(y0+dy*(bh+8));if(free()){moved=true;break search;}}
    if(!moved){px=clampX(tries[0][0]);py=clampY(tries[0][1]);}}}
  // last resort on cramped screens: switch to the short label and try once more
  if(!free()&&!b.classList.contains('short')){b.classList.add('short');bw=b.offsetWidth;px=clampX(px);const sx=px,sy=py;retry:for(const r of [0,1,2,3])for(const [dx,dy] of [[0,r],[0,-r],[r,0],[-r,0],[r,r],[-r,-r]]){px=clampX(sx+dx*(bw*.55+8));py=clampY(sy+dy*(bh+8));if(free())break retry;px=sx;py=sy;}}
  placed.push(box());
  b.style.left=px+'px';b.style.top=py+'px';
 });
}
function renderControls(){
 const i=ix();$('#theme-filters').innerHTML=`<button class="theme-button" data-theme="all" aria-pressed="${theme==='all'}"><span class="theme-dot"></span><span>${txt('all')}</span></button>`+Object.entries(R.themes).map(([k,t])=>`<button class="theme-button" data-theme="${k}" aria-pressed="${theme===k}" style="--theme:${t.color}"><span class="theme-dot"></span><span>${esc(t.short[i])}</span></button>`).join('');
 $('#hotspots').innerHTML=currentNodes().map(n=>`<button class="hotspot${n.method?' method':''}" data-node="${n.id}" aria-label="${esc(n.label[i])}" aria-pressed="${selected===n.id}" style="--color:${n.color}"><span class="node"></span><span class="label-long">${esc(n.label[i])}</span><span class="label-short">${esc((shortLabels[n.id]||n.label)[i])}</span><span class="plus">+</span></button>`).join('');
 $$('[data-scale]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.scale)===scale)));$$('[data-scale-label]').forEach(e=>e.textContent=R.scales[Number(e.dataset.scaleLabel)].title[i]);$('#scale-range').textContent=R.scales[scale].range[i];positionHotspots();
}
function selectNode(id){if(!currentNodes().some(n=>n.id===id))return;selected=id;renderControls();renderPanel();syncURL();if(paused)drawFrame(performance.now());}
function switchScale(s){if(s===scale)return;captureTransition(s>scale?1:-1);scale=s;selected=null;renderControls();renderPanel();buildBackground();syncURL();if(paused)drawFrame(performance.now());else startAnimation();}
// Nearest scale that shows the current theme (the given one if it already does).
function themeScale(from){if(currentNodes().length)return from;const count=k=>R.nodes.filter(n=>n.scale===k&&n.tags.includes(theme)).length;const options=R.scales.map((_,k)=>k).filter(k=>R.nodes.some(n=>n.scale===k&&n.tags.includes(theme))).sort((a,b)=>count(b)-count(a)||Math.abs(a-from)-Math.abs(b-from));return options.length?options[0]:from;}
function switchTheme(t){if(t!=='all'&&!R.themes[t])return;const old=scale;theme=t;selected=null;
 // Jump to the nearest scale that shows this theme when the current one has nothing for it.
 scale=themeScale(old);
 captureTransition(scale===old?0:scale>old?1:-1);renderControls();renderPanel();buildBackground();syncURL();if(paused)drawFrame(performance.now());else startAnimation();}
function updateMotion(){$('#motion').setAttribute('aria-pressed',String(paused));$('#motion').innerHTML=(paused?'▷ ':'Ⅱ ')+`<span>${txt(paused?'play':'pause')}</span>`;}
function translate(){$$('[data-i18n]').forEach(e=>e.textContent=txt(e.dataset.i18n));window.setNav(lang);document.documentElement.lang=lang==='en'?'en':'zh-CN';$('#language').textContent=lang==='en'?'中文':'EN';renderControls();renderPanel();updateMotion();syncURL();}
$('#hotspots').addEventListener('click',e=>{const b=e.target.closest('[data-node]');if(b)selectNode(b.dataset.node);});
$('#panel-content').addEventListener('click',e=>{const b=e.target.closest('[data-node]'),z=e.target.closest('[data-zoom]');if(b)selectNode(b.dataset.node);if(z)switchScale(Number(z.dataset.zoom));});
$('#theme-filters').addEventListener('click',e=>{const b=e.target.closest('[data-theme]');if(b){switchTheme(b.dataset.theme);if(innerWidth<=760){$('#filter-toggle').setAttribute('aria-expanded','false');$('#theme-filters').hidden=true;$('.filter-chevron').textContent='+';}}});
$$('[data-scale]').forEach(b=>b.addEventListener('click',()=>switchScale(Number(b.dataset.scale))));
$('#filter-toggle').addEventListener('click',()=>{const expanded=$('#filter-toggle').getAttribute('aria-expanded')!=='true';$('#filter-toggle').setAttribute('aria-expanded',String(expanded));$('#theme-filters').hidden=!expanded;$('.filter-chevron').textContent=expanded?'−':'+';});
$('#reset').addEventListener('click',()=>{selected=null;renderControls();renderPanel();syncURL();if(paused)drawFrame(performance.now());});
$('#language').addEventListener('click',()=>{lang=lang==='en'?'zh':'en';translate();});
$('#motion').addEventListener('click',()=>{paused=!paused;updateMotion();if(paused){cancelAnimationFrame(animationId);transitionStart=0;drawFrame(performance.now());}else startAnimation();});
addEventListener('keydown',e=>{if(e.target.matches('input,textarea'))return;if(e.key==='Escape')$('#reset').click();if(e.key==='ArrowRight')switchScale(Math.min(R.scales.length-1,scale+1));if(e.key==='ArrowLeft')switchScale(Math.max(0,scale-1));});
reduced.addEventListener('change',e=>{paused=e.matches;updateMotion();if(paused){cancelAnimationFrame(animationId);transitionStart=0;drawFrame(performance.now());}else startAnimation();});

// Procedural conceptual graphics. All scales are illustrations, not measured maps.
// A static layer (sky and diffuse glows) is baked once per scale/theme; particle systems are animated every frame.
const canvas=$('#universe'),ctx=canvas.getContext('2d'),background=document.createElement('canvas'),g=background.getContext('2d'),snapshot=document.createElement('canvas'),snap=snapshot.getContext('2d');
let width=1,height=1,pixelRatio=1,rngState=73421,simTime=0,lastTick=0,animationId=0,transitionStart=0,transitionDir=0,systems=[],density=1;
const TAU=Math.PI*2,pointer={x:0,y:0,tx:0,ty:0},o={x:0,y:0,a:0,s:1},sprites={};
function random(){rngState=(Math.imul(rngState,1664525)+1013904223)|0;return(rngState>>>0)/4294967296;}
function gauss(){return Math.sqrt(-2*Math.log(Math.max(random(),.00001)))*Math.cos(2*Math.PI*random());}
function n(count){return Math.round(count*density);}
function point(x,y,r,color,alpha=1){g.globalAlpha=alpha;g.fillStyle=color;g.beginPath();g.arc(x,y,Math.max(.2,r),0,TAU);g.fill();}
function glow(x,y,rx,ry,color,alpha=1,rotation=0){g.save();g.translate(x,y);g.rotate(rotation);g.scale(rx,ry);const gr=g.createRadialGradient(0,0,0,0,0,1);gr.addColorStop(0,color);gr.addColorStop(1,'transparent');g.fillStyle=gr;g.globalAlpha=alpha;g.fillRect(-1,-1,2,2);g.restore();}
function cubic(a,b,c,d,t){const u=1-t;return u*u*u*a+3*u*u*t*b+3*u*t*t*c+t*t*t*d;}
function pathPoint(path,t){return{x:cubic(path[0][0],path[1][0],path[2][0],path[3][0],t)*width,y:cubic(path[0][1],path[1][1],path[2][1],path[3][1],t)*height};}
function sprite(color){if(!sprites[color]){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,color);gr.addColorStop(.25,color+'88');gr.addColorStop(1,color+'00');x.fillStyle=gr;x.fillRect(0,0,64,64);sprites[color]=c;}return sprites[color];}
function blob(color,x,y,r,a){ctx.globalAlpha=Math.max(0,Math.min(1,a));ctx.drawImage(sprite(color),x-r,y-r,r*2,r*2);}
// Draw a particle list in one colour; fn fills the shared object `o` and returns false to skip a particle.
function dots(list,color,t,fn){ctx.fillStyle=color;for(const p of list){if(!fn(p,t))continue;if(o.a<=.004)continue;ctx.globalAlpha=Math.min(1,o.a);ctx.fillRect(o.x-o.s/2,o.y-o.s/2,o.s,o.s);}}

const inflowPaths=[[[-.12,.38],[.18,.2],[.18,.68],[.52,.55]],[[.01,.96],[.26,.99],[.32,.7],[.52,.55]],[[1.08,.42],[.93,.28],[.73,.7],[.52,.55]]];
const webPaths=[
 [[-.1,.25],[.18,.2],[.23,.69],[.52,.55]],[[.1,1.1],[.37,.9],[.23,.61],[.52,.55]],[[1.1,.4],[.89,.18],[.68,.69],[.52,.55]],[[1.1,1.1],[.67,.84],[.7,.58],[.52,.55]],[[.3,-.1],[.6,.18],[.75,.3],[.52,.55]],[[.15,.84],[.1,.65],[.44,.2],[.73,.35]]
];

// A rotating spiral disk: a face-on texture is rendered once, then rotated and inclined every frame;
// a sparse layer of bright young stars twinkles on top.
function diskTexture(R,arms=3){const D=Math.ceil(R*2*pixelRatio),c=document.createElement('canvas');c.width=c.height=D;const x=c.getContext('2d'),k=D/2/R;x.translate(D/2,D/2);x.scale(k,k);
 const dot=(px,py,r,col,al)=>{x.globalAlpha=al;x.fillStyle=col;x.beginPath();x.arc(px,py,r,0,TAU);x.fill();};
 let gr=x.createRadialGradient(0,0,0,0,0,R);gr.addColorStop(0,'#f3dcb0cc');gr.addColorStop(.12,'#d9c19a55');gr.addColorStop(.45,'#6fa9c022');gr.addColorStop(1,'#6fa9c000');x.fillStyle=gr;x.beginPath();x.arc(0,0,R,0,TAU);x.fill();
 x.globalCompositeOperation='lighter';
 for(let j=0;j<n(26000);j++){const r=Math.pow(random(),.85)*R,a=Math.floor(random()*arms)*TAU/arms+Math.log(1+r/R*9)*2.2+gauss()*(.16+.1*r/R),fade=1-r/R;dot(Math.cos(a)*r,Math.sin(a)*r,(.25+random()*.55)/k*1.4,random()>.82?'#e6c79c':'#b6d8e6',(.1+random()*.38)*fade);}
 for(let j=0;j<n(5000);j++){const r=Math.abs(gauss())*R*.13,a=random()*TAU;dot(Math.cos(a)*r,Math.sin(a)*r*.9,(.3+random()*.5)/k*1.4,'#f1d7ab',.12+random()*.3);}
 x.globalCompositeOperation='source-over';
 for(let j=0;j<n(4000);j++){const r=R*(.12+Math.pow(random(),.8)*.75),a=Math.floor(random()*arms)*TAU/arms+Math.log(1+r/R*9)*2.2-.12+gauss()*.05;dot(Math.cos(a)*r,Math.sin(a)*r,(.4+random()*.6)/k*1.6,'#070c14',.12*(1-r/R));}
 return c;}
function diskSystem(cx,cy,s,{alpha=1,edge=.26,tilt=-.17,count=4800,spin=.045}={}){
 const R=s*.27,tex=diskTexture(R),ct=Math.cos(tilt),st=Math.sin(tilt),young=[];
 for(let j=0;j<n(count/10);j++){const r=R*(.15+Math.pow(random(),.8)*.8);young.push({r,a:Math.floor(random()*3)*TAU/3+Math.log(1+r/R*9)*2.2+gauss()*.1,al:alpha*(.35+random()*.6),tw:random()*TAU,f:.6+random()*1.6,sz:1+random()*1.2});}
 const place=(p,t)=>{const a=p.a+t*spin,x=Math.cos(a)*p.r,y=Math.sin(a)*p.r*edge;o.x=cx+x*ct-y*st;o.y=cy+x*st+y*ct;o.s=p.sz;o.a=p.al*(.35+.65*Math.sin(t*p.f+p.tw)**2);return true;};
 systems.push({draw(t){ctx.globalCompositeOperation='lighter';blob('#6fbed5',cx,cy,s*.3,.08*alpha);ctx.save();ctx.translate(cx,cy);ctx.rotate(tilt);ctx.scale(1,edge);ctx.rotate(t*spin);ctx.globalAlpha=alpha;ctx.drawImage(tex,-R,-R,R*2,R*2);ctx.restore();
  dots(young,'#cfeaf5',t,place);blob('#f2d3a0',cx,cy,s*.05,.5*alpha);blob('#fff4de',cx,cy,s*.014,.85*alpha);}});
}
// Particles flowing along Bezier paths and accelerating toward the end (accretion, filaments).
function streamSystem(paths,count,color,{speed=.035,spread=.018,alpha=.6,size=1.3}={}){
 const ps=[];paths.forEach(path=>{for(let j=0;j<n(count);j++)ps.push({path,u:random(),ox:gauss(),oy:gauss(),v:.7+random()*.6,al:alpha*(.3+random()*.7),sz:size*(.6+random()*.8)});});
 const m=Math.min(width,height);
 systems.push({draw(t){ctx.globalCompositeOperation='lighter';dots(ps,color,t,(p,t)=>{const u=(p.u+t*speed*p.v)%1,w=Math.pow(u,1.35),P=p.path,sp=(.003+spread*(1-w))*m;o.x=cubic(P[0][0],P[1][0],P[2][0],P[3][0],w)*width+p.ox*sp;o.y=cubic(P[0][1],P[1][1],P[2][1],P[3][1],w)*height+p.oy*sp;o.a=p.al*Math.sin(Math.PI*u);o.s=p.sz;return true;});}});
}
// Biconical outflow plus a galactic fountain: fountain gas leaves hot (amber) and falls back cooled (cyan).
function windSystem(cx,cy,S,{tilt=-.17,count=1700,fountain=.4,reach=.42,height=.13,wind=true,hot='#efb283',cold='#8fd8dc'}={}){
 const ct=Math.cos(tilt),st=Math.sin(tilt),ps=[];
 for(let j=0;j<n(count);j++){const f=!wind||random()<fountain;ps.push({f,side:random()<.5?-1:1,ang:gauss()*.26,life:f?7+random()*6:5+random()*5,ph:random(),r0:gauss()*S*.07,dr:(.03+random()*.06)*S,h:S*height*(.35+random()*.65),d:S*reach*(.45+random()*.55),al:.3+random()*.55,sz:.9+random()*1.2});}
 const place=(p,t,phase)=>{const s=(t/p.life+p.ph)%1;let x,z;
  if(p.f){if(phase==='hot'?s>.5:s<=.5)return false;x=p.r0+Math.sign(p.r0||1)*p.dr*s;z=p.h*Math.sin(Math.PI*s);o.a=p.al*.85*Math.sin(Math.PI*Math.min(1,s*1.15));}
  else{if(phase!=='hot')return false;const d=p.d*(1-Math.pow(1-s,2)),a=p.ang*(1+s*.6);x=p.r0*.3+Math.sin(a)*d;z=Math.cos(a)*d;o.a=p.al*(1-s)*Math.min(1,s*8);}
  z*=-p.side;o.x=cx+x*ct-z*st;o.y=cy+x*st+z*ct;o.s=p.sz;return true;};
 systems.push({draw(t){ctx.globalCompositeOperation='lighter';if(wind)for(const side of [-1,1]){ctx.save();ctx.translate(cx+st*S*.2*side,cy-ct*S*.2*side);ctx.rotate(tilt);ctx.scale(.55,1);blob('#e89a6a',0,0,S*.24,.10+.04*Math.sin(t*.6+side));ctx.restore();}dots(ps,hot,t,(p,t)=>place(p,t,'hot'));dots(ps,cold,t,(p,t)=>place(p,t,'cold'));}});
}
// Slowly drifting, twinkling diffuse gas (hot halos).
function hazeSystem(cx,cy,S,count,{reach=.44,flat=.91,colors=['#d9ac77','#9fb7c8'],alpha=.32,glowColor='#bd8646'}={}){
 const groups=colors.map(()=>[]);for(let j=0;j<n(count);j++){const a=random()*TAU,r=Math.pow(random(),.6)*S*reach,lobe=.86+.08*Math.sin(a*5)+.08*Math.sin(a*9);groups[Math.floor(random()*colors.length)].push({a,r:r*lobe,w:(random()-.5)*.02,tw:random()*TAU,f:.4+random()*.9,al:alpha*(.25+random()*.75)*(1-r/(S*reach*1.45)),sz:.7+random()*1});}
 systems.push({draw(t){ctx.globalCompositeOperation='lighter';blob(glowColor,cx,cy,S*.5,.05+.015*Math.sin(t*.25));groups.forEach((list,k)=>dots(list,colors[k],t,(p,t)=>{const a=p.a+p.w*t,r=p.r*(1+.035*Math.sin(t*.35+p.tw));o.x=cx+Math.cos(a)*r;o.y=cy+Math.sin(a)*r*flat;o.a=p.al*(.45+.55*Math.sin(t*p.f+p.tw)**2);o.s=p.sz;return true;}));}});
}
// Cool clouds scattered through the halo, each with internal turbulent motion; they drift slowly inward.
function cloudSystem(cx,cy,S){
 const clouds=Array.from({length:16},(_,k)=>{const R=S*(.09+Math.pow(random(),.7)*.27),rr=S*(.006+random()*.016);return{phi:random()*TAU,R,rr,k,w:(.004+random()*.01)*(random()<.5?-1:1),cx:0,cy:0,parts:Array.from({length:n(Math.round(30+rr/S*5000))},()=>({rho:Math.abs(gauss())*.8,th:random()*TAU,w:(random()<.5?-1:1)*(.3+random()*1.1),al:.2+random()*.55,sz:.6+random()*1}))};});
 const sys={clouds,draw(t){ctx.globalCompositeOperation='lighter';for(const c of clouds){const phi=c.phi+t*c.w,R=c.R*(1-.06*Math.sin(t*.09+c.k));c.cx=cx+Math.cos(phi)*R;c.cy=cy+Math.sin(phi)*R*.85;blob('#68d8d7',c.cx,c.cy,c.rr*2.6,.09+.04*Math.sin(t*.9+c.k));
  dots(c.parts,'#a8e6e4',t,(p,t)=>{const a=p.th+p.w*t,r=p.rho*c.rr*(1+.2*Math.sin(t*1.7+p.th));o.x=c.cx+Math.cos(a)*r;o.y=c.cy+Math.sin(a)*r*.65;o.a=p.al;o.s=p.sz;return true;});}}};
 systems.push(sys);return sys;
}
// A background quasar sightline: photons travel toward the observer and light up where they cross clouds.
function sightlineSystem(x0,y0,x1,y1,cloudSys,label){
 systems.push({draw(t){const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.22;ctx.strokeStyle='#c5b6ea';ctx.lineWidth=.8;ctx.setLineDash([2,5]);ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();ctx.setLineDash([]);
  ctx.globalCompositeOperation='lighter';blob('#b9a0ed',x0,y0,14+3*Math.sin(t*2.1),.75);blob('#ffffff',x0,y0,4,.9);
  for(let j=0;j<5;j++){const u=(t*.07+j/5)%1;blob('#e6dcff',x0+dx*u,y0+dy*u,5,.7*Math.sin(Math.PI*u));}
  if(cloudSys)for(const c of cloudSys.clouds){const u=((c.cx-x0)*dx+(c.cy-y0)*dy)/(L*L),px=x0+dx*u,py=y0+dy*u,d=Math.hypot(c.cx-px,c.cy-py);if(u>0&&u<1&&d<c.rr*2.4){blob('#cfc2ff',px,py,c.rr*1.6,.55*(1-d/(c.rr*2.4)));}}
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.75;ctx.fillStyle='#b4a6d8';ctx.font='8px system-ui';ctx.textAlign='right';ctx.fillText(label(),x0-12,y0-8);ctx.textAlign='left';}});
}
// A quasar-lit nebula with a tidal tail, and an integral-field footprint whose cells show a velocity field.
function nebulaSystem(x,y,s){
 const ps=[];for(let j=0;j<n(1300);j++){const tail=random()<.35,u=random();let px,py;if(tail){const a=-.6+u*2.2;px=Math.cos(a)*s*(.05+u*.11);py=Math.sin(a)*s*(.04+u*.07);}else{const r=Math.abs(gauss())*s*.045,a=random()*TAU;px=Math.cos(a)*r*1.3;py=Math.sin(a)*r;}ps.push({x:px,y:py,w:(random()-.5)*.6,ph:random()*TAU,al:.15+random()*.45,sz:.7+random()*1.1});}
 systems.push({draw(t){ctx.globalCompositeOperation='lighter';blob('#9a78d8',x,y,s*.12,.16+.04*Math.sin(t*.7));
  dots(ps,'#d4bdf6',t,(p,t)=>{const a=p.w*t*.15;o.x=x+p.x*Math.cos(a)-p.y*Math.sin(a)+Math.sin(t*.8+p.ph)*1.5;o.y=y+p.x*Math.sin(a)+p.y*Math.cos(a)+Math.cos(t*.7+p.ph)*1.5;o.a=p.al*(.6+.4*Math.sin(t*1.1+p.ph));o.s=p.sz;return true;});
  blob('#f1e6ff',x,y,6+1.5*Math.sin(t*2.3),.95);}});
}
function ifuSystem(x,y,s){const N=7,cell=s*.026,half=N*cell/2;
 systems.push({draw(t){ctx.globalCompositeOperation='source-over';for(let a=0;a<N;a++)for(let b=0;b<N;b++){const cx=x-half+(a+.5)*cell,cy=y-half+(b+.5)*cell,dx=(cx-x)/half,dy=(cy-y)/half;
   const v=Math.max(-1,Math.min(1,.8*(dx*Math.cos(t*.05)+dy*Math.sin(t*.05))+.35*Math.sin(dx*4+t*.6)*Math.cos(dy*3-t*.4)));
   ctx.globalAlpha=.16;ctx.fillStyle=v>0?`rgb(${230},${120+60*(1-v)|0},${110+60*(1-v)|0})`:`rgb(${110+60*(1+v)|0},${150+50*(1+v)|0},${235})`;ctx.fillRect(cx-cell/2+.5,cy-cell/2+.5,cell-1,cell-1);}
  ctx.globalAlpha=.55;ctx.strokeStyle='#c9d3dc';ctx.lineWidth=.8;ctx.setLineDash([3,3]);ctx.strokeRect(x-half,y-half,half*2,half*2);ctx.setLineDash([]);
  ctx.globalAlpha=.75;ctx.fillStyle='#a9b8c6';ctx.font='8px system-ui';ctx.fillText(lang==='en'?'IFU FIELD':'积分视场',x-half,y-half-5);}});
}
// Galactic-center bubbles: thin shells expand from the center along the minor axis, with gas rising inside.
function bubbleSystem(cx,cy,s){
 const rx=s*.105,ry=s*.19,shell=[],core=[];
 for(const sign of [-1,1]){for(let j=0;j<n(1600);j++)shell.push({sign,a:random()*TAU,rim:1-Math.abs(gauss())*.045,ph:random()*.2,al:.25+random()*.5,sz:.7+random()*1,violet:random()<.18});for(let j=0;j<n(500);j++)core.push({sign,u:random(),ox:gauss()*.25,v:.6+random()*.6,al:.2+random()*.4});}
 const lobe=(sign,k)=>[cx-sign*s*.018*k,cy+sign*ry*k];
 const shellAt=(p,t,violet)=>{if(p.violet!==violet)return false;const k=.82+.18*Math.sin(t*.35+p.ph*TAU*.2),[x,y]=lobe(p.sign,k);o.x=x+Math.cos(p.a)*rx*k*p.rim;o.y=y+Math.sin(p.a)*ry*k*p.rim;const top=-p.sign*Math.sin(p.a);o.a=p.al*(.55+.45*top)*(.7+.3*Math.sin(t*1.3+p.a*3));o.s=p.sz;return true;};
 systems.push({draw(t){ctx.globalCompositeOperation='lighter';for(const sign of [-1,1]){const[x,y]=lobe(sign,1);blob('#d9a25f',x,y,ry*1.05,.10);}
  dots(shell,'#eab884',t,(p,t)=>shellAt(p,t,false));dots(shell,'#bba6dc',t,(p,t)=>shellAt(p,t,true));
  dots(core,'#f0c39a',t,(p,t)=>{const u=(p.u+t*.05*p.v)%1;o.x=cx-p.sign*s*.018*u*2+p.ox*rx*Math.sin(Math.PI*u);o.y=cy+p.sign*ry*1.9*u;o.a=p.al*Math.sin(Math.PI*u);o.s=1.1;return true;});}});
}
// Small orbiting galaxies (group members) and twinkling field galaxies.
function membersSystem(centers,s){
 const ps=[];centers.forEach(([x,y,scale])=>{for(let j=0;j<7;j++)ps.push({x:x*width,y:y*height,R:Math.abs(gauss())*s*.05*scale+s*.012,a:random()*TAU,w:(.03+random()*.05)*(random()<.5?-1:1),tw:random()*TAU});});
 systems.push({draw(t){ctx.globalCompositeOperation='lighter';for(const p of ps){const a=p.a+p.w*t;blob('#e6bd87',p.x+Math.cos(a)*p.R,p.y+Math.sin(a)*p.R*.7,s*.012,.55+.25*Math.sin(t*1.1+p.tw));}}});
}
function twinkleSystem(paths,count){
 const ps=[];for(let j=0;j<n(count);j++){const P=paths[Math.floor(random()*paths.length)],q=pathPoint(P,random());ps.push({x:q.x+gauss()*Math.min(width,height)*.02,y:q.y+gauss()*Math.min(width,height)*.02,tw:random()*TAU,f:.5+random()*1.5,big:random()<.15});}
 systems.push({draw(t){ctx.globalCompositeOperation='lighter';for(const p of ps){const a=.25+.6*Math.sin(t*p.f+p.tw)**2;if(p.big)blob('#f0d9b0',p.x,p.y,4,a*.8);else{ctx.globalAlpha=a;ctx.fillStyle='#e9dcc2';ctx.fillRect(p.x-.7,p.y-.7,1.4,1.4);}}}});
}
function m31Inset(w,h){const s=Math.min(w,h)*.9;return{x:w*.84,y:h*.78,R:s*.29*.27,s};}
function label(text,x,y){systems.push({draw(){ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.7;ctx.fillStyle='#8b9fb6';ctx.font='8px system-ui';ctx.fillText(text(),x,y);}});}

function sky(){const base=g.createLinearGradient(0,0,width,height);base.addColorStop(0,'#070e18');base.addColorStop(.6,'#0c1724');base.addColorStop(1,'#070f19');g.globalAlpha=1;g.fillStyle=base;g.fillRect(0,0,width,height);for(let j=0;j<420;j++)point(random()*width,random()*height,.2+random()*.45,'#bed4e4',random()*.25);}
function bakedStreams(paths,count,spread){const m=Math.min(width,height);paths.forEach((path,k)=>{for(let j=0;j<count;j++){const t=random(),p=pathPoint(path,t),sp=(.006+spread*(1-t))*m;point(p.x+gauss()*sp,p.y+gauss()*sp,.2+random()*.5,k%2?'#85bbcf':'#9ad2d4',.02+random()*.09);}});}

function webScene(){const s=Math.min(width,height);
 if(visible('filaments')){bakedStreams(webPaths,n(2600),.016);streamSystem(webPaths,320,'#9ad2d4',{speed:.022,spread:.014,alpha:.55});twinkleSystem(webPaths,90);}
 if(visible('groups')){[[.51,.54,1],[.75,.35,.8],[.24,.46,.8]].forEach(([x,y,k])=>glow(width*x,height*y,s*.2*k,s*.17*k,'#bd8646',.2));hazeSystem(width*.75,height*.35,s*.32,700,{alpha:.22});hazeSystem(width*.24,height*.46,s*.32,600,{alpha:.2});membersSystem([[.75,.35,.8],[.24,.46,.8],[.51,.54,1]],s);}
 if(visible('target'))diskSystem(width*.52,height*.55,s*.34,{alpha:.9,count:2600});
 if(visible('quasar')){const qx=width*.77,qy=height*.70;hazeSystem(qx,qy,s*.12,500,{reach:.5,flat:.7,colors:['#b9a0ed','#d6c9ff'],alpha:.35,glowColor:'#8f78c9'});sightlineSystem(qx,qy,width*.52,height*.55,null,()=>lang==='en'?'QUASAR':'类星体');}}
function haloScene(){const cx=width*.52,cy=height*.55,s=Math.min(width,height)*.92;glow(cx,cy,s*.9,s*.7,'#2f526b',.13);let clouds=null;
 if(visible('hot')){glow(cx,cy,s*.46,s*.4,'#bd8646',.18);hazeSystem(cx,cy,s,1800,{alpha:.26});}
 if(visible('inflow')){bakedStreams(inflowPaths,n(1400),.016);streamSystem(inflowPaths,460,'#9ad8e2',{speed:.03});}
 if(visible('cool'))clouds=cloudSystem(cx,cy,s);
 if(visible('galaxy'))diskSystem(cx,cy,s);else glow(cx,cy,s*.02,s*.01,'#d0b999',.4);
 if(visible('feedback'))windSystem(cx,cy,s);
 const nx=width*.27,ny=height*.60;if(visible('qso-nebula'))nebulaSystem(nx,ny,s);if(visible('m-ifu'))ifuSystem(nx,ny,s);
 if(visible('cool')||visible('m-abs'))sightlineSystem(width*.9,height*.17,width*.05,height*.97,clouds,()=>lang==='en'?'BACKGROUND QSO':'背景类星体');}
function galacticScene(){const cx=width*.52,cy=height*.53,s=Math.min(width,height)*.9;
 if(visible('mw-hot'))hazeSystem(cx,cy,s*1.07,1600);
 if(visible('bubbles')){for(const sign of [-1,1])glow(cx-sign*s*.018,cy+sign*s*.18,s*.105,s*.19,'#d9a25f',.3,-.08);bubbleSystem(cx,cy,s);}
 if(visible('warm-disk')){diskSystem(cx,cy,s*1.38,{edge:.12,count:4200,spin:.03});windSystem(cx,cy,s*1.38,{wind:false,count:700,height:.05,hot:'#e9b98e',cold:'#91d9de'});}else glow(cx,cy,s*.015,s*.008,'#d1bca1',.4);
 if(visible('local-group')){const{x,y}=m31Inset(width,height);diskSystem(x,y,s*.29,{alpha:.65,count:900,spin:.06});label(()=>lang==='en'?'M31 · CONTEXT INSET':'M31 · 环境插图',x-s*.07,y+s*.05);}
}
// Solar System: the solar wind streams out, charge-exchanges with interstellar neutrals and with Earth's
// outer atmosphere in the magnetosheath. Brightness follows a schematic solar cycle; the heliospheric glow lags it.
function solarScene(){const s=Math.min(width,height),sx=width*.17,sy=height*.5,ex=width*.68,ey=height*.52,period=48,lag=6;
 const activity=t=>.62+.38*Math.sin(TAU*t/period);
 const bow=y=>ex-s*.12+(y-ey)*(y-ey)/(s*.25),pause=y=>ex-s*.07+(y-ey)*(y-ey)/(s*.14);
 glow(sx,sy,s*.5,s*.5,'#7a5a2c',.16);
 const fieldLines=Array.from({length:7},(_,k)=>k*TAU/7);
 const wind=Array.from({length:n(2200)},()=>({a:random()*TAU,ph:random(),v:.6+random()*.5,al:.35+random()*.55,sz:.9+random()*1.1}));
 const neutrals=Array.from({length:n(420)},()=>({x:random(),y:random(),v:.6+random()*.6,al:.15+random()*.3}));
 const helioSparks=Array.from({length:n(160)},()=>{const r=s*.12+Math.pow(random(),.7)*width*.55,a=random()*TAU;return{x:sx+Math.cos(a)*r,y:sy+Math.sin(a)*r*.8,ph:random(),f:.15+random()*.35};});
 const sheathSparks=Array.from({length:n(140)},()=>{const dy=(random()*2-1)*s*.2,x0=bow(ey+dy),x1=Math.abs(dy)<s*.16?pause(ey+dy):x0+s*.05;return{x:x0+random()*Math.max(4,x1-x0),y:ey+dy,ph:random(),f:.3+random()*.5};});
 const maxR=Math.hypot(width,height);
 systems.push({draw(t){const A=activity(t),Alag=activity(t-lag);ctx.globalCompositeOperation='lighter';
  // Parker-spiral field lines, rotating with the Sun
  ctx.strokeStyle='#e5c284';ctx.lineWidth=.7;for(const f of fieldLines){ctx.globalAlpha=.10;ctx.beginPath();for(let r=s*.07;r<maxR*.8;r+=8){const a=f+t*.05-r/(s*.9);const x=sx+Math.cos(a)*r,y=sy+Math.sin(a)*r;r===s*.07?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();}
  // interstellar neutrals drifting through the heliosphere
  dots(neutrals,'#9fbfe6',t,(p,t)=>{const u=(p.x-t*.012*p.v)%1,x=(u<0?u+1:u)*width*1.1-width*.05;o.x=x;o.y=(p.y*height+(width-x)*.18)%height;o.a=p.al;o.s=1.2;return true;});
  // solar wind; near Earth it is diverted around the bow shock and brightens in the magnetosheath
  dots(wind,'#efd59a',t,(p,t)=>{const u=(p.ph+t*.05*p.v)%1,r=s*.07+u*maxR*.75;let x=sx+Math.cos(p.a)*r,y=sy+Math.sin(p.a)*r;const dy=y-ey;if(x>bow(y)&&Math.abs(dy)<s*.32&&x<ex+s*.35){const push=Math.min(1,(x-bow(y))/(s*.08));y+=Math.sign(dy||1)*push*s*.06*(1-Math.abs(dy)/(s*.32));}o.x=x;o.y=y;o.a=p.al*A*(1-u*.8);o.s=p.sz;return true;});
  // charge-exchange flashes: heliospheric (lagging the cycle) and magnetosheath (prompt)
  for(const p of helioSparks){const k=Math.pow(Math.max(0,Math.sin(TAU*(t*p.f+p.ph))),14);if(k>.02)blob('#a8f0c8',p.x,p.y,4+3*k,k*.7*Alag);}
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.16*A;ctx.fillStyle='#7fd8b0';ctx.beginPath();for(let y=ey-s*.2;y<=ey+s*.2;y+=4)ctx.lineTo(bow(y),y);for(let y=ey+s*.16;y>=ey-s*.16;y-=4)ctx.lineTo(pause(y),y);ctx.closePath();ctx.fill();
  ctx.globalCompositeOperation='lighter';for(const p of sheathSparks){const k=Math.pow(Math.max(0,Math.sin(TAU*(t*p.f+p.ph))),10);if(k>.02)blob('#c4ffe0',p.x,p.y,3+3*k,k*.9*A);}
  // bow shock, magnetopause and tail
  ctx.globalCompositeOperation='source-over';ctx.lineWidth=1;ctx.strokeStyle='#9ccdb8';ctx.globalAlpha=.55;ctx.beginPath();for(let y=ey-s*.3;y<=ey+s*.3;y+=4)y===ey-s*.3?ctx.moveTo(bow(y),y):ctx.lineTo(bow(y),y);ctx.stroke();
  ctx.globalAlpha=.4;ctx.beginPath();for(let y=ey-s*.16;y<=ey+s*.16;y+=3)y===ey-s*.16?ctx.moveTo(pause(y),y):ctx.lineTo(pause(y),y);ctx.stroke();for(const d of [-1,1]){ctx.beginPath();ctx.moveTo(pause(ey+d*s*.16),ey+d*s*.16);ctx.quadraticCurveTo(ex+s*.3,ey+d*s*.12,ex+s*.55,ey+d*s*.1);ctx.stroke();}
  // Sun and Earth
  ctx.globalCompositeOperation='lighter';blob('#f2c46d',sx,sy,s*(.16+.02*A),.55);blob('#fff1c9',sx,sy,s*.05,1);blob('#7fb7e8',ex,ey,s*.03,.6);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.fillStyle='#8fc3ea';ctx.beginPath();ctx.arc(ex,ey,Math.max(2.5,s*.008),0,TAU);ctx.fill();
  // a telescope in orbit looking outward through the magnetosheath
  const ox=ex+Math.cos(t*.5)*s*.05,oy=ey+Math.sin(t*.5)*s*.03;ctx.globalAlpha=.5;ctx.strokeStyle='#e8bb81';ctx.setLineDash([2,5]);ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox+(width-ox)*.9,oy+(height-oy)*.75);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=.9;ctx.fillStyle='#f1d5a8';ctx.fillRect(ox-1.5,oy-1.5,3,3);
  ctx.globalAlpha=.75;ctx.fillStyle='#a9b8c6';ctx.font='8px system-ui';ctx.fillText(lang==='en'?'SUN':'太阳',sx-9,sy+s*.11);ctx.fillText(lang==='en'?'EARTH':'地球',ex-12,ey+s*.05);
  // schematic solar-cycle strip
  const gx=width*.04,gy=height*.86,gw=Math.min(width*.2,170),gh=s*.045;ctx.globalAlpha=.5;ctx.strokeStyle='#e5c284';ctx.beginPath();for(let k=0;k<=60;k++){const tt=t-period+k/60*period,x=gx+k/60*gw,y=gy-(activity(tt)-.62)/.38*gh;k?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();ctx.strokeStyle='#a8f0c8';ctx.beginPath();for(let k=0;k<=60;k++){const tt=t-period+k/60*period,x=gx+k/60*gw,y=gy-(activity(tt-lag)-.62)/.38*gh;k?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
  ctx.globalAlpha=.7;ctx.fillStyle='#8b9fb6';ctx.fillText(lang==='en'?'SOLAR CYCLE · X-RAY GLOW (LAGGED) · SCHEMATIC':'太阳活动周 · X 射线辉光（滞后）· 示意',gx,gy+gh+12);
  ctx.globalAlpha=1;}});
}
function buildBackground(){rngState=73421+scale*31;systems=[];density=Math.max(.35,Math.min(1,width*height/(1100*760)));g.setTransform(pixelRatio,0,0,pixelRatio,0,0);g.clearRect(0,0,width,height);sky();[webScene,haloScene,galacticScene,solarScene][scale]();g.globalAlpha=1;}
function captureTransition(direction){if(reduced.matches||paused)return;snapshot.width=canvas.width;snapshot.height=canvas.height;snap.drawImage(canvas,0,0);transitionStart=performance.now();transitionDir=direction;}
function drawFrame(now){const t=simTime;ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.clearRect(0,0,width,height);
 let z=1,e=1;if(transitionStart){const k=Math.min(1,(now-transitionStart)/900);e=1-Math.pow(1-k,3);z=1-transitionDir*(1-e)*.28;if(k===1)transitionStart=0;}
 ctx.save();ctx.translate(width/2,height/2);ctx.scale(z,z);ctx.translate(-width/2,-height/2);
 ctx.drawImage(background,0,0,background.width,background.height,-pointer.x*4,-pointer.y*3,width,height);
 ctx.translate(-pointer.x*10,-pointer.y*7);for(const sys of systems)sys.draw(t);
 ctx.restore();ctx.globalCompositeOperation='source-over';
 if(selected){const n=R.nodes.find(n=>n.id===selected);if(n){const xx=n.xy[0]*width/100,yy=n.xy[1]*height/100,gr=ctx.createRadialGradient(xx,yy,0,xx,yy,width*.15);gr.addColorStop(0,n.color+'1b');gr.addColorStop(1,n.color+'00');ctx.globalAlpha=1;ctx.fillStyle=gr;ctx.fillRect(0,0,width,height);}}
 if(e<1){const zz=1+transitionDir*e*.6;ctx.save();ctx.globalAlpha=1-e;ctx.translate(width/2,height/2);ctx.scale(zz,zz);ctx.drawImage(snapshot,0,0,snapshot.width,snapshot.height,-width/2,-height/2,width,height);ctx.restore();}
 ctx.globalAlpha=1;
}
function frame(now){if(paused||document.hidden)return;const dt=Math.min((now-lastTick)/1000,.05);lastTick=now;simTime+=dt;pointer.x+=(pointer.tx-pointer.x)*.04;pointer.y+=(pointer.ty-pointer.y)*.04;drawFrame(now);animationId=requestAnimationFrame(frame);}
function startAnimation(){cancelAnimationFrame(animationId);lastTick=performance.now();if(!paused&&!document.hidden)animationId=requestAnimationFrame(frame);}
function resize(){const mobile=innerWidth<=760;if(mobile!==lastMobile){lastMobile=mobile;$('#filter-toggle').setAttribute('aria-expanded',String(!mobile));$('#theme-filters').hidden=mobile;$('.filter-chevron').textContent=mobile?'+':'−';}fitPanel();const rect=$('#scene').getBoundingClientRect();width=rect.width;height=rect.height;pixelRatio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*pixelRatio);canvas.height=Math.round(height*pixelRatio);background.width=canvas.width;background.height=canvas.height;transitionStart=0;buildBackground();positionHotspots();drawFrame(performance.now());}
let lastMobile=innerWidth<=760;
let resizeTimer;new ResizeObserver(()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(resize,80);}).observe($('#scene'));
$('#scene').addEventListener('pointermove',e=>{if(reduced.matches||e.pointerType==='touch')return;const r=$('#scene').getBoundingClientRect();pointer.tx=(e.clientX-r.left)/r.width*2-1;pointer.ty=(e.clientY-r.top)/r.height*2-1;});
$('#scene').addEventListener('pointerleave',()=>{pointer.tx=0;pointer.ty=0;});
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(animationId);else startAnimation();});
if(innerWidth<=760){$('#filter-toggle').setAttribute('aria-expanded','false');$('#theme-filters').hidden=true;$('.filter-chevron').textContent='+';}
const hashNode=R.nodes.find(n=>n.id===location.hash.slice(1));if(hashNode){scale=hashNode.scale;if(theme==='all'||hashNode.tags.includes(theme))selected=hashNode.id;}
scale=themeScale(scale);simTime=20;translate();resize();startAnimation();
