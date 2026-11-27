
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const projectRoot = path.resolve(__dirname, '..');
const sandbox = { window: {} };

vm.runInNewContext(
  fs.readFileSync(
    path.join(projectRoot, 'js', 'progression-utils.js'),
    'utf8'
  ),
  sandbox
);

const progression = sandbox.window.QR_PROGRESSION_UTILS;

const {
  hasStage,
  canOpenStage,
  completeStage,
  canOpenLesson,
  registerLessonStart
} = progression;

const lessons = [
  { id: 'danza-1', category: 'danzas' },
  { id: 'danza-2', category: 'danzas' },
  { id: 'danza-3', category: 'danzas' },
  { id: 'musica-1', category: 'musica' },
  { id: 'musica-2', category: 'musica' }
];

function freshProgress() {
  return {
    completed: [],
    started: [],
    batteries: 5,
    refillAt: null,

    routeStages: {
      danzas: [],
      musica: []
    },

    experience: 0,
    experienceAwards: []
  };
}

test(
  'la primera etapa está disponible, pero las siguientes respetan el orden',
  () => {
    const state = freshProgress();

    assert.equal(
      canOpenStage(state, 'danzas', 'lecciones'),
      true
    );

    assert.equal(
      canOpenStage(state, 'danzas', 'juego'),
      false
    );

    assert.equal(
      canOpenStage(state, 'danzas', 'practica'),
      false
    );

    assert.equal(
      canOpenStage(state, 'danzas', 'test'),
      false
    );

    assert.equal(
      canOpenStage(state, 'danzas', 'recompensa'),
      false
    );
  }
);

test(
  'la etapa de lecciones solo se completa cuando todas las lecciones de la categoría están terminadas',
  () => {
    const state = freshProgress();

    assert.equal(
      completeStage(
        state,
        'danzas',
        'lecciones',
        ['danza-1', 'danza-2'],
        lessons
      ),
      false
    );

    assert.deepEqual(state.routeStages.danzas, []);
    assert.equal(state.experience, 0);

    state.completed = [
      'danza-1',
      'danza-2',
      'danza-3'
    ];

    assert.equal(
      completeStage(
        state,
        'danzas',
        'lecciones',
        state.completed,
        lessons
      ),
      true
    );

    assert.equal(
      hasStage(state, 'danzas', 'lecciones'),
      true
    );

    assert.equal(
      canOpenStage(state, 'danzas', 'juego'),
      true
    );
  }
);

test(
  'cada etapa concede experiencia una sola vez y la recompensa se habilita después del test',
  () => {
    const state = freshProgress();

    state.completed = [
      'danza-1',
      'danza-2',
      'danza-3'
    ];

    assert.equal(
      completeStage(
        state,
        'danzas',
        'lecciones',
        state.completed,
        lessons
      ),
      true
    );

    assert.equal(
      completeStage(
        state,
        'danzas',
        'lecciones',
        state.completed,
        lessons
      ),
      false
    );

    assert.equal(state.experience, 50);

    assert.equal(
      completeStage(state, 'danzas', 'juego', state.completed, lessons),
      true
    );

    assert.equal(
      completeStage(state, 'danzas', 'practica', state.completed, lessons),
      true
    );

    assert.equal(
      canOpenStage(state, 'danzas', 'test'),
      true
    );

    assert.equal(
      canOpenStage(state, 'danzas', 'recompensa'),
      false
    );

    assert.equal(
      completeStage(state, 'danzas', 'test', state.completed, lessons),
      true
    );

    assert.equal(
      canOpenStage(state, 'danzas', 'recompensa'),
      true
    );

    assert.equal(state.experience, 250);

    assert.deepEqual(state.experienceAwards, [
      'danzas-lecciones',
      'danzas-juego',
      'danzas-practica',
      'danzas-test'
    ]);
  }
);

test(
  'el progreso de Danzas no desbloquea las etapas de Música',
  () => {
    const state = freshProgress();

    state.completed = [
      'danza-1',
      'danza-2',
      'danza-3'
    ];

    assert.equal(
      completeStage(
        state,
        'danzas',
        'lecciones',
        state.completed,
        lessons
      ),
      true
    );

    assert.equal(
      canOpenStage(state, 'danzas', 'juego'),
      true
    );

    assert.equal(
      canOpenStage(state, 'musica', 'juego'),
      false
    );

    assert.equal(
      canOpenStage(state, 'musica', 'lecciones'),
      true
    );
  }
);

test(
  'las lecciones se desbloquean en orden y una lección iniciada se puede retomar',
  () => {
    const state = freshProgress();

    assert.equal(
      canOpenLesson(state, 'danzas', 'danza-1', lessons),
      true
    );

    assert.equal(
      canOpenLesson(state, 'danzas', 'danza-2', lessons),
      false
    );

    state.started.push('danza-1');

    assert.equal(
      canOpenLesson(state, 'danzas', 'danza-1', lessons),
      true
    );

    assert.equal(
      canOpenLesson(state, 'danzas', 'danza-2', lessons),
      false
    );

    state.completed.push('danza-1');

    assert.equal(
      canOpenLesson(state, 'danzas', 'danza-2', lessons),
      true
    );

    assert.equal(
      canOpenLesson(state, 'danzas', 'danza-3', lessons),
      false
    );
  }
);

test(
  'iniciar una lección nueva consume una batería y registra la hora de recarga',
  () => {
    const state = freshProgress();

    const result = registerLessonStart(state, 'siku-1', {
      now: 1000,
      refillMs: 86400000
    });

    assert.equal(result.started, true);
    assert.equal(result.energySpent, true);
    assert.equal(result.insufficientEnergy, false);

    assert.equal(state.batteries, 4);
    assert.equal(state.refillAt, 86401000);

    assert.deepEqual([...state.started], ['siku-1']);
  }
);

test(
  'volver a abrir una lección iniciada no consume otra batería',
  () => {
    const state = freshProgress();

    const first = registerLessonStart(state, 'siku-1', {
      now: 1000,
      refillMs: 86400000
    });

    const resumed = registerLessonStart(state, 'siku-1', {
      now: 2000,
      refillMs: 86400000
    });

    assert.equal(first.started, true);
    assert.equal(resumed.started, false);
    assert.equal(resumed.energySpent, false);
    assert.equal(resumed.insufficientEnergy, false);

    assert.equal(state.batteries, 4);
    assert.equal(state.started.length, 1);
  }
);

test(
  'la energía ilimitada registra una lección sin descontar baterías ni iniciar recarga',
  () => {
    const state = freshProgress();

    const result = registerLessonStart(state, 'cajon-1', {
      unlimited: true,
      now: 1000,
      refillMs: 86400000
    });

    assert.equal(result.started, true);
    assert.equal(result.energySpent, false);
    assert.equal(result.insufficientEnergy, false);

    assert.equal(state.batteries, 5);
    assert.equal(state.refillAt, null);

    assert.deepEqual([...state.started], ['cajon-1']);

    const afterPlanChange = registerLessonStart(
      state,
      'cajon-1',
      {
        now: 2000,
        refillMs: 86400000
      }
    );

    assert.equal(afterPlanChange.started, false);
    assert.equal(state.batteries, 5);
  }
);

test(
  'sin baterías no se registra una lección nueva ni se modifica el estado',
  () => {
    const state = freshProgress();
    state.batteries = 0;

    const result = registerLessonStart(state, 'esuwa-1', {
      now: 1000,
      refillMs: 86400000
    });

    assert.equal(result.started, false);
    assert.equal(result.energySpent, false);
    assert.equal(result.insufficientEnergy, true);

    assert.deepEqual(state.started, []);
    assert.equal(state.batteries, 0);
    assert.equal(state.refillAt, null);
  }
);

test(
  'un estado incompleto no provoca excepciones ni cambios parciales al completar una etapa',
  () => {
    const state = {
      routeStages: {
        danzas: []
      },
      experience: 0,
      experienceAwards: null
    };

    assert.equal(
      completeStage(
        state,
        'danzas',
        'lecciones',
        ['danza-1'],
        lessons
      ),
      false
    );

    assert.deepEqual(state.routeStages.danzas, []);
    assert.equal(state.experience, 0);
  }
);

test(
  'las funciones rechazan argumentos o estados inválidos de forma segura',
  () => {
    assert.equal(
      hasStage(null, 'danzas', 'lecciones'),
      false
    );

    assert.equal(
      canOpenStage(null, 'danzas', 'lecciones'),
      false
    );

    assert.equal(
      canOpenLesson(null, 'danzas', 'danza-1', lessons),
      false
    );

    assert.equal(
      completeStage(null, 'danzas', 'lecciones', [], lessons),
      false
    );

    const startResult = registerLessonStart(null, 'danza-1');

    assert.equal(startResult.started, false);
    assert.equal(startResult.energySpent, false);
    assert.equal(startResult.insufficientEnergy, false);
  }
);

test(
  'no se habilitan categorías, etapas ni lecciones desconocidas',
  () => {
    const state = freshProgress();

    assert.equal(
      canOpenStage(state, 'gastronomia', 'lecciones'),
      false
    );

    assert.equal(
      canOpenStage(state, 'danzas', 'inventada'),
      false
    );

    assert.equal(
      canOpenLesson(
        state,
        'danzas',
        'leccion-inexistente',
        lessons
      ),
      false
    );

    assert.equal(
      completeStage(
        state,
        'danzas',
        'recompensa',
        state.completed,
        lessons
      ),
      false
    );
  }
);
