import { MENTORS_LIST } from "../data/mockData";

export default function Mentors() {
  return (
    <section id="ustozlar" className="section">
      <div className="container">
        <div className="section-head">
          <h2>Bizning ustozlar</h2>
          <p>
            Yirik loyihalarda tajriba orttirgan amaliyotchi mutaxassislardan
            bilim oling.
          </p>
        </div>
        <div className="grid-3">
          {MENTORS_LIST.map((mentor) => (
            <div className="card" key={mentor.name}>
              <div className="mentor-role">{mentor.role}</div>
              <h3>{mentor.name}</h3>
              <div className="mentor-exp">{mentor.experience}</div>
              <p>{mentor.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}