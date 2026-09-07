(function(){
'use strict';
var select=document.querySelector('#category-select');
if(select)select.addEventListener('change',function(){location.href=select.value});
var menu=document.querySelector('.page-menu'),mobile=document.querySelector('.page-mobile-nav');
if(menu&&mobile)menu.addEventListener('click',function(){var open=mobile.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});
document.addEventListener('keydown',function(event){if(event.key==='Escape'){document.querySelectorAll('.nav-categories').forEach(function(item){item.classList.remove('open')});if(mobile)mobile.classList.remove('open')}});
})();
