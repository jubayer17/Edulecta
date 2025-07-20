/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { AppContext } from "./AppContext";
import { dummyCourses } from "../assets/assets";

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");
  const [allCourses, setAllCourses] = useState([]);
  const currency = import.meta.env.VITE_CURRENCY; // fixed

  const fetchAllCourses = async () => {
    // simulate async if needed
    setAllCourses(dummyCourses);
  };

  useEffect(() => {
    fetchAllCourses();
  }, []); // run once on mount

  const value = {
    user,
    setUser,
    theme,
    setTheme,
    currency,
    allCourses,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
