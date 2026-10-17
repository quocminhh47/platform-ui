import { ApiError } from '../../../services/api/api-error';

export function adminCoursesLoadMessage(cause: unknown): string {
  if (cause instanceof ApiError && cause.status === 401) {
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }
  if (cause instanceof ApiError && cause.status === 403) {
    return 'Bạn không có quyền truy cập danh sách khóa học.';
  }
  if (cause instanceof ApiError) {
    return 'Không thể tải danh sách khóa học. Thử lại sau.';
  }
  return 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.';
}

export function adminPublishMessage(cause: unknown): string {
  if (cause instanceof ApiError && cause.status === 401) {
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }
  if (cause instanceof ApiError && cause.status === 403) {
    return 'Bạn không có quyền thay đổi trạng thái xuất bản.';
  }
  if (cause instanceof ApiError) {
    return 'Không thể cập nhật trạng thái xuất bản. Thử lại sau.';
  }
  return 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.';
}

export const ADMIN_PUBLISH_SUCCESS = 'Khóa học đã được xuất bản.';
export const ADMIN_UNPUBLISH_SUCCESS = 'Khóa học đã được gỡ xuất bản.';
