module.exports = {
  content: ['./src/**/*.{ts,tsx,html}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary PostQuee Orange
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#FF8C00',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },

        // Modern PostQuee Color System (from colors.scss)
        newBgColor: '#030304',
        newBgColorInner: 'rgba(20, 23, 30, 0.4)',
        newSettings: '#14171E',
        newBackdrop: 'rgba(0, 0, 0, 0.7)',
        newBoxHover: 'rgba(255, 105, 0, 0.1)',
        newBoxFocused: '#FF6900',
        newBorder: 'rgba(255, 255, 255, 0.15)',
        newBgLineColor: 'rgba(255, 255, 255, 0.06)',
        newSep: 'rgba(255, 255, 255, 0.08)',
        newBlockSeparator: 'rgba(255, 255, 255, 0.08)',
        newTableBorder: 'rgba(255, 255, 255, 0.06)',

        // Text colors
        newTextColor: '#F9FAFB',
        textItemFocused: '#FFFFFF',
        textItemBlur: '#9CA3AF',
        textColor: '#F9FAFB',

        // Interactive elements
        btnSimple: 'rgba(255, 255, 255, 0.05)',
        btnText: '#FFFFFF',
        btnPrimary: '#FF6900',
        btnPrimaryHover: '#FF8533',
        ai: '#FF6900',

        // Tables and lists
        newTableHeader: 'rgba(255, 255, 255, 0.03)',
        newTableText: '#E5E7EB',
        newTableTextFocused: '#FF6900',
        newColColor: 'rgba(255, 255, 255, 0.02)',
        menuDots: '#9CA3AF',
        menuDotsHover: '#FFFFFF',

        // Popups and modals
        popup: 'rgba(18, 21, 28, 0.85)',
        popupBorder: 'rgba(255, 255, 255, 0.1)',

        // Social platform colors
        bgLinkedin: '#1b1f23',
        bgFacebook: '#242526',
        bgInstagram: '#0b1014',
        bgTiktokItem: '#2a2a2a',
        bgYoutube: '#0F0F0F',
        textLinkedin: '#c6c7c8',
        borderLinkedin: '#2e3438',
        borderPreview: 'rgba(255, 255, 255, 0.1)',

        // Legacy mappings
        secondary: '#FF6900',
        gray: '#9CA3AF',
        input: 'rgba(0, 0, 0, 0.3)',
        inputText: '#FFFFFF',
        tableBorder: 'rgba(255, 255, 255, 0.06)',
      },

      gridTemplateColumns: {
        13: 'repeat(13, minmax(0, 1fr))',
      },

      fontFamily: {
        sans: ['Helvetica Neue', 'Arial', 'sans-serif'],
      },

      animation: {
        fade: 'fadeOut 0.5s ease-in-out',
        normalFadeIn: 'normalFadeIn 0.5s ease-in-out',
        fadeIn: 'normalFadeIn 0.2s ease-in-out forwards',
        normalFadeOut: 'normalFadeOut 0.5s linear 5s forwards',
        fadeDown: 'fadeDown 4s ease-in-out forwards',
        normalFadeDown: 'normalFadeDown 0.5s ease-in-out forwards',
      },

      boxShadow: {
        menu: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        previewShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      },

      keyframes: {
        fadeOut: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        normalFadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        normalFadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeDown: {
          '0%': { opacity: '0', marginTop: '-30px' },
          '10%': { opacity: '1', marginTop: '0' },
          '85%': { opacity: '1', marginTop: '0' },
          '90%': { opacity: '1', marginTop: '10px' },
          '100%': { opacity: '0', marginTop: '-30px' },
        },
        normalFadeDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
