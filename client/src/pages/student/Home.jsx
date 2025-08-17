import React from "react";
import Hero from "../../components/student/Hero";
import SearchBar from "../../components/student/SearchBar";
import Companies from "../../components/student/Companies";
import CoursesSection from "../../components/student/CoursesSection";
import TopPicksCourses from "../../components/student/TopPicksCourses";
import NewlyAddedCourses from "../../components/student/NewlyAddedCourses";
import SubscriptionPlans from "../../components/student/SubscriptionPlans";
import TestimonialsSection from "../../components/student/TestimonialsSection";
import CallToAction from "../../components/student/CallToAction";
import Footer from "../../components/student/Footer";

const Home = () => {
  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col pt-16 md:pt-20 pb-20 md:pb-0">
      {/* Unified Background Elements for All Components */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-50/40 via-purple-50/30 to-pink-50/40 -z-10"></div>
      <div className="fixed top-20 left-10 w-40 h-40 bg-blue-200/20 rounded-full blur-3xl animate-pulse -z-10"></div>
      <div
        className="fixed bottom-20 right-10 w-32 h-32 bg-purple-200/20 rounded-full blur-3xl animate-pulse -z-10"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="fixed top-1/2 left-1/4 w-24 h-24 bg-pink-200/20 rounded-full blur-2xl animate-pulse -z-10"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="fixed top-1/3 right-1/4 w-36 h-36 bg-indigo-200/15 rounded-full blur-3xl animate-pulse -z-10"
        style={{ animationDelay: "3s" }}
      ></div>
      <div
        className="fixed bottom-1/3 left-1/3 w-28 h-28 bg-purple-300/15 rounded-full blur-2xl animate-pulse -z-10"
        style={{ animationDelay: "4s" }}
      ></div>

      <div className="relative z-10 ">
        <Hero />

        <div className="flex justify-center mt-4 md:mt-6 px-6 md:px-8 lg:px-6">
          <div className="w-full max-w-md md:max-w-lg">
            <SearchBar />
          </div>
        </div>

        <section className="mt-8 md:mt-12 px-4 md:px-6">
          <Companies />
        </section>

        <section className="mt-12 md:mt-16 px-4 md:px-6">
          <CoursesSection />
        </section>

        <section className="mt-12 md:mt-16">
          <TopPicksCourses />
        </section>

        <section className="mt-12 md:mt-16">
          <NewlyAddedCourses />
        </section>

        <section id="subscription" className="mt-12 md:mt-16">
          <SubscriptionPlans />
        </section>

        <section className="mt-12 md:mt-16 px-4 md:px-6">
          <TestimonialsSection />
        </section>

        <section className="mt-12 md:mt-16">
          <CallToAction />
        </section>

        <footer className="w-full">
          <Footer />
        </footer>
      </div>
    </div>
  );
};

export default Home;
