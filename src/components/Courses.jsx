import { useState } from "react";

const CATEGORIES = [
  { label: "Barchasi", value: "all" },
  { label: "Dasturlash", value: "Dasturlash" },
  { label: "Sun’iy Intellekt", value: "Sun'iy Intellekt" },
  { label: "Dizayn", value: "Dizayn" },
  { label: "Marketing", value: "Marketing" },
];

export default function Courses({ courses, onSelectCourse }) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredCourses =
    activeCategory === "all"
      ? courses
      : courses.filter((course) => course.category === activeCategory);

  return (
    <section id="kurslar" className="section section-white">
      <div className="container">
        <div className="section-head">
          <h2>O’zingizga mos yo’nalishni tanlang</h2>
          <p>
            Dasturlash, sun’iy intellekt, marketing, dizayn va data analitika
            yo’nalishlarida amaliy kurslar.
          </p>
        </div>

        <div className="filter-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              className={`tab-btn ${activeCategory === cat.value ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid-3">
          {filteredCourses.map((course, index) => (
            <div className="card" key={course._id || course.id || index}>
              <span className="course-tag">{course.category}</span>
              <h3>{course.title}</h3>
              <div className="course-meta">
                <div>{course.duration}</div>
                <div>
                  Daraja: <strong>{course.level}</strong>
                </div>
              </div>
              <div className="course-price">
                <strong>{course.price}</strong>
                <a
                  href="#royxat"
                  onClick={() => onSelectCourse(course.title)}
                  className="btn btn-outline btn-sm"
                >
                  Yozilish
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}