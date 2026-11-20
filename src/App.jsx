import { useEffect, useState } from "react";
import { fetchCourses } from "./api/api";
import { DEFAULT_COURSES } from "./data/mockData";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Courses from "./components/Courses";
import Mentors from "./components/Mentors";
import RegisterAndBranches from "./components/RegisterAndBranches";
import Footer from "./components/Footer";
import Portal from "./components/Portal";

export default function App() {
  const path = window.location.pathname;
  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [selectedCourse, setSelectedCourse] = useState("");

  useEffect(() => {
    if (["/login", "/admin", "/cabinet"].includes(path)) return;
    fetchCourses()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCourses(data);
        }
      })
      .catch(() => { });
  }, [path]);

  if (path === "/login") return <Portal mode="login" />;
  if (path === "/admin") return <Portal mode="admin" />;
  if (path === "/cabinet") return <Portal mode="student" />;

  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <Courses courses={courses} onSelectCourse={setSelectedCourse} />
      <Mentors />
      <RegisterAndBranches key={selectedCourse} selectedCourse={selectedCourse} courses={courses} />
      <Footer />
    </>
  );
}
