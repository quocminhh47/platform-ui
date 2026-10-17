export type HomeCategory = {
  id: string;
  label: string;
  description: string;
  href: string;
};

export type HomeTrustItem = {
  title: string;
  description: string;
};

export type HomeReason = {
  title: string;
  description: string;
};

export type HomeProcessStep = {
  step: string;
  title: string;
  description: string;
};

export type HomeTestimonial = {
  id: string;
  quote: string;
  role: string;
  note: string;
};

export const HOME_CATEGORIES: HomeCategory[] = [
  {
    id: 'beginner',
    label: 'Sơ cấp',
    description: 'Pinyin, từ vựng và mẫu câu giao tiếp hằng ngày.',
    href: '/courses',
  },
  {
    id: 'hsk',
    label: 'Luyện thi HSK',
    description: 'Ôn luyện theo cấp độ HSK với bài tập và quiz.',
    href: '/courses',
  },
  {
    id: 'speaking',
    label: 'Giao tiếp',
    description: 'Luyện nghe–nói theo tình huống thực tế.',
    href: '/courses',
  },
  {
    id: 'business',
    label: 'Tiếng Trung thương mại',
    description: 'Từ vựng và kỹ năng làm việc với đối tác Trung Quốc.',
    href: '/courses',
  },
];

export const HOME_TRUST_ITEMS: HomeTrustItem[] = [
  {
    title: 'Lộ trình rõ ràng',
    description: 'Bài học theo chủ đề và cấp độ, dễ theo dõi tiến độ.',
  },
  {
    title: 'Thực hành đa dạng',
    description: 'Video, bài đọc và bài kiểm tra trên cùng một nền tảng.',
  },
  {
    title: 'Hỗ trợ giảng viên',
    description: 'Nội dung do đội ngũ giảng dạy trung tâm biên soạn.',
  },
];

export const HOME_REASONS: HomeReason[] = [
  {
    title: 'Giáo trình có cấu trúc',
    description: 'Mỗi khóa chia theo chương và bài, phù hợp người mới và người ôn thi.',
  },
  {
    title: 'Tập trung giao tiếp',
    description: 'Ưu tiên mẫu câu, phát âm và ngữ cảnh sử dụng thực tế.',
  },
  {
    title: 'Theo dõi tiến độ',
    description: 'Sau khi đăng ký, học viên xem tiến độ từng bài trong không gian học.',
  },
  {
    title: 'Học linh hoạt',
    description: 'Truy cập bài học trên trình duyệt, phù hợp lịch học cá nhân.',
  },
];

export const HOME_PROCESS_STEPS: HomeProcessStep[] = [
  {
    step: '01',
    title: 'Chọn khóa phù hợp',
    description: 'Xem danh mục khóa học và mô tả từng chương trình.',
  },
  {
    step: '02',
    title: 'Đăng ký tài khoản',
    description: 'Tạo tài khoản miễn phí để ghi danh các khóa đã xuất bản.',
  },
  {
    step: '03',
    title: 'Học theo bài',
    description: 'Video, tài liệu và quiz trong cùng không gian học.',
  },
  {
    step: '04',
    title: 'Theo dõi tiến độ',
    description: 'Đánh dấu bài hoàn thành và tiếp tục lộ trình của bạn.',
  },
];

/** Demo quotes — not verified reviews. */
export const HOME_TESTIMONIALS: HomeTestimonial[] = [
  {
    id: 'demo-1',
    quote:
      'Giao diện rõ ràng giúp tôi biết bài nào đã học và bài nào cần ôn lại trước kỳ thi HSK.',
    role: 'Học viên luyện thi (minh họa)',
    note: 'Nội dung demo — không phải đánh giá xác thực.',
  },
  {
    id: 'demo-2',
    quote:
      'Các bài giao tiếp ngắn, dễ luyện tập lại nhiều lần trong tuần.',
    role: 'Học viên sơ cấp (minh họa)',
    note: 'Nội dung demo — không phải đánh giá xác thực.',
  },
];

export const HERO_CATEGORY_TABS = [
  { id: 'beginner', label: 'Sơ cấp', href: '/courses' },
  { id: 'hsk', label: 'Luyện HSK', href: '/courses' },
  { id: 'short', label: 'Khóa ngắn hạn', href: '/courses' },
] as const;
