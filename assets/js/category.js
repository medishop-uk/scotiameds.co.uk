(function(){
'use strict';
var medicineImages={'alprazolam-alprax-2mg':'alprax-xr2.jpg','bromazepam':'broze.jpg','co-codamol':'co-codamol.jpg','lorazepam-ativan-2mg':'lorazepam.jpg','nitrazepam-noctin-5mg':'noctin.jpg','clonazepam-rivotril-2mg':'rivotril-2.jpg','diazepam-sedil-5mg':'sedil.jpg','diazepam-martin-dow-10mg':'valium.jpg','zopiclone-7-5mg':'zopiclone-tablets.jpg'};
document.querySelectorAll('.category-product-image').forEach(function(link){var slug=link.getAttribute('href').split('/').pop(),file=medicineImages[slug],img=link.querySelector('img');if(file&&img){img.src='../../assets/img/medicine/'+file;img.loading='lazy'}});
var select=document.querySelector('#category-select');
if(select)select.addEventListener('change',function(){location.href=select.value});
var menu=document.querySelector('.page-menu'),mobile=document.querySelector('.page-mobile-nav');
if(menu&&mobile)menu.addEventListener('click',function(){var open=mobile.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});
document.addEventListener('keydown',function(event){if(event.key==='Escape'){document.querySelectorAll('.nav-categories').forEach(function(item){item.classList.remove('open')});if(mobile)mobile.classList.remove('open')}});
})();
