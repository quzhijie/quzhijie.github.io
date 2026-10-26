'use strict';
// Runs in <head> before the body is drawn: a ?lang=zh page shows its static Chinese text from the first paint.
if(new URLSearchParams(location.search).get('lang')==='zh')document.documentElement.lang='zh-CN';
