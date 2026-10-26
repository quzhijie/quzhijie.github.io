'use strict';
// Research team. Source: CV "Research Advising" plus the owner's notes on members and their topics.
const $=s=>document.querySelector(s),P=window.PUBLICATIONS;
let lang=new URLSearchParams(location.search).get('lang')==='zh'?'zh':'en';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const TEAM={
 pi:[{name:'Zhijie Qu',photo:'qu',links:true,zh:'屈稚杰',role:['Assistant Professor','助理教授'],where:['Department of Astronomy, Tsinghua University','清华大学天文系'],years:'2025–',noPapers:true,
  topic:['The multiphase gas around galaxies — how much of it there is, how it moves, and what it tells us about feedback and accretion. Previously KICP Associate Fellow at the University of Chicago; Ph.D., University of Michigan; B.S., Peking University.','星系周围的多相气体——有多少、如何运动，以及它如何揭示反馈与吸积。此前为芝加哥大学 KICP Associate Fellow；博士毕业于密歇根大学，本科毕业于北京大学。']}],
 postdoc:[{name:'He Lin',zh:'何琳',where:['NJU → THU','南京大学 → 清华大学'],years:'2026–',topic:['Galaxy kinematics from stacked MUSE cubes of the Cosmic Ultraviolet Baryon Survey (CUBS): following [O II] emission and its rotation from the disk out into the halo.','叠加宇宙紫外重子巡天（CUBS）的 MUSE 数据立方研究星系运动学：追踪 [O II] 发射及其旋转从星系盘延伸到气体晕。']}],
 grad:[
  {name:'Zeyang Pan',zh:'潘泽阳',where:['UCAS','中国科学院大学'],years:'2021–',with:'Joel Bregman & Jifeng Liu',topic:['X-ray line emission of the Milky Way’s hot gas and of solar-wind charge exchange (X-LEAP).','银河系热气体与太阳风电荷交换的 X 射线谱线发射（X-LEAP）。']},
  {name:'Wenhao Wang',photo:'wenhao',zh:'王文豪',where:['XMU → THU','厦门大学 → 清华大学'],years:'2025–',topic:['Baryon cycling in highly inclined dwarf galaxies.','高倾角矮星系中的重子循环。']},
  {name:'Yuqian Gui',photo:'yuqian',zh:'桂雨谦',where:['THU','清华大学'],years:'2025–',with:'Dandan Xu',home:'https://yq-gui.github.io/',topic:['Kinematics of the circumgalactic medium around M31 from HST/COS absorption toward background quasars.','利用背景类星体的 HST/COS 吸收线研究 M31 星系周介质的运动学。']},
  {name:'Junle Wang',photo:'junle',zh:'王均乐',where:['BNU → THU','北京师范大学 → 清华大学'],years:'2025–',topic:['Mapping the Milky Way’s hot gas with the Einstein Probe Wide-field X-ray Telescope (WXT).','利用爱因斯坦探针宽视场 X 射线望远镜（WXT）绘制银河系热气体。']},
  {name:'Yuanzhen Han',zh:'韩园珍',where:['PMO','紫金山天文台'],years:'2025–',with:'Shuinai Zhang & Li Ji',topic:['Small-scale models of circumgalactic absorbers, comparing the covering fraction with the number of absorption components.','星系周吸收体的小尺度建模：比较覆盖率与吸收成分的数目。']}
 ],
 undergrad:[
  {name:'Eliana Schiller',where:['UChicago','芝加哥大学'],years:'2024–',with:'Hsiao-Wen Chen',topic:['Kinematics of H I and O VI absorbers in the circumgalactic medium.','星系周介质中 H I 与 O VI 吸收体的运动学。']},
  {name:'Jinglun Dai',zh:'代靖伦',where:['THU','清华大学'],years:'2025–'}
 ],
 alumni:[
  {name:'Hang Yang',now:['Now in industry','现在业界工作'],zh:'杨航',role:['PhD student','博士生'],where:['PMO','紫金山天文台'],years:'2019–2025',with:'Joel Bregman & Li Ji',topic:['Modelling cool gas clumps in the circumgalactic medium.','星系周介质中冷气体团块的建模。']},
  {name:'Suyash Kumar',role:['PhD student','博士生'],where:['UChicago','芝加哥大学'],years:'2022–2025',with:'Hsiao-Wen Chen',topic:['The physical nature of C IV-bearing gas around galaxies.','星系周围含 C IV 气体的物理性质。']},
  {name:'Cameron Pratt',now:['Now in industry','现在业界工作'],role:['PhD student','博士生'],where:['UMich','密歇根大学'],years:'2020–2024',with:'Joel N. Bregman',topic:['Sunyaev–Zeldovich measurements of hot halos, including machine-learning extraction.','热气体晕的 Sunyaev–Zeldovich 测量，包括机器学习信号提取。']},
  {name:'Ryan Lindley',now:['Now in industry','现在业界工作'],role:['Undergraduate','本科生'],where:['UMich','密歇根大学'],years:'2019–2021',topic:['Kinematics of the Milky Way’s warm gas.','银河系暖气体的运动学。']}
 ]
};
// Links carry only non-default state (Chinese, or a chosen theme).
const langQ=()=>lang==='zh'?'?lang=zh':'',mapQ=()=>{const q=new URLSearchParams();if(typeof T!=='undefined'&&T)q.set('theme',theme);if(lang==='zh')q.set('lang','zh');const s=q.toString();return s?'?'+s:'';};
const C={en:{position:'Assistant Professor · Astronomy, Tsinghua University',team:'Team',map:'← Home',research:'Research',pubs:'All publications',title:'Research team',lede:'Postdocs and students working with me across the cosmic ecosystem — from the solar wind to the gas between galaxies.',postdoc:'Postdoctoral researchers',grad:'Graduate students',undergrad:'Undergraduate researchers',alumni:'Alumni',with:'Co-advised with',pi:'Principal investigator',papers:'First-author papers',join:'Prospective students and postdocs are welcome to get in touch.',email:'Email ↗',mapLink:'Back to home ↗',home:'Homepage ↗'},
 zh:{position:'清华大学天文系 · 助理教授',team:'团队',map:'← 首页',research:'研究',pubs:'全部论文',title:'研究团队',lede:'与我一起研究宇宙生态系统的博士后和学生——从太阳风到星系之间的气体。',postdoc:'博士后',grad:'研究生',undergrad:'本科生科研',alumni:'已毕业成员',with:'合作指导',pi:'负责人',papers:'第一作者论文',join:'欢迎有兴趣的学生和博士后联系。',email:'发邮件 ↗',mapLink:'返回首页 ↗',home:'个人主页 ↗'}};
const c=k=>C[lang][k],I=()=>lang==='en'?0:1;
const family=n=>n.split(' ').at(-1);
// Match on first given name plus family name, ignoring middle initials ("Cameron T. Pratt").
const key=n=>{const w=n.replace('*','').trim().split(/\s+/);return (w[0]+' '+w.at(-1)).toLowerCase();};
function firstAuthored(name){return P.filter(p=>p.authors[0]&&key(p.authors[0])===key(name)).sort((a,b)=>b.year-a.year);}
function card(m){const initials=m.name.split(' ').map(s=>s[0]).join('');// Photos come from the members' public department pages.
 const face=m.photo?`<img class="avatar photo" src="team/${m.photo}.jpg" alt="" width="64" height="64" loading="lazy">`:`<div class="avatar" aria-hidden="true">${esc(initials)}</div>`;const papers=m.noPapers?[]:firstAuthored(m.name);
 return `<article class="member">${face}<div><h3>${esc(m.name)}${m.zh?` <span class="member-zh">${esc(m.zh)}</span>`:''}</h3><p class="member-meta">${m.role?esc(m.role[I()])+' · ':''}${esc(m.where[I()])} · ${esc(m.years)}${m.now?` · <span class="member-now">${esc(m.now[I()])}</span>`:''}</p>${m.with?`<p class="member-with">${c('with')} ${esc(m.with)}</p>`:''}${m.topic?`<p class="member-topic">${esc(m.topic[I()])}</p>`:''}${m.home?`<div class="member-links"><a href="${esc(m.home)}" target="_blank" rel="noopener">${c('home')}</a></div>`:''}${m.links?`<div class="member-links"><a href="cv.pdf" target="_blank" rel="noopener">CV ↗</a>${window.PROFILE_LINKS.map(([n,u])=>`<a href="${u}" target="_blank" rel="noopener">${n} ↗</a>`).join('')}<a href="mailto:quzhijie@tsinghua.edu.cn">Email ↗</a></div>`:''}${papers.length?`<div class="member-papers"><span>${c('papers')}</span>${papers.map(p=>`<a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.title)} <em>${esc(family(p.authors[0]))} ${p.year}</em> ↗</a>`).join('')}</div>`:''}</div></article>`;}
function render(){document.documentElement.lang=lang==='en'?'en':'zh-CN';document.title=c('title')+' · Zhijie Qu';$('#position').textContent=c('position');window.setNav(lang);$('#language').textContent=lang==='en'?'中文':'EN';
 $('#detail-title').textContent=c('title');$('#lede').textContent=c('lede');
 $('#team').innerHTML=['pi','postdoc','grad','undergrad','alumni'].map(g=>`<section class="reading-block"><h2 class="block-title">${c(g)}</h2><div class="members">${TEAM[g].map(card).join('')}</div></section>`).join('');
 $('#join').innerHTML=`${esc(c('join'))} <a href="mailto:quzhijie@tsinghua.edu.cn">${c('email')}</a>`;$('#map-footer').textContent=c('mapLink');$('#map-footer').href=`index.html${langQ()}`;}
$('#language').addEventListener('click',()=>{lang=lang==='en'?'zh':'en';render();});render();
