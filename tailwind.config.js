/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-outfit)'],
        outfit: ['var(--font-outfit)'],
      },
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          25: "var(--color-brand-25)",
          50: "var(--color-brand-50)",
          100: "var(--color-brand-100)",
          200: "var(--color-brand-200)",
          300: "var(--color-brand-300)",
          400: "var(--color-brand-400)",
          500: "var(--color-brand-500)",
          600: "var(--color-brand-600)",
          700: "var(--color-brand-700)",
          800: "var(--color-brand-800)",
          900: "var(--color-brand-900)",
          950: "var(--color-brand-950)",
        },
        'blue-light': {
          25: "var(--color-blue-light-25)",
          50: "var(--color-blue-light-50)",
          100: "var(--color-blue-light-100)",
          200: "var(--color-blue-light-200)",
          300: "var(--color-blue-light-300)",
          400: "var(--color-blue-light-400)",
          500: "var(--color-blue-light-500)",
          600: "var(--color-blue-light-600)",
          700: "var(--color-blue-light-700)",
          800: "var(--color-blue-light-800)",
          900: "var(--color-blue-light-900)",
          950: "var(--color-blue-light-950)",
        },
        gray: {
          25: "var(--color-gray-25)",
          50: "var(--color-gray-50)",
          100: "var(--color-gray-100)",
          200: "var(--color-gray-200)",
          300: "var(--color-gray-300)",
          400: "var(--color-gray-400)",
          500: "var(--color-gray-500)",
          600: "var(--color-gray-600)",
          700: "var(--color-gray-700)",
          800: "var(--color-gray-800)",
          900: "var(--color-gray-900)",
          950: "var(--color-gray-950)",
          dark: "var(--color-gray-dark)",
        },
        orange: {
          25: "var(--color-orange-25)",
          50: "var(--color-orange-50)",
          100: "var(--color-orange-100)",
          200: "var(--color-orange-200)",
          300: "var(--color-orange-300)",
          400: "var(--color-orange-400)",
          500: "var(--color-orange-500)",
          600: "var(--color-orange-600)",
          700: "var(--color-orange-700)",
          800: "var(--color-orange-800)",
          900: "var(--color-orange-900)",
          950: "var(--color-orange-950)",
        },
        success: {
          25: "var(--color-success-25)",
          50: "var(--color-success-50)",
          100: "var(--color-success-100)",
          200: "var(--color-success-200)",
          300: "var(--color-success-300)",
          400: "var(--color-success-400)",
          500: "var(--color-success-500)",
          600: "var(--color-success-600)",
          700: "var(--color-success-700)",
          800: "var(--color-success-800)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
      },
      fontSize: {
        'title-2xl': ['var(--text-title-2xl)', {
          lineHeight: 'var(--text-title-2xl--line-height)',
        }],
        'title-xl': ['var(--text-title-xl)', {
          lineHeight: 'var(--text-title-xl--line-height)',
        }],
        'title-lg': ['var(--text-title-lg)', {
          lineHeight: 'var(--text-title-lg--line-height)',
        }],
        'title-md': ['var(--text-title-md)', {
          lineHeight: 'var(--text-title-md--line-height)',
        }],
        'title-sm': ['var(--text-title-sm)', {
          lineHeight: 'var(--text-title-sm--line-height)',
        }],
        'theme-xl': ['var(--text-theme-xl)', {
          lineHeight: 'var(--text-theme-xl--line-height)',
        }],
        'theme-sm': ['var(--text-theme-sm)', {
          lineHeight: 'var(--text-theme-sm--line-height)',
        }],
        'theme-xs': ['var(--text-theme-xs)', {
          lineHeight: 'var(--text-theme-xs--line-height)',
        }],
      },
      zIndex: {
        1: '1',
        2: '2',
        3: '3',
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("tailwindcss-animate")
  ],
}
