const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/question-utils.js'), 'utf8'), sandbox);
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/content.js'), 'utf8'), sandbox);
const { shuffleOptions, prepareQuestions, isCorrectOption, nextScore, migrateLegacySelection, registerLessonAttempt, unlockLessonRetry, updateTriviaRecords, validScore } = sandbox.window.QR_QUESTION_UTILS;
const content = sandbox.window.QR_CONTENT;
const lessonQuestions = content.lessons.map(lesson => ({ id: lesson.id, ...lesson.question }));
const allQuestions = [...lessonQuestions, ...content.trivia];

test('las seis preguntas de lección y ocho de trivia usan tres opciones con IDs únicos y correctos válidos', () => {
  assert.equal(lessonQuestions.length, 6);
  assert.equal(content.trivia.length, 8);
  for (const question of allQuestions) {
    assert.equal(question.options.length, 3, question.text || question.prompt);
    const ids = question.options.map(option => option.id);
    assert.equal(new Set(ids).size, 3, question.text || question.prompt);
    assert.ok(question.options.every(option => option.id && option.text));
    assert.ok(ids.includes(question.correctOptionId), question.text || question.prompt);
    assert.equal(isCorrectOption(question, question.correctOptionId), true);
    assert.equal(question.options.filter(option => isCorrectOption(question, option.id)).length, 1);
    assert.equal('answer' in question, false);
    assert.equal('correct' in question, false);
  }
});

test('las posiciones de origen de respuestas correctas están distribuidas', () => {
  const positions = allQuestions.map(question => question.options.findIndex(option => option.id === question.correctOptionId));
  assert.ok(new Set(positions).size >= 3, `Posiciones encontradas: ${positions.join(',')}`);
});

test('Fisher–Yates permuta una copia y deja intacta la lista original', () => {
  const options = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  const result = shuffleOptions(options, () => 0);
  assert.deepEqual(result.map(option => option.id), ['b', 'c', 'a']);
  assert.deepEqual(options.map(option => option.id), ['a', 'b', 'c']);
});

test('la aleatorización conserva la respuesta correcta y puede ubicarla en cada posición', () => {
  for (const question of allQuestions) {
    const positions = new Set();
    for (const sequence of [[0.99, 0.99], [0, 0], [0.4, 0]]) {
      const random = () => sequence.shift();
      const shuffled = prepareQuestions([question], random)[0];
      positions.add(shuffled.options.findIndex(option => option.id === shuffled.correctOptionId));
      assert.equal(shuffled.options.length, 3);
      assert.equal(shuffled.options.filter(option => isCorrectOption(shuffled, option.id)).length, 1);
    }
    assert.deepEqual([...positions].sort(), [0, 1, 2], question.text || question.prompt);
  }
  assert.equal(content.trivia[0].id, 'trivia-marinera-localidad');
});

test('la puntuación solo suma al ID correcto y cada nuevo intento crea una sesión de opciones independiente', () => {
  let score = 0;
  const question = content.trivia[1];
  const wrong = question.options.find(option => option.id !== question.correctOptionId).id;
  score = nextScore(score, question, wrong);
  assert.equal(score, 0);
  score = nextScore(score, question, question.correctOptionId);
  assert.equal(score, 1);

  const firstAttempt = prepareQuestions(content.trivia);
  const replay = prepareQuestions(content.trivia);
  assert.notEqual(firstAttempt, replay);
  for (const attempt of [firstAttempt, replay]) {
    for (const item of attempt) {
      assert.equal(item.options.filter(option => isCorrectOption(item, option.id)).length, 1);
      assert.equal(nextScore(0, item, item.correctOptionId), 1);
    }
  }
});

test('la migración conserva respuestas correctas antiguas por ID y descarta selecciones incorrectas ambiguas', () => {
  const question = content.lessons[0].question;
  assert.equal(migrateLegacySelection(question, 0), question.correctOptionId);
  assert.equal(migrateLegacySelection(question, 1), null);
  assert.equal(migrateLegacySelection(question, 2), null);
  assert.equal(migrateLegacySelection(question, 'lamas'), 'lamas');
});

test('las ocho preguntas de trivia tienen identificadores estables y solo tres están marcadas para el reto extra', () => {
  const ids = content.trivia.map(question => question.id);
  assert.equal(new Set(ids).size, 8);
  assert.ok(ids.every(id => /^trivia-[a-z0-9-]+$/.test(id)));
  assert.deepEqual(Array.from(content.trivia.filter(question => question.bonusEligible), question => question.id), [
    'trivia-tijeras-objeto', 'trivia-sikuris-colectivo', 'trivia-cajon-generos'
  ]);
});

test('el primer intento de lección queda fijo mientras se permiten reintentos', () => {
  const question = content.lessons[0].question;
  const wrong = question.options.find(option => option.id !== question.correctOptionId).id;
  const first = registerLessonAttempt({}, question, wrong);
  assert.equal(first.firstAttemptCorrect, false);
  assert.equal(first.attempts, 1);
  const retry = unlockLessonRetry(first);
  assert.equal(retry.selected, null);
  assert.equal(retry.checked, false);
  const second = registerLessonAttempt(retry, question, question.correctOptionId);
  assert.equal(second.firstAttemptCorrect, false);
  assert.equal(second.attempts, 2);
  const firstCorrect = registerLessonAttempt({}, question, question.correctOptionId);
  assert.equal(firstCorrect.firstAttemptCorrect, true);
});

test('primera evaluación y récord de práctica se guardan como valores separados y validados', () => {
  const records = (...args) => JSON.parse(JSON.stringify(updateTriviaRecords(...args)));
  assert.deepEqual(records(null, null, 0), { firstAttemptScore: 0, bestPracticeScore: 0 });
  assert.deepEqual(records(0, 4, 3), { firstAttemptScore: 0, bestPracticeScore: 4 });
  assert.deepEqual(records(0, 4, 7), { firstAttemptScore: 0, bestPracticeScore: 7 });
  assert.equal(validScore(8, 8), 8);
  assert.equal(validScore(9, 8), null);
  assert.equal(validScore(-1, 8), null);
});

test('la interfaz compara IDs estables para seleccionar, retroalimentar y puntuar', () => {
  const script = fs.readFileSync(path.join(root, 'js/script.js'), 'utf8');
  assert.match(script, /questionUtils\.prepareQuestions\(questions\)/);
  assert.match(script, /quizSession\.selected = answer\.dataset\.answer/);
  assert.match(script, /questionUtils\.nextScore\(/);
  assert.match(script, /questionUtils\.migrateLegacySelection\(question, legacySelection\)/);
  assert.match(script, /quizSession\.selected === option\.id/);
  assert.match(script, /selected === option\.id/);
  assert.match(script, /questionUtils\.isCorrectOption\(lesson\.question, checked\.selected\)/);
  assert.match(script, /if \(quizSession\.answered\) return/);
  assert.match(script, /quizSession\.answers\.push\(/);
  assert.match(script, /state\.quizAwards\?\.\[awardKey\] !== true/);
  const renderer = script.slice(script.indexOf('function renderQuizQuestion('), script.indexOf('function finishQuiz('));
  assert.doesNotMatch(renderer, /q\.explanation|q\.correctOptionId/);
  assert.match(script, /data-review="\$\{escapeHtml\(item\.lesson\)\}"/);
  assert.doesNotMatch(script, /q\.choices|q\.answer|lesson\.question\.correct/);
});
