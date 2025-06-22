
import type {Config} from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans-ios': ['-apple-system', 'SF Pro Text', 'BlinkMacSystemFont', 'Helvetica Neue', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        'sans-android': ['Roboto', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)', 
        '2xl': 'calc(var(--radius) + 8px)', 
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'global-pulse': { 
          '0%, 100%': { filter: 'brightness(100%) saturate(100%)' },
          '50%': { filter: 'brightness(80%) saturate(80%)' },
        },
        'orb-pulse': { 
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'typewriter': {
          from: { width: '0' },
          to: { width: '100%' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
         'global-ripple-effect': { 
          '0%': { transform: 'translate(-50%, -50%) scale(0.1)', opacity: '0.5' },
          '83%': { opacity: '0.5' },
          '100%': { transform: 'translate(-50%, -50%) scale(200)', opacity: '0' },
        },
        'particle-calm-motion': {
          '0%': { transform: 'translateY(0) translateX(0) scale(1)', opacity: '0' },
          '10%': { opacity: '0.7' },
          '50%': { transform: 'translateY(-20vh) translateX(var(--particle-drift-x, 0px)) scale(1)' },
          '90%': { opacity: '0.7' },
          '100%': { transform: 'translateY(-40vh) translateX(calc(var(--particle-drift-x, 0px) * 2)) scale(1)', opacity: '0' },
        },
        'particle-joyful-motion': {
          '0%': { transform: 'translateY(0) scale(0.7)', opacity: '0' },
          '15%': { opacity: '1' },
          '50%': { transform: 'translateY(-25vh) translateX(var(--particle-drift-x)) scale(1.5)' }, /* Pop */
          '85%': { opacity: '1' },
          '100%': { transform: 'translateY(-50vh) translateX(calc(var(--particle-drift-x) * 2)) scale(0.7)', opacity: '0' },
        },
        'particle-anxious-motion': {
          '0%': { transform: 'translate(0, 0)', opacity: '0' },
          '10%': { opacity: '1' },
          '25%': { transform: 'translate(calc(var(--particle-drift-x) * 0.5), -10vh)' },
          '50%': { transform: 'translate(calc(var(--particle-drift-x) * -0.2), -20vh)' }, /* Jagged */
          '75%': { transform: 'translate(calc(var(--particle-drift-x) * 1.2), -30vh)' },
          '90%': { opacity: '0.5', transform: 'translate(calc(var(--particle-drift-x) * 1.1), -35vh) scale(1.2)' }, /* Glitch */
          '100%': { transform: 'translate(calc(var(--particle-drift-x) * 2), -40vh)', opacity: '0' },
        },
        'collective-shift-wave': {
          '0%': { transform: 'translateX(-100%) skewX(-15deg)', opacity: '0.3' },
          '20%': { transform: 'translateX(0) skewX(0deg)', opacity: '0.1' },
          '100%': { transform: 'translateX(100%) skewX(15deg)', opacity: '0.3' },
        },
        'fireworks-burst': {
          '0%': {
            transform: 'rotate(var(--particle-angle)) translateX(0) scale(0.5)',
            opacity: '1',
          },
          '100%': {
            transform: 'rotate(var(--particle-angle)) translateX(var(--particle-distance)) scale(0)',
            opacity: '0',
          },
        },
        'count-bounce': {
          '0%, 100%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(1.15)' },
          '60%': { transform: 'scale(0.95)' },
          '80%': { transform: 'scale(1.05)' },
        },
        'logo-calm': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        'logo-joyful': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-1px) scale(1.05)' },
        },
        'logo-anxious': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '10%': { transform: 'translate(-1px, 1px) scale(1.01)' },
          '30%': { transform: 'translate(1px, -1px) scale(0.99)' },
          '50%': { transform: 'translate(-1px, -1px) scale(1.02)' },
          '70%': { transform: 'translate(1px, 1px) scale(1)' },
          '90%': { transform: 'translate(0, 0) scale(0.98)' },
        },
        'text-breathe': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'global-pulse': 'global-pulse 2s ease-in-out', 
        'orb-pulse': 'orb-pulse 3s ease-in-out infinite', 
        'typewriter': 'typewriter 2s steps(40) 1s 1 normal both',
        'fade-in': 'fade-in 1s ease-out forwards',
        'global-ripple-effect': 'global-ripple-effect 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards', 
        'particle-calm': 'particle-calm-motion var(--animation-duration, 25s) ease-in-out var(--animation-delay, 0s) infinite',
        'particle-joyful': 'particle-joyful-motion var(--animation-duration, 10s) ease-out var(--animation-delay, 0s) infinite',
        'particle-anxious': 'particle-anxious-motion var(--animation-duration, 7s) linear var(--animation-delay, 0s) infinite',
        'collective-shift-wave': 'collective-shift-wave 1.5s ease-out forwards', 
        'fireworks-burst': 'fireworks-burst var(--animation-duration, 1.4s) ease-out var(--animation-delay, 0s) forwards',
        'count-bounce': 'count-bounce 0.6s ease-out',
        'logo-calm': 'logo-calm 4s ease-in-out infinite',
        'logo-joyful': 'logo-joyful 1.5s ease-in-out infinite',
        'logo-anxious': 'logo-anxious 0.5s linear infinite',
        'text-breathe': 'text-breathe 2s ease-in-out infinite',
      },
      backdropBlur: {
        '24px': '24px', 
        '2xl': '24px', 
      },
      boxShadow: {
        'soft': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        'lifted': '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
      }
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
