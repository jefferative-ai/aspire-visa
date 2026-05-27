export { FREE_QUESTIONS, FREE_SECTIONS } from "./free";
export { PAID_QUESTIONS, PAID_SECTIONS } from "./paid";
export type { Question, QuestionOption, QuestionType, ScreeningAnswers } from "./types";
export { NORDIC_DESTINATIONS, WORLD_COUNTRIES, SCHENGEN_COUNTRIES, NORDIC_COUNTRY_VALUES } from "./countries";

import { FREE_QUESTIONS } from "./free";
import { PAID_QUESTIONS } from "./paid";
import type { ScreeningAnswers } from "./types";

export function getVisibleFreeQuestions(answers: ScreeningAnswers) {
  return FREE_QUESTIONS.filter((q) => !q.showIf || q.showIf(answers));
}

export function getVisiblePaidQuestions(answers: ScreeningAnswers) {
  return PAID_QUESTIONS.filter((q) => !q.showIf || q.showIf(answers));
}

export function checkHardBlock(answers: ScreeningAnswers): string | null {
  for (const q of [...FREE_QUESTIONS, ...PAID_QUESTIONS]) {
    if (q.hardBlockIf) {
      const block = q.hardBlockIf(answers);
      if (block) return block;
    }
  }
  return null;
}
