const FAQ_ITEMS = [
  {
    question: 'Tôi cần đăng ký tài khoản để học không?',
    answer:
      'Bạn có thể xem danh mục khóa học công khai. Để ghi danh và vào không gian học, hãy đăng ký tài khoản và đăng nhập.',
  },
  {
    question: 'Khóa học có miễn phí không?',
    answer:
      'Tùy từng khóa. Giá hiển thị trên thẻ khóa học và trang chi tiết; nhiều khóa trong giai đoạn MVP có thể miễn phí.',
  },
  {
    question: 'Làm sao để tiếp tục bài học đang học?',
    answer:
      'Sau khi ghi danh, mở khóa học từ “Khóa của tôi” hoặc trang chi tiết khóa để vào không gian học.',
  },
];

export function FaqSection() {
  return (
    <section className="landing-section landing-faq" id="faq" aria-labelledby="faq-heading">
      <div className="landing-container landing-faq-inner">
        <h2 id="faq-heading">Câu hỏi thường gặp</h2>
        <dl className="landing-faq-list">
          {FAQ_ITEMS.map((item) => (
            <div key={item.question} className="landing-faq-item">
              <dt>{item.question}</dt>
              <dd>{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
