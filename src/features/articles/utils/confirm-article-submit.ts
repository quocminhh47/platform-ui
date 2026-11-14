export function confirmArticleSubmit(title: string): boolean {
  const label = title.trim() || 'bài viết này';
  return window.confirm(
    `Gửi “${label}” để quản trị viên duyệt? Bạn sẽ không chỉnh sửa được cho đến khi có phản hồi.`,
  );
}

export function confirmPublishedArticleUpdate(title: string): boolean {
  const label = title.trim() || 'bài viết này';
  return window.confirm(
    `Lưu thay đổi cho “${label}” sẽ gửi bản cập nhật để duyệt. Bản đã xuất bản vẫn hiển thị công khai cho đến khi quản trị viên phê duyệt. Tiếp tục?`,
  );
}
