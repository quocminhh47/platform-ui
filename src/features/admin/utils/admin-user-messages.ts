import { ApiError } from '../../../services/api/api-error';

export function adminUsersLoadMessage(cause: unknown): string {
  if (cause instanceof ApiError && cause.status === 401) {
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }
  if (cause instanceof ApiError && cause.status === 403) {
    return 'Bạn không có quyền xem danh sách người dùng.';
  }
  if (cause instanceof ApiError) {
    return 'Không thể tải danh sách người dùng. Thử lại sau.';
  }
  return 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.';
}

export function adminUserSaveMessage(cause: unknown): string {
  if (cause instanceof ApiError && cause.status === 401) {
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }
  if (cause instanceof ApiError && cause.status === 403) {
    return 'Bạn không có quyền thực hiện thao tác này.';
  }
  if (cause instanceof ApiError && cause.status === 409) {
    return cause.message?.trim() || 'Email hoặc số điện thoại đã được sử dụng.';
  }
  if (cause instanceof ApiError && cause.status === 400) {
    return cause.message?.trim() || 'Dữ liệu không hợp lệ.';
  }
  if (cause instanceof ApiError) {
    return 'Không thể lưu người dùng. Thử lại sau.';
  }
  return 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.';
}

export const ADMIN_USER_CREATE_SUCCESS = 'Đã tạo tài khoản người dùng.';
export const ADMIN_USER_UPDATE_SUCCESS = 'Đã cập nhật người dùng.';
export const ADMIN_USER_ACTIVATE_SUCCESS = 'Đã kích hoạt tài khoản.';
export const ADMIN_USER_DEACTIVATE_SUCCESS = 'Đã ngưng hoạt động tài khoản.';
