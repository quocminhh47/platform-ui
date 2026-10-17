import { ApiError } from '../../../services/api/api-error';

export const ADMIN_QUIZ_SAVE_SUCCESS = 'Đã lưu cấu hình quiz.';

export const ADMIN_QUIZ_ATTEMPTS_LOCKED_MESSAGE =
  'Không thể thay đổi câu hỏi vì đã có lượt làm bài. Chỉ có thể cập nhật điểm đạt, thời gian và số lần làm.';

export function adminQuizLoadMessage(cause: unknown): string {
  if (cause instanceof ApiError && cause.status === 401) {
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }
  if (cause instanceof ApiError && cause.status === 403) {
    return 'Bạn không có quyền xem cấu hình quiz.';
  }
  if (cause instanceof ApiError && cause.status === 404) {
    return 'Không tìm thấy bài học quiz hoặc khóa học.';
  }
  if (cause instanceof ApiError) {
    return 'Không thể tải cấu hình quiz. Thử lại sau.';
  }
  return 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.';
}

export function adminQuizSaveMessage(cause: unknown): string {
  if (cause instanceof ApiError && cause.status === 409) {
    return ADMIN_QUIZ_ATTEMPTS_LOCKED_MESSAGE;
  }
  if (cause instanceof ApiError && cause.status === 401) {
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }
  if (cause instanceof ApiError && cause.status === 403) {
    return 'Bạn không có quyền lưu cấu hình quiz.';
  }
  if (cause instanceof ApiError && cause.status === 400) {
    return cause.message.trim() || 'Dữ liệu không hợp lệ. Kiểm tra các trường và thử lại.';
  }
  if (cause instanceof ApiError) {
    return 'Không thể lưu cấu hình quiz. Thử lại sau.';
  }
  return 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.';
}
