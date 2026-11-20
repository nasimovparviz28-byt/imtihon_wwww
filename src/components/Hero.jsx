export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div>
          <div className="badge">12 000+ muvaffaqiyatli bitiruvchi</div>
          <h1>Zamonaviy kasblarni amaliyotchilar bilan o’rganing</h1>
          <p>
            Keyingisi siz bo’lishingiz mumkin! Dasturlash, sun’iy intellekt,
            dizayn va marketing yo’nalishlarida intensiv ta’lim.
          </p>
          <div className="hero-btns">
            <a href="#royxat" className="btn btn-primary">
              Bepul konsultatsiya olish
            </a>
            <a href="#kurslar" className="btn btn-outline">
              Kurslarni ko’rish
            </a>
          </div>
          <div className="hero-features">
            <span>Zamonaviy o’quv dasturi</span>
            <span>Amaliyotchi ustozlar</span>
            <span>Bepul master-klasslar</span>
            <span>Sertifikat</span>
          </div>
        </div>

        <div className="hero-card">
          <h3>Markaz ko’rsatkichlari</h3>
          <div className="stats-grid">
            <div className="stat-box">
              <strong>12 000+</strong>
              <span>Muvaffaqiyatli bitiruvchi</span>
            </div>
            <div className="stat-box">
              <strong>6 ta</strong>
              <span>Zamonaviy filial</span>
            </div>
            <div className="stat-box">
              <strong>2 000+</strong>
              <span>TechJobs orqali ishga joylashgan</span>
            </div>
            <div className="stat-box">
              <strong>24/7</strong>
              <span>Bepul kovorking zonasi</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}