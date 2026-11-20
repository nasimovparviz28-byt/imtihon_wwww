export default function Navbar() {
  return (
    <header className="header">
      <div className="container nav">
        <a href="#" className="logo">
          <span>NT</span> Najot Ta’lim
        </a>
        <ul className="nav-links">
          <li>
            <a href="#kurslar">Kurslar</a>
          </li>
          <li>
            <a href="#ustozlar">Ustozlar</a>
          </li>
          <li>
            <a href="#afzalliklar">Biz haqimizda</a>
          </li>
          <li>
            <a href="#manzillar">Filiallar</a>
          </li>
        </ul>
        <div className="nav-actions">
          <a href="/login" className="nav-login">Kabinetga kirish</a>
          <a href="tel:+998788889888" className="phone-link">
            78 888 9 888
          </a>
          <a href="#royxat" className="btn btn-primary">
            Ro’yxatdan o’tish
          </a>
        </div>
      </div>
    </header>
  );
}
