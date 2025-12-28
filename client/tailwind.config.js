/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cor primária - Azul Royal Premium (confiança e profissionalismo)
        primary: {
          50: '#eef4ff',
          100: '#e0eaff',
          200: '#c6d8ff',
          300: '#a4bdfd',
          400: '#7a96fa',
          500: '#5570f4',
          600: '#3d4de9',
          700: '#333fd6',
          800: '#2c36ad',
          900: '#2a3488',
          950: '#1a1f52',
        },
        // Cor médica - Turquesa Sofisticado (saúde e bem-estar)
        medical: {
          50: '#effefa',
          100: '#c8fff2',
          200: '#91fee6',
          300: '#53f5d6',
          400: '#1ee3c1',
          500: '#06c9aa',
          600: '#02a38c',
          700: '#068271',
          800: '#0a675c',
          900: '#0d554c',
          950: '#003330',
        },
        // Cor accent - Âmbar Elegante (destaque e premium)
        accent: {
          50: '#fefbe8',
          100: '#fff9c2',
          200: '#ffef89',
          300: '#ffe045',
          400: '#fecb12',
          500: '#eeb105',
          600: '#cd8802',
          700: '#a36105',
          800: '#864b0d',
          900: '#723e11',
          950: '#431f05',
        },
        // Sucesso
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        // Perigo
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Aviso
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 20px -5px rgba(61, 77, 233, 0.4)',
        'glow-medical': '0 0 20px -5px rgba(6, 201, 170, 0.4)',
        'glow-accent': '0 0 20px -5px rgba(238, 177, 5, 0.4)',
        'inner-lg': 'inset 0 2px 10px 0 rgba(0, 0, 0, 0.06)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)',
        'elevated': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(61, 77, 233, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(61, 77, 233, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
