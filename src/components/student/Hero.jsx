import React from "react";
import { assets } from "./../../assets/assets";

const Hero = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full pt-20 md:pt-36 px-7 md:px-0 space-y-7 text-center bg-gradient-to-b from-blue-100/80">
      <h1 className="relative font-bold text-gray-800 max-w-3xl mx-auto text-home-heading-large md:text-home-heading-large text-home-heading-small">
        Empower your future with courses designed to{" "}
        <span className="text-blue-600">fit your choice</span>
        <img
          className="hidden md:block absolute -bottom-7 right-0"
          src={assets.sketch}
          alt=""
        />
      </h1>

      <p className="hidden md:block text-gray-500 max-w-2xl mx-auto">
        We bring together world-class instructors, interactive content, and a
        supportive community to help you achieve your personal and professional
        goals.
      </p>
      <p className="md:hidden text-gray-500 max-w-sm mx-auto">
        We bring together world-class instructors to help you achieve your
        professional goals.
      </p>
    </div>
  );
};

export default Hero;
