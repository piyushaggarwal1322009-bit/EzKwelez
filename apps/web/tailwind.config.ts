import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-canvas-rgb) / <alpha-value>)",
        foreground: "rgb(var(--color-text-primary-rgb) / <alpha-value>)",
        white: "rgb(var(--color-text-primary-rgb) / <alpha-value>)",
        surface: {
          50: "rgb(var(--color-surface-rgb) / <alpha-value>)",
          100: "rgb(var(--color-elevated-rgb) / <alpha-value>)",
          200: "rgb(var(--color-subtle-rgb) / <alpha-value>)",
          800: "rgb(var(--color-border-strong-rgb) / <alpha-value>)",
          900: "rgb(var(--color-surface-rgb) / <alpha-value>)",
        },
        brand: {
          primary: "rgb(var(--color-brand-primary-rgb) / <alpha-value>)",
          accent: "rgb(var(--color-brand-accent-rgb) / <alpha-value>)",
          critical: "var(--color-danger)",
          warning: "var(--color-warning)",
          success: "var(--color-success)",
        },
        slate: {
          50: "rgb(var(--color-text-primary-rgb) / <alpha-value>)",
          100: "rgb(var(--color-text-primary-rgb) / <alpha-value>)",
          200: "rgb(var(--color-text-secondary-rgb) / <alpha-value>)",
          300: "rgb(var(--color-text-secondary-rgb) / <alpha-value>)",
          400: "rgb(var(--color-text-muted-rgb) / <alpha-value>)",
          500: "rgb(var(--color-text-muted-rgb) / <alpha-value>)",
          600: "rgb(var(--color-border-strong-rgb) / <alpha-value>)",
          700: "rgb(var(--color-border-strong-rgb) / <alpha-value>)",
          800: "rgb(var(--color-elevated-rgb) / <alpha-value>)",
          900: "rgb(var(--color-surface-rgb) / <alpha-value>)",
          950: "rgb(var(--color-canvas-rgb) / <alpha-value>)",
        },
        red: {
          200: "rgb(var(--color-danger-text-rgb) / <alpha-value>)",
          300: "rgb(var(--color-danger-text-rgb) / <alpha-value>)",
          400: "var(--color-danger)",
          700: "rgb(var(--color-danger-border-rgb) / <alpha-value>)",
          800: "rgb(var(--color-danger-border-rgb) / <alpha-value>)",
          950: "rgb(var(--color-danger-surface-rgb) / <alpha-value>)",
        },
        amber: {
          200: "rgb(var(--color-warning-text-rgb) / <alpha-value>)",
          300: "rgb(var(--color-warning-text-rgb) / <alpha-value>)",
          400: "var(--color-warning)",
          700: "rgb(var(--color-warning-border-rgb) / <alpha-value>)",
          800: "rgb(var(--color-warning-border-rgb) / <alpha-value>)",
          950: "rgb(var(--color-warning-surface-rgb) / <alpha-value>)",
        },
        emerald: {
          200: "rgb(var(--color-success-text-rgb) / <alpha-value>)",
          300: "rgb(var(--color-success-text-rgb) / <alpha-value>)",
          400: "var(--color-success)",
          700: "rgb(var(--color-success-border-rgb) / <alpha-value>)",
          800: "rgb(var(--color-success-border-rgb) / <alpha-value>)",
          950: "rgb(var(--color-success-surface-rgb) / <alpha-value>)",
        },
        cyan: {
          200: "rgb(var(--color-info-text-rgb) / <alpha-value>)",
          300: "rgb(var(--color-info-text-rgb) / <alpha-value>)",
          400: "var(--color-info)",
          700: "rgb(var(--color-info-border-rgb) / <alpha-value>)",
          800: "rgb(var(--color-info-border-rgb) / <alpha-value>)",
          950: "rgb(var(--color-info-surface-rgb) / <alpha-value>)",
        },
        orange: {
          200: "rgb(var(--color-warning-text-rgb) / <alpha-value>)",
          300: "rgb(var(--color-warning-text-rgb) / <alpha-value>)",
          400: "var(--color-warning)",
          700: "rgb(var(--color-warning-border-rgb) / <alpha-value>)",
          800: "rgb(var(--color-warning-border-rgb) / <alpha-value>)",
          950: "rgb(var(--color-warning-surface-rgb) / <alpha-value>)",
        },
        blue: {
          200: "rgb(var(--color-info-text-rgb) / <alpha-value>)",
          300: "rgb(var(--color-info-text-rgb) / <alpha-value>)",
          400: "var(--color-info)",
          700: "rgb(var(--color-info-border-rgb) / <alpha-value>)",
          800: "rgb(var(--color-info-border-rgb) / <alpha-value>)",
          950: "rgb(var(--color-info-surface-rgb) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        DEFAULT: "var(--radius-control)",
        lg: "var(--radius-panel)",
      },
    },
  },
  plugins: [],
};
export default config;
