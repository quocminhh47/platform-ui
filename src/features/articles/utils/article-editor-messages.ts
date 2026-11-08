import { ApiError } from '../../../services/api/api-error';

export function articleEditorSaveMessage(cause: unknown): string {
  if (cause instanceof ApiError) {
    if (cause.body?.details?.length) {
      return cause.body.details.join(' ');
    }
    if (cause.status === 403) {
      return 'Bạn không có quyền thực hiện thao tác này.';
    }
    if (cause.status === 404) {
      return 'Không tìm thấy bài viết.';
    }
    if (cause.body?.message) {
      return cause.body.message;
    }
    return 'Không lưu được bài viết. Vui lòng thử lại.';
  }
  return 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.';
}
