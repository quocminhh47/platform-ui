export function confirmDeactivateUser(fullName: string): boolean {
  return window.confirm(
    `Ngưng hoạt động tài khoản "${fullName}"? Người dùng sẽ không thể sử dụng hệ thống cho đến khi được kích hoạt lại.`,
  );
}
