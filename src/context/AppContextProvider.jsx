/* eslint-disable no-unused-vars */
import { useEffect, useState, useCallback } from "react";
import { AppContext } from "./AppContext";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");
  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(true);

  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();

  const fetchAllCourses = async () => {
    setAllCourses(dummyCourses);
  };

  const calculateRating = useCallback((course) => {
    if (!course.courseRatings || course.courseRatings.length === 0) {
      return 0;
    }
    let totalRating = 0;
    course.courseRatings.forEach((value) => {
      totalRating += value.rating;
    });
    return Math.round((totalRating / course.courseRatings.length) * 2) / 2;
  }, []);

  useEffect(() => {
    fetchAllCourses();
  }, []);

  const value = {
    user,
    setUser,
    theme,
    setTheme,
    currency,
    allCourses,
    navigate,
    calculateRating,
    isEducator,
    setIsEducator,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
