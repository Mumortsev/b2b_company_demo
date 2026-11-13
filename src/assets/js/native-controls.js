// Small native controllers keep Fabrica's existing classes, layouts and transitions.
const menu = document.getElementById('mobile-menu');
const menuButton = document.querySelector('[data-hs-overlay="#mobile-menu"]');
function setMenu(open, restore = false) {
  if (!menu || !menuButton) return;
  menu.classList.toggle('open', open);
  menu.inert = !open;
  menu.setAttribute('aria-hidden', String(!open));
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  if (restore) menuButton.focus({preventScroll:true});
}
if (menu && menuButton) {
  menu.setAttribute('role','navigation');
  setMenu(false);
  menuButton.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('resize', () => { if (innerWidth >= 1280) setMenu(false); }, {passive:true});
}
const dropdowns = [...document.querySelectorAll('.hs-dropdown')];
function dropdownState(dropdown, open) {
  dropdown.classList.toggle('open',open);
  const content=dropdown.querySelector('.hs-dropdown-menu');
  content?.classList.toggle('hidden',!open);
  content?.classList.toggle('open',open);
  dropdown.querySelector('.hs-dropdown-toggle')?.setAttribute('aria-expanded',String(open));
}
dropdowns.forEach((dropdown) => {
  dropdown.querySelector('.hs-dropdown-toggle')?.addEventListener('click', () => dropdownState(dropdown,!dropdown.classList.contains('open')));
  dropdown.addEventListener('mouseenter', () => { if(matchMedia('(hover:hover)').matches) dropdownState(dropdown,true); });
  dropdown.addEventListener('mouseleave', () => { if(!dropdown.contains(document.activeElement)) dropdownState(dropdown,false); });
  dropdown.addEventListener('focusout', (event) => { if(!dropdown.contains(event.relatedTarget)) dropdownState(dropdown,false); });
});
document.querySelectorAll('.hs-accordion').forEach((accordion,index) => {
  const button=accordion.querySelector('.hs-accordion-toggle');
  const panel=accordion.querySelector('.hs-accordion-content');
  if(!button||!panel)return;
  panel.id ||= 'accordion-panel-'+index;
  button.setAttribute('aria-controls',panel.id);
  const update=()=>{const open=accordion.classList.contains('active');button.setAttribute('aria-expanded',String(open));panel.classList.toggle('hidden',!open);};
  update();button.addEventListener('click',()=>{accordion.classList.toggle('active');update();});
});
const tabs=[...document.querySelectorAll('[data-hs-tab]')];
function activateTab(tab) {
  const group=tab.closest('[role="tablist"]') || tab.parentElement;
  group.querySelectorAll('[data-hs-tab]').forEach((item)=>{
    const selected=item===tab;item.classList.toggle('active',selected);item.setAttribute('aria-selected',String(selected));item.tabIndex=selected?0:-1;
    document.querySelector(item.dataset.hsTab)?.classList.toggle('hidden',!selected);
  });
}
tabs.forEach((tab)=>{
  tab.addEventListener('click',()=>activateTab(tab));
  tab.addEventListener('keydown',(event)=>{
    const group=[...(tab.closest('[role="tablist"]')||tab.parentElement).querySelectorAll('[data-hs-tab]')];
    const i=group.indexOf(tab);let next;
    if(['ArrowRight','ArrowDown'].includes(event.key))next=group[(i+1)%group.length];
    if(['ArrowLeft','ArrowUp'].includes(event.key))next=group[(i+group.length-1)%group.length];
    if(event.key==='Home')next=group[0];if(event.key==='End')next=group.at(-1);
    if(next){event.preventDefault();activateTab(next);next.focus();}
  });
  if(tab.getAttribute('aria-selected')==='true')activateTab(tab);
});
document.addEventListener('click',(event)=>{
  dropdowns.forEach(d=>{if(!d.contains(event.target))dropdownState(d,false);});
  if(menu?.classList.contains('open')&&!menu.contains(event.target)&&!menuButton.contains(event.target))setMenu(false);
});
document.addEventListener('keydown',(event)=>{
  if(event.key==='Escape'){
    if(menu?.classList.contains('open'))setMenu(false,true);
    dropdowns.forEach(d=>{if(d.classList.contains('open')){dropdownState(d,false);d.querySelector('button')?.focus();}});
  }
});
