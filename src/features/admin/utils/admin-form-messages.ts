import { ApiError } from '../../../services/api/api-error';

export const ADMIN_COURSE_CREATE_SUCCESS = 'Đã tạo khóa học.';
export const ADMIN_COURSE_UPDATE_SUCCESS = 'Đã cập nhật khóa học.';

export function adminCourseLoadMessage(cause: unknown): string {
  if (cause instanceof ApiError && cause.status === 404) {
    return 'Không tìm thấy khóa học.';
  }
  if (cause instanceof ApiError && cause.status === 401) {
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }
  if (cause instanceof ApiError) {
    return 'Không thể tải khóa học. Thử lại sau.';
  }
  return 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.';
}

export function adminInstructorsLoadMessage(cause: unknown): string {
  if (cause instanceof ApiError && cause.status === 401) {
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }
  if (cause instanceof ApiError && cause.status === 403) {
    return 'Bạn không có quyền tải danh sách người dùng.';
  }
  if (cause instanceof ApiError) {
    return 'Không thể tải danh sách giảng viên. Thử lại sau.';
  }
  return 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.';
}

export function adminCourseSaveMessage(cause: unknown): string {
  if (cause instanceof ApiError && cause.status === 401) {
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }
  if (cause instanceof ApiError && cause.status === 403) {
    return 'Bạn không có quyền lưu khóa học.';
  }
  if (cause instanceof ApiError && cause.status === 400) {
    return cause.message.trim() || 'Dữ liệu không hợp lệ. Kiểm tra các trường và thử lại.';
  }
  if (cause instanceof ApiError) {
    return 'Không thể lưu khóa học. Thử lại sau.';
  }
  return 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.';
}
