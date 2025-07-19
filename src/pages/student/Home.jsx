import React from "react";
import Hero from "../../components/student/Hero";
import SearchBar from "../../components/student/SearchBar";

const Home = () => {
  return (
    <div className="min-h-screen w-full bg-white">
      <Hero />
      <div className="flex justify-center mt-6 px-4">
        <SearchBar />
      </div>
    </div>
  );
};

export default Home;
