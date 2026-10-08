import * as React from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>("dark");

  React.useEffect(() => {
    const savedTheme = window.localStorage.getItem("ezykwelez-theme");
    const initialTheme = savedTheme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = initialTheme;
    setTheme(initialTheme);
  }, []);

  const value = {
    theme,
    toggleTheme: () => setTheme((current) => {
      const nextTheme = current === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = nextTheme;
      window.localStorage.setItem("ezykwelez-theme", nextTheme);
      return nextTheme;
    }),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}