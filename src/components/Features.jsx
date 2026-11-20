import { FEATURES_LIST } from "../data/mockData";

export default function Features() {
  return (
    <section id="afzalliklar" className="section">
      <div className="container">
        <div className="section-head">
          <h2>Nega aynan Najot Ta’lim?</h2>
          <p>
            O’quvchilarimizga nafaqat sifatli bilim, balki karyera qurish uchun
            to’liq ekotizim taqdim etamiz.
          </p>
        </div>
        <div className="grid-3">
          {FEATURES_LIST.map((item) => (
            <div className="card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}