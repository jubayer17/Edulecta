import React from "react";
import Hero from "../../components/student/Hero";
import SearchBar from "../../components/student/SearchBar";
import Companies from "../../components/student/Companies";
import CoursesSection from "../../components/student/CoursesSection";
import CourseCard from "../../components/student/CourseCard"; // 👈 Import CourseCard

const Home = () => {
  return (
    <div className="min-h-screen w-full bg-white">
      {/* Hero Section */}
      <Hero />

      {/* Search Bar */}
      <div className="flex justify-center mt-6 px-4">
        <SearchBar />
      </div>

      {/* Trusted Companies Section */}
      <section className="mt-12 px-4">
        <Companies />
      </section>

      {/* Courses Section */}
      <section className="w-full mt-16 px-4 md:px-20 lg:px-40">
        <CoursesSection />
      </section>
    </div>
  );
};

export default Home;
