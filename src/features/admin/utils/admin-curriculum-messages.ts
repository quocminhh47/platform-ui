import { ApiError } from '../../../services/api/api-error';

export const ADMIN_SECTION_CREATE_SUCCESS = 'Đã thêm chương.';
export const ADMIN_SECTION_UPDATE_SUCCESS = 'Đã cập nhật chương.';
export const ADMIN_LESSON_CREATE_SUCCESS = 'Đã thêm bài học.';
export const ADMIN_LESSON_UPDATE_SUCCESS = 'Đã cập nhật bài học.';

export function adminCurriculumLoadMessage(cause: unknown): string {
  if (cause instanceof ApiError && cause.status === 404) {
    return 'Không tìm thấy nội dung chương trình.';
  }
  if (cause instanceof ApiError && cause.status === 401) {
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }
  if (cause instanceof ApiError && cause.status === 403) {
    return 'Bạn không có quyền xem chương trình khóa học này.';
  }
  if (cause instanceof ApiError) {
    return 'Không thể tải chương trình học. Thử lại sau.';
  }
  return 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.';
}

export function adminCurriculumSaveMessage(cause: unknown): string {
  if (cause instanceof ApiError && cause.status === 401) {
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }
  if (cause instanceof ApiError && cause.status === 403) {
    return 'Bạn không có quyền thực hiện thao tác này.';
  }
  if (cause instanceof ApiError && cause.status === 400) {
    return cause.message.trim() || 'Dữ liệu không hợp lệ. Kiểm tra các trường và thử lại.';
  }
  if (cause instanceof ApiError) {
    return 'Không thể lưu. Thử lại sau.';
  }
  return 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.';
}

export const QUIZ_LESSON_HINT =
  'Bài học QUIZ cần cấu hình câu hỏi riêng qua API quản trị quiz; chưa hỗ trợ trên màn hình này.';
