(() => {
  'use strict';

  const PROFILE_KEY = 'qoyllur-ritmo-learning-profile-v1';
  const screens = ['name', 'cover', 'intro', 'knowledge', 'interests', 'style', 'time', 'summary'];
  let profile = { completed: false, displayName: '', knowledge: null, interests: [], styles: [], minutes: null };
  let areaCatalog = [];
  let screenIndex = 0;
  let editing = false;
  let initialized = false;

  function readProfile() {
    try {
      const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
      if (!saved || typeof saved !== 'object') return { ...profile };
      return {
        completed: saved.completed === true,
        displayName: typeof saved.displayName === 'string' ? saved.displayName.trim().slice(0,32) : '',
        knowledge: ['poco', 'intermedio', 'suficiente'].includes(saved.knowledge) ? saved.knowledge : null,
        interests: Array.isArray(saved.interests) ? [...new Set(saved.interests.filter(id => areaCatalog.some(area => area.id === id)))] : [],
        styles: Array.isArray(saved.styles) ? [...new Set(saved.styles.filter(id => ['visual','brief','audio','games','mixed'].includes(id)))] : [],
        minutes: [10, 20, 30].includes(Number(saved.minutes)) ? Number(saved.minutes) : null
      };
    } catch { return { ...profile }; }
  }

  function saveProfile() {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch { /* El recorrido sigue disponible en memoria. */ }
  }

  function renderInterests() {
    const target = document.querySelector('#setup-interests');
    if (!target) return;
    const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    target.innerHTML = areaCatalog.map(area => `<article class="interest-card"><button class="setup-choice interest-choice" type="button" data-setup-choice="interests" data-choice="${escape(area.id)}" aria-pressed="${profile.interests.includes(area.id)}"><span class="interest-photo"><img src="${escape(area.image.src)}" alt="" loading="lazy" onerror="this.closest('.interest-photo').classList.add('image-missing');this.remove()"></span><strong>${escape(area.title)}</strong><small>${escape(area.description)}</small></button><a class="interest-credit" href="${escape(area.image.href)}" target="_blank" rel="noopener noreferrer">${escape(area.image.credit)} ↗</a></article>`).join('');
  }

  function restoreSelections() {
    document.querySelectorAll('[data-setup-choice]').forEach(button => {
      const type = button.dataset.setupChoice;
      const choice = button.dataset.choice;
      const selected = type === 'interests' ? profile.interests.includes(choice)
        : type === 'styles' ? profile.styles.includes(choice)
          : type === 'knowledge' ? profile.knowledge === choice
            : type === 'minutes' ? Number(profile.minutes) === Number(choice) : false;
      button.setAttribute('aria-pressed', String(selected));
      button.classList.toggle('is-selected', selected);
    });
  }

  function showScreen(name) {
    const index = screens.indexOf(name);
    if (index < 0) return;
    screenIndex = index;
    document.querySelectorAll('[data-setup-screen]').forEach(screen => {
      screen.hidden = screen.dataset.setupScreen !== name;
    });
    const cancel = document.querySelector('#setup-cancel');
    const welcomeName=document.querySelector('#welcome-name');
    if(welcomeName) welcomeName.textContent=profile.displayName?`¡Qué bueno tenerte aquí, ${profile.displayName}!`:'';
    if (cancel) cancel.hidden = !editing;
    restoreSelections();
    if (name === 'summary') {
      const interestNames = areaCatalog.filter(area => profile.interests.includes(area.id)).map(area => area.title);
      const styleLabels = { visual: 'imágenes', brief: 'explicaciones breves', audio: 'audios cuando estén disponibles', games: 'juegos', mixed: 'una combinación de formatos' };
      const selectedStyles = profile.styles.map(id => styleLabels[id]).filter(Boolean);
      const text = `Empezaremos por ${interestNames.join(', ')}. Según tus respuestas, tu punto de partida será «${{ poco: 'Conozco poco', intermedio: 'Conozco más o menos', suficiente: 'Conozco suficiente' }[profile.knowledge]}». Prefieres ${selectedStyles.join(', ')}. El tiempo elegido (${profile.minutes} minutos) es una referencia flexible; todas las categorías seguirán abiertas.`;
      const summary = document.querySelector('#setup-summary-copy');
      if (summary) summary.textContent = text;
    }
    const heading = document.querySelector(`[data-setup-screen="${name}"] h1`);
    if (heading) { heading.setAttribute('tabindex', '-1'); window.requestAnimationFrame(() => heading.focus({ preventScroll: true })); }
  }

  function canAdvance(name) {
    if (name === 'knowledge') return Boolean(profile.knowledge);
    if (name === 'interests') return profile.interests.length > 0;
    if (name === 'style') return profile.styles.length > 0;
    if (name === 'time') return Boolean(profile.minutes);
    return true;
  }

  function finish() {
    profile.completed = true;
    saveProfile();
    editing = false;
    document.querySelector('#onboarding-shell').hidden = true;
    document.querySelector('.app-shell').hidden = false;
    document.querySelector('.skip-link').href = '#main-content';
    window.dispatchEvent(new CustomEvent('qr:setup-complete'));
  }

  function cancelEditing() {
    profile = readProfile();
    editing = false;
    document.querySelector('#onboarding-shell').hidden = true;
    document.querySelector('.app-shell').hidden = false;
    document.querySelector('.skip-link').href = '#main-content';
    window.dispatchEvent(new CustomEvent('qr:setup-cancel'));
  }

  function handleChoice(button) {
    const type = button.dataset.setupChoice;
    const choice = button.dataset.choice;
    if (type === 'interests') {
      profile.interests = profile.interests.includes(choice) ? profile.interests.filter(id => id !== choice) : [...profile.interests, choice];
    } else if (type === 'styles') {
      profile.styles = profile.styles.includes(choice) ? profile.styles.filter(id => id !== choice) : [...profile.styles, choice];
    } else if (type === 'knowledge') profile.knowledge = choice;
    else if (type === 'minutes') profile.minutes = Number(choice);
    restoreSelections();
  }

  function handleSetupClick(event) {
    const choice = event.target.closest('[data-setup-choice]');
    if (choice) { handleChoice(choice); return; }
    const action = event.target.closest('[data-setup-action]')?.dataset.setupAction;
    if (action === 'begin') {
      profile.completed = true;
      saveProfile();
      editing = false;
      document.querySelector('#onboarding-shell').hidden = true;
      document.querySelector('.app-shell').hidden = false;
      document.querySelector('.skip-link').href = '#main-content';
      window.dispatchEvent(new CustomEvent('qr:adventure-started'));
      return;
    }
    if (action === 'finish') { finish(); return; }
    if (action === 'back') {
      const previous = Math.max(editing ? 2 : 1, screenIndex - 1);
      showScreen(screens[previous]); return;
    }
    if (action === 'next') {
      const current = screens[screenIndex];
      if (!canAdvance(current)) {
        const messages = { knowledge: 'Elige la opción que mejor te describe.', interests: 'Selecciona al menos un tema. Después podrás explorar todas las categorías.', style: 'Selecciona al menos una forma de aprender.', time: 'Elige una duración orientativa.' };
        const live = document.querySelector('#setup-live');
        if (live) live.textContent = messages[current] || 'Completa esta selección para continuar.';
        return;
      }
      if (current === 'intro') showScreen('knowledge');
      else if (current === 'knowledge') showScreen('interests');
      else if (current === 'interests') showScreen('style');
      else if (current === 'style') showScreen('time');
      else if (current === 'time') showScreen('summary');
      return;
    }
    if (event.target.closest('#setup-cancel')) cancelEditing();
  }

  function initialize(areas) {
    areaCatalog = areas.map(area => ({ id: area.id, title: area.title, description: area.description, image: area.image }));
    renderInterests();
    profile = readProfile();
    initialized = true;
    const shell = document.querySelector('#onboarding-shell');
    const app = document.querySelector('.app-shell');
    // La portada es la entrada de la experiencia en cada visita; el perfil y el progreso no se reinician.
    const setupRequired = !profile.displayName;
    shell.hidden = !setupRequired;
    app.hidden = setupRequired;
    document.querySelector('.skip-link').href = setupRequired ? '#setup-main' : '#main-content';
    if (setupRequired) showScreen('name');
    restoreSelections();
    if (!document.documentElement.dataset.setupHandler) {
      document.addEventListener('click', handleSetupClick);
      document.addEventListener('submit', event=>{
        if(event.target.id!=='name-create-form')return;
        event.preventDefault();
        const input=document.querySelector('#profile-name');
        const name=input?.value.trim().replace(/\s+/g,' ').slice(0,32)||'';
        if(!name){input?.focus();return;}
        profile.displayName=name;saveProfile();showScreen('cover');
      });
      document.documentElement.dataset.setupHandler = 'true';
    }
    return setupRequired;
  }

  function startEditing() {
    if (!initialized) return;
    profile = readProfile();
    editing = true;
    document.querySelector('.app-shell').hidden = true;
    document.querySelector('#onboarding-shell').hidden = false;
    document.querySelector('.skip-link').href = '#setup-main';
    renderInterests();
    showScreen('intro');
  }

  function updateBattery(available, maximum) {
    const target = document.querySelector('#setup-battery');
    if (target) target.textContent = maximum === Infinity ? '∞' : `${Math.round(available / maximum * 100)}%`;
  }

  window.QR_ONBOARDING = { initialize, startEditing, updateBattery, getProfile: () => ({ ...profile, interests: [...profile.interests], styles: [...profile.styles] }), getName: () => profile.displayName, setName: value => { const name=String(value||'').trim().replace(/\s+/g,' ').slice(0,32); if(!name) return false; profile.displayName=name; profile.completed=true; saveProfile(); return true; } };
})();
