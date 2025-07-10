/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,css,scss,sass,less,styl}"
  ],
  theme: {
    extend: {
      screens: {
        // Redefinir los breakpoints estándar
        // Cambio clave: 'md' ahora está en 1150px en lugar de 768px
        'sm': '640px',
        'md': '1150px',  // Ahora el breakpoint móvil/desktop está en 1150px
        'lg': '1280px',
        'xl': '1440px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
}

// Verifica si hay alguna configuración de breakpoints