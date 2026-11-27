(() => {
  'use strict';

  function shuffleOptions(options, random = Math.random) {
    const result = options.map(option => ({ ...option }));
    for (let index = result.length - 1; index > 0; index -= 1) {
      const other = Math.floor(random() * (index + 1));
      [result[index], result[other]] = [result[other], result[index]];
    }
    return result;
  }

  function prepareQuestions(questions, random = Math.random) {
    return questions.map(question => ({ ...question, options: shuffleOptions(question.options, random) }));
  }

  function isCorrectOption(question, optionId) {
    return optionId !== null && optionId !== undefined && optionId === question.correctOptionId;
  }

  function nextScore(score, question, optionId) {
    return score + (isCorrectOption(question, optionId) ? 1 : 0);
  }

  function migrateLegacySelection(question, selectedIndex) {
    if (!Number.isInteger(selectedIndex)) return selectedIndex;
    return selectedIndex === 0 ? question?.correctOptionId ?? null : null;
  }

  function registerLessonAttempt(previous = {}, question, optionId) {
    const attempts = Number.isSafeInteger(previous.attempts) && previous.attempts >= 0 ? previous.attempts : 0;
    const correct = isCorrectOption(question, optionId);
    return {
      ...previous,
      selected: optionId,
      checked: true,
      attempts: attempts + 1,
      firstAttemptCorrect: attempts === 0 ? correct : previous.firstAttemptCorrect === true
    };
  }

  function unlockLessonRetry(previous = {}) {
    return { ...previous, selected: null, checked: false };
  }

  function updateTriviaRecords(firstAttemptScore, bestPracticeScore, score) {
    return {
      firstAttemptScore: Number.isInteger(firstAttemptScore) ? firstAttemptScore : score,
      bestPracticeScore: Number.isInteger(bestPracticeScore) ? Math.max(bestPracticeScore, score) : score
    };
  }

  function validScore(value, total) {
    return Number.isInteger(value) && value >= 0 && value <= total ? value : null;
  }

  window.QR_QUESTION_UTILS = {
    shuffleOptions, prepareQuestions, isCorrectOption, nextScore, migrateLegacySelection,
    registerLessonAttempt, unlockLessonRetry, updateTriviaRecords, validScore
  };
})();
