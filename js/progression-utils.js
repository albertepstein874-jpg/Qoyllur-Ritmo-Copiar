
(() => {
  'use strict';

  const VALID_CATEGORIES = new Set(['danzas', 'musica']);

  const STAGE_ORDER = [
    'lecciones',
    'juego',
    'practica',
    'test',
    'recompensa'
  ];

  const COMPLETABLE_STAGES = new Set([
    'lecciones',
    'juego',
    'practica',
    'test'
  ]);

  const EXPERIENCE_BY_STAGE = Object.freeze({
    lecciones: 50,
    juego: 50,
    practica: 50,
    test: 100
  });

  const FAILED_START = Object.freeze({
    started: false,
    energySpent: false,
    insufficientEnergy: false
  });

  function isRecord(value) {
    return value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value);
  }

  function isValidId(value) {
    return typeof value === 'string' &&
      value.trim().length > 0;
  }

  function hasStage(state, category, stage) {
    if (!isRecord(state) || !VALID_CATEGORIES.has(category)) {
      return false;
    }

    const stages = state.routeStages?.[category];

    return Array.isArray(stages) && stages.includes(stage);
  }

  function canOpenStage(state, category, stage) {
    if (!isRecord(state) || !VALID_CATEGORIES.has(category)) {
      return false;
    }

    const stages = state.routeStages?.[category];
    const stageIndex = STAGE_ORDER.indexOf(stage);

    if (!Array.isArray(stages) || stageIndex < 0) {
      return false;
    }

    if (stage === 'recompensa') {
      return stages.includes('test');
    }

    if (stageIndex === 0) {
      return true;
    }

    return stages.includes(STAGE_ORDER[stageIndex - 1]);
  }

  function completeStage(
    state,
    category,
    stage,
    completedLessonIds,
    lessons
  ) {
    // Validar todo antes de modificar el estado.
    if (!isRecord(state) || !VALID_CATEGORIES.has(category)) {
      return false;
    }

    if (!COMPLETABLE_STAGES.has(stage)) {
      return false;
    }

    const categoryStages = state.routeStages?.[category];

    if (
      !Array.isArray(categoryStages) ||
      !Array.isArray(state.experienceAwards) ||
      !Number.isSafeInteger(state.experience) ||
      state.experience < 0
    ) {
      return false;
    }

    if (
      categoryStages.includes(stage) ||
      !canOpenStage(state, category, stage)
    ) {
      return false;
    }

    // La etapa de lecciones requiere completar todos los temas.
    if (stage === 'lecciones') {
      if (
        !Array.isArray(completedLessonIds) ||
        !Array.isArray(lessons)
      ) {
        return false;
      }

      const categoryLessons = lessons.filter(
        lesson => isRecord(lesson) &&
          lesson.category === category
      );

      if (
        categoryLessons.length === 0 ||
        categoryLessons.some(lesson => !isValidId(lesson.id)) ||
        !categoryLessons.every(
          lesson => completedLessonIds.includes(lesson.id)
        )
      ) {
        return false;
      }
    }

    const awardId = `${category}-${stage}`;
    const alreadyAwarded = state.experienceAwards.includes(awardId);

    const nextExperience = alreadyAwarded
      ? state.experience
      : state.experience + EXPERIENCE_BY_STAGE[stage];

    if (!Number.isSafeInteger(nextExperience)) {
      return false;
    }

    // Modificar el estado solamente después de validar todo.
    categoryStages.push(stage);

    if (!alreadyAwarded) {
      state.experience = nextExperience;
      state.experienceAwards.push(awardId);
    }

    return true;
  }

  function canOpenLesson(state, category, lessonId, lessons) {
    if (
      !isRecord(state) ||
      !VALID_CATEGORIES.has(category) ||
      !isValidId(lessonId) ||
      !Array.isArray(lessons) ||
      !Array.isArray(state.completed) ||
      !Array.isArray(state.started)
    ) {
      return false;
    }

    const orderedLessons = lessons.filter(
      lesson => isRecord(lesson) &&
        lesson.category === category
    );

    const index = orderedLessons.findIndex(
      lesson => lesson.id === lessonId
    );

    if (index < 0) {
      return false;
    }

    // Permitir retomar una lección iniciada o completada.
    if (
      state.completed.includes(lessonId) ||
      state.started.includes(lessonId)
    ) {
      return true;
    }

    // La primera lección de cada categoría está disponible.
    if (index === 0) {
      return true;
    }

    // Las demás requieren completar la lección anterior.
    const previousLesson = orderedLessons[index - 1];

    return isValidId(previousLesson.id) &&
      state.completed.includes(previousLesson.id);
  }

  function registerLessonStart(state, lessonId, options = {}) {
    if (
      !isRecord(state) ||
      !isValidId(lessonId) ||
      !Array.isArray(state.completed)
    ) {
      return { ...FAILED_START };
    }

    const safeOptions = isRecord(options) ? options : {};
    const unlimited = safeOptions.unlimited === true;

    const started = Array.isArray(state.started)
      ? state.started
      : [];

    // No aceptar un registro de lecciones mal formado.
    if (
      state.started !== undefined &&
      !Array.isArray(state.started)
    ) {
      return { ...FAILED_START };
    }

    // Reabrir una lección no consume otra batería.
    if (
      state.completed.includes(lessonId) ||
      started.includes(lessonId)
    ) {
      return { ...FAILED_START };
    }

    let nextBatteries = state.batteries;
    let nextRefillAt = state.refillAt;

    if (!unlimited) {
      if (
        !Number.isSafeInteger(state.batteries) ||
        state.batteries < 0
      ) {
        return { ...FAILED_START };
      }

      if (state.batteries === 0) {
        return {
          started: false,
          energySpent: false,
          insufficientEnergy: true
        };
      }

      nextBatteries = state.batteries - 1;

      const now = Number.isFinite(safeOptions.now)
        ? safeOptions.now
        : Date.now();

      const refillMs = Number.isFinite(safeOptions.refillMs)
        ? Math.max(0, safeOptions.refillMs)
        : 0;

      if (!Number.isFinite(nextRefillAt)) {
        nextRefillAt = now + refillMs;
      }
    }

    // Registrar el inicio después de comprobar las condiciones.
    state.started = [...started, lessonId];

    if (!unlimited) {
      state.batteries = nextBatteries;

      if (!Number.isFinite(state.refillAt)) {
        state.refillAt = nextRefillAt;
      }
    }

    return {
      started: true,
      energySpent: !unlimited,
      insufficientEnergy: false
    };
  }

  // Mantener la misma interfaz que utiliza script.js.
  window.QR_PROGRESSION_UTILS = Object.freeze({
    hasStage,
    canOpenStage,
    completeStage,
    canOpenLesson,
    registerLessonStart
  });
})();
