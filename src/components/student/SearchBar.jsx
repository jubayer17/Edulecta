/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { assets } from "../../assets/assets";
import { useNavigate } from "react-router-dom";

const SearchBar = ({ data = "" }) => {
  const navigate = useNavigate();
  const [input, setInput] = useState(data);

  const onSubmitHandler = (e) => {
    e.preventDefault();
    if (input.trim()) {
      navigate("/course-list/" + input.trim());
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="max-w-xl w-full md:h-14 h-10 flex items-center bg-white border border-gray-500/20 rounded"
    >
      <img
        src={assets.search_icon}
        alt="search_icon"
        className="md:w-auto w-8 px-2"
      />
      <input
        onChange={(e) => setInput(e.target.value)}
        value={input}
        type="text"
        placeholder="Search for courses"
        className="w-full h-full outline-none text-gray-500/80 text-sm sm:text-base"
      />
      <button
        type="submit"
        className="bg-blue-600 rounded text-white md:px-10 px-5 md:py-3 py-1.5 mx-1 text-sm sm:text-base"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
