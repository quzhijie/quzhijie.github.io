'use strict';
// Static reading pages (Data, Teaching, Contact): bilingual blocks marked .lang-en / .lang-zh, shared tabs and masthead.
const $=s=>document.querySelector(s);
let lang=new URLSearchParams(location.search).get('lang')==='zh'?'zh':'en';
const C={en:{position:'Assistant Professor · Astronomy, Tsinghua University',map:'← Home',research:'Research',team:'Team',data:'Data & Code',contact:'Contact',teaching:'Teaching',pubs:'All publications',mapLink:'Back to home ↗'},
 zh:{position:'清华大学天文系 · 助理教授',map:'← 首页',research:'研究',team:'团队',data:'数据与代码',contact:'联系',teaching:'教学',pubs:'全部论文',mapLink:'返回首页 ↗'}};
function render(){const c=C[lang],q=lang==='zh'?'?lang=zh':'',page=document.body.dataset.page;
 document.documentElement.lang=lang==='en'?'en':'zh-CN';$('#position').textContent=c.position;$('#language').textContent=lang==='en'?'中文':'EN';window.setNav(lang);
 document.title=c[page]+' · Zhijie Qu';$('#map-footer').textContent=c.mapLink;$('#map-footer').href='index.html'+q;}
$('#language').addEventListener('click',()=>{lang=lang==='en'?'zh':'en';render();});render();
