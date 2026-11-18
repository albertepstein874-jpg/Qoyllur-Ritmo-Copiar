(() => {
  'use strict';
  const content = window.QR_CONTENT;
  const questionUtils = window.QR_QUESTION_UTILS;
  const STORAGE_KEY = 'qoyllur-ritmo-progress-v1';
  const TUTORIAL_KEY = 'qoyllur-ritmo-welcome-tour-v1';
  const REFILL_MS = 24 * 60 * 60 * 1000;
  const futureAreas = [
    { id: 'gastronomia', title: 'Gastronomía', short: 'SABORES DEL PERÚ', icon: '◉', tone: 'gold', description: 'Contenido en preparación.', image: { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ceviche_del_Per%C3%BA.jpg?width=900', alt: 'Plato de ceviche peruano', credit: 'Manuel González Olaechea y Franco · Wikimedia Commons', href: 'https://commons.wikimedia.org/wiki/File:Ceviche_del_Per%C3%BA.jpg' } },
    { id: 'festividades', title: 'Festividades', short: 'CELEBRACIONES', icon: '✧', tone: 'violet', description: 'Contenido en preparación.', image: { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Inti_Raymi.jpg?width=900', alt: 'Celebración del Inti Raymi en Sacsayhuamán, Cusco', credit: 'Cyntia Motta · Wikimedia Commons · CC BY-SA 3.0', href: 'https://commons.wikimedia.org/wiki/File:Inti_Raymi.jpg' } },
    { id: 'patrimonio', title: 'Patrimonio cultural', short: 'MEMORIAS VIVAS', icon: '⌂', tone: 'turquoise', description: 'Contenido en preparación.', image: { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Cusco_Cathedral.jpg?width=900', alt: 'Catedral de Cusco', credit: 'Jordan Klein · Wikimedia Commons · CC BY 2.0', href: 'https://commons.wikimedia.org/wiki/File:Cusco_Cathedral.jpg' } },
    { id: 'historia', title: 'Historia y tradiciones', short: 'HISTORIAS DEL PERÚ', icon: '◷', tone: 'clay', description: 'Contenido en preparación.', image: { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Traditionnal_peruvian_weaving_-_Cuzco_-_Peru.jpg?width=900', alt: 'Tejido tradicional en Cusco', credit: 'Pethrus · Wikimedia Commons · CC BY-SA 4.0', href: 'https://commons.wikimedia.org/wiki/File:Traditionnal_peruvian_weaving_-_Cuzco_-_Peru.jpg' } }
  ];
  const heroAsset = { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Machu_Picchu_panorama.jpg?width=1800', href: 'https://commons.wikimedia.org/wiki/File:Machu_Picchu_panorama.jpg', credit: 'Brian Jeffery Beggerly · Wikimedia Commons · CC BY 2.0' };
  const tutorialSteps = [
    { target: '.nav-item[data-nav="inicio"]', title: 'Inicio', copy: 'Aquí puedes volver a la pantalla principal en cualquier momento.' },
    { target: '#primary-nav', title: 'Tu menú de aprendizaje', copy: 'Desde este menú puedes cambiar entre las áreas culturales, tus retos y el seguimiento personal.' },
    { target: '#home-categories', title: 'Danzas y Música', copy: 'Elige una tarjeta para explorar las lecciones de Danzas del Perú o Música peruana.' },
    { target: '#nav-expansion-group', title: 'Más áreas culturales', copy: 'Gastronomía, Festividades, Patrimonio e Historia y tradiciones ya tienen su espacio. El contenido se añadirá cuando esté preparado y verificado.' },
    { target: '[data-nav="jugar"]', title: 'Practica jugando', copy: 'En Retos y juegos encontrarás actividades por área y la trivia cultural de ocho preguntas.' },
    { target: '[data-nav="liga"]', title: 'Tu liga personal', copy: 'Consulta tus puntos y tu avance semanal. La liga muestra solo tus propios resultados.' },
    { target: '[data-nav="progreso"]', title: 'Sigue tu aprendizaje', copy: 'Revisa las lecciones completadas, tu trivia y el progreso guardado en este dispositivo.' }
  ];
  let tutorialIndex = 0;
  let tutorialFinishedScreen = false;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const lessonMap = Object.fromEntries(content.lessons.map(item => [item.id, item]));
  const categoryMap = Object.fromEntries(content.categories.map(item => [item.id, item]));
  let activeFilter = 'all';
  let quizSession = null;
  let dialogLesson = null;
  let lessonOptionOrder = [];
  const matchSessions = { danzas: null, musica: null };
  const areaTabs = Object.fromEntries([...content.categories, ...futureAreas].map(area => [area.id, 'aprender']));

  function freshState() {
      return { completed: [], started: [], batteries: 5, refillAt: null, bestTrivia: null, byCategory: { danzas: [], musica: [] }, plan: 'gratis', lessonAnswers: {}, activityLog: [], updatedAt: Date.now() };
  }
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return freshState();
      const parsed = JSON.parse(raw);
      const state = { ...freshState(), ...parsed };
      state.completed = Array.isArray(state.completed) ? state.completed.filter(id => lessonMap[id]) : [];
      state.started = Array.isArray(state.started) ? state.started.filter(id => lessonMap[id]) : [];
      state.plan = content.memberships.some(plan => plan.id === state.plan) ? state.plan : 'gratis';
      state.bestTrivia = Number.isFinite(state.bestTrivia) ? state.bestTrivia : null;
      state.batteries = Number.isFinite(state.batteries) ? state.batteries : 5;
      state.refillAt = Number.isFinite(state.refillAt) ? state.refillAt : null;
      state.lessonAnswers = state.lessonAnswers && typeof state.lessonAnswers === 'object' ? state.lessonAnswers : {};
      // Las versiones previas guardaban índices y siempre situaban la respuesta correcta en 0.
      Object.entries(state.lessonAnswers).forEach(([lessonId, answer]) => {
        if (answer && typeof answer === 'object' && Number.isInteger(answer.selected)) {
          const question = lessonMap[lessonId]?.question;
          answer.selected = questionUtils.migrateLegacySelection(question, answer.selected);
          if (answer.selected === null) answer.checked = false;
        }
      });
      state.activityLog = Array.isArray(state.activityLog) ? state.activityLog.filter(item => item && /^\d{4}-\d{2}-\d{2}$/.test(item.date) && typeof item.id === 'string' && Number.isFinite(item.points)).slice(-500) : [];
      return state;
    } catch { return freshState(); }
  }
  let state = loadState();
  function saveState() {
    state.byCategory = Object.fromEntries(content.categories.map(category => [category.id, state.completed.filter(id => lessonMap[id].category === category.id)]));
    state.updatedAt = Date.now();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { announce('No fue posible guardar el progreso en este navegador.'); }
  }
  function currentPlan() { return content.memberships.find(plan => plan.id === state.plan) || content.memberships[0]; }
  function hasUnlimitedEnergy() { return state.plan === 'premium'; }
  function cap() { return hasUnlimitedEnergy() ? Infinity : currentPlan().batteries; }
  function reconcileEnergy() {
    if (hasUnlimitedEnergy()) return false;
    const max = cap();
    if (state.batteries > max) { state.batteries = max; saveState(); }
    if (state.refillAt && Date.now() >= state.refillAt) {
      state.batteries = max;
      state.refillAt = null;
      saveState();
      announce('Tus baterías se recargaron por completo.');
      return true;
    }
    return false;
  }
  function announce(message) { const live = $('#live-announcer'); if (live) live.textContent = message; }
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }
  function percentComplete() { return Math.round(state.completed.length / content.lessons.length * 100); }
  function categoryPercent(id) { const lessons = content.lessons.filter(item => item.category === id); const completed = lessons.filter(item => state.completed.includes(item.id)).length; return { completed, total: lessons.length, percent: Math.round(completed / lessons.length * 100) }; }

  function dateKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
  function weekDates() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const monday = new Date(today); monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, index) => { const date = new Date(monday); date.setDate(monday.getDate() + index); return date; });
  }
  function weeklyStats() {
    const dates = weekDates();
    const start = dateKey(dates[0]);
    const end = dateKey(dates[6]);
    const events = state.activityLog.filter(item => item.date >= start && item.date <= end);
    const activeDates = [...new Set(events.map(item => item.date))];
    const activeSet = new Set(state.activityLog.map(item => item.date));
    let cursor = new Date(); cursor.setHours(0, 0, 0, 0);
    if (!activeSet.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    let streak = 0;
    while (activeSet.has(dateKey(cursor))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
    return { dates, events, activeDates, activeSet, streak, points: events.reduce((sum, item) => sum + item.points, 0) };
  }
  function calendarMarkup(stats, large = false) {
    const labels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    const today = dateKey();
    return `<div class="week-days ${large ? 'week-days-large' : ''}">${stats.dates.map((date, index) => { const key = dateKey(date); const active = stats.activeSet.has(key); return `<div class="week-day ${active ? 'is-active' : ''} ${key === today ? 'is-today' : ''} ${key > today ? 'is-future' : ''}"><small>${labels[index]}</small><span aria-label="${key}${active ? ', actividad completada' : ''}">${active ? '✓' : date.getDate()}</span></div>`; }).join('')}</div>`;
  }
  function renderWeeklyDashboard() {
    const stats = weeklyStats();
    const activeCount = stats.activeDates.length;
    const progress = Math.min(100, Math.round(activeCount / 4 * 100));
    ['home-week-calendar', 'league-week-calendar', 'progress-week-calendar'].forEach(id => { const el = $(`#${id}`); if (el) el.innerHTML = calendarMarkup(stats, id === 'league-week-calendar'); });
    const assign = (id, value) => { const el = $(`#${id}`); if (el) el.textContent = value; };
    assign('top-streak', stats.streak); assign('home-streak', stats.streak); assign('progress-streak', stats.streak);
    assign('home-week-count', `${activeCount} de 4 días activos`); assign('league-week-count', `${activeCount} de 4 días activos`);
    assign('league-points', stats.points); assign('league-activities', stats.events.length); assign('league-active-days', `${activeCount} / 4`);
    assign('top-points', stats.points); assign('home-league-points', stats.points); assign('home-league-days', activeCount);
    assign('home-league-activities', Math.min(stats.events.length, 3));
    const homeLeagueProgress = $('#home-league-progress-fill');
    if (homeLeagueProgress) homeLeagueProgress.style.width = `${Math.min(100, Math.round(stats.events.length / 3 * 100))}%`;
    const topWeek = $('#top-week-dots');
    if (topWeek) topWeek.innerHTML = stats.dates.map(date => { const active = stats.activeSet.has(dateKey(date)); return `<span class="top-week-dot ${active ? 'is-active' : ''}" aria-hidden="true">${active ? '✓' : ''}</span>`; }).join('');
    assign('progress-week-summary', `${activeCount} de 4 días activos esta semana`);
    ['home-week-progress', 'league-week-progress'].forEach(id => { const el = $(`#${id}`); if (el) el.style.width = `${progress}%`; });
  }
  function recordActivity(id, points = 0) {
    const date = dateKey();
    if (!state.activityLog.some(item => item.date === date && item.id === id)) {
      state.activityLog.push({ date, id, points });
      state.activityLog = state.activityLog.slice(-500);
      saveState();
    }
    renderWeeklyDashboard();
  }

  function showView(name) {
    const view = $(`[data-view="${name}"]`);
    if (!view) return;
    $$('[data-view]').forEach(section => { const active = section.dataset.view === name; section.hidden = !active; section.classList.toggle('is-visible', active); });
    $$('[data-nav]').forEach(button => { const active = button.dataset.nav === name; button.classList.toggle('is-active', active); active ? button.setAttribute('aria-current', 'page') : button.removeAttribute('aria-current'); });
    const labels = { inicio: 'Inicio', danzas: 'Danzas del Perú', musica: 'Música peruana', explorar: 'Todas las lecciones', jugar: 'Retos y juegos', liga: 'Mi liga', progreso: 'Mi progreso' };
    futureAreas.forEach(area => { labels[area.id] = area.title; });
    $('#current-page-label').textContent = labels[name] || 'Inicio';
    if (name === 'inicio') renderHome();
    if (name === 'jugar' && !quizSession) renderQuizIntro();
    if (name === 'progreso') renderProgress();
    if (name === 'liga') renderWeeklyDashboard();
    if (name === 'danzas' || name === 'musica') renderAreaViews();
    if (futureAreas.some(area => area.id === name)) renderFutureArea(name);
    closeMobileMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function closeMobileMenu() {
    const sidebar = $('#sidebar'); const backdrop = $('#sidebar-backdrop'); const toggle = $('#mobile-menu-toggle');
    if (sidebar) sidebar.classList.remove('is-open');
    if (backdrop) backdrop.hidden = true;
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  function positionTutorialSpotlight() {
    if ($('#tutorial-layer').hidden || tutorialFinishedScreen) return;
    const target = $(tutorialSteps[tutorialIndex]?.target);
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const size = Math.min(Math.max(Math.max(rect.width, rect.height) + 34, 112), Math.min(window.innerWidth, window.innerHeight) * .72);
    const left = Math.max(12, Math.min(window.innerWidth - size - 12, rect.left + rect.width / 2 - size / 2));
    const top = Math.max(12, Math.min(window.innerHeight - size - 12, rect.top + rect.height / 2 - size / 2));
    const spot = $('#tutorial-spotlight');
    spot.style.width = `${size}px`; spot.style.height = `${size}px`; spot.style.left = `${left}px`; spot.style.top = `${top}px`;
  }

  function renderTutorialStep() {
    const layer = $('#tutorial-layer');
    tutorialFinishedScreen = tutorialIndex >= tutorialSteps.length;
    if (tutorialFinishedScreen) {
      $('#tutorial-step').textContent = 'RECORRIDO COMPLETADO';
      $('#tutorial-step').dataset.stepNumber = '✓';
      $('#tutorial-progress-fill').style.width = '100%';
      $('#tutorial-title').textContent = '¡Bienvenido a Qoyllur Ritmo!';
      $('#tutorial-copy').textContent = 'Tu recorrido está listo. Elige un área cultural y comienza a explorar a tu propio ritmo.';
      $('#tutorial-next').innerHTML = 'Comenzar a explorar <span aria-hidden="true">→</span>';
      $('#tutorial-skip').hidden = true;
      $('#tutorial-spotlight').style.display = 'none';
      $('#tutorial-next').focus();
      return;
    }
    const step = tutorialSteps[tutorialIndex];
    $('#tutorial-step').textContent = `PASO ${tutorialIndex + 1} DE ${tutorialSteps.length}`;
    $('#tutorial-step').dataset.stepNumber = String(tutorialIndex + 1);
    $('#tutorial-progress-fill').style.width = `${Math.round((tutorialIndex + 1) / tutorialSteps.length * 100)}%`;
    $('#tutorial-title').textContent = step.title;
    $('#tutorial-copy').textContent = step.copy;
    $('#tutorial-next').innerHTML = `${tutorialIndex === tutorialSteps.length - 1 ? 'Terminar recorrido' : 'Siguiente'} <span aria-hidden="true">→</span>`;
    $('#tutorial-skip').hidden = false;
    $('#tutorial-spotlight').style.display = '';
    window.requestAnimationFrame(positionTutorialSpotlight);
  }

  function startTutorial() {
    tutorialIndex = 0;
    tutorialFinishedScreen = false;
    document.body.classList.add('tutorial-active');
    const appShell = $('.app-shell');
    if (appShell) appShell.inert = true;
    $('#tutorial-layer').hidden = false;
    $('#tutorial-layer').setAttribute('aria-hidden', 'false');
    showView('inicio');
    renderTutorialStep();
    $('#tutorial-next').focus();
  }

  function endTutorial(status) {
    try { localStorage.setItem(TUTORIAL_KEY, JSON.stringify({ status, endedAt: new Date().toISOString() })); } catch { /* La guía sigue disponible durante esta sesión. */ }
    $('#tutorial-layer').hidden = true;
    $('#tutorial-layer').setAttribute('aria-hidden', 'true');
    document.body.classList.remove('tutorial-active');
    const appShell = $('.app-shell');
    if (appShell) appShell.inert = false;
    $('#tutorial-spotlight').style.display = 'none';
    $('#tutorial-skip').hidden = false;
  }

  function advanceTutorial() {
    if (tutorialFinishedScreen) { endTutorial('completed'); return; }
    tutorialIndex += 1;
    renderTutorialStep();
  }

  function renderCategoryCards(target) {
    target.innerHTML = [...content.categories, ...futureAreas].map(category => {
      const hasLessons = content.categories.some(item => item.id === category.id);
      const stats = hasLessons ? categoryPercent(category.id) : { completed: 0, total: 0, percent: 0 };
      const featured = content.lessons.find(item => item.category === category.id);
      const image = featured?.image || category.image;
      return `<button class="category-card category-${category.tone} category-theme-${category.id} ${hasLessons ? '' : 'category-coming-soon'}" type="button" data-category="${category.id}" aria-label="Explorar ${escapeHtml(category.title)}${hasLessons ? `. ${stats.completed} de ${stats.total} lecciones completadas` : '. Contenido en preparación'}">
        <span class="category-icon" aria-hidden="true">${category.icon}</span><span class="category-topline">${category.short} <span>${hasLessons ? `${stats.completed}/${stats.total}` : 'PRÓXIMAMENTE'}</span></span><strong>${escapeHtml(category.title)}</strong><span class="category-desc">${escapeHtml(category.description)}</span>
        ${hasLessons ? `<span class="category-progress"><span style="width:${stats.percent}%"></span></span><span class="category-bottom"><span>${stats.completed ? `${stats.completed} lección${stats.completed > 1 ? 'es' : ''} completada${stats.completed > 1 ? 's' : ''}` : 'Empieza a explorar'}</span><span aria-hidden="true">↗</span></span>` : '<span class="category-bottom"><span>Contenido en preparación</span><span aria-hidden="true">→</span></span>'}<img class="category-photo" src="${escapeHtml(image.src)}" alt="" loading="lazy" onerror="this.style.display='none'"><span class="category-photo-credit">${escapeHtml(image.credit || image.caption || '')}</span>
      </button>`;
    }).join('');
  }

  function renderFutureArea(id) {
    const area = futureAreas.find(item => item.id === id);
    const view = $(`#view-${id}`);
    if (!area || !view) return;
    const activeTab = areaTabs[id] || 'aprender';
    view.innerHTML = `<div class="area-cover future-area-cover area-${id}"><img src="${escapeHtml(area.image.src)}" alt="${escapeHtml(area.image.alt)}" onerror="this.closest('.future-area-cover').classList.add('image-missing');this.remove()"><div class="area-cover-shade"></div><div class="area-cover-copy"><p class="eyebrow">NUEVA ÁREA CULTURAL</p><h1 id="${id}-title">${escapeHtml(area.title)}<span class="title-period">.</span></h1><p>Este espacio está preparado para incorporar contenido educativo con fuentes verificadas.</p><a class="future-photo-credit" href="${escapeHtml(area.image.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(area.image.credit)} ↗</a></div></div><div class="area-subnav" role="tablist" aria-label="Secciones de ${escapeHtml(area.title)}">${['aprender','practicar','evaluar'].map((tab,index)=>`<button type="button" role="tab" id="${id}-tab-${tab}" aria-controls="${id}-panel-${tab}" aria-selected="${activeTab===tab}" class="area-subnav-button ${activeTab===tab?'is-active':''}" data-area-tab="${tab}" data-area-id="${id}">${['Aprender','Practicar','Evaluar'][index]}</button>`).join('')}</div>${['aprender','practicar','evaluar'].map((tab,index)=>`<section class="panel future-area-panel" role="tabpanel" id="${id}-panel-${tab}" aria-labelledby="${id}-tab-${tab}" data-area-panel="${tab}" ${activeTab!==tab?'hidden':''}><span class="area-step">0${index+1}</span><p class="eyebrow">${tab.toUpperCase()}</p><h2>${tab==='aprender'?'Lecciones breves':tab==='practicar'?'Actividades interactivas':'Comprueba lo aprendido'}</h2><p class="muted">${tab==='aprender'?'Las lecciones con imágenes y explicaciones se añadirán cuando el contenido esté listo.':tab==='practicar'?'Este espacio queda reservado para juegos y actividades de práctica.':'Los cuestionarios se incorporarán junto con sus lecciones.'}</p><span class="future-status">${tab==='aprender'?'CONTENIDO EN PREPARACIÓN':tab==='practicar'?'ACTIVIDADES PENDIENTES':'EVALUACIONES PENDIENTES'}</span></section>`).join('')}`;
  }

  function activateAreaTab(areaId, tabId) {
    if (!['aprender','practicar','evaluar'].includes(tabId)) return;
    const view = $(`#view-${areaId}`);
    if (!view) return;
    areaTabs[areaId] = tabId;
    $$('[data-area-tab]', view).forEach(button => {
      const active = button.dataset.areaTab === tabId;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
    $$('[data-area-panel]', view).forEach(panel => {
      const active = panel.dataset.areaPanel === tabId;
      panel.hidden = !active;
      if (active) { panel.setAttribute('role','tabpanel'); panel.setAttribute('aria-labelledby',`${areaId}-tab-${tabId}`); }
    });
  }

  function lessonCard(lesson, index) {
    const completed = state.completed.includes(lesson.id);
    const started = state.started.includes(lesson.id);
    const status = completed ? 'Completada' : started ? 'En curso' : 'Por descubrir';
    const action = completed ? 'Repetir lección' : started ? 'Continuar lección' : 'Empezar lección';
    const tone = /Amazonía|Wachiperi/i.test(lesson.region) ? 'amazon' : /afroperuana/i.test(lesson.region) ? 'afro' : /Andes|Altiplano|Apurímac|Ayacucho|Huancavelica|Puno/i.test(lesson.region) ? 'andes' : 'coast';
    return `<article class="lesson-card culture-${tone} ${completed ? 'is-complete' : ''}">
      <button class="lesson-image-button" type="button" data-lesson="${lesson.id}" aria-label="${action}: ${escapeHtml(lesson.title)}"><img src="${escapeHtml(lesson.image.src)}" alt="${escapeHtml(lesson.image.alt)}" loading="lazy" onerror="this.closest('.lesson-image-button').classList.add('image-missing');this.remove()"><span class="lesson-image-index">0${index + 1}</span><span class="image-credit">Foto ↗</span></button>
      <div class="lesson-card-body"><div class="lesson-meta"><span>${escapeHtml(lesson.region)}</span><span>·</span><span>${lesson.duration}</span></div><h3>${escapeHtml(lesson.title)}</h3><p>${escapeHtml(lesson.summary)}</p><div class="lesson-card-footer"><span class="lesson-status ${completed ? 'done' : started ? 'started' : ''}"><i></i>${status}</span><button class="lesson-open" type="button" data-lesson="${lesson.id}">${action} <span aria-hidden="true">→</span></button></div></div>
    </article>`;
  }

  function renderLessonGroups() {
    const target = $('#lesson-groups');
    const categories = activeFilter === 'all' ? content.categories : content.categories.filter(category => category.id === activeFilter);
    target.innerHTML = categories.map(category => {
      const lessons = content.lessons.filter(item => item.category === category.id);
      const progress = categoryPercent(category.id);
      return `<section class="lesson-group"><div class="group-heading"><div><span class="group-icon ${category.tone}" aria-hidden="true">${category.icon}</span><div><p class="eyebrow">${category.short.toUpperCase()}</p><h2>${escapeHtml(category.title)}</h2></div></div><span class="group-progress">${progress.completed} de ${progress.total} completadas</span></div><div class="lesson-card-grid">${lessons.map((lesson, index) => lessonCard(lesson, index)).join('')}</div></section>`;
    }).join('');
    renderRoute($('#explore-route'));
    $('#route-completed-count').textContent = `${state.completed.length}/6`;
  }

  const associationPairs = {
    danzas: [
      { id: 'lamista', left: 'Marinera de Lamas', right: 'San Martín' },
      { id: 'tijeras', left: 'Danza de las tijeras', right: 'Hojas metálicas articuladas' },
      { id: 'pallitas', left: 'Las Pallitas', right: 'Guitarra' }
    ],
    musica: [
      { id: 'siku', left: 'Siku en Conima', right: 'Partes arka e ira' },
      { id: 'cajon', left: 'Cajón peruano', right: 'Música afroperuana' },
      { id: 'esuwa', left: 'Esuwa', right: 'Cánticos Wachiperi en lengua Harakbut' }
    ]
  };
  function shuffled(items) { const result = [...items]; for (let index = result.length - 1; index > 0; index -= 1) { const other = Math.floor(Math.random() * (index + 1)); [result[index], result[other]] = [result[other], result[index]]; } return result; }
  function renderAssociation(categoryId) {
    const target = $(`#association-${categoryId}`);
    if (!target) return;
    const session = matchSessions[categoryId];
    if (!session) {
      target.innerHTML = `<div class="association-intro"><span class="association-symbol" aria-hidden="true">⤳</span><div><strong>Conecta las parejas</strong><p>Relaciona cada expresión con un dato de su lección.</p></div><button class="button button-outline" type="button" data-start-match="${categoryId}">Empezar juego</button></div>`;
      return;
    }
    const leftItems = session.pairs;
    const rightItems = session.rightOrder;
    target.innerHTML = `<div class="association-head"><p>${session.complete ? '¡Todas las parejas conectadas!' : 'Elige un concepto y encuentra su relación.'}</p><span>${session.matched.length}/${session.pairs.length}</span></div><div class="association-board"><div class="association-column">${leftItems.map(pair => `<button class="match-choice ${session.matched.includes(pair.id) ? 'is-matched' : ''} ${session.selectedLeft === pair.id ? 'is-selected' : ''}" type="button" data-match-area="${categoryId}" data-match-side="left" data-match-id="${pair.id}" ${session.matched.includes(pair.id) || session.complete ? 'disabled' : ''}>${pair.left}</button>`).join('')}</div><div class="association-column">${rightItems.map(pair => `<button class="match-choice ${session.matched.includes(pair.id) ? 'is-matched' : ''} ${session.selectedRight === pair.id ? 'is-selected' : ''}" type="button" data-match-area="${categoryId}" data-match-side="right" data-match-id="${pair.id}" ${session.matched.includes(pair.id) || session.complete ? 'disabled' : ''}>${pair.right}</button>`).join('')}</div></div><p class="association-feedback ${session.complete ? 'is-success' : ''}" aria-live="polite">${session.message || 'El juego no tiene límite de tiempo.'}</p>${session.complete ? '<button class="text-link" type="button" data-reset-match="' + categoryId + '">Volver a jugar ↻</button>' : ''}`;
  }
  function renderAreaViews() {
    content.categories.forEach(category => {
      const view = $(`#view-${category.id}`);
      if (!view) return;
      const lessons = content.lessons.filter(lesson => lesson.category === category.id);
      const stats = categoryPercent(category.id);
      const featured = lessons[0];
      const activeTab = areaTabs[category.id] || 'aprender';
      view.innerHTML = `<div class="area-cover area-${category.id}"><img src="${escapeHtml(featured.image.src)}" alt="${escapeHtml(featured.image.alt)}" onerror="this.closest('.area-cover').classList.add('image-missing');this.remove()"><div class="area-cover-shade"></div><div class="area-cover-copy"><p class="eyebrow">ÁREA CULTURAL · ${stats.completed}/${stats.total} LECCIONES</p><h1 id="${category.id}-title">${escapeHtml(category.title)}<span class="title-period">.</span></h1><p>${escapeHtml(category.description)}</p></div></div><div class="area-subnav" role="tablist" aria-label="Secciones de ${escapeHtml(category.title)}">${['aprender','practicar','evaluar'].map((tab,index)=>`<button type="button" role="tab" id="${category.id}-tab-${tab}" aria-controls="${category.id}-panel-${tab}" aria-selected="${activeTab===tab}" class="area-subnav-button ${activeTab===tab?'is-active':''}" data-area-tab="${tab}" data-area-id="${category.id}">${['Aprender','Practicar','Evaluar'][index]}</button>`).join('')}</div><section class="area-block learn-block" id="${category.id}-panel-aprender" role="tabpanel" aria-labelledby="${category.id}-tab-aprender" data-area-panel="aprender" ${activeTab!=='aprender'?'hidden':''}><div class="area-block-heading"><span class="area-step">01</span><div><p class="eyebrow">APRENDER</p><h2>Historias en pequeñas dosis</h2><p class="muted">Lecciones breves, fotografías y datos culturales.</p></div></div><div class="lesson-card-grid area-lesson-grid">${lessons.map((lesson, index) => lessonCard(lesson, index)).join('')}</div></section><section class="area-block play-block" id="${category.id}-panel-practicar" role="tabpanel" aria-labelledby="${category.id}-tab-practicar" data-area-panel="practicar" ${activeTab!=='practicar'?'hidden':''}><div class="area-block-heading"><span class="area-step">02</span><div><p class="eyebrow">PRACTICAR</p><h2>Conecta lo que descubriste</h2><p class="muted">Asocia expresiones con lugares, objetos y prácticas descritos en las lecciones.</p></div></div><section class="panel association-card" id="association-${category.id}"></section><div class="activity-roadmap"><span class="roadmap-icon" aria-hidden="true">✧</span><span>${category.id==='musica'?'Reconocimiento de instrumentos y asociación de sonidos · espacio preparado para próximas actividades.':'Reconocimiento de imágenes y nuevos retos de danza · espacio preparado para próximas actividades.'}</span></div></section><section class="area-block prove-block" id="${category.id}-panel-evaluar" role="tabpanel" aria-labelledby="${category.id}-tab-evaluar" data-area-panel="evaluar" ${activeTab!=='evaluar'?'hidden':''}><div class="area-block-heading"><span class="area-step">03</span><div><p class="eyebrow">EVALUAR</p><h2>Demuestra lo que sabes</h2><p class="muted">Preguntas relacionadas con esta área, con explicación al responder.</p></div></div><section class="panel prove-card"><div><span class="prove-badge" aria-hidden="true">✓</span><strong>${escapeHtml(category.title)}</strong><p class="muted">${content.trivia.filter(question => lessonMap[question.lesson]?.category === category.id).length} preguntas · sin gastar baterías</p></div><button class="button button-dark" type="button" data-area-quiz="${category.id}">Empezar reto <span aria-hidden="true">→</span></button></section></section>`;
      renderAssociation(category.id);
    });
  }
  function startMatch(categoryId) {
    const pairs = associationPairs[categoryId];
    if (!pairs) return;
    matchSessions[categoryId] = { pairs, rightOrder: shuffled(pairs), selectedLeft: null, selectedRight: null, matched: [], message: '', complete: false };
    renderAssociation(categoryId);
  }
  function chooseMatch(area, side, id) {
    const session = matchSessions[area];
    if (!session || session.complete || session.matched.includes(id)) return;
    if (side === 'left') {
      session.selectedLeft = id;
      session.selectedRight = null;
      session.message = 'Ahora elige la pareja correcta.';
    } else if (!session.selectedLeft) {
      session.message = 'Primero elige un concepto de la izquierda.';
    } else if (session.selectedLeft === id) {
      session.matched.push(id);
      session.selectedLeft = null;
      session.selectedRight = null;
      session.message = session.matched.length === session.pairs.length ? '¡Buen ojo! Has completado este reto.' : '¡Coincide! Sigue con otra pareja.';
      if (session.matched.length === session.pairs.length) {
        session.complete = true;
        recordActivity(`association-${area}`, 12);
      }
    } else {
      session.selectedLeft = null;
      session.selectedRight = id;
      session.message = 'Esa pareja no coincide. Puedes volver a elegir.';
    }
    renderAssociation(area);
  }

  function renderRoute(target) {
    const compact = target.classList.contains('compact');
    const points = content.lessons.map((lesson, index) => {
      const x = compact ? (index % 2 === 0 ? 26 : 74) : (index % 2 === 0 ? 37 : 63);
      const y = compact ? 25 + index * 38 : 22 + index * 68;
      const status = state.completed.includes(lesson.id) ? 'completed' : state.started.includes(lesson.id) ? 'started' : !hasUnlimitedEnergy() && state.batteries <= 0 ? 'locked' : 'available';
      return { lesson, x, y, status, number: index + 1 };
    });
    const height = compact ? 250 : 22 + (points.length - 1) * 68 + 34;
    const paths = points.slice(0, -1).map((point, index) => { const next = points[index + 1]; const controlY = (point.y + next.y) / 2; return `<path d="M ${point.x} ${point.y} C ${point.x} ${controlY}, ${next.x} ${controlY}, ${next.x} ${next.y}" />`; }).join('');
     target.innerHTML = `<div class="route-map ${target.classList.contains('compact') ? 'is-compact' : ''}" style="--route-height:${height}px"><svg class="route-connector" viewBox="0 0 100 ${height}" preserveAspectRatio="none" aria-hidden="true">${paths}</svg>${points.map(point => `<button type="button" class="route-node ${point.status}" data-lesson="${point.lesson.id}" style="--node-x:${point.x}%;--node-y:${point.y}px" aria-label="Lección ${point.number}: ${escapeHtml(point.lesson.title)}. ${point.status === 'completed' ? 'Completada' : point.status === 'started' ? 'En curso' : point.status === 'locked' ? 'Sin energía disponible' : 'Disponible'}"><span class="node-number">${point.status === 'completed' ? '✓' : point.status === 'locked' ? '⌑' : point.number}</span><span class="node-label"><small>${escapeHtml(point.lesson.region)}</small><strong>${escapeHtml(point.lesson.shortTitle)}</strong></span></button>`).join('')}</div>`;
  }

  function renderHome() {
    renderCategoryCards($('#home-categories'));
    const nextLesson = content.lessons.find(lesson => !state.completed.includes(lesson.id));
    $('#sidebar-progress-fill').style.width = `${percentComplete()}%`;
    $('#sidebar-progress-label').textContent = `${state.completed.length} de 6 lecciones`;
    $('#home-progress-label').textContent = `${state.completed.length} de ${content.lessons.length}`;
    $('#home-progress-fill').style.width = `${percentComplete()}%`;
    $('#home-progress-percent').textContent = `${percentComplete()}%`;
    const heroPhoto = $('#home-hero-photo');
    if (heroPhoto) { heroPhoto.src = heroAsset.src; heroPhoto.alt = 'Vista panorámica de Machu Picchu, en Cusco'; }
    const heroCredit = $('#home-hero-credit');
    if (heroCredit) { heroCredit.href = heroAsset.href; heroCredit.textContent = heroAsset.credit; }
    $('#home-best-score').textContent = `Trivia · mejor resultado ${state.bestTrivia === null ? '—' : state.bestTrivia}/8`;
    const lesson = nextLesson || content.lessons[0];
    $('#home-recommendation-card').innerHTML = `<div class="recommendation-image"><img src="${escapeHtml(lesson.image.src)}" alt="${escapeHtml(lesson.image.alt)}" loading="lazy" onerror="this.closest('.recommendation-image').classList.add('image-missing');this.remove()"><span>${escapeHtml(lesson.region)}</span></div><div class="recommendation-copy"><p class="eyebrow">${nextLesson ? 'ACTIVIDAD RECOMENDADA' : 'PARA VOLVER A EXPLORAR'}</p><h2>${escapeHtml(lesson.title)}</h2><p class="muted">${escapeHtml(lesson.summary)}</p><button class="button button-dark" type="button" data-lesson="${lesson.id}">${nextLesson ? 'Continuar aprendiendo' : 'Repetir lección'} <span aria-hidden="true">→</span></button></div>`;
    renderWeeklyDashboard();
  }

  function renderBatteryStatus() {
    const refilled = reconcileEnergy();
    const unlimited = hasUnlimitedEnergy();
    $('#battery-count').textContent = unlimited ? '∞' : state.batteries;
    $('#battery-cap').textContent = unlimited ? '∞' : cap();
    $('#stat-batteries').innerHTML = unlimited ? '∞ <small>ilimitadas</small>' : `${state.batteries} <small>/ ${cap()}</small>`;
    const meter = $('#battery-meter');
    if (meter) meter.innerHTML = unlimited ? '<span class="battery-unlimited">∞ Energía ilimitada</span>' : Array.from({ length: cap() }, (_, index) => `<span class="battery-cell ${index < state.batteries ? 'filled' : ''}" aria-hidden="true">⚡</span>`).join('');
    const timer = $('#battery-timer');
    if (timer) {
      if (unlimited) timer.textContent = 'Tu plan Premium no necesita recargas.';
      else if (state.batteries >= cap()) timer.textContent = 'Baterías completas';
      else if (state.refillAt) timer.textContent = `Recarga completa en ${formatRemaining(state.refillAt - Date.now())}`;
      else timer.textContent = 'La recarga completa comenzará al usar una batería.';
    }
    if (refilled) { renderHome(); renderLessonGroups(); }
  }
  function formatRemaining(ms) { const totalMinutes = Math.max(0, Math.ceil(ms / 60000)); const hours = Math.floor(totalMinutes / 60); const minutes = totalMinutes % 60; return `${hours} h ${String(minutes).padStart(2, '0')} min`; }

  function renderProgress() {
    renderBatteryStatus();
    $('#stat-lessons').innerHTML = `${state.completed.length} <small>/ 6</small>`;
    $('#stat-trivia').innerHTML = state.bestTrivia === null ? '— <small>/ 8</small>' : `${state.bestTrivia} <small>/ 8</small>`;
    $('#best-score').textContent = state.bestTrivia === null ? '—' : state.bestTrivia;
    $('#best-score-total').textContent = '/ 8';
    $('#route-completed-count').textContent = `${state.completed.length}/6`;
    $('#category-progress-list').innerHTML = content.categories.map(category => {
      const stats = categoryPercent(category.id);
      return `<div class="category-progress-row"><div class="progress-row-icon ${category.tone}" aria-hidden="true">${category.icon}</div><div class="progress-row-info"><div class="progress-row-top"><strong>${escapeHtml(category.title)}</strong><span>${stats.completed}/${stats.total}</span></div><div class="progress-bar"><span style="width:${stats.percent}%"></span></div></div></div>`;
    }).join('');
    renderMemberships();
    renderWeeklyDashboard();
    const adButton = $('#ad-reward');
    if (adButton) {
      const adNote = adButton.nextElementSibling;
      if (state.plan === 'plus' || state.plan === 'premium') {
        adButton.hidden = true;
        if (adNote) adNote.textContent = 'Tu plan incluye una experiencia sin anuncios.';
      } else {
        adButton.hidden = false;
        if (adNote) adNote.textContent = 'Opción de demostración; no se reproducen anuncios ni se recopilan datos.';
      }
    }
  }

  function renderMemberships() {
    $('#membership-grid').innerHTML = content.memberships.map(plan => `<article class="membership-card ${plan.id === state.plan ? 'is-current' : ''} ${plan.id === 'plus' ? 'is-featured' : ''}"><div class="membership-card-top"><h3>${escapeHtml(plan.name)}</h3>${plan.id === state.plan ? '<span class="current-tag">ACTUAL</span>' : plan.id === 'plus' ? '<span class="popular-tag">POPULAR</span>' : ''}</div><div class="plan-price">${escapeHtml(plan.price)} <small>${escapeHtml(plan.period)}</small></div><ul>${plan.perks.map(perk => `<li><span aria-hidden="true">✓</span>${escapeHtml(perk)}</li>`).join('')}</ul><button class="button ${plan.id === state.plan ? 'button-current' : 'button-plan'}" type="button" data-plan="${plan.id}" ${plan.id === state.plan ? 'disabled' : ''}>${plan.id === state.plan ? 'Plan actual' : 'Probar en demo'}</button></article>`).join('');
  }

  function renderQuizIntro() {
    const bonus = state.plan === 'plus' || state.plan === 'premium';
    $('#trivia-card').innerHTML = `<div class="trivia-start"><div class="quiz-burst" aria-hidden="true">✳</div><p class="eyebrow">TRIVIA CULTURAL · 8 PREGUNTAS</p><h2>¿Cuánto sabes<br>de nuestros ritmos?</h2><p class="muted">Responde, descubre y conecta historias de distintas regiones del Perú.</p><div class="quiz-start-details"><span><b>08</b> preguntas</span><span><b>✦</b> retroalimentación</span><span><b>∞</b> intentos</span></div><div class="quiz-start-actions"><button class="button button-dark button-large" type="button" id="start-quiz">Empezar trivia <span aria-hidden="true">→</span></button>${bonus ? '<button class="button button-outline" type="button" id="start-bonus">Reto relámpago · 3 preguntas ✦</button>' : ''}</div><span class="trivia-footer-note">No necesitas baterías para jugar</span></div>`;
    $('#best-score').textContent = state.bestTrivia === null ? '—' : state.bestTrivia;
    $('#best-score-total').textContent = '/ 8';
  }

  function startQuiz(mode = 'main', category = null) {
    const questions = category ? content.trivia.filter(question => lessonMap[question.lesson]?.category === category) : mode === 'bonus' ? [content.trivia[1], content.trivia[4], content.trivia[6]] : content.trivia;
    if (!questions.length) return;
    quizSession = { index: 0, score: 0, selected: null, answered: false, mode, category, activityId: category ? `area-quiz-${category}` : mode === 'bonus' ? 'bonus-quiz' : 'main-trivia', questions: questionUtils.prepareQuestions(questions) };
    renderQuizQuestion();
  }
  function renderQuizQuestion() {
    const q = quizSession.questions[quizSession.index];
    const total = quizSession.questions.length;
    const progress = (quizSession.index / total) * 100;
    $('#trivia-card').innerHTML = `<div class="trivia-question"><div class="quiz-topline"><span class="eyebrow">${quizSession.mode === 'bonus' ? 'RETO RELÁMPAGO' : 'PREGUNTA'} ${String(quizSession.index + 1).padStart(2, '0')} <span class="muted">/ ${String(total).padStart(2, '0')}</span></span><button type="button" class="quiz-exit" id="quiz-exit">Salir</button></div><div class="quiz-progress"><span style="width:${progress}%"></span></div><h2>${escapeHtml(q.prompt)}</h2><div class="quiz-options" role="group" aria-label="Opciones de respuesta">${q.options.map((option, index) => `<button class="quiz-option ${quizSession.selected === option.id ? 'selected' : ''}" type="button" data-answer="${escapeHtml(option.id)}" ${quizSession.answered ? 'disabled' : ''}><span class="option-key">${String.fromCharCode(65 + index)}</span><span>${escapeHtml(option.text)}</span><span class="option-state" aria-hidden="true">${quizSession.answered && option.id === q.correctOptionId ? '✓' : quizSession.answered && option.id === quizSession.selected ? '×' : ''}</span></button>`).join('')}</div>${quizSession.answered ? `<div class="answer-feedback ${questionUtils.isCorrectOption(q, quizSession.selected) ? 'correct' : 'incorrect'}"><strong>${questionUtils.isCorrectOption(q, quizSession.selected) ? '¡Muy bien!' : 'Sigue aprendiendo'}</strong><p>${escapeHtml(q.explanation)}</p><button class="text-link" type="button" data-review="${q.lesson}">Repasar esta lección <span aria-hidden="true">↗</span></button></div>` : '<p class="answer-hint">Elige una opción para responder.</p>'}<div class="quiz-actions">${quizSession.answered ? `<button class="button button-dark" type="button" id="quiz-next">${quizSession.index === total - 1 ? 'Ver resultado' : 'Siguiente pregunta'} <span aria-hidden="true">→</span></button>` : `<button class="button button-dark" type="button" id="quiz-submit" ${quizSession.selected === null ? 'disabled' : ''}>Comprobar respuesta <span aria-hidden="true">→</span></button>`}</div></div>`;
  }
  function finishQuiz() {
    const score = quizSession.score;
    const total = quizSession.questions.length;
    const isBest = quizSession.mode === 'main' && !quizSession.category && (state.bestTrivia === null || score > state.bestTrivia);
    if (isBest) { state.bestTrivia = score; saveState(); }
    $('#best-score').textContent = state.bestTrivia === null ? '—' : state.bestTrivia;
    const bestMessage = quizSession.category ? `Reto de ${categoryMap[quizSession.category].title} completado · ${score}/${total}.` : quizSession.mode === 'bonus' ? `Reto extra completado · ${score}/${total}.` : isBest ? '¡Nuevo récord personal!' : score === state.bestTrivia ? `Igualaste tu mejor puntaje: ${state.bestTrivia}/8.` : `Tu mejor resultado sigue siendo ${state.bestTrivia}/8.`;
    const completedMode = quizSession.category ? 'RETO DEL ÁREA COMPLETADO' : quizSession.mode === 'bonus' ? 'RETO COMPLETADO' : 'TRIVIA COMPLETADA';
    const retryCategory = quizSession.category || '';
    recordActivity(`quiz-${quizSession.activityId}`, 8 + score * 2);
    $('#trivia-card').innerHTML = `<div class="trivia-result"><div class="result-medal" aria-hidden="true">${score >= Math.ceil(total * .75) ? '✦' : '♫'}</div><p class="eyebrow">${completedMode}</p><h2>${score >= Math.ceil(total * .75) ? '¡Qué buen oído!' : 'Cada respuesta suma!'}</h2><p class="muted">Tu resultado en esta ronda</p><div class="result-score">${score}<span>/ ${total}</span></div><p class="result-best">${bestMessage}</p><div class="result-actions"><button class="button button-dark" type="button" id="retry-quiz" data-mode="${quizSession.mode}" data-category="${retryCategory}">Intentar otra vez</button><button class="button button-outline" type="button" data-nav="${retryCategory || 'explorar'}">${retryCategory ? 'Volver al área' : 'Explorar lecciones'}</button></div></div>`;
    quizSession = null;
  }

  function openLesson(id) {
    const lesson = lessonMap[id];
    if (!lesson) return;
    const completed = state.completed.includes(id);
    const alreadyStarted = state.started.includes(id);
    if (!completed && !alreadyStarted && !hasUnlimitedEnergy() && state.batteries <= 0) {
      showNotice('Te faltan baterías', 'Has usado todas tus baterías disponibles. Se recargan por completo cada 24 horas. También puedes recuperar una con un anuncio voluntario cuando esa opción esté habilitada.');
      return;
    }
    if (!completed && !alreadyStarted && !hasUnlimitedEnergy()) {
      state.batteries -= 1;
      state.started.push(id);
      if (!state.refillAt) state.refillAt = Date.now() + REFILL_MS;
      saveState();
      renderHome();
      renderLessonGroups();
    }
    dialogLesson = id;
    lessonOptionOrder = questionUtils.shuffleOptions(lesson.question.options);
    renderLessonDialog(lesson);
    renderBatteryStatus();
    const dialog = $('#lesson-dialog');
    if (!dialog.open) dialog.showModal();
    $('#close-lesson').focus();
  }

  function renderLessonDialog(lesson) {
    const savedAnswer = state.lessonAnswers?.[lesson.id];
    const selected = savedAnswer && typeof savedAnswer === 'object' ? savedAnswer.selected : null;
    const answered = Boolean(savedAnswer && typeof savedAnswer === 'object' && savedAnswer.checked);
    const feedback = answered ? `<div class="lesson-answer-feedback ${questionUtils.isCorrectOption(lesson.question, selected) ? 'correct' : 'incorrect'}"><strong>${questionUtils.isCorrectOption(lesson.question, selected) ? '¡Correcto!' : 'Vuelve a intentarlo'}</strong><p>${escapeHtml(lesson.question.feedback)}</p></div>` : '';
    const completed = state.completed.includes(lesson.id);
      $('#lesson-dialog-content').innerHTML = `<article class="lesson-detail"><div class="lesson-detail-image"><img src="${escapeHtml(lesson.image.src)}" alt="${escapeHtml(lesson.image.alt)}" onerror="this.closest('.lesson-detail-image').classList.add('image-missing');this.remove()"><span class="detail-image-caption"><a href="${escapeHtml(lesson.image.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(lesson.image.caption)} ↗</a></span></div><div class="lesson-detail-copy"><div class="lesson-meta"><span>${escapeHtml(categoryMap[lesson.category].title)}</span><span>·</span><span>${escapeHtml(lesson.region)}</span><span>·</span><span>${lesson.duration}</span></div><h1 id="lesson-dialog-title">${escapeHtml(lesson.title)}</h1><div class="objective-box"><span class="objective-icon" aria-hidden="true">◎</span><div><strong>Al terminar podrás</strong><p>${escapeHtml(lesson.objective)}</p></div></div><p class="lesson-intro">${escapeHtml(lesson.intro)}</p><div class="lesson-sections">${lesson.sections.map((section, index) => `<section><span class="section-number">0${index + 1}</span><div><h2>${escapeHtml(section.heading)}</h2><p>${escapeHtml(section.body)}</p></div></section>`).join('')}</div><aside class="cultural-fact"><span aria-hidden="true">✦</span><div><strong>Dato cultural</strong><p>${escapeHtml(lesson.fact)}</p></div></aside><section class="comprehension"><p class="eyebrow">COMPRUEBA LO APRENDIDO</p><h2>${escapeHtml(lesson.question.text)}</h2><div class="comprehension-options">${lessonOptionOrder.map((option, index) => `<button class="comprehension-option ${selected === option.id ? 'selected' : ''} ${answered && questionUtils.isCorrectOption(lesson.question, selected) && option.id === selected ? 'correct' : answered && option.id === selected && !questionUtils.isCorrectOption(lesson.question, selected) ? 'incorrect' : ''}" type="button" data-comprehension="${escapeHtml(option.id)}" aria-pressed="${selected === option.id}"><span>${String.fromCharCode(65 + index)}</span>${escapeHtml(option.text)}</button>`).join('')}</div>${feedback}<button class="button button-outline" type="button" id="check-comprehension" ${selected === null || answered ? 'disabled' : ''}>Comprobar respuesta</button></section><div class="lesson-complete-row"><button class="button button-dark" type="button" id="mark-complete" ${completed ? 'disabled' : !answered || !questionUtils.isCorrectOption(lesson.question, selected) ? 'disabled' : ''}>${completed ? '✓ Lección completada' : 'Marcar como completada'}</button><span>${completed ? 'Puedes repetirla cuando quieras, sin gastar baterías.' : questionUtils.isCorrectOption(lesson.question, selected) && answered ? '¡Respuesta correcta! Ya puedes completar la lección.' : 'Responde correctamente para completar esta lección.'}</span></div></div></article>`;
  }

  function showNotice(title, copy) {
    $('#notice-title').textContent = title;
    $('#notice-copy').textContent = copy;
    const dialog = $('#notice-dialog');
    if (!dialog.open) dialog.showModal();
    $('#close-notice').focus();
  }
  function closeLesson() { const dialog = $('#lesson-dialog'); if (dialog.open) dialog.close(); dialogLesson = null; renderHome(); renderLessonGroups(); renderProgress(); }
  function openLessonFromCurrent(id) { showView('explorar'); openLesson(id); }

  document.addEventListener('click', event => {
    if (!$('#tutorial-layer').hidden) {
      if (event.target.closest('#tutorial-next')) { advanceTutorial(); return; }
      if (event.target.closest('#tutorial-skip')) { endTutorial('skipped'); return; }
      if (event.target.closest('.tutorial-card')) return;
      return;
    }
    const areaTab = event.target.closest('[data-area-tab]');
    if (areaTab) { activateAreaTab(areaTab.dataset.areaId, areaTab.dataset.areaTab); return; }
    if (event.target.closest('#replay-tutorial')) { startTutorial(); return; }
    if (event.target.closest('#mobile-menu-toggle')) {
      const sidebar = $('#sidebar'); const backdrop = $('#sidebar-backdrop'); const toggle = $('#mobile-menu-toggle');
      const open = !sidebar.classList.contains('is-open');
      sidebar.classList.toggle('is-open', open); backdrop.hidden = !open; toggle.setAttribute('aria-expanded', String(open)); return;
    }
    if (event.target.closest('#sidebar-backdrop')) { closeMobileMenu(); return; }
    const nav = event.target.closest('[data-nav]');
    if (nav) { showView(nav.dataset.nav); return; }
    const lessonButton = event.target.closest('[data-lesson]');
    if (lessonButton) { openLesson(lessonButton.dataset.lesson); return; }
    const categoryButton = event.target.closest('[data-category]');
    if (categoryButton) { showView(categoryButton.dataset.category); return; }
    const filter = event.target.closest('[data-filter]');
    if (filter) { activeFilter = filter.dataset.filter; $$('.filter-tab').forEach(button => { const active = button === filter; button.classList.toggle('is-selected', active); button.setAttribute('aria-pressed', String(active)); }); renderLessonGroups(); return; }
    const planButton = event.target.closest('[data-plan]');
    if (planButton && planButton.dataset.plan !== state.plan) {
      const nextPlan = content.memberships.find(plan => plan.id === planButton.dataset.plan);
      const previousCap = cap();
      const wasUnlimited = hasUnlimitedEnergy();
      state.plan = nextPlan.id;
      if (nextPlan.id !== 'premium') {
        if (wasUnlimited) { state.batteries = nextPlan.batteries; state.refillAt = null; }
        else state.batteries = Math.min(state.batteries + Math.max(0, nextPlan.batteries - previousCap), nextPlan.batteries);
      }
      if (state.batteries >= cap()) state.refillAt = null;
      saveState(); renderProgress(); renderBatteryStatus(); renderHome(); renderLessonGroups(); renderQuizIntro(); showNotice('Plan de demostración activado', `${nextPlan.name} está activo en esta demostración. No se realizó ningún cobro ni se solicitaron datos bancarios.`); return;
    }
    const answer = event.target.closest('[data-answer]');
    if (answer && quizSession && !quizSession.answered) { quizSession.selected = answer.dataset.answer; renderQuizQuestion(); return; }
    const lessonAnswer = event.target.closest('[data-comprehension]');
    if (lessonAnswer && dialogLesson) { state.lessonAnswers = state.lessonAnswers || {}; state.lessonAnswers[dialogLesson] = { selected: lessonAnswer.dataset.comprehension, checked: false }; saveState(); renderLessonDialog(lessonMap[dialogLesson]); return; }
    const review = event.target.closest('[data-review]');
    if (review) { if (quizSession) { quizSession = null; renderQuizIntro(); } openLessonFromCurrent(review.dataset.review); return; }
    const practiceLink = event.target.closest('[data-open-practice]');
    if (practiceLink) {
      const category = practiceLink.dataset.openPractice;
      showView(category); activateAreaTab(category, 'practicar'); startMatch(category);
      $(`#${category}-panel-practicar`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return;
    }
    const startMatchButton = event.target.closest('[data-start-match]');
    if (startMatchButton) { startMatch(startMatchButton.dataset.startMatch); return; }
    const matchChoice = event.target.closest('[data-match-side]');
    if (matchChoice) { chooseMatch(matchChoice.dataset.matchArea, matchChoice.dataset.matchSide, matchChoice.dataset.matchId); return; }
    const resetMatchButton = event.target.closest('[data-reset-match]');
    if (resetMatchButton) { matchSessions[resetMatchButton.dataset.resetMatch] = null; renderAssociation(resetMatchButton.dataset.resetMatch); return; }
    const areaQuizButton = event.target.closest('[data-area-quiz]');
    if (areaQuizButton) { showView('jugar'); startQuiz('area', areaQuizButton.dataset.areaQuiz); $('#trivia-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    if (event.target.closest('#start-quiz')) { startQuiz(); return; }
    if (event.target.closest('#start-bonus') && (state.plan === 'plus' || state.plan === 'premium')) { startQuiz('bonus'); return; }
    if (event.target.closest('#quiz-submit') && quizSession && quizSession.selected !== null) {
      quizSession.answered = true;
      quizSession.score = questionUtils.nextScore(quizSession.score, quizSession.questions[quizSession.index], quizSession.selected);
      renderQuizQuestion(); return;
    }
    if (event.target.closest('#quiz-next') && quizSession) { if (quizSession.index === quizSession.questions.length - 1) finishQuiz(); else { quizSession.index += 1; quizSession.selected = null; quizSession.answered = false; renderQuizQuestion(); } return; }
    if (event.target.closest('#quiz-exit')) { quizSession = null; renderQuizIntro(); return; }
    if (event.target.closest('#retry-quiz')) { const retry = event.target.closest('#retry-quiz'); startQuiz(retry.dataset.mode || 'main', retry.dataset.category || null); return; }
    if (event.target.closest('#check-comprehension') && dialogLesson) { const saved = state.lessonAnswers?.[dialogLesson]; if (saved && typeof saved === 'object') saved.checked = true; saveState(); renderLessonDialog(lessonMap[dialogLesson]); announce(questionUtils.isCorrectOption(lessonMap[dialogLesson].question, saved?.selected) ? 'Respuesta correcta.' : 'Respuesta incorrecta. Revisa la explicación y vuelve a intentarlo.'); return; }
    if (event.target.closest('#mark-complete') && dialogLesson) { const saved = state.lessonAnswers?.[dialogLesson]; if (saved?.checked && questionUtils.isCorrectOption(lessonMap[dialogLesson].question, saved.selected) && !state.completed.includes(dialogLesson)) { state.completed.push(dialogLesson); saveState(); recordActivity(`lesson-${dialogLesson}`, 10); renderLessonDialog(lessonMap[dialogLesson]); renderHome(); renderLessonGroups(); renderAreaViews(); renderProgress(); const node = $(`.route-node[data-lesson="${dialogLesson}"]`); if (node) { node.classList.add('celebrate'); window.setTimeout(() => node.classList.remove('celebrate'), 650); } announce('¡Lección completada! Tu progreso se guardó.'); } else announce('Primero responde correctamente la pregunta.'); return; }
    if (event.target.closest('#close-lesson')) { closeLesson(); return; }
    if (event.target.closest('#close-notice')) { $('#notice-dialog').close(); return; }
    if (event.target.closest('#battery-info')) { showNotice('¿Cómo funcionan las baterías?', 'Una batería se usa al iniciar por primera vez una lección. No se vuelve a cobrar al actualizar, reabrir o repetir una lección ya iniciada o completada. La recarga completa ocurre 24 horas después del primer uso. La trivia no utiliza baterías.'); return; }
    if (event.target.closest('#ad-reward')) { showNotice('Anuncio voluntario (demo)', 'La interfaz está preparada para ofrecer una recompensa por ver un anuncio voluntario. En esta versión no hay anuncios conectados y tu saldo no cambia.'); return; }
    if (event.target.closest('#reset-progress')) { if (window.confirm('¿Reiniciar todo tu progreso? Se borrarán lecciones completadas, mejor puntaje, racha, liga personal, plan demo y baterías guardadas en este navegador.')) { state = freshState(); saveState(); quizSession = null; matchSessions.danzas = null; matchSessions.musica = null; renderHome(); renderLessonGroups(); renderAreaViews(); renderProgress(); renderBatteryStatus(); renderQuizIntro(); showView('inicio'); announce('El progreso se reinició.'); } return; }
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMobileMenu(); });
  document.addEventListener('keydown', event => {
    const areaTab = event.target.closest?.('[data-area-tab]');
    if (areaTab && ['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) {
      const tabs = $$(`[data-area-tab][data-area-id="${areaTab.dataset.areaId}"]`);
      const index = tabs.indexOf(areaTab);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      event.preventDefault(); tabs[next]?.focus(); activateAreaTab(areaTab.dataset.areaId, tabs[next]?.dataset.areaTab); return;
    }
    if ($('#tutorial-layer').hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); endTutorial('skipped'); return; }
    if (event.key === 'Tab') {
      const controls = [$('#tutorial-skip'), $('#tutorial-next')].filter(item => item && !item.hidden);
      const current = controls.indexOf(document.activeElement);
      const next = event.shiftKey ? (current <= 0 ? controls.length - 1 : current - 1) : (current >= controls.length - 1 ? 0 : current + 1);
      event.preventDefault(); controls[next]?.focus();
    }
  });
  window.addEventListener('resize', positionTutorialSpotlight);
  window.addEventListener('scroll', positionTutorialSpotlight, true);

  $('#lesson-dialog').addEventListener('click', event => { if (event.target === $('#lesson-dialog')) closeLesson(); });
  $('#lesson-dialog').addEventListener('close', () => { dialogLesson = null; renderHome(); renderLessonGroups(); renderProgress(); });
  $('#notice-dialog').addEventListener('click', event => { if (event.target === $('#notice-dialog')) $('#notice-dialog').close(); });
  window.addEventListener('storage', event => { if (event.key === STORAGE_KEY) { state = loadState(); renderHome(); renderLessonGroups(); renderAreaViews(); renderProgress(); renderBatteryStatus(); renderQuizIntro(); } });

  renderHome();
  renderLessonGroups();
  renderAreaViews();
  futureAreas.forEach(area => renderFutureArea(area.id));
  renderRoute($('#explore-route'));
  renderProgress();
  renderWeeklyDashboard();
  renderBatteryStatus();
  renderQuizIntro();
  setInterval(() => { if (state.refillAt) renderBatteryStatus(); }, 60000);
  let tutorialSeen = false;
  try { tutorialSeen = Boolean(JSON.parse(localStorage.getItem(TUTORIAL_KEY) || 'null')?.status); } catch { tutorialSeen = false; }
  if (!tutorialSeen) window.setTimeout(startTutorial, 450);
})();
