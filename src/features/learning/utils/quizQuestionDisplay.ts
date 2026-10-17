import type { QuizQuestionType } from '../types/quiz.types';

export function optionLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

export function questionTypeInstruction(type: QuizQuestionType): string {
  switch (type) {
    case 'MULTIPLE_CHOICE':
      return 'Có thể chọn nhiều đáp án đúng';
    case 'TRUE_FALSE':
      return 'Chọn một đáp án';
    default:
      return 'Chọn một đáp án chính xác';
  }
}

/** Detect prominent Han characters for display sizing. */
export function questionUsesCharacterDisplay(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}
