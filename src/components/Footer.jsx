export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <strong className="footer-brand">Najot Ta’lim</strong>
            <p className="footer-desc">
              IT Park rezidenti · Zamonaviy kasblar markazi
            </p>
          </div>
          <div className="footer-links">
            <a href="#kurslar">Kurslar</a>
            <a href="#ustozlar">Ustozlar</a>
            <a href="#afzalliklar">Biz haqimizda</a>
            <a href="#manzillar">Manzillar</a>
            <a href="#royxat">Ro’yxatdan o’tish</a>
          </div>
        </div>
        <div className="footer-copy">
          © 2018–2026 Najot Ta’lim. Barcha huquqlar himoyalangan.
        </div>
      </div>
    </footer>
  );
}