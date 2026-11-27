(() => {
  'use strict';
  const content = window.QR_CONTENT;
  const questionUtils = window.QR_QUESTION_UTILS;
  const progression = window.QR_PROGRESSION_UTILS;
  const STORAGE_KEY = 'qoyllur-ritmo-progress-v1';
  const STORAGE_SCHEMA_VERSION = 3;
  const TUTORIAL_KEY = 'qoyllur-ritmo-welcome-tour-v1';
  const REFILL_MS = 24 * 60 * 60 * 1000;
  const futureAreas = [
    { id: 'gastronomia', title: 'Gastronomía', short: 'SABORES DEL PERÚ', icon: '◉', tone: 'gold', description: 'Contenido en preparación.', image: { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ceviche_del_Per%C3%BA.jpg?width=900', alt: 'Plato de ceviche peruano', credit: 'Manuel González Olaechea y Franco · Wikimedia Commons', href: 'https://commons.wikimedia.org/wiki/File:Ceviche_del_Per%C3%BA.jpg' } },
    { id: 'festividades', title: 'Festividades', short: 'CELEBRACIONES', icon: '✧', tone: 'violet', description: 'Contenido en preparación.', image: { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Inti_Raymi.jpg?width=900', alt: 'Celebración del Inti Raymi en Sacsayhuamán, Cusco', credit: 'Cyntia Motta · Wikimedia Commons · CC BY-SA 3.0', href: 'https://commons.wikimedia.org/wiki/File:Inti_Raymi.jpg' } },
    { id: 'patrimonio', title: 'Patrimonio cultural', short: 'MEMORIAS VIVAS', icon: '⌂', tone: 'turquoise', description: 'Contenido en preparación.', image: { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Cusco_Cathedral.jpg?width=900', alt: 'Catedral de Cusco', credit: 'Jordan Klein · Wikimedia Commons · CC BY 2.0', href: 'https://commons.wikimedia.org/wiki/File:Cusco_Cathedral.jpg' } },
    { id: 'historia', title: 'Historia y tradiciones', short: 'HISTORIAS DEL PERÚ', icon: '◷', tone: 'clay', description: 'Contenido en preparación.', image: { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Traditionnal_peruvian_weaving_-_Cuzco_-_Peru.jpg?width=900', alt: 'Tejido tradicional en Cusco', credit: 'Pethrus · Wikimedia Commons · CC BY-SA 4.0', href: 'https://commons.wikimedia.org/wiki/File:Traditionnal_peruvian_weaving_-_Cuzco_-_Peru.jpg' } }
  ];
  const heroAsset = { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Machu_Picchu_panorama.jpg?width=1800', href: 'https://commons.wikimedia.org/wiki/File:Machu_Picchu_panorama.jpg', credit: 'Brian Jeffery Beggerly · Wikimedia Commons · CC BY 2.0' };
  const levelPhotos = {
    danzas: [
      { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Marinera_Peruana.jpg?width=900', alt: 'Representación de marinera peruana', credit: 'Mcjv0900 · CC BY-SA 4.0', href: 'https://commons.wikimedia.org/wiki/File:Marinera_Peruana.jpg' },
      { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Danza_de_las_Tijeras.jpg?width=900', alt: 'Danzante de tijeras', credit: 'Almendra Bazan · CC0', href: 'https://commons.wikimedia.org/wiki/File:Danza_de_las_Tijeras.jpg' },
      { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Atajo_de_los_negritos.jpg?width=900', alt: 'Danzantes del Hatajo de Negritos', credit: 'Andresestebanpro · CC BY-SA 4.0', href: 'https://commons.wikimedia.org/wiki/File:Atajo_de_los_negritos.jpg' }
    ],
    musica: [
      { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Agrupaci%C3%B3n_Cultural_de_Sikuris_Claveles_Rojos_de_Huancan%C3%A9_-_M%C3%BAsicos.jpg?width=900', alt: 'Músicos de sikuri de Huancané', credit: 'Abelchristian111 · CC BY-SA 4.0', href: 'https://commons.wikimedia.org/wiki/File:Agrupaci%C3%B3n_Cultural_de_Sikuris_Claveles_Rojos_de_Huancan%C3%A9_-_M%C3%BAsicos.jpg' },
      { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Cajon_peruano._Instrumento_de_percusi%C3%B3n.JPG?width=900', alt: 'Intérprete de cajón peruano', credit: 'SLR · CC BY 3.0', href: 'https://commons.wikimedia.org/wiki/File:Cajon_peruano._Instrumento_de_percusi%C3%B3n.JPG' },
      { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Quena.jpg?width=900', alt: 'Quena peruana', credit: 'Aurogallego · CC BY-SA 4.0', href: 'https://commons.wikimedia.org/wiki/File:Quena.jpg' }
    ]
  };
  const tutorialSteps = [
    { target: '[data-nav="inicio"]', title: 'Inicio', copy: 'Aquí encontrarás tu racha, batería, progreso y el acceso al tutorial.' },
    { target: '[data-nav="aprendizaje"]', title: 'Aprendizaje', copy: 'Entra aquí para ver las seis áreas culturales.' },
    { target: '.learning-category-card', title: 'Elige una categoría', copy: 'Cada categoría tiene una breve bienvenida para conocer tus intereses. No es una prueba.' },
    { target: '.learning-path-grid', title: 'Sigue tu ruta', copy: 'Completa cada lección para desbloquear el siguiente paso. Las actividades y el reto final se abren poco a poco.' },
    { target: '[data-nav="perfil"]', title: 'Perfil', copy: 'Aquí puedes cambiar tu nombre y consultar tu progreso y preferencias.' }
  ];
  let tutorialIndex = 0;
  let tutorialFinishedScreen = false;
  let tutorialReturnFocus = null;
  let storageMigrationNote = false;
  let storageNeedsSave = false;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const lessonMap = Object.fromEntries(content.lessons.map(item => [item.id, item]));
  const categoryMap = Object.fromEntries(content.categories.map(item => [item.id, item]));
  const categoryPreferenceKey = 'qoyllur-ritmo-category-preferences-v1';
  const categoryPreferences = (() => { try { const value=JSON.parse(localStorage.getItem(categoryPreferenceKey)||'{}'); return value&&typeof value==='object'&&!Array.isArray(value)?value:{}; } catch { return {}; } })();
  let preferenceCategory = null;
  let preferenceIndex = 0;
  let preferenceDraft = [];
  const preferenceQuestions = {
    musica: [
      { q:'Si pudieras descubrir un sonido del Perú, ¿por dónde empezarías?', a:['Por instrumentos que conversan entre sí','Por ritmos que acompañan distintas celebraciones','Por cantos que guardan historias de una comunidad'] },
      { q:'¿Qué instrumento te gustaría conocer primero?', a:['El siku o zampoña','El cajón peruano','Quiero conocer primero los cantos Esuwa'] },
      { q:'¿Cómo te gustaría explorar la música peruana?', a:['Descubriendo cómo se construye una melodía en grupo','Relacionando instrumentos con sus tradiciones','Conociendo expresiones musicales de distintos territorios'] }
    ],
    danzas: [
      { q:'Si pudieras acercarte a una danza peruana, ¿qué observarías primero?', a:['Los movimientos y la destreza','La música y los instrumentos','La historia de la comunidad que la mantiene viva'] },
      { q:'¿Qué te gustaría descubrir durante el recorrido?', a:['Por qué existen variantes regionales','Cómo se relacionan danza, música y celebración','Qué significado tiene para sus comunidades'] },
      { q:'¿Qué experiencia te entusiasma más?', a:['Comparar expresiones de distintas regiones','Reconocer elementos de una presentación','Resolver retos sobre lo que descubrí'] }
    ],
    gastronomia: [
      { q:'¿Qué disfrutas descubrir de una comida?', a:['Sus ingredientes','Cómo se prepara','La historia que acompaña al plato'] },
      { q:'¿Qué te gustaría probar?', a:['Un plato de una región nueva','Una preparación tradicional','Un ingrediente que aún no conoces'] },
      { q:'¿Qué historia culinaria te interesa?', a:['Recetas familiares','Sabores de distintas regiones','Cómo cambian las preparaciones con el tiempo'] }
    ],
    festividades: [
      { q:'¿Qué te llama la atención de una celebración?', a:['La música y las danzas','Las costumbres compartidas','El significado para la comunidad'] },
      { q:'¿Qué momento te gustaría vivir?', a:['Una comparsa en movimiento','La preparación de una fiesta','Una celebración comunitaria'] },
      { q:'¿Qué te gustaría descubrir?', a:['Cómo se transmite una festividad','Qué expresiones la acompañan','Cómo la vive cada localidad'] }
    ],
    patrimonio: [
      { q:'¿Qué te gustaría explorar primero?', a:['Un sitio histórico','La arquitectura de una ciudad','Una práctica cultural viva'] },
      { q:'¿Qué aspecto te interesa más?', a:['Cómo se conserva un lugar','Las historias vinculadas a un sitio','El patrimonio material e inmaterial'] },
      { q:'¿Qué recorrido elegirías?', a:['Visitar un monumento','Conocer un oficio tradicional','Descubrir cómo una comunidad cuida su patrimonio'] }
    ],
    historia: [
      { q:'¿Qué tipo de relato despierta más tu curiosidad?', a:['Historias de comunidades','Personajes y acontecimientos','Costumbres que pasan entre generaciones'] },
      { q:'¿Qué te gustaría entender mejor?', a:['Cómo cambian las tradiciones','Cómo se conserva la memoria','Cómo se conectan distintas épocas'] },
      { q:'¿Qué formato prefieres para explorar una historia?', a:['Relatos breves','Líneas de tiempo','Voces y recuerdos de una comunidad'] }
    ]
  };
  const preferenceFeedback = {
    musica: [
      [
        '¡Buena elección! Conocerás el siku y el cajón peruano, dos instrumentos con formas distintas de participar en la música.',
        '¡Vamos por el ritmo! Descubrirás cómo el cajón acompaña géneros afroperuanos y criollos.',
        '¡Qué interesante! También conocerás Esuwa, una tradición de cánticos del pueblo Wachiperi en lengua Harakbut.'
      ],
      [
        'El siku, también llamado zampoña en determinados contextos, se interpreta en una práctica colectiva llamada sikuri.',
        'El cajón peruano es un instrumento de percusión que acompaña distintos géneros musicales.',
        'Los cantos Esuwa son una expresión vocal; la lección explica su contexto cultural sin tratarlos como un instrumento.'
      ],
      [
        'En la lección del siku descubrirás cómo las partes arka e ira se complementan para tejer una melodía.',
        'En la ruta relacionarás instrumentos, prácticas musicales y sus contextos.',
        'Conocerás expresiones del Altiplano, la costa y la Amazonía sin reducirlas a una sola tradición.'
      ]
    ],
    danzas: [
      [
        'La ruta te permitirá reconocer movimientos y expresiones propias de distintas danzas.',
        'Descubrirás cómo la música acompaña prácticas y formas de danza diferentes.',
        'Cada lección presenta una expresión vinculada con comunidades y territorios concretos.'
      ],
      [
        'Conocerás ejemplos de variantes regionales de la marinera.',
        'Explorarás cómo se relacionan la destreza, la música y la comunidad en la danza de las tijeras.',
        'Las lecciones explican contextos culturales específicos, no una versión única de las danzas peruanas.'
      ],
      [
        'Podrás comparar la marinera, la danza de las tijeras y el Hatajo de Negritos y Las Pallitas.',
        'En cada ficha reconocerás elementos documentados de su presentación.',
        'Al final tendrás una actividad para relacionar lo que descubriste.'
      ]
    ]
  };
  let activeFilter = 'all';
  let currentCategory = null;
  let quizSession = null;
  let quizReturnMarkup = null;
  let dialogLesson = null;
  let lessonReturnFocus = null;
  let lessonOptionOrder = [];
  const matchSessions = { danzas: null, musica: null };
  const areaTabs = Object.fromEntries([...content.categories, ...futureAreas].map(area => [area.id, 'aprender']));

  function freshState() {
      return { schemaVersion: STORAGE_SCHEMA_VERSION, completed: [], started: [], batteries: 5, refillAt: null, bestTrivia: null, firstTriviaScore: null, historicalTriviaBest: null, historicalTriviaBestRaw: null, quizAwards: { main: false, bonus: false, danzas: false, musica: false }, byCategory: { danzas: [], musica: [] }, plan: 'gratis', lessonAnswers: {}, activityLog: [], leagueAwards: [], categoryLevels: {}, routeStages: { danzas: [], musica: [] }, categoryPracticeBest: { danzas: null, musica: null }, experience: 0, experienceAwards: [], badges: [], storageArchive: {}, updatedAt: Date.now() };
  }
  function activityPointLimit(id) {
    if (content.lessons.some(lesson => id === `lesson-${lesson.id}`)) return 10;
    if (id === 'association-danzas' || id === 'association-musica') return 12;
    if (id === 'quiz-main-trivia') return 24;
    if (id === 'quiz-bonus-quiz') return 14;
    if (id === 'quiz-area-quiz-danzas' || id === 'quiz-area-quiz-musica') return 16;
    return null;
  }
  function validActivityDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00`);
    return !Number.isNaN(date.getTime()) && dateKey(date) === value;
  }
  function loadState() {
    let sourceRaw = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      sourceRaw = raw;
      if (!raw) return freshState();
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new TypeError('El progreso guardado no tiene el formato esperado.');
      const state = { ...freshState(), ...parsed };
      state.storageArchive = state.storageArchive && typeof state.storageArchive === 'object' ? state.storageArchive : {};
      const archiveInvalid = (key, value) => {
        if (value === undefined) return;
        const values = state.storageArchive.invalidValues && typeof state.storageArchive.invalidValues === 'object' ? state.storageArchive.invalidValues : {};
        values[key] = value;
        state.storageArchive.invalidValues = values;
        storageMigrationNote = true;
        storageNeedsSave = true;
      };
      const sourceVersion = Number.isInteger(parsed.schemaVersion) ? parsed.schemaVersion : 0;
      const oldSchema = sourceVersion < 2;
      if (sourceVersion < STORAGE_SCHEMA_VERSION) { storageMigrationNote = sourceVersion < 2; storageNeedsSave = true; }
      const validIds = new Set(content.lessons.map(lesson => lesson.id));
      if (Array.isArray(state.completed)) { const rejected = state.completed.filter(id => !validIds.has(id)); if (rejected.length) archiveInvalid('completedLessonIds', rejected); }
      if (Array.isArray(state.started)) { const rejected = state.started.filter(id => !validIds.has(id)); if (rejected.length) archiveInvalid('startedLessonIds', rejected); }
      if (!Array.isArray(state.completed)) archiveInvalid('completedLessonIds', state.completed);
      if (!Array.isArray(state.started)) archiveInvalid('startedLessonIds', state.started);
      state.completed = Array.isArray(state.completed) ? [...new Set(state.completed.filter(id => validIds.has(id)))] : [];
      state.started = Array.isArray(state.started) ? [...new Set(state.started.filter(id => validIds.has(id)))] : [];
      if (!content.memberships.some(plan => plan.id === state.plan)) archiveInvalid('plan', state.plan);
      state.plan = content.memberships.some(plan => plan.id === state.plan) ? state.plan : 'gratis';
      if (oldSchema) {
        const oldBest = parsed.bestTrivia;
        state.historicalTriviaBest = questionUtils.validScore(oldBest, 8);
        state.historicalTriviaBestRaw = oldBest !== null && oldBest !== undefined && state.historicalTriviaBest === null ? oldBest : null;
        state.bestTrivia = null;
        state.firstTriviaScore = null;
        state.quizAwards = { main: false, bonus: false, danzas: false, musica: false };
        state.quizAwards.main = questionUtils.validScore(oldBest, 8) !== null;
        storageMigrationNote = true;
        storageNeedsSave = true;
      } else {
        ['bestTrivia', 'firstTriviaScore', 'historicalTriviaBest'].forEach(key => {
          if (parsed[key] !== null && parsed[key] !== undefined && questionUtils.validScore(parsed[key], 8) === null) archiveInvalid(key, parsed[key]);
        });
        state.bestTrivia = questionUtils.validScore(state.bestTrivia, 8);
        state.firstTriviaScore = questionUtils.validScore(state.firstTriviaScore, 8);
        state.historicalTriviaBest = questionUtils.validScore(state.historicalTriviaBest, 8);
        if (state.bestTrivia !== (parsed.bestTrivia ?? null) || state.firstTriviaScore !== (parsed.firstTriviaScore ?? null) || state.historicalTriviaBest !== (parsed.historicalTriviaBest ?? null)) {
          storageMigrationNote = true;
          storageNeedsSave = true;
        }
      }
      const currentPlan = content.memberships.find(plan => plan.id === state.plan);
      const maxBatteries = currentPlan?.batteries ?? 5;
      if (!Number.isInteger(state.batteries) || state.batteries < 0 || state.batteries > maxBatteries) {
        archiveInvalid('batteries', state.batteries);
        state.batteries = Math.min(maxBatteries, Math.max(0, Number.isFinite(state.batteries) ? Math.floor(state.batteries) : 5));
        storageMigrationNote = true;
        storageNeedsSave = true;
      }
      if (state.refillAt !== null && (!Number.isFinite(state.refillAt) || state.refillAt <= 0)) archiveInvalid('refillAt', state.refillAt);
      state.refillAt = Number.isFinite(state.refillAt) && state.refillAt > 0 ? state.refillAt : null;
      if (state.lessonAnswers !== null && (typeof state.lessonAnswers !== 'object' || Array.isArray(state.lessonAnswers))) archiveInvalid('lessonAnswers', state.lessonAnswers);
      state.lessonAnswers = state.lessonAnswers && typeof state.lessonAnswers === 'object' ? state.lessonAnswers : {};
      const migratedAnswers = {};
      Object.entries(state.lessonAnswers).forEach(([lessonId, answer]) => {
        const question = lessonMap[lessonId]?.question;
        if (!question || !answer || typeof answer !== 'object') {
          const rejected = Array.isArray(state.storageArchive.rejectedLessonAnswers) ? state.storageArchive.rejectedLessonAnswers : [];
          state.storageArchive.rejectedLessonAnswers = [...rejected, { lessonId, answer }].slice(-100);
          storageMigrationNote = true; storageNeedsSave = true; return;
        }
        let selected = answer.selected;
        let checked = answer.checked === true;
        if (oldSchema && Number.isInteger(selected)) {
          const legacySelection = selected;
          selected = questionUtils.migrateLegacySelection(question, legacySelection);
          if (selected === null) {
            const rejected = Array.isArray(state.storageArchive.rejectedLessonAnswers) ? state.storageArchive.rejectedLessonAnswers : [];
            state.storageArchive.rejectedLessonAnswers = [...rejected, { lessonId, answer, legacySelection }].slice(-100);
            checked = false; storageMigrationNote = true;
          }
          storageNeedsSave = true;
        }
        const optionIds = new Set(question.options.map(option => option.id));
        if (selected !== null && selected !== undefined && (typeof selected !== 'string' || !optionIds.has(selected))) {
          const rejected = Array.isArray(state.storageArchive.rejectedLessonAnswers) ? state.storageArchive.rejectedLessonAnswers : [];
          state.storageArchive.rejectedLessonAnswers = [...rejected, { lessonId, answer }].slice(-100);
          selected = null;
          checked = false;
          storageMigrationNote = true;
          storageNeedsSave = true;
        }
        const attempts = Number.isSafeInteger(answer.attempts) && answer.attempts >= 0 && answer.attempts <= 1000 ? answer.attempts : 0;
        let firstAttemptCorrect = typeof answer.firstAttemptCorrect === 'boolean' ? answer.firstAttemptCorrect : null;
        if (firstAttemptCorrect !== null && attempts < 1) firstAttemptCorrect = null;
        if (checked && selected === null) checked = false;
        migratedAnswers[lessonId] = { ...answer, selected: selected ?? null, checked, attempts: oldSchema ? (checked ? 1 : 0) : attempts, firstAttemptCorrect: oldSchema ? null : firstAttemptCorrect };
      });
      state.lessonAnswers = migratedAnswers;
      const awardKeys = ['main', 'bonus', 'danzas', 'musica'];
      const awards = state.quizAwards && typeof state.quizAwards === 'object' ? state.quizAwards : {};
      state.quizAwards = Object.fromEntries(awardKeys.map(key => [key, awards[key] === true]));
      if (state.activityLog !== null && !Array.isArray(state.activityLog)) archiveInvalid('activityLog', state.activityLog);
      const previousLog = Array.isArray(state.activityLog) ? state.activityLog : [];
      state.activityLog = previousLog.filter(item => {
        const maxPoints = item && activityPointLimit(item.id);
        return validActivityDate(item?.date) && maxPoints !== null && Number.isInteger(item.points) && item.points >= 0 && item.points <= maxPoints;
      }).slice(-500);
      state.leagueAwards = Array.isArray(state.leagueAwards) ? [...new Set(state.leagueAwards.filter(id => typeof id === 'string' && activityPointLimit(id) !== null))].slice(-500) : [];
      const historicalPointAwards = state.activityLog.filter(item => item.points > 0).map(item => item.id);
      state.leagueAwards = [...new Set([...state.leagueAwards, ...historicalPointAwards])];
      if (state.activityLog.length !== previousLog.length) {
                const rejectedActivities = Array.isArray(state.storageArchive.rejectedActivityEntries) ? state.storageArchive.rejectedActivityEntries : [];
        state.storageArchive.rejectedActivityEntries = [...rejectedActivities, ...previousLog.filter(item => {
          const maxPoints = item && activityPointLimit(item.id);
          return !validActivityDate(item?.date) || maxPoints === null || !Number.isInteger(item.points) || item.points < 0 || item.points > maxPoints;
        })].slice(-500);
        storageMigrationNote = true;
        storageNeedsSave = true;
      }
      const recordedQuizIds = new Set(state.activityLog.map(item => item.id));
      state.quizAwards.main = state.quizAwards.main || recordedQuizIds.has('quiz-main-trivia');
      state.quizAwards.bonus = state.quizAwards.bonus || recordedQuizIds.has('quiz-bonus-quiz');
      state.quizAwards.danzas = state.quizAwards.danzas || recordedQuizIds.has('quiz-area-quiz-danzas');
      state.quizAwards.musica = state.quizAwards.musica || recordedQuizIds.has('quiz-area-quiz-musica');
      const validCategoryIds = new Set(['danzas', 'musica', ...futureAreas.map(area => area.id)]);
      const savedLevels = state.categoryLevels && typeof state.categoryLevels === 'object' ? state.categoryLevels : {};
      state.categoryLevels = Object.fromEntries(Object.entries(savedLevels).filter(([id, level]) => validCategoryIds.has(id) && ['poco', 'intermedio', 'suficiente'].includes(level)));
      const savedStages = state.routeStages && typeof state.routeStages === 'object' ? state.routeStages : {};
      state.routeStages = Object.fromEntries(['danzas', 'musica'].map(id => [id, [...new Set((Array.isArray(savedStages[id]) ? savedStages[id] : []).filter(stage => ['lecciones', 'juego', 'practica', 'test'].includes(stage)))]]));
      ['danzas', 'musica'].forEach(id => {
        if (content.lessons.filter(lesson => lesson.category === id).every(lesson => state.completed.includes(lesson.id)) && !state.routeStages[id].includes('lecciones')) {
          state.routeStages[id].push('lecciones');
          storageNeedsSave = true;
        }
      });
      state.categoryPracticeBest = Object.fromEntries(['danzas', 'musica'].map(id => [id, questionUtils.validScore(state.categoryPracticeBest?.[id], 3)]));
      state.experience = Number.isSafeInteger(state.experience) && state.experience >= 0 && state.experience <= 1000000 ? state.experience : 0;
      state.experienceAwards = Array.isArray(state.experienceAwards) ? [...new Set(state.experienceAwards.filter(id => typeof id === 'string' && /^[a-z-]+$/.test(id)))].slice(0, 100) : [];
      state.badges = Array.isArray(state.badges) ? [...new Set(state.badges.filter(id => ['danzas', 'musica'].includes(id)))] : [];
      state.schemaVersion = STORAGE_SCHEMA_VERSION;
      return state;
    } catch {
      const fallback = freshState();
      if (sourceRaw !== null) {
        fallback.storageArchive.unreadableProgressRaw = sourceRaw;
        storageMigrationNote = true;
        storageNeedsSave = true;
      }
      return fallback;
    }
  }
  let state = loadState();
  function saveState() {
    state.byCategory = Object.fromEntries(content.categories.map(category => [category.id, state.completed.filter(id => lessonMap[id].category === category.id)]));
    state.updatedAt = Date.now();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { announce('No fue posible guardar el progreso en este navegador.'); }
    if (window.QR_ONBOARDING) window.QR_ONBOARDING.updateBattery(state.batteries, cap());
  }
  if (storageNeedsSave) saveState();
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
  function prefersReducedMotion() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function scrollElementIntoView(element, block = 'start') {
    if (!element) return;
    element.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block });
  }
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
    if (points > 0 && state.leagueAwards.includes(id)) return false;
    let recorded = false;
    if (!state.activityLog.some(item => item.date === date && item.id === id)) {
      state.activityLog.push({ date, id, points });
      state.activityLog = state.activityLog.slice(-500);
      if (points > 0) state.leagueAwards.push(id);
      saveState();
      recorded = true;
    }
    renderWeeklyDashboard();
    return recorded;
  }

  function showView(name) {
    const view = $(`[data-view="${name}"]`);
    if (!view) return;
    $$('[data-view]').forEach(section => { const active = section.dataset.view === name; section.hidden = !active; section.classList.toggle('is-visible', active); });
    const journey = ['categorias', 'nivel', 'introduccion', 'ruta', 'preguntas-iniciales', 'danzas', 'musica'].includes(name);
    $('.app-shell').classList.toggle('journey-focus', journey);
    const navName = ['nivel', 'ruta', 'introduccion', 'preguntas-iniciales'].includes(name) ? 'aprendizaje' : name;
    $$('[data-nav]').forEach(button => { const active = button.dataset.nav === navName; button.classList.toggle('is-active', active); active ? button.setAttribute('aria-current', 'page') : button.removeAttribute('aria-current'); });
    const labels = { inicio: 'Inicio', aprendizaje: 'Aprendizaje', perfil: 'Perfil', categorias: 'Categorías', danzas: 'Danzas del Perú', musica: 'Música peruana', explorar: 'Aprendizaje', jugar: 'Retos y juegos', liga: 'Mi liga', progreso: 'Mi progreso', nivel: 'Nivel de aprendizaje', introduccion: 'Tu recorrido', ruta: 'Ruta de aprendizaje', 'preguntas-iniciales':'Preguntas iniciales' };
    futureAreas.forEach(area => { labels[area.id] = area.title; });
    $('#current-page-label').textContent = labels[name] || 'Inicio';
    if (name === 'inicio') renderHome();
    if (name === 'aprendizaje') renderLearningHub();
    if (name === 'perfil') renderProfile();
    if (name === 'preguntas-iniciales') renderCategoryQuestions();
    if (name === 'categorias') renderJourneyCategories();
    if (name === 'jugar' && !quizSession) renderQuizIntro();
    if (name === 'progreso') renderProgress();
    if (name === 'liga') renderWeeklyDashboard();
    if (name === 'danzas' || name === 'musica') renderAreaViews();
    if (futureAreas.some(area => area.id === name)) renderFutureArea(name);
    if (name === 'nivel' && currentCategory) renderLevelSelection(currentCategory);
    if (name === 'ruta' && currentCategory) renderLearningRoute(currentCategory);
    if (name === 'introduccion' && currentCategory) renderCategoryIntroduction(currentCategory);
    closeMobileMenu();
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    const heading = view.querySelector('h1');
    if (heading) { heading.setAttribute('tabindex', '-1'); window.requestAnimationFrame(() => heading.focus({ preventScroll: true })); }
  }

  function areaInfo(id) {
    const area = categoryMap[id] || futureAreas.find(item => item.id === id);
    if (!area) return null;
    const lesson = content.lessons.find(item => item.category === id);
    return { ...area, image: lesson?.image || area.image, available: Boolean(lesson) };
  }
  function openCategory(id) {
    const area = areaInfo(id);
    if (!area) return;
    if (!area.available) {
      showNotice('Muy pronto', `La sección de ${area.title} se incorporará cuando sus lecciones estén preparadas y verificadas.`);
      return;
    }
    currentCategory = id;
    preferenceCategory = id;
    if (Array.isArray(categoryPreferences[id]) && categoryPreferences[id].length) showView('ruta');
    else showView('introduccion');
  }
  function renderJourneyCategories() {
    const target = $('#category-picker-grid');
    if (!target) return;
    const items = [...content.categories, ...futureAreas];
    target.innerHTML = items.map(area => {
      const image = area.id === 'danzas' ? levelPhotos.danzas[0] : area.id === 'musica' ? levelPhotos.musica[0] : area.image;
      const stats = categoryMap[area.id] ? categoryPercent(area.id) : null;
      return `<article class="journey-category-item"><button class="journey-category-card tone-${area.tone}" type="button" data-category="${area.id}" aria-label="Elegir ${escapeHtml(area.title)}"><img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" loading="lazy" onerror="this.closest('.journey-category-card').classList.add('image-missing');this.remove()"><span class="journey-card-shade"></span><span class="journey-card-copy"><small>${escapeHtml(area.short)}</small><strong>${escapeHtml(area.title)}</strong><span>${stats ? `${stats.completed} de ${stats.total} lecciones · ${stats.percent}%` : 'Contenido en preparación'}</span></span></button><span class="journey-photo-credit">${escapeHtml(image.credit)}</span></article>`;
    }).join('');
  }
  function renderLearningHub() {
    const target = $('#learning-category-grid');
    if (!target) return;
    const areas = [areaInfo('musica'), areaInfo('danzas'), ...futureAreas.map(area => areaInfo(area.id))].filter(Boolean);
    target.innerHTML = areas.map(area => {
      const photo = area.image;
      const available = area.available;
      const progress = available ? categoryPercent(area.id) : null;
      const displayTitle = ({ musica: 'Música', danzas: 'Danzas', patrimonio: 'Patrimonio' })[area.id] || area.title;
      const description = available
        ? `${progress.total} lecciones · ${progress.completed} completadas`
        : 'Contenido en preparación';
      return `<button class="learning-category-card category-${escapeHtml(area.tone)} ${available ? 'is-available' : 'is-coming-soon'}" type="button" data-learning-category="${escapeHtml(area.id)}" aria-label="${escapeHtml(displayTitle)}. ${escapeHtml(description)}">
        <img class="learning-category-photo" src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.alt || area.title)}" loading="lazy" onerror="this.closest('.learning-category-card').classList.add('image-missing');this.remove()">
        <span class="learning-category-shade" aria-hidden="true"></span>
        <span class="learning-category-status">${available ? 'RUTA DISPONIBLE' : 'PRÓXIMAMENTE'}</span>
        <span class="learning-category-copy"><strong>${escapeHtml(displayTitle)}</strong><small>${escapeHtml(description)}</small></span>
        <span class="learning-category-arrow" aria-hidden="true">${available ? '↗' : '…'}</span>
      </button>`;
    }).join('');
  }
  function illustrationMarkup() {
    return `<div class="learning-vicuna-wrap"><img class="learning-vicuna" src="imagenes/vicuna-guia.png" alt="Vicuña guía de Qoyllur Ritmo con una manta andina" loading="eager"><span class="learning-vicuna-caption">Tu compañera de ruta</span></div>`;
  }
  function renderCategoryQuestions() {
    const target = $('#category-question-content');
    const area = categoryMap[preferenceCategory] || futureAreas.find(item => item.id === preferenceCategory);
    if (!target || !area) return;
    const questions = preferenceQuestions[preferenceCategory] || [];
    if (preferenceIndex >= questions.length) {
      const welcomeName = window.QR_ONBOARDING?.getName();
      target.innerHTML = `<section class="learning-motivation-screen"><div class="learning-motivation-character">${illustrationMarkup()}</div><div class="learning-motivation-copy"><p class="eyebrow">TU AVENTURA COMIENZA AQUÍ</p><h1 id="category-question-title" tabindex="-1">${welcomeName ? `¡Vamos, ${escapeHtml(welcomeName)}!` : '¡Vamos a descubrir el Perú!'}</h1><blockquote>“Yo te acompañaré en esta aventura. Paso a paso descubrirás sonidos, historias y tradiciones que hacen única nuestra cultura. ¡Tu curiosidad será tu mejor compañera!”</blockquote><p>Tu recorrido está listo. Completa cada lección para abrir el siguiente desafío.</p><button class="button learning-primary-button" type="button" data-action="enter-category">¡Vamos a la ruta! <span aria-hidden="true">→</span></button></div></section>`;
      window.requestAnimationFrame(() => $('#category-question-title')?.focus({ preventScroll: true }));
      return;
    }    const item = questions[preferenceIndex];
    const selected = preferenceDraft[preferenceIndex];
    const selectedFeedback = Number.isInteger(selected) ? preferenceFeedback[preferenceCategory]?.[preferenceIndex]?.[selected] : '';
    target.innerHTML = `<section class="learning-question-scene">
      <div class="learning-question-guide">${illustrationMarkup()}<div class="learning-guide-speech"><strong>¡Hola! Soy tu guía.</strong><p>${selectedFeedback ? escapeHtml(selectedFeedback) : 'Elige lo que más te llama la atención. ¡Vamos a descubrirlo juntos!'}</p></div></div>
      <div class="learning-question-card"><p class="eyebrow">${escapeHtml(area.title)} · CONOZCAMOS TUS INTERESES</p><div class="learning-question-progress" role="progressbar" aria-label="Avance de preguntas" aria-valuemin="0" aria-valuemax="${questions.length}" aria-valuenow="${preferenceIndex + 1}"><span style="width:${Math.round((preferenceIndex + 1) / questions.length * 100)}%"></span></div><p class="learning-question-count">Pregunta ${preferenceIndex + 1} de ${questions.length}</p><h1 id="category-question-title" tabindex="-1">${escapeHtml(item.q)}</h1><div class="learning-answer-list" role="group" aria-label="Opciones de respuesta">${item.a.map((answer, index) => `<button type="button" class="learning-answer-option ${selected === index ? 'is-selected' : ''}" data-preference-answer="${index}" aria-pressed="${selected === index}"><span class="learning-answer-letter" aria-hidden="true">${String.fromCharCode(65 + index)}</span>${escapeHtml(answer)}</button>`).join('')}</div>${selectedFeedback ? `<p class="learning-answer-feedback" role="status">${escapeHtml(selectedFeedback)}</p>` : ''}<div class="learning-question-actions"><button class="button button-quiet" type="button" data-action="back-to-learning">Salir</button><button class="button learning-primary-button" type="button" data-action="next-preference" ${Number.isInteger(selected) ? '' : 'disabled'}>${preferenceIndex === questions.length - 1 ? 'Finalizar' : 'Continuar'} <span aria-hidden="true">→</span></button></div><p class="learning-question-note">No hay respuestas correctas o incorrectas: queremos conocer tu curiosidad.</p></div>
    </section>`;
    window.requestAnimationFrame(() => {
      const active = target.querySelector('.learning-answer-option.is-selected') || target.querySelector('#category-question-title');
      active?.focus({ preventScroll: true });
    });
  }
  function renderProfile() {
    const target=$('#profile-content'); if(!target)return;
    const name=window.QR_ONBOARDING?.getName()||'';
    const prefs=Object.entries(categoryPreferences).filter(([,answers])=>Array.isArray(answers));
    target.innerHTML=`<header class="profile-heading"><p class="eyebrow">TU ESPACIO PERSONAL</p><h1 id="profile-title">Perfil</h1></header><section class="profile-panel"><div class="profile-avatar" aria-hidden="true">${escapeHtml(name.slice(0,1).toUpperCase()||'Q')}</div><form id="profile-name-form"><label for="profile-name-edit">Nombre o apodo</label><div class="profile-name-row"><input id="profile-name-edit" name="displayName" maxlength="32" value="${escapeHtml(name)}" required><button class="button setup-primary" type="submit">Guardar nombre</button></div><p class="muted">Solo se guarda en este navegador; no se envía a servidores.</p></form></section><section class="profile-panel"><h2>Tu aprendizaje</h2><p>${state.completed.length} de ${content.lessons.length} lecciones completadas · Trivia: ${state.bestTrivia===null?'sin jugar':`${state.bestTrivia}/8`}</p><button type="button" class="button button-outline" data-nav="progreso">Ver progreso detallado</button></section><section class="profile-panel"><h2>Tus preferencias</h2>${prefs.length?prefs.map(([id,answers])=>{const title=categoryMap[id]?.title||futureAreas.find(area=>area.id===id)?.title||id;const selected=answers.map(item=>preferenceQuestions[id]?.[item.question-1]?.a[item.choice]).filter(Boolean);return `<p><strong>${escapeHtml(title)}:</strong> ${selected.map(escapeHtml).join(' · ')||'Preferencias guardadas'}</p>`}).join(''):'<p class="muted">Todavía no has respondido preguntas iniciales por categoría.</p>'}</section>`;
  }
  function renderCategoryIntroduction(id) {
    const area = areaInfo(id);
    const target = $('#category-introduction');
    if (!area || !target) return;
    const lessons = content.lessons.filter(item => item.category === id);
    const displayName = id === 'musica' ? 'Música' : 'Danzas del Perú';
    const topicCopy = id === 'musica'
      ? 'Descubre cómo los instrumentos, los ritmos y los cantos cuentan historias de distintas comunidades del Perú.'
      : 'Conoce danzas con expresiones regionales, música, destreza y vínculos con las comunidades que las mantienen vivas.';
    const list = lessons.map(item => `<li><span aria-hidden="true">✦</span>${escapeHtml(item.shortTitle)}</li>`).join('');
    target.innerHTML = `<section class="learning-welcome-scene" style="--learning-scene-image:url('${escapeHtml(heroAsset.src)}')"><div class="learning-welcome-backdrop" aria-hidden="true"></div><div class="learning-welcome-character">${illustrationMarkup()}</div><div class="learning-welcome-card"><p class="eyebrow">QOYLLUR RITMO · UNA NUEVA AVENTURA</p><h1 id="intro-title" tabindex="-1">¡Bienvenido a la sección de ${escapeHtml(displayName)}!</h1><p class="learning-welcome-copy">${escapeHtml(topicCopy)}</p><p class="learning-welcome-subtitle">En esta ruta podrás:</p><ul class="learning-welcome-list">${list}</ul><button class="button learning-primary-button" type="button" data-action="start-category-questions">¡Comencemos! <span aria-hidden="true">→</span></button><p class="learning-welcome-footnote">Lecciones breves · juegos sin cronómetro · un paso a la vez</p></div></section>`;
    window.requestAnimationFrame(() => $('#intro-title')?.focus({ preventScroll: true }));
  }
  function renderLevelSelection(id) {
    const area = areaInfo(id);
    const target = $('#level-choice-area');
    if (!area || !target) return;
    const levels = [
      { id: 'poco', title: 'Conozco poco', copy: 'Estoy empezando y quiero aprender lo esencial.' },
      { id: 'intermedio', title: 'Conozco más o menos', copy: 'Ya conozco algunas expresiones y quiero profundizar.' },
      { id: 'suficiente', title: 'Conozco suficiente', copy: 'Tengo conocimientos previos y quiero ponerlos a prueba.' }
    ];
    const choices = levelPhotos[id] || [area.image, area.image, area.image];
    target.innerHTML = `<div class="journey-heading"><button class="text-link" type="button" data-action="back-categories">← Categorías</button><p class="eyebrow">${escapeHtml(area.title)}</p><h1 id="level-title">¿Cuál es tu nivel de conocimiento?</h1><p>Elige el punto de partida que mejor te describa.</p></div><div class="level-photo-grid">${levels.map((level,index)=>{const photo=choices[index];return `<article class="level-photo-item"><button class="level-photo-card ${state.categoryLevels[id]===level.id?'is-selected':''}" type="button" data-level="${level.id}" aria-pressed="${state.categoryLevels[id]===level.id}"><img src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.alt)}" onerror="this.closest('.level-photo-card').classList.add('image-missing');this.remove()"><span class="level-photo-shade"></span><span class="level-photo-number">0${index+1}</span><strong>${level.title}</strong><small>${level.copy}</small><span class="level-selected-mark" aria-hidden="true">✓</span></button><span class="journey-photo-credit">${escapeHtml(photo.credit)}</span></article>`}).join('')}</div><div class="journey-actions"><button class="button setup-primary" type="button" data-action="save-level" ${state.categoryLevels[id]?'':'disabled'}>Continuar <span aria-hidden="true">→</span></button></div>`;
  }
  function routeStageDone(category, stage) { return progression.hasStage(state, category, stage); }
  function completeRouteStage(category, stage) {
    if (!progression.completeStage(state, category, stage, state.completed, content.lessons)) return false;
    saveState();
    return true;
  }
  function renderLearningRoute(id) {
    const area = areaInfo(id);
    const target = $('#learning-route-screen');
    if (!area || !target) return;
    if (!area.available) {
      target.innerHTML = `<section class="pathway-empty"><h1 id="pathway-title">Esta ruta estará disponible pronto</h1><p class="muted">El contenido se añadirá cuando esté preparado y verificado.</p><button class="button button-outline" type="button" data-action="back-to-learning">Volver a Aprendizaje</button></section>`;
      return;
    }
    reconcileEnergy();
    renderBatteryStatus();
    const lessons = content.lessons.filter(item => item.category === id);
    if (lessons.length && lessons.every(item => state.completed.includes(item.id)) && !routeStageDone(id, 'lecciones')) completeRouteStage(id, 'lecciones');
    const weekly = weeklyStats();
    const completedLessons = lessons.filter(item => state.completed.includes(item.id)).length;
    const pathTotal = lessons.length + 4;
    const pathDone = completedLessons + ['juego', 'practica', 'test'].filter(stage => routeStageDone(id, stage)).length + (state.badges.includes(id) ? 1 : 0);
    const canOpenLesson = index => index === 0 || state.completed.includes(lessons[index - 1].id);
    const lessonNodes = lessons.map((lesson, index) => {
      const done = state.completed.includes(lesson.id);
      const started = state.started.includes(lesson.id);
      const unlocked = done || started || canOpenLesson(index);
      const status = done ? 'Completada' : started ? 'En curso' : unlocked ? 'Disponible' : 'Bloqueada';
      return `<button class="learning-path-node learning-path-lesson ${done ? 'is-complete' : ''} ${unlocked ? 'is-open' : 'is-locked'}" type="button" data-lesson="${escapeHtml(lesson.id)}" style="--node-index:${index}" ${unlocked ? '' : 'disabled'} aria-label="${escapeHtml(lesson.shortTitle)}, ${status}"><span class="learning-path-orb">${done ? '✓' : unlocked ? (index + 1) : '⌑'}</span><strong>${escapeHtml(lesson.shortTitle)}</strong><small>${status}${!done && !started ? ' · 1 batería' : ''}</small></button>`;
    }).join('');
    const pathStages = [
      { id: 'juego', title: 'Conecta las parejas', subtitle: 'Juego de asociación', icon: '✣' },
      { id: 'practica', title: 'Practica lo aprendido', subtitle: 'Preguntas con pistas', icon: '✧' },
      { id: 'test', title: 'Desafío final', subtitle: 'Comprueba lo aprendido', icon: '★' },
      { id: 'recompensa', title: 'Insignia cultural', subtitle: 'Tu reconocimiento', icon: '🏅' }
    ];
    const stageNodes = pathStages.map((stage, index) => {
      const done = stage.id === 'recompensa' ? state.badges.includes(id) : routeStageDone(id, stage.id);
      const unlocked = done || progression.canOpenStage(state, id, stage.id);
      const status = done ? 'Completado' : unlocked ? 'Disponible' : 'Bloqueado';
      return `<button class="learning-path-node learning-path-stage ${done ? 'is-complete' : ''} ${unlocked ? 'is-open' : 'is-locked'}" type="button" data-route-stage="${stage.id}" data-route-category="${id}" style="--node-index:${lessons.length + index}" ${unlocked ? '' : 'disabled'} aria-label="${stage.title}, ${status}"><span class="learning-path-orb">${done ? '✓' : unlocked ? stage.icon : '⌑'}</span><strong>${stage.title}</strong><small>${stage.subtitle} · ${status}</small></button>`;
    }).join('');
    const energyValue = hasUnlimitedEnergy() ? '∞' : `${state.batteries}/${cap()}`;
    const energyCells = hasUnlimitedEnergy() ? '<i class="is-filled unlimited">∞</i>' : Array.from({ length: Math.min(cap(), 10) }, (_, index) => `<i class="${index < state.batteries ? 'is-filled' : ''}" aria-hidden="true"></i>`).join('');
    const adCopy = ['gratis', 'basico'].includes(state.plan)
      ? 'Los anuncios voluntarios y la recompensa por verlos son una demostración: aquí todavía no se reproducen anuncios ni se entregan baterías.'
      : 'Este plan de demostración muestra una experiencia sin anuncios.';
    const instrumentCards = id === 'musica' ? [
      { lesson: lessons[0], title: 'Siku o zampoña', tag: 'Instrumento de viento', note: 'Conoce sus partes arka e ira y la práctica colectiva de los sikuris.' },
      { lesson: lessons[1], title: 'Cajón peruano', tag: 'Instrumento de percusión', note: 'Descubre sus usos en géneros afroperuanos y criollos.' },
      { lesson: lessons[2], title: 'Cantos Esuwa', tag: 'Expresión vocal', note: 'Acércate a esta tradición del pueblo Wachiperi, en lengua Harakbut.' }
    ] : lessons.map(lesson => ({ lesson, title: lesson.shortTitle, tag: 'Expresión cultural', note: lesson.summary }));
    target.innerHTML = `<section class="learning-route-scene" style="--learning-scene-image:url('${escapeHtml(heroAsset.src)}')">
      <div class="learning-route-overlay" aria-hidden="true"></div><div class="learning-route-content">
        <header class="learning-route-header"><div><button class="learning-back-link" type="button" data-action="back-to-learning">← Todas las categorías</button><p class="eyebrow">${escapeHtml(area.title)} · TU AVENTURA</p><h1 id="pathway-title" tabindex="-1">Sigue el camino del conocimiento</h1><p>Completa una etapa para descubrir la siguiente. ¡La vicuña te acompaña!</p></div><div class="learning-route-hud"><span class="learning-energy-pill" aria-label="${hasUnlimitedEnergy() ? 'Energía ilimitada' : `${state.batteries} de ${cap()} baterías disponibles`}">⚡ <strong>${energyValue}</strong><small>baterías</small><span class="learning-battery-cells">${energyCells}</span></span><span class="learning-streak-pill">🔥 <strong>${weekly.streak}</strong><small>días</small></span><button class="learning-plans-link" type="button" data-action="view-plans">Ver planes</button></div></header>
        <div class="learning-route-progress"><div><span>Tu avance en esta ruta</span><strong>${pathDone}/${pathTotal}</strong></div><div class="learning-progress-track" role="progressbar" aria-label="Progreso de la ruta" aria-valuemin="0" aria-valuemax="${pathTotal}" aria-valuenow="${pathDone}"><span style="width:${Math.round(pathDone / pathTotal * 100)}%"></span></div><small>Una batería se consume al iniciar por primera vez cada lección. Repetir una lección no gasta otra.</small></div>
        <section class="learning-path-panel" aria-label="Camino de aprendizaje"><div class="learning-path-heading"><div><p class="eyebrow">TU CAMINO</p><h2>Avanza a tu propio ritmo</h2></div><span class="learning-path-count">${completedLessons} de ${lessons.length} lecciones</span></div><div class="learning-path-grid"><svg class="learning-rope" viewBox="0 0 1000 520" preserveAspectRatio="none" aria-hidden="true"><path d="M110 85 C250 5 390 5 500 85 S750 165 890 85 C960 45 960 180 890 240 S650 320 500 255 S250 190 110 255 C35 290 35 395 500 445" fill="none" stroke="#82451f" stroke-width="18" stroke-linecap="round"/><path d="M110 85 C250 5 390 5 500 85 S750 165 890 85 C960 45 960 180 890 240 S650 320 500 255 S250 190 110 255 C35 290 35 395 500 445" fill="none" stroke="#e4a74e" stroke-width="9" stroke-linecap="round" stroke-dasharray="10 8"/></svg>${lessonNodes}${stageNodes}</div><div class="learning-path-legend"><span><i class="legend-open"></i> Disponible</span><span><i class="legend-locked"></i> Bloqueado</span><span><i class="legend-done"></i> Completado</span></div></section>
        <section class="learning-discovery-section"><div class="learning-section-heading"><div><p class="eyebrow">UN POCO MÁS DE CERCA</p><h2>${id === 'musica' ? 'Instrumentos y expresiones musicales' : 'Conoce las expresiones de esta ruta'}</h2><p>${id === 'musica' ? 'Explora las fichas y vuelve a sus lecciones cuando quieras.' : 'Cada tarjeta te lleva a una de las lecciones de la ruta.'}</p></div><span class="learning-section-decoration" aria-hidden="true">♫</span></div><div class="learning-instrument-grid">${instrumentCards.map((card, index) => {
        const lessonIndex = lessons.findIndex(item => item.id === card.lesson.id);
        const canOpen = state.completed.includes(card.lesson.id) || state.started.includes(card.lesson.id) || canOpenLesson(lessonIndex);
        return `<button type="button" class="learning-instrument-card ${canOpen ? '' : 'is-locked'}" data-lesson="${escapeHtml(card.lesson.id)}" ${canOpen ? '' : 'disabled'}><img src="${escapeHtml(card.lesson.image.src)}" alt="${escapeHtml(card.lesson.image.alt)}" loading="lazy"><span class="learning-instrument-copy"><small>${escapeHtml(card.tag)}</small><strong>${escapeHtml(card.title)}</strong><span>${escapeHtml(card.note)}</span><b>${canOpen ? 'Ver ficha ↗' : 'Completa la lección anterior'}</b></span></button>`;
      }).join('')}</div></section>
        <section class="learning-practice-section" id="association-${id}"><div class="learning-section-heading"><div><p class="eyebrow">ACTIVIDAD OPCIONAL</p><h2>Relaciona lo que descubriste</h2><p>Una práctica de reconocimiento sin cronómetro. Se habilita al terminar las lecciones.</p></div><span class="learning-section-decoration" aria-hidden="true">✣</span></div><div class="learning-association-card"></div></section>
        <aside class="learning-plan-note"><div><strong>Tu energía y tus opciones</strong><p>${escapeHtml(adCopy)}</p></div><button class="button learning-secondary-button" type="button" data-action="view-plans">Ver baterías y planes</button></aside>
        <p class="learning-photo-credit"><a href="${escapeHtml(heroAsset.href)}" target="_blank" rel="noopener noreferrer">Fotografía de fondo: ${escapeHtml(heroAsset.credit)} ↗</a></p>
      </div></section>`;
    const associationTarget = $(`#association-${id} .learning-association-card`);    if (associationTarget) {
      associationTarget.id = `association-board-${id}`;
      renderAssociation(id, associationTarget);
    }
    window.requestAnimationFrame(() => $('#pathway-title')?.focus({ preventScroll: true }));
  }
  function launchRouteStage(category, stage) {
    if (stage === 'juego') {
      if (!routeStageDone(category, 'lecciones')) { showNotice('Sigue el orden de la ruta', 'Primero completa las tres lecciones para desbloquear este juego.'); return; }
      showView('ruta');
      startMatch(category);
      window.requestAnimationFrame(() => scrollElementIntoView($(`#association-${category}`), 'center'));
      return;
    }
    if (stage === 'practica') {
      if (!routeStageDone(category, 'juego')) return;
      startQuiz('practice', category);
      showView('jugar');
      return;
    }
    if (stage === 'test') {
      if (!routeStageDone(category, 'practica')) return;
      showView('jugar');
      startQuiz('area', category);
      return;
    }
    if (stage === 'recompensa') {
      if (!routeStageDone(category, 'test')) return;
      if (!state.badges.includes(category)) {
        state.badges.push(category);
        saveState();
        renderProgress();
        showNotice('¡Ruta completada!', `Has ganado la insignia de ${categoryMap[category].title}.`);
      }
      renderLearningRoute(category);
    }
  }
  function closeMobileMenu() {
    const sidebar = $('#sidebar'); const backdrop = $('#sidebar-backdrop'); const toggle = $('#mobile-menu-toggle');
    if (sidebar) sidebar.classList.remove('is-open');
    if (backdrop) backdrop.hidden = true;
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  function currentTutorialTarget() {
    const mobile = window.matchMedia('(max-width: 760px)').matches;
    const needsSidebar = mobile && [1, 4].includes(tutorialIndex);
    if (needsSidebar) {
      $('#sidebar')?.classList.add('is-open');
      $('#mobile-menu-toggle')?.setAttribute('aria-expanded', 'true');
    } else if (mobile) closeMobileMenu();
    return $(tutorialSteps[tutorialIndex]?.target);
  }

  function positionTutorialSpotlight() {
    if ($('#tutorial-layer').hidden || tutorialFinishedScreen) return;
    const target = currentTutorialTarget();
    if (!target) return;
    const rectBeforeScroll = target.getBoundingClientRect();
    if (rectBeforeScroll.bottom < 12 || rectBeforeScroll.top > window.innerHeight - 12 || rectBeforeScroll.right < 12 || rectBeforeScroll.left > window.innerWidth - 12) {
      target.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
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
    tutorialReturnFocus = document.activeElement && document.activeElement !== document.body ? document.activeElement : $('.nav-item[data-nav="inicio"]');
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
    closeMobileMenu();
    $('#tutorial-spotlight').style.display = 'none';
    $('#tutorial-skip').hidden = false;
    if (tutorialReturnFocus?.isConnected) tutorialReturnFocus.focus({ preventScroll: true });
    tutorialReturnFocus = null;
  }

  function advanceTutorial() {
    if (tutorialFinishedScreen) { endTutorial('completed'); return; }
    tutorialIndex += 1;
    if(tutorialIndex===1) showView('aprendizaje');
    else if(tutorialIndex===3) { currentCategory = 'musica'; showView('ruta'); }
    else if(tutorialIndex===4) showView('perfil');
    renderTutorialStep();
  }

  function renderCategoryCards(target) {
    const preferences = window.QR_ONBOARDING?.getProfile();
    const items = [...content.categories, ...futureAreas].sort((a,b) => { const ai = preferences?.interests.indexOf(a.id) ?? -1; const bi = preferences?.interests.indexOf(b.id) ?? -1; return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi); });
    target.innerHTML = items.map(category => {
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
    view.innerHTML = `<section class="learning-legacy-redirect"><p class="eyebrow">NUEVA ÁREA CULTURAL</p><h1>${escapeHtml(area.title)}</h1><p>Esta categoría aparecerá aquí cuando tenga lecciones, actividades y evaluaciones con contenido verificado.</p><button class="button learning-primary-button" type="button" data-action="back-to-learning">Volver a Aprendizaje</button></section>`;
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
        completeRouteStage(area, 'juego');
        renderLearningRoute(area);
        renderProgress();
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
    const target=$('#view-inicio'); if(!target)return;
    const nextLesson=content.lessons.find(lesson=>!state.completed.includes(lesson.id));
    const stats=weeklyStats(); const name=window.QR_ONBOARDING?.getName()||'explorador';
    target.innerHTML=`<div class="home-backdrop-credit"><a href="https://commons.wikimedia.org/wiki/File:Machu_Picchu_panorama.jpg" target="_blank" rel="noopener noreferrer">Imagen de fondo: Brian Jeffery Beggerly · CC BY 2.0</a></div><header class="dashboard-heading"><p class="eyebrow">QOYLLUR RITMO</p><h1 id="home-title">¡Hola, ${escapeHtml(name)}!</h1><p>Tu siguiente descubrimiento cultural te espera.</p></header><div class="home-status-grid"><section class="home-status-card"><span aria-hidden="true">🔥</span><small>Racha actual</small><strong>${stats.streak} ${stats.streak===1?'día':'días'}</strong></section><section class="home-status-card"><span aria-hidden="true">⚡</span><small>Baterías</small><strong>${hasUnlimitedEnergy()?'∞':state.batteries}${hasUnlimitedEnergy()?'':` / ${cap()}`}</strong></section><section class="home-status-card"><span aria-hidden="true">◷</span><small>Progreso general</small><strong>${state.completed.length} / ${content.lessons.length}</strong><div class="home-progress-track"><i style="width:${percentComplete()}%"></i></div></section></div><section class="home-activity-card"><div><p class="eyebrow">TU ACTIVIDAD</p><h2>${nextLesson?'Continúa a tu ritmo':'Has recorrido todas las lecciones'}</h2><p>${nextLesson?escapeHtml(nextLesson.title):'Puedes volver a explorar cualquier categoría.'}</p></div>${nextLesson?`<button class="button setup-primary" type="button" data-lesson="${escapeHtml(nextLesson.id)}">Continuar lección <span aria-hidden="true">→</span></button>`:'<button class="button setup-primary" type="button" data-nav="aprendizaje">Explorar Aprendizaje <span aria-hidden="true">→</span></button>'}</section><button class="tutorial-launch-card" type="button" id="replay-tutorial"><span aria-hidden="true">◎</span><span><strong>Tutorial: aprende a navegar</strong><small>Una guía breve para recorrer Qoyllur Ritmo.</small></span><b aria-hidden="true">→</b></button>`;
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
    window.QR_ONBOARDING?.updateBattery(state.batteries, cap());
    if (refilled) { renderHome(); renderLessonGroups(); }
  }
  function formatRemaining(ms) { const totalMinutes = Math.max(0, Math.ceil(ms / 60000)); const hours = Math.floor(totalMinutes / 60); const minutes = totalMinutes % 60; return `${hours} h ${String(minutes).padStart(2, '0')} min`; }

  function renderProgress() {
    renderBatteryStatus();
    $('#stat-lessons').innerHTML = `${state.completed.length} <small>/ 6</small>`;
    const firstTryLessons = Object.values(state.lessonAnswers).filter(answer => answer?.firstAttemptCorrect === true).length;
    $('#stat-lesson-first').innerHTML = `${firstTryLessons} <small>/ 6</small>`;
    $('#stat-trivia-first').innerHTML = state.firstTriviaScore === null ? '— <small>/ 8</small>' : `${state.firstTriviaScore} <small>/ 8</small>`;
    $('#stat-trivia').innerHTML = state.bestTrivia === null ? '— <small>/ 8</small>' : `${state.bestTrivia} <small>/ 8</small>`;
    $('#stat-experience').textContent = `${state.experience} XP`;
    $('#best-score').textContent = state.bestTrivia === null ? '—' : state.bestTrivia;
    $('#best-score-total').textContent = '/ 8';
    $('#first-score').textContent = state.firstTriviaScore === null ? '—' : state.firstTriviaScore;
    const history = $('#historical-score');
    if (history) { history.hidden = state.historicalTriviaBest === null; history.textContent = state.historicalTriviaBest === null ? '' : `Récord anterior conservado como dato histórico: ${state.historicalTriviaBest}/8 (reglas anteriores).`; }
    const migrationNote = $('#storage-migration-note');
    if (migrationNote) migrationNote.hidden = !storageMigrationNote;
    $('#route-completed-count').textContent = `${state.completed.length}/6`;
    $('#category-progress-list').innerHTML = [...content.categories,...futureAreas].map(category => {
      const hasLessons = categoryMap[category.id];
      const stats = hasLessons ? categoryPercent(category.id) : null;
      return `<div class="category-progress-row"><div class="progress-row-icon ${category.tone}" aria-hidden="true">${category.icon}</div><div class="progress-row-info"><div class="progress-row-top"><strong>${escapeHtml(category.title)}</strong><span>${hasLessons ? `${stats.completed}/${stats.total}` : 'En preparación'}</span></div>${hasLessons ? `<div class="progress-bar"><span style="width:${stats.percent}%"></span></div>` : '<small class="muted">El contenido se incorporará con fuentes verificadas.</small>'}</div></div>`;
    }).join('');
    const badgeCatalog = [...content.categories,...futureAreas];
    $('#badges-grid').innerHTML = badgeCatalog.map(area => { const available = Boolean(categoryMap[area.id]); const earned = state.badges.includes(area.id); return `<article class="badge-card ${earned?'is-earned':''}"><span aria-hidden="true">${earned?'✦':'◇'}</span><strong>${escapeHtml(area.title)}</strong><small>${earned?'Ruta completada':available?'Completa la ruta para obtenerla':'Contenido en preparación'}</small></article>`; }).join('');
    $('#badge-count').textContent = `${state.badges.length} desbloqueada${state.badges.length===1?'':'s'}`;
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
    $('#trivia-card').innerHTML = `<div class="trivia-start"><div class="quiz-burst" aria-hidden="true">✳</div><p class="eyebrow">TRIVIA CULTURAL · 8 PREGUNTAS</p><h2>¿Cuánto sabes<br>de nuestros ritmos?</h2><p class="muted">Tu primera ronda registra una evaluación inicial. Después podrás practicar sin límite y ver tu mejor resultado.</p><div class="quiz-start-details"><span><b>08</b> preguntas</span><span><b>✦</b> respuestas al final</span><span><b>∞</b> partidas de práctica</span></div><div class="quiz-start-actions"><button class="button button-dark button-large" type="button" id="start-quiz">Empezar trivia <span aria-hidden="true">→</span></button>${bonus ? '<button class="button button-outline" type="button" id="start-bonus">Reto relámpago · 3 preguntas ✦</button>' : ''}</div><span class="trivia-footer-note">No necesitas baterías para jugar · las repeticiones no suman puntos de liga</span></div>`;
    $('#best-score').textContent = state.bestTrivia === null ? '—' : state.bestTrivia;
    $('#best-score-total').textContent = '/ 8';
    $('#first-score').textContent = state.firstTriviaScore === null ? '—' : state.firstTriviaScore;
    const history = $('#historical-score');
    if (history) { history.hidden = state.historicalTriviaBest === null; history.textContent = state.historicalTriviaBest === null ? '' : `Récord anterior conservado como dato histórico: ${state.historicalTriviaBest}/8 (reglas anteriores).`; }
  }

  function startQuiz(mode = 'main', category = null) {
    const questions = mode === 'practice' && category ? content.lessons.filter(item => item.category === category).map(item => ({ id: `${item.id}-practice`, lesson: item.id, prompt: item.question.text, options: item.question.options, correctOptionId: item.question.correctOptionId, explanation: item.question.feedback })) : category ? content.trivia.filter(question => lessonMap[question.lesson]?.category === category) : mode === 'bonus' ? content.trivia.filter(question => question.bonusEligible === true) : content.trivia;
    if (!questions.length) return;
    quizSession = { index: 0, score: 0, selected: null, answered: false, mode, category, activityId: category ? `area-quiz-${category}` : mode === 'bonus' ? 'bonus-quiz' : 'main-trivia', answers: [], questions: questionUtils.prepareQuestions(questions) };
    renderQuizQuestion(true);
  }
  function focusQuiz(selector) {
    window.requestAnimationFrame(() => $(selector)?.focus({ preventScroll: true }));
  }
  function renderQuizQuestion(focusTitle = false, focusSelected = false, focusNext = false) {
    const q = quizSession.questions[quizSession.index];
    const total = quizSession.questions.length;
    const progress = (quizSession.index / total) * 100;
    $('#trivia-card').innerHTML = `<div class="trivia-question"><div class="quiz-topline"><span class="eyebrow">${quizSession.mode === 'bonus' ? 'RETO RELÁMPAGO' : 'PREGUNTA'} ${String(quizSession.index + 1).padStart(2, '0')} <span class="muted">/ ${String(total).padStart(2, '0')}</span></span><button type="button" class="quiz-exit" id="quiz-exit">Salir</button></div><div class="quiz-progress" aria-hidden="true"><span style="width:${progress}%"></span></div><h2 id="quiz-question-title" tabindex="-1">${escapeHtml(q.prompt)}</h2><div class="quiz-options" role="group" aria-label="Opciones de respuesta">${q.options.map((option, index) => `<button class="quiz-option ${quizSession.selected === option.id ? 'selected' : ''}" type="button" data-answer="${escapeHtml(option.id)}" aria-pressed="${quizSession.selected === option.id}" ${quizSession.answered ? 'disabled' : ''}><span class="option-key" aria-hidden="true">${String.fromCharCode(65 + index)}</span><span>${escapeHtml(option.text)}</span><span class="option-state" aria-hidden="true"></span></button>`).join('')}</div>${quizSession.answered ? '<p class="answer-hint">Respuesta registrada. Al terminar verás la respuesta correcta y la explicación.</p>' : '<p class="answer-hint">Elige una opción para responder.</p>'}<div class="quiz-actions">${quizSession.answered ? `<button class="button button-dark" type="button" id="quiz-next">${quizSession.index === total - 1 ? 'Ver resultado' : 'Siguiente pregunta'} <span aria-hidden="true">→</span></button>` : `<button class="button button-dark" type="button" id="quiz-submit" ${quizSession.selected === null ? 'disabled' : ''}>Registrar respuesta <span aria-hidden="true">→</span></button>`}</div></div>`;
    const live = $('#quiz-live');
    if (live) live.textContent = quizSession.answered ? 'Respuesta registrada.' : `Pregunta ${quizSession.index + 1} de ${total}.`;
    if (focusTitle) focusQuiz('#quiz-question-title');
    else if (focusNext) focusQuiz('#quiz-next');
    else if (focusSelected) focusQuiz(`[data-answer="${CSS.escape(quizSession.selected)}"]`);
  }
  function finishQuiz() {
    const score = quizSession.score;
    const total = quizSession.questions.length;
    const mode = quizSession.mode;
    const category = quizSession.category;
    const activityId = quizSession.activityId;
    const answers = quizSession.answers.slice();
    const isMain = mode === 'main' && !category;
    const practiceMode = mode === 'practice' && Boolean(category);
    const passMark = Math.ceil(total * 2 / 3);
    const passed = score >= passMark;
    const firstRound = isMain && state.firstTriviaScore === null;
    const previousBest = state.bestTrivia;
    const isBest = isMain && (previousBest === null || score > previousBest);
    if (isMain) {
      const records = questionUtils.updateTriviaRecords(state.firstTriviaScore, state.bestTrivia, score);
      state.firstTriviaScore = records.firstAttemptScore;
      state.bestTrivia = records.bestPracticeScore;
    }
    let awarded = false;
    const points = isMain ? 8 + score * 2 : (category ? 6 : 4) + score * 2;
    if (practiceMode) {
      const previous = state.categoryPracticeBest[category];
      state.categoryPracticeBest[category] = previous === null ? score : Math.max(previous, score);
      if (passed) completeRouteStage(category, 'practica');
    } else {
      const awardKey = category || (mode === 'bonus' ? 'bonus' : 'main');
      const canAward = state.quizAwards?.[awardKey] !== true;
      awarded = canAward && (!category || passed) && recordActivity(`quiz-${activityId}`, points);
      if (canAward && (!category || passed)) state.quizAwards[awardKey] = true;
      if (category && !practiceMode && passed) completeRouteStage(category, 'test');
    }
    saveState();
    $('#best-score').textContent = state.bestTrivia === null ? '—' : state.bestTrivia;
    $('#first-score').textContent = state.firstTriviaScore === null ? '—' : state.firstTriviaScore;
    const bestMessage = practiceMode ? `${passed ? 'Etapa de práctica superada' : `Necesitas al menos ${passMark} aciertos para superar esta etapa`} · mejor resultado ${state.categoryPracticeBest[category]}/${total}.` : !isMain ? `${category ? `Reto de ${categoryMap[category].title}` : 'Reto extra'} completado · ${score}/${total}.` : firstRound ? `Primera ronda evaluativa registrada: ${score}/8. ${isBest ? 'También es tu mejor resultado de práctica.' : ''}` : isBest ? '¡Nuevo récord de práctica!' : `Mejor resultado de práctica: ${state.bestTrivia}/8.`;
    const completedMode = practiceMode ? 'PRÁCTICA DE ÁREA' : category ? 'RETO DEL ÁREA COMPLETADO' : mode === 'bonus' ? 'RETO COMPLETADO' : 'TRIVIA COMPLETADA';
    const retryCategory = category || '';
    const review = answers.map(item => `<li class="quiz-review-item ${item.correct ? 'is-correct' : 'is-incorrect'}"><strong>${escapeHtml(item.prompt)}</strong><span>Tu respuesta: ${escapeHtml(item.selectedText)}</span>${item.correct ? '' : `<span>Respuesta correcta: ${escapeHtml(item.correctText)}</span>`}<p>${escapeHtml(item.explanation)}</p><button class="text-link" type="button" data-review="${escapeHtml(item.lesson)}">Repasar lección <span aria-hidden="true">↗</span></button></li>`).join('');
    $('#trivia-card').innerHTML = `<div class="trivia-result"><div class="result-medal" aria-hidden="true">${passed ? '✦' : '♫'}</div><p class="eyebrow">${completedMode}</p><h2 tabindex="-1" id="quiz-result-title">${passed ? '¡Buen trabajo!' : 'Cada respuesta suma'}</h2><p class="muted">Tu resultado en esta ronda</p><div class="result-score">${score}<span>/ ${total}</span></div><p class="result-best">${bestMessage}</p><p class="result-points">${awarded ? `Primera actividad de este tipo: +${points} puntos.` : 'Sin puntos de liga nuevos en esta partida.'}</p><details class="quiz-review"><summary>Revisar respuestas y explicaciones</summary><ol>${review}</ol></details><div class="result-actions"><button class="button button-dark" type="button" id="retry-quiz" data-mode="${mode}" data-category="${retryCategory}">Intentar otra vez</button><button class="button button-outline" type="button" data-action="open-route" data-category="${retryCategory}">${retryCategory ? 'Volver a la ruta' : 'Explorar lecciones'}</button></div></div>`;
    const live = $('#quiz-live');
    if (live) live.textContent = `Ronda terminada. Resultado ${score} de ${total}. ${awarded ? `Sumaste ${points} puntos.` : 'Sin puntos nuevos.'}`;
    focusQuiz('#quiz-result-title');
    quizSession = null;
    if (category) { renderLearningRoute(category); renderProgress(); }
  }

  function openLesson(id) {
    const lesson = lessonMap[id];
    if (!lesson) return;
    lessonReturnFocus = document.activeElement;
    const completed = state.completed.includes(id);
    const alreadyStarted = state.started.includes(id);
    const categoryLessons = content.lessons.filter(item => item.category === lesson.category);
    const lessonIndex = categoryLessons.findIndex(item => item.id === id);
    const previousLesson = lessonIndex > 0 ? categoryLessons[lessonIndex - 1] : null;
    if (!progression.canOpenLesson(state, lesson.category, id, content.lessons)) {
      showNotice('Esta lección sigue bloqueada', `Primero completa ${previousLesson?.shortTitle || 'la lección anterior'}. Así avanzas paso a paso y se mantiene el orden de aprendizaje.`);
      return;
    }
    if (!completed && !alreadyStarted) {
      const registration = progression.registerLessonStart(state, id, {
        unlimited: hasUnlimitedEnergy(),
        now: Date.now(),
        refillMs: REFILL_MS
      });
      if (registration.insufficientEnergy) {
        showNotice('Te faltan baterías', 'Has usado todas tus baterías disponibles. Se recargan por completo cada 24 horas. En esta versión, los anuncios y los planes son demostrativos; no se realizan cobros ni se entregan baterías por ver anuncios.');
        return;
      }
      if (!registration.started) return;
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
    const answerState = savedAnswer && typeof savedAnswer === 'object' ? savedAnswer : {};
    const selected = answerState.selected ?? null;
    const answered = answerState.checked === true;
    const correct = answered && questionUtils.isCorrectOption(lesson.question, selected);
    const feedback = answered ? `<div class="lesson-answer-feedback ${correct ? 'correct' : 'incorrect'}" role="status"><strong>${correct ? '¡Correcto!' : 'Aún no coincide'}</strong><p>${correct ? escapeHtml(lesson.question.feedback) : 'Relee esta parte de la lección y vuelve a intentarlo.'}</p>${correct && answerState.firstAttemptCorrect === true ? '<small>Correcta al primer intento.</small>' : correct ? '<small>Has llegado a la respuesta correcta tras practicar.</small>' : '<button class="text-link" id="lesson-retry" type="button">Elegir otra respuesta</button>'}</div>` : '';
    const completed = state.completed.includes(lesson.id);
    $('#lesson-dialog-content').innerHTML = `<article class="lesson-detail"><div class="lesson-detail-image"><img src="${escapeHtml(lesson.image.src)}" alt="${escapeHtml(lesson.image.alt)}" onerror="this.closest('.lesson-detail-image').classList.add('image-missing');this.remove()"><span class="detail-image-caption"><a href="${escapeHtml(lesson.image.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(lesson.image.caption)} ↗</a></span></div><div class="lesson-detail-copy"><div class="lesson-meta"><span>${escapeHtml(categoryMap[lesson.category].title)}</span><span>·</span><span>${escapeHtml(lesson.region)}</span><span>·</span><span>${lesson.duration}</span></div><h1 id="lesson-dialog-title">${escapeHtml(lesson.title)}</h1><div class="objective-box"><span class="objective-icon" aria-hidden="true">◎</span><div><strong>Al terminar podrás</strong><p>${escapeHtml(lesson.objective)}</p></div></div><p class="lesson-intro">${escapeHtml(lesson.intro)}</p><div class="lesson-sections">${lesson.sections.map((section, index) => `<section><span class="section-number">0${index + 1}</span><div><h2>${escapeHtml(section.heading)}</h2><p>${escapeHtml(section.body)}</p></div></section>`).join('')}</div><aside class="cultural-fact"><span aria-hidden="true">✦</span><div><strong>Dato cultural</strong><p>${escapeHtml(lesson.fact)}</p></div></aside><section class="comprehension"><p class="eyebrow">COMPRUEBA LO APRENDIDO</p><h2>${escapeHtml(lesson.question.text)}</h2><div class="comprehension-options" role="group" aria-label="Opciones de respuesta">${lessonOptionOrder.map((option, index) => `<button class="comprehension-option ${selected === option.id ? 'selected' : ''} ${correct && option.id === selected ? 'correct' : answered && option.id === selected ? 'incorrect' : ''}" type="button" data-comprehension="${escapeHtml(option.id)}" aria-pressed="${selected === option.id}" ${answered ? 'disabled' : ''}><span aria-hidden="true">${String.fromCharCode(65 + index)}</span>${escapeHtml(option.text)}</button>`).join('')}</div>${feedback}<button class="button button-outline" type="button" id="check-comprehension" ${selected === null || answered ? 'disabled' : ''}>Comprobar respuesta</button></section><div class="lesson-complete-row"><button class="button button-dark" type="button" id="mark-complete" ${completed ? 'disabled' : !correct ? 'disabled' : ''}>${completed ? '✓ Lección completada' : 'Marcar como completada'}</button><span>${completed ? 'Puedes repetirla cuando quieras, sin gastar baterías.' : correct ? 'Puedes completar esta lección.' : 'Responde correctamente para completar esta lección.'}</span></div></div></article>`;
  }

  function focusLesson(selector) { window.requestAnimationFrame(() => $(selector, $('#lesson-dialog-content'))?.focus({ preventScroll: true })); }

  function showNotice(title, copy) {
    $('#notice-title').textContent = title;
    $('#notice-copy').textContent = copy;
    const dialog = $('#notice-dialog');
    if (!dialog.open) dialog.showModal();
    $('#close-notice').focus();
  }
  function closeLesson() {
    const dialog = $('#lesson-dialog');
    if (dialog.open) dialog.close();
    dialogLesson = null; renderHome(); renderLessonGroups(); renderProgress();
    window.requestAnimationFrame(() => {
      if (lessonReturnFocus?.isConnected) lessonReturnFocus.focus({ preventScroll: true });
      else { const heading = $('[data-view]:not([hidden]) h1'); if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); } }
      lessonReturnFocus = null;
    });
  }
  function openLessonFromCurrent(id) {
    const lesson = lessonMap[id];
    if (!lesson) return;
    reconcileEnergy();
    if (!progression.canOpenLesson(state, lesson.category, id, content.lessons)) {
      showNotice('Esta lección sigue bloqueada', 'Primero completa la lección anterior de esta ruta. Mientras tanto, puedes consultar la explicación que aparece en el resultado de la trivia.');
      return;
    }
    const alreadyStarted = state.started.includes(id);
    const alreadyCompleted = state.completed.includes(id);
    if (!alreadyStarted && !alreadyCompleted && !hasUnlimitedEnergy() && state.batteries <= 0) {
      showNotice('Te faltan baterías', 'No tienes baterías disponibles para iniciar esta lección. La explicación de la pregunta ya aparece en el resultado de la trivia.');
      return;
    }
    quizReturnMarkup = $('#trivia-card').innerHTML;
    showView('explorar');
    openLesson(id);
  }
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
    if (nav) { if (areaInfo(nav.dataset.nav)) openCategory(nav.dataset.nav); else showView(nav.dataset.nav); return; }
    const learningCategory=event.target.closest('[data-learning-category]');
    if (learningCategory) { openCategory(learningCategory.dataset.learningCategory); return; }
    const preferenceAnswer=event.target.closest('[data-preference-answer]');
    if(preferenceAnswer){preferenceDraft[preferenceIndex]=Number(preferenceAnswer.dataset.preferenceAnswer);renderCategoryQuestions();return;}
    const lessonButton = event.target.closest('[data-lesson]');
    if (lessonButton) { openLesson(lessonButton.dataset.lesson); return; }
    const categoryButton = event.target.closest('[data-category]');
    if (categoryButton) { openCategory(categoryButton.dataset.category, true); return; }
    const actionButton = event.target.closest('[data-action]');
    if (actionButton) {
      const action = actionButton.dataset.action;
      if (action === 'continue-route') {
        const prefs = window.QR_ONBOARDING?.getProfile();
        const next = content.lessons.find(item => prefs?.interests.includes(item.category) && !state.completed.includes(item.id)) || content.lessons.find(item => !state.completed.includes(item.id));
        openCategory(next?.category || prefs?.interests.find(id => categoryMap[id]) || 'danzas'); return;
      }
      if (action === 'edit-personalization') { window.QR_ONBOARDING?.startEditing(); return; }
      if (action === 'back-home') { showView('inicio'); return; }
      if (action === 'back-categories') { showView('aprendizaje'); return; }
      if (action === 'back-learning') { showView('aprendizaje'); return; }
      if (action === 'back-level') { showView('aprendizaje'); return; }
      if (action === 'edit-level') { openCategory(currentCategory, true); return; }
      if (action === 'save-level') { showView('introduccion'); return; }
      if (action === 'begin-route') { showView('ruta'); return; }
      if (action === 'start-category-questions') { preferenceIndex = 0; preferenceDraft = []; showView('preguntas-iniciales'); return; }
      if (action === 'view-plans') { showView('progreso'); window.requestAnimationFrame(() => scrollElementIntoView($('.membership-section'), 'start')); return; }
      if (action === 'next-preference') {
        const questions=preferenceQuestions[preferenceCategory]||[];
        if(!Number.isInteger(preferenceDraft[preferenceIndex]))return;
        preferenceIndex+=1;
        if(preferenceIndex>=questions.length){categoryPreferences[preferenceCategory]=preferenceDraft.map((choice,index)=>({question:index+1,choice}));try{localStorage.setItem(categoryPreferenceKey,JSON.stringify(categoryPreferences));}catch{} }
        renderCategoryQuestions();return;
      }
      if (action === 'enter-category') { currentCategory = preferenceCategory; showView('ruta'); return; }
      if (action === 'back-to-learning') { showView('aprendizaje');return; }
      if (action === 'open-route') { if (actionButton.dataset.category && categoryMap[actionButton.dataset.category]) { currentCategory = actionButton.dataset.category; showView('ruta'); } else showView('explorar'); return; }
    }
    const levelChoice = event.target.closest('[data-level]');
    if (levelChoice && currentCategory) {
      state.categoryLevels[currentCategory] = levelChoice.dataset.level;
      saveState();
      renderLevelSelection(currentCategory);
      return;
    }
    const routeNode = event.target.closest('[data-route-stage]');
    if (routeNode) { launchRouteStage(routeNode.dataset.routeCategory, routeNode.dataset.routeStage); return; }
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
    if (answer && quizSession && !quizSession.answered) {
      const q = quizSession.questions[quizSession.index];
      if (q.options.some(option => option.id === answer.dataset.answer)) { quizSession.selected = answer.dataset.answer; renderQuizQuestion(false, true); }
      return;
    }
    const lessonAnswer = event.target.closest('[data-comprehension]');
    if (lessonAnswer && dialogLesson) {
      const lesson = lessonMap[dialogLesson];
      const previous = state.lessonAnswers?.[dialogLesson] || {};
      if (!previous.checked && lesson.question.options.some(option => option.id === lessonAnswer.dataset.comprehension)) {
        state.lessonAnswers[dialogLesson] = { ...previous, selected: lessonAnswer.dataset.comprehension, checked: false };
        saveState(); renderLessonDialog(lesson); focusLesson(`[data-comprehension="${CSS.escape(lessonAnswer.dataset.comprehension)}"]`);
      }
      return;
    }
    if (event.target.closest('#lesson-retry') && dialogLesson) {
      state.lessonAnswers[dialogLesson] = questionUtils.unlockLessonRetry(state.lessonAnswers[dialogLesson]);
      saveState(); renderLessonDialog(lessonMap[dialogLesson]);
      focusLesson('[data-comprehension]'); announce('Elige una nueva respuesta.'); return;
    }
    const review = event.target.closest('[data-review]');
    if (review) {
      openLessonFromCurrent(review.dataset.review);
      return;
    }
    const practiceLink = event.target.closest('[data-open-practice]');
    if (practiceLink) {
      const category = practiceLink.dataset.openPractice;
      if (!routeStageDone(category, 'lecciones')) { showNotice('Todavía está bloqueado', 'Completa primero las tres lecciones de esta ruta.'); return; }
      currentCategory = category; showView('ruta'); startMatch(category);
      window.requestAnimationFrame(() => scrollElementIntoView($(`#association-${category}`), 'center')); return;
    }
    const startMatchButton = event.target.closest('[data-start-match]');
    if (startMatchButton) { const category = startMatchButton.dataset.startMatch; if (!routeStageDone(category, 'lecciones')) { showNotice('Sigue el orden de la ruta', 'Completa primero las tres lecciones para desbloquear esta práctica.'); return; } startMatch(category); return; }
    const matchChoice = event.target.closest('[data-match-side]');
    if (matchChoice) { chooseMatch(matchChoice.dataset.matchArea, matchChoice.dataset.matchSide, matchChoice.dataset.matchId); return; }
    const resetMatchButton = event.target.closest('[data-reset-match]');
    if (resetMatchButton) { matchSessions[resetMatchButton.dataset.resetMatch] = null; renderAssociation(resetMatchButton.dataset.resetMatch); return; }
    const areaQuizButton = event.target.closest('[data-area-quiz]');
    if (areaQuizButton) { showView('jugar'); startQuiz('area', areaQuizButton.dataset.areaQuiz); scrollElementIntoView($('#trivia-card'), 'center'); return; }
    if (event.target.closest('#start-quiz')) { startQuiz(); return; }
    if (event.target.closest('#start-bonus') && (state.plan === 'plus' || state.plan === 'premium')) { startQuiz('bonus'); return; }
    if (event.target.closest('#quiz-submit') && quizSession && quizSession.selected !== null) {
      if (quizSession.answered) return;
      const q = quizSession.questions[quizSession.index];
      const selectedOption = q.options.find(option => option.id === quizSession.selected);
      if (!selectedOption) return;
      quizSession.answered = true;
      const correct = questionUtils.isCorrectOption(q, selectedOption.id);
      quizSession.score = questionUtils.nextScore(quizSession.score, q, selectedOption.id);
      quizSession.answers.push({ prompt: q.prompt, lesson: q.lesson, selectedText: selectedOption.text, correctText: q.options.find(option => option.id === q.correctOptionId)?.text || '', correct, explanation: q.explanation });
      renderQuizQuestion(false, false, true); return;
    }
    if (event.target.closest('#quiz-next') && quizSession && quizSession.answered) { if (quizSession.index === quizSession.questions.length - 1) finishQuiz(); else { quizSession.index += 1; quizSession.selected = null; quizSession.answered = false; renderQuizQuestion(true); } return; }
    if (event.target.closest('#quiz-exit')) { quizSession = null; renderQuizIntro(); return; }
    if (event.target.closest('#retry-quiz')) { const retry = event.target.closest('#retry-quiz'); startQuiz(retry.dataset.mode || 'main', retry.dataset.category || null); return; }
    if (event.target.closest('#check-comprehension') && dialogLesson) {
      const lesson = lessonMap[dialogLesson];
      const previous = state.lessonAnswers?.[dialogLesson];
      if (!previous || previous.checked || !lesson.question.options.some(option => option.id === previous.selected)) return;
      const checked = questionUtils.registerLessonAttempt(previous, lesson.question, previous.selected);
      state.lessonAnswers[dialogLesson] = checked;
      saveState(); renderLessonDialog(lesson);
      const isCorrect = questionUtils.isCorrectOption(lesson.question, checked.selected);
      announce(isCorrect ? 'Respuesta correcta. Ya puedes completar la lección.' : 'Aún no coincide. Relee la lección y vuelve a intentarlo.');
      focusLesson(isCorrect ? '#mark-complete' : '#lesson-retry'); return;
    }
    if (event.target.closest('#mark-complete') && dialogLesson) {
      const saved = state.lessonAnswers?.[dialogLesson];
      if (saved?.checked && questionUtils.isCorrectOption(lessonMap[dialogLesson].question, saved.selected) && !state.completed.includes(dialogLesson)) {
        const lessonId = dialogLesson;
        state.completed.push(lessonId); completeRouteStage(lessonMap[lessonId].category, 'lecciones'); saveState();
        recordActivity(`lesson-${lessonId}`, saved.firstAttemptCorrect === true ? 10 : 0);
        renderLessonDialog(lessonMap[lessonId]); renderHome(); renderLessonGroups(); renderAreaViews(); renderLearningRoute(lessonMap[lessonId].category); renderProgress();
        const node = $(`.route-node[data-lesson="${lessonId}"]`); if (node) { node.classList.add('celebrate'); window.setTimeout(() => node.classList.remove('celebrate'), 650); }
        announce(saved.firstAttemptCorrect === true ? '¡Lección completada! Respuesta correcta al primer intento y puntos guardados.' : '¡Lección completada! Tu progreso se guardó; los reintentos no suman puntos.');
      } else announce('Primero responde correctamente la pregunta.');
      return;
    }
    if (event.target.closest('#close-lesson')) { closeLesson(); return; }
    if (event.target.closest('#close-notice')) { $('#notice-dialog').close(); return; }
    if (event.target.closest('#battery-info')) { showNotice('¿Cómo funcionan las baterías?', 'Una batería se usa al iniciar por primera vez una lección. No se vuelve a cobrar al actualizar, reabrir o repetir una lección ya iniciada o completada. La recarga completa ocurre 24 horas después del primer uso. La trivia no utiliza baterías.'); return; }
    if (event.target.closest('#ad-reward')) { showNotice('Anuncio voluntario (demo)', 'La interfaz está preparada para ofrecer una recompensa por ver un anuncio voluntario. En esta versión no hay anuncios conectados y tu saldo no cambia.'); return; }
    if (event.target.closest('#reset-progress')) { if (window.confirm('¿Reiniciar todo tu progreso? Se borrarán lecciones completadas, mejor puntaje, racha, liga personal, plan demo y baterías guardadas en este navegador.')) { state = freshState(); saveState(); quizSession = null; matchSessions.danzas = null; matchSessions.musica = null; renderHome(); renderLessonGroups(); renderAreaViews(); renderProgress(); renderBatteryStatus(); renderQuizIntro(); showView('inicio'); announce('El progreso se reinició.'); } return; }
  });
  document.addEventListener('submit',event=>{
    if(event.target.id!=='profile-name-form')return;
    event.preventDefault();
    const input=$('#profile-name-edit');
    if(window.QR_ONBOARDING?.setName(input?.value)){renderProfile();renderHome();announce('El nombre del perfil se actualizó.');}
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
  $('#lesson-dialog').addEventListener('close', () => {
    dialogLesson = null; renderHome(); renderLessonGroups(); renderProgress();
    if (quizReturnMarkup !== null) {
      showView('jugar');
      $('#trivia-card').innerHTML = quizReturnMarkup;
      quizReturnMarkup = null;
      focusQuiz('#quiz-result-title');
    }
  });
  $('#notice-dialog').addEventListener('click', event => { if (event.target === $('#notice-dialog')) $('#notice-dialog').close(); });
  window.addEventListener('storage', event => { if (event.key === STORAGE_KEY) { state = loadState(); renderHome(); renderLessonGroups(); renderAreaViews(); renderProgress(); renderBatteryStatus(); renderQuizIntro(); if (currentCategory && $('#view-ruta') && !$('#view-ruta').hidden) renderLearningRoute(currentCategory); } });

  const setupAreas = [...content.categories, ...futureAreas].map(area => {
    const lesson = content.lessons.find(item => item.category === area.id);
    return { ...area, image: lesson?.image || area.image };
  });
  const setupRequired = window.QR_ONBOARDING?.initialize(setupAreas) ?? false;
  window.addEventListener('qr:adventure-started', () => showView('inicio'));
  window.addEventListener('qr:setup-complete', () => {
    renderHome(); renderProgress(); renderBatteryStatus();
    let tutorialSeen = false;
    try { tutorialSeen = Boolean(JSON.parse(localStorage.getItem(TUTORIAL_KEY) || 'null')?.status); } catch { tutorialSeen = false; }
    if (!tutorialSeen) window.setTimeout(startTutorial, 350);
  });
  window.addEventListener('qr:setup-cancel', () => renderHome());

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
})();