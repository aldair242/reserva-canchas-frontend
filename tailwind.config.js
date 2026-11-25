/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Verde césped deportivo (principal)
        turf: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Azul noche (fondos oscuros sobrios y paneles pro)
        navy: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#0b1120',
        },
        // Lima exclusivo para acciones destacadas / CTAs
        limeAccent: {
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
        },
        // Estados semánticos (con texto siempre visible)
        status: {
          successBg: '#f0fdf4',
          successText: '#15803d',
          successBorder: '#bbf7d0',
          warningBg: '#fffbeb',
          warningText: '#b45309',
          warningBorder: '#fde68a',
          dangerBg: '#fff1f2',
          dangerText: '#be123c',
          dangerBorder: '#fecdd3',
          infoBg: '#f0f9ff',
          infoText: '#0369a1',
          infoBorder: '#bae6fd',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        card: '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
        elevated: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.05)',
        highlight: '0 0 0 3px rgba(132, 204, 22, 0.35)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
