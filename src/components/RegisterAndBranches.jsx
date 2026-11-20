import { useState } from "react";
import { createLead } from "../api/api";
import { BRANCHES_DATA } from "../data/mockData";

const BRANCH_KEYS = Object.keys(BRANCHES_DATA);

export default function RegisterAndBranches({ selectedCourse = "", courses = [] }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [course, setCourse] = useState(selectedCourse || "");
  const [branch, setBranch] = useState(BRANCH_KEYS[0]);
  const [activeBranchTab, setActiveBranchTab] = useState(BRANCH_KEYS[0]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    const payload = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      course,
      branch,
      createdAt: new Date().toISOString(),
    };

    try {
      await createLead(payload);
      setStatus({
        type: "success",
        message: "Arizangiz qabul qilindi va administrator tasdig‘iga yuborildi. Tasdiqlangach, login va vaqtinchalik parolingizni olasiz.",
      });
      setFullName("");
      setPhone("+998 ");
      setCourse("");
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Arizani yuborib bo‘lmadi. Keyinroq urinib ko‘ring.",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentBranch = BRANCHES_DATA[activeBranchTab];

  return (
    <section id="royxat" className="section">
      <div className="container">
        <div className="register-wrap">
          <div>
            <h2 className="register-title">Bepul konsultatsiyaga yoziling</h2>
            <p className="register-subtitle">
              Ma’lumotlaringizni qoldiring — mutaxassislarimiz siz bilan
              bog’lanishadi.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="fullName">Ism-familiya *</label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Masalan: Jasur Karimov"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Telefon raqam *</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+998 90 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="course">Kursni tanlang *</label>
                <select
                  id="course"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  required
                >
                  <option value="">Kurs tanlang</option>
                  <option value="Bilmayman, maslahat kerak">
                    Bilmayman, maslahat kerak
                  </option>
                  {courses.map((item) => (
                    <option key={item._id || item.id || item.title} value={item.title}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="branch">Filialni tanlang *</label>
                <select
                  id="branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  required
                >
                  {BRANCH_KEYS.map((key) => (
                    <option key={key} value={key}>{BRANCHES_DATA[key].city}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? "Yuborilmoqda..." : "Ro’yxatdan o’tish"}
              </button>

              {status.message && (
                <div className={`status-msg ${status.type}`}>
                  {status.message}
                  {status.type === "success" && (
                    <a className="status-login-link" href="/login">Kabinetga kirish</a>
                  )}
                </div>
              )}
            </form>
          </div>

          <div id="manzillar">
            <h2 className="register-title">Bizning manzillar</h2>
            <p className="register-subtitle">
              O’zingizga yaqin filialni tanlab ma’lumotlarni ko’ring.
            </p>

            <div className="branch-pills">
              {BRANCH_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`branch-pill ${activeBranchTab === key ? "active" : ""}`}
                  onClick={() => setActiveBranchTab(key)}
                >
                  {key}
                </button>
              ))}
            </div>

            <div className="branch-info">
              <div>
                <strong>Shahar / Filial</strong>
                <span>{currentBranch.city}</span>
              </div>
              <div>
                <strong>Manzil</strong>
                <span>{currentBranch.address}</span>
              </div>
              <div>
                <strong>Mo’ljal</strong>
                <span>{currentBranch.landmark}</span>
              </div>
              <div>
                <strong>Ish vaqti</strong>
                <span>{currentBranch.hours}</span>
              </div>
              <div>
                <strong>Telefon</strong>
                <span>{currentBranch.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
