import React from "react";
import { assets } from "../../assets/assets";

const Companies = () => {
  const logos = [
    assets.microsoft_logo,
    assets.walmart_logo,
    assets.accenture_logo,
    assets.adobe_logo,
    assets.paypal_logo,
  ];

  // Duplicate logos for seamless looping
  const repeatedLogos = [...logos, ...logos];

  return (
    <div className="pt-16 mb-16">
      <p className="text-base text-center text-gray-500 mb-4">
        Trusted by learners from
      </p>

      {/* Scrolling container with fixed width */}
      <div className="w-[400px] md:w-[800px] mx-auto overflow-hidden relative">
        <div className="flex w-max animate-marquee gap-10">
          {repeatedLogos.map((logo, index) => (
            <img
              key={index}
              src={logo}
              alt="Company"
              className="w-20 md:w-28 flex-shrink-0"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Companies;
