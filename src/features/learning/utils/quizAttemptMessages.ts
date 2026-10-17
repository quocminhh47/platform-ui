import { ApiError } from '../../../services/api/api-error';

export function quizAttemptLoadMessage(cause: unknown): string {
  if (cause instanceof ApiError && cause.status === 401) {
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }
  if (cause instanceof ApiError && cause.status === 403) {
    return 'Bạn cần ghi danh khóa học để làm bài trắc nghiệm.';
  }
  if (cause instanceof ApiError && cause.status === 404) {
    return 'Bài trắc nghiệm chưa được cấu hình hoặc không khả dụng.';
  }
  if (cause instanceof ApiError && cause.status === 409) {
    return quizAttemptQuotaMessage(cause);
  }
  if (cause instanceof ApiError) {
    return 'Không thể tải bài trắc nghiệm. Vui lòng thử lại.';
  }
  return 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.';
}

export function quizAttemptQuotaMessage(cause: unknown): string {
  if (cause instanceof ApiError && cause.status === 409) {
    const message = cause.message.toLowerCase();
    if (message.includes('maximum') || message.includes('attempt')) {
      return 'Bạn đã dùng hết số lần làm bài cho phép.';
    }
  }
  if (cause instanceof ApiError && cause.message) {
    return cause.message;
  }
  return 'Bạn đã dùng hết số lần làm bài cho phép.';
}

export function quizAttemptSubmitMessage(cause: unknown): string {
  if (cause instanceof ApiError && cause.status === 409) {
    if (cause.message.toLowerCase().includes('expired')) {
      return 'Thời gian làm bài đã hết. Bạn có thể bắt đầu lượt mới.';
    }
    return cause.message || 'Không thể nộp bài.';
  }
  if (cause instanceof ApiError && cause.status === 400) {
    return 'Câu trả lời chưa hợp lệ. Kiểm tra lại các lựa chọn.';
  }
  if (cause instanceof ApiError) {
    return 'Không thể nộp bài. Vui lòng thử lại.';
  }
  return 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.';
}
