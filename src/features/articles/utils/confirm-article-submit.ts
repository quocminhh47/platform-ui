export function confirmArticleSubmit(title: string): boolean {
  const label = title.trim() || 'bài viết này';
  return window.confirm(
    `Gửi “${label}” để quản trị viên duyệt? Bạn sẽ không chỉnh sửa được cho đến khi có phản hồi.`,
  );
}
