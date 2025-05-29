export default function Footer() {
    return (
      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-info">
            <h3>SỞ GIAO THÔNG VẬN TẢI THÀNH PHỐ HỒ CHÍ MINH</h3>
            <p>Trung tâm Quản lý Giao thông công cộng</p>
            <p>Địa chỉ: 200 Lý Chính Thắng, Phường 9, Quận 3, TP. Hồ Chí Minh</p>
            <p>Điện thoại: (028) 3526 0636 - Fax: (028) 3526 0635</p>
            <p>Email: ttqlgtcc@tphcm.gov.vn</p>
          </div>
  
          <div className="footer-links">
            <h4>Liên kết nhanh</h4>
            <ul>
              <li>
                <a href="/">Trang chủ</a>
              </li>
              <li>
                <a href="/Intro">Giới thiệu</a>
              </li>
              <li>
                <a href="/TTTuyen">Thông tin tuyến</a>
              </li>
              {/* <li>
                <a href="#">Tin tức</a>
              </li>
              <li>
                <a href="#">Liên hệ</a>
              </li> */}
            </ul>
          </div>
  
          <div className="footer-social">
            <h4>Kết nối với chúng tôi</h4>
            <div className="social-links">
              <a href="https://www.facebook.com/" className="social-link">
                Facebook
              </a>
              <a href="https://www.youtube.com/" className="social-link">
                YouTube
              </a>
              <a href="https://chat.zalo.me/" className="social-link">
                Zalo
              </a>
            </div>
          </div>
        </div>
  
        <div className="copyright">
          <p>© 2025 Trung tâm Quản lý Giao thông công cộng TP.HCM. All rights reserved.</p>
          <p>Giới thiệu sách hay</p>
        </div>
      </footer>
    )
  }
  