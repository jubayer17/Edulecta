import { useState } from "react";
import { AppContext } from "./AppContext";

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");

  const value = {
    user,
    setUser,
    theme,
    setTheme,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
