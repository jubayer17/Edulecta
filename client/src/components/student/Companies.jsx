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
    <div className="pt-16 mb-16 relative overflow-hidden">
      {/* Content */}
      <div className="relative z-10">
        <div className="text-center mb-8">
          <p className="text-base text-gray-500 mb-2">
            Trusted by learners from
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-blue-200"></div>
            <span className="px-3 font-medium">Industry Leaders</span>
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-blue-200"></div>
          </div>
        </div>

        {/* Scrolling container with fixed width */}
        <div className="w-[400px] md:w-[800px] mx-auto overflow-hidden relative">
          {/* Gradient fade edges */}
          <div className="absolute left-0 top-0 w-16 h-full bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 w-16 h-full bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none"></div>

          <div className="flex w-max animate-marquee gap-10">
            {repeatedLogos.map((logo, index) => (
              <div
                key={index}
                className="flex-shrink-0 p-4 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 group"
              >
                <img
                  src={logo}
                  alt="Company"
                  className="w-16 md:w-20 h-auto opacity-70 group-hover:opacity-100 transition-opacity duration-300 filter grayscale group-hover:grayscale-0"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Stats or additional info */}
        <div className="mt-8 flex justify-center items-center gap-8 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span>50,000+ professionals trained</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Industry partnerships</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Companies;
