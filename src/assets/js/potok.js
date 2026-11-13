import data from './potok-data.json';
const { products, articles, cases } = data;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const photo = (name) => {
  const images = import.meta.glob('../images/potok/*.webp', { eager: true, query: '?url', import: 'default' });
  return images[`../images/potok/${name}.webp`];
};

// Filter state is shareable, with accessible feedback and no hover-only controls.
const grid = document.querySelector('#product-grid');
if (grid) {
  const buttons = [...document.querySelectorAll('[data-product-filter]')];
  function filter(category) {
    if (!buttons.some((b) => b.dataset.productFilter === category)) category = 'all';
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.productFilter === category)));
    let count = 0;
    grid.querySelectorAll('[data-product-card]').forEach((card) => {
      card.hidden = category !== 'all' && card.dataset.category !== category;
      if (!card.hidden) count += 1;
    });
    document.querySelector('#product-count').textContent = `Показано моделей: ${count}`;
  }
  filter(new URLSearchParams(location.search).get('type') || 'all');
  buttons.forEach((b) => b.addEventListener('click', () => {
    const url = new URL(location.href);
    b.dataset.productFilter === 'all' ? url.searchParams.delete('type') : url.searchParams.set('type', b.dataset.productFilter);
    history.pushState({}, '', url);
    filter(b.dataset.productFilter);
  }));
  addEventListener('popstate', () => filter(new URLSearchParams(location.search).get('type') || 'all'));
}

let dialog, previousFocus;
function openDetail(content) {
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.className = 'potok-dialog';
    dialog.setAttribute('aria-labelledby', 'detail-title');
    document.body.append(dialog);
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => {
      document.body.style.overflow = '';
      previousFocus?.focus({ preventScroll: true });
    });
  }
  previousFocus = document.activeElement;
  dialog.innerHTML = `<button class="potok-dialog-close" aria-label="Закрыть подробности">×</button>${content}`;
  dialog.querySelector('.potok-dialog-close').addEventListener('click', () => dialog.close());
  document.body.style.overflow = 'hidden';
  if (!dialog.open) dialog.showModal();
  dialog.querySelector('.potok-dialog-close').focus({ preventScroll: true });
}
function openProduct(id) {
  const item = products.find((p) => p.id === id);
  if (!item) return;
  openDetail(`<img class="potok-dialog-photo" src="${photo(item.image)}" alt="Иллюстративная фотография оборудования"><div class="potok-dialog-body"><p class="potok-eyebrow">${esc(item.label)} / ДЕМО-МОДЕЛЬ</p><h2 id="detail-title">${esc(item.name)}</h2><p>${esc(item.description)}</p><dl class="potok-specs">${Object.entries(item.specs).map(([k,v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl><p class="potok-note">Иллюстративное фото, не чертёж конкретной модели. Нагрузка, скорость, размеры и исполнение определяются по техническому заданию.</p><a class="potok-action" href="contact.html?product=${item.id}">Выбрать для запроса ↗</a></div>`);
}
function openCase(id) {
  const item = cases.find((p) => p.id === id);
  if (!item) return;
  openDetail(`<img class="potok-dialog-photo" src="${photo(item.image)}" alt="Иллюстрация производственного процесса"><div class="potok-dialog-body"><p class="potok-eyebrow">${esc(item.industry)} / КОНЦЕПЦИЯ</p><h2 id="detail-title">${esc(item.title)}</h2><h3>Задача</h3><p>${esc(item.task)}</p><h3>Схема решения</h3><p>${esc(item.solution)}</p><h3>Возможный состав</h3><ul>${item.equipment.map((id) => `<li>${esc(products.find((p)=>p.id===id).name)}</li>`).join('')}</ul><p class="potok-note">Демонстрационная концепция. Это не выполненный заказ и не подтверждённый результат внедрения.</p><a class="potok-action" href="contact.html?project=${item.id}">Подготовить похожую задачу ↗</a></div>`);
}
document.addEventListener('click', (event) => {
  const product = event.target.closest('[data-product-detail]');
  if (product) { event.preventDefault(); openProduct(product.dataset.productDetail); }
  const concept = event.target.closest('[data-case-detail]');
  if (concept) {
    event.preventDefault(); openCase(concept.dataset.caseDetail);
    const url = new URL(location.href); url.searchParams.set('case', concept.dataset.caseDetail); history.replaceState({}, '', url);
  }
});
if (location.pathname.endsWith('case-studies.html')) {
  const id = new URLSearchParams(location.search).get('case');
  if (id) openCase(id);
}

// Every article card loads its own content in the original Fabrica article layout.
const articleTitle = document.querySelector('#article-title');
if (articleTitle) {
  const item = articles.find((p) => p.id === new URLSearchParams(location.search).get('article')) || articles[0];
  articleTitle.textContent = item.title;
  document.title = `${item.title} | ПОТОК ИНЖИНИРИНГ`;
  document.querySelector('#article-deck').textContent = item.deck;
  document.querySelector('#article-subtitle').textContent = item.title;
  document.querySelector('#article-image').src = photo(item.image);
  const paragraphs = [...document.querySelectorAll('[data-article-paragraph]')];
  paragraphs.forEach((p, i) => { p.textContent = item.paragraphs[Math.min(i, item.paragraphs.length - 1)]; });
  document.querySelector('#article-points').innerHTML = item.points.map((p) => `<li>${esc(p)}</li>`).join('');
}

// Requests are exported on-device; no fake "sent" response and no PII storage.
const form = document.querySelector('[data-request-form]');
if (form) {
  const params = new URLSearchParams(location.search);
  const selected = products.find((p) => p.id === params.get('product'));
  const project = cases.find((p) => p.id === params.get('project'));
  if (selected) form.elements.equipment.value = selected.id;
  if (project) form.elements.description.value = `Задача по концепции «${project.title}».\n\nОпишите ваши условия: `;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const equipment = products.find((p) => p.id === values.get('equipment'));
    const text = ['ПОТОК ИНЖИНИРИНГ — демонстрационный технический запрос', 'Документ создан на устройстве. Он не отправлен компании.', '', `Имя: ${values.get('name')}`, `Компания: ${values.get('company') || 'Не указана'}`, `Почта: ${values.get('email')}`, `Телефон: ${values.get('phone') || 'Не указан'}`, `Оборудование: ${equipment?.name || 'Требуется подбор'}`, '', 'Описание задачи:', values.get('description'), '', 'Уточнить при обсуждении: свойства и размеры груза, схема маршрута, рабочая среда, производительность, монтаж и управление.'].join('\n');
    const blob = new Blob(['\ufeff' + text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'ПОТОК-технический-запрос.txt'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    document.querySelector('#request-status').textContent = 'Файл подготовлен к скачиванию. Запрос не отправлен компании.';
  });
}

// Mark the fictional company once per page, in the footer.
const footer = document.querySelector('#footer');
if (footer) {
  const notice = document.createElement('p'); notice.className = 'potok-demo-note';
  notice.textContent = 'ПОТОК ИНЖИНИРИНГ — вымышленная компания. Демонстрационный проект для портфолио. Фотографии иллюстративные.';
  const content = footer.querySelector('.container-full'); if (content) content.append(notice);
}

// Native focus and touch feedback; the original menu and tabs are retained.
document.querySelectorAll('#mobile-menu a').forEach((a) => a.addEventListener('click', () => {
  window.HSOverlay?.close('#mobile-menu');
}));
// Anchor offsets respect the fixed header and reduced-motion preference.
document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', (event) => {
  const id = a.getAttribute('href');
  if (!id || id === '#') return;
  const target = document.getElementById(id.slice(1));
  if (!target) return;
  event.preventDefault(); target.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
  history.replaceState({}, '', id);
}));
