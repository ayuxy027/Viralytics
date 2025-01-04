export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        light: {
          primary: '#7895b0',
          secondary: '#d0dae6',
          tertiary: '#0d497a',
          background: '#f9fbfd',
        },
        dark: {
          primary: '#cfd8e3',
          secondary: '#6b85a0',
          tertiary: '#0a3d68',
          background: '#061228',
        }
      },
      backgroundImage: {
        'noise': 'url("data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%" height="100%" filter="url(%23noise)" opacity="0.075"/%3E%3C/svg%3E")',
      },
      opacity: {
        '85': '0.85',
      }
    },
  },
  plugins: [],
}