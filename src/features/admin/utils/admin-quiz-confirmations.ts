export function confirmRemoveQuizQuestion(questionNumber: number): boolean {
  return window.confirm(
    `Xóa câu ${questionNumber}? Thay đổi chỉ được lưu khi bạn bấm "Lưu quiz".`,
  );
}

export function confirmRemoveQuizOption(optionLabel: string): boolean {
  return window.confirm(`Xóa lựa chọn ${optionLabel}?`);
}
