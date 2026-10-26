'use strict';
// Shared masthead (partials/masthead.html, filled into each page by scripts/build-pages.py): the links
// already carry both languages and the current section, so here they only keep ?lang.
window.setNav=function(lang){
 for(const a of document.querySelectorAll('.masthead nav a'))a.href=a.getAttribute('href').split('?')[0]+(lang==='zh'?'?lang=zh':'');
};
// Scholar profiles, shown on the publications page and in the PI's team card.
window.PROFILE_LINKS=[['NASA ADS','https://ui.adsabs.harvard.edu/public-libraries/Ji7tbpTxSJCxOVkkuOrS3g'],['Google Scholar','https://scholar.google.com/citations?user=geCFnGcAAAAJ&hl=en'],['ORCID','https://orcid.org/0000-0002-2941-646X']];
