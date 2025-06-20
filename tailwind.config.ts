
import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
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
        'global-pulse': { // Updated as per spec 1.3.2
          '0%, 100%': { filter: 'brightness(100%) saturate(100%)', transform: 'scale(1)' },
          '50%': { filter: 'brightness(80%) saturate(80%)', transform: 'scale(0.99)' },
        },
        'orb-pulse': { // New for OrbButton hypnotic pulse (spec 2.5)
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
         'global-ripple-effect': { // Renamed from ripple-effect to be specific
          '0%': { transform: 'scale(0.1) translate(-50%, -50%)', opacity: '0.7' }, // Start from center
          '100%': { transform: 'scale(3) translate(-50%, -50%)', opacity: '0' }, // Ensure ripple starts from center
        },
        'particle-float': {
          '0%': { transform: 'translateY(0) translateX(0)', opacity: '0' },
          '25%': { opacity: '0.7' },
          '50%': { transform: 'translateY(-15vh) translateX(5vw)', opacity: '1'},
          '75%': { opacity: '0.7' },
          '100%': { transform: 'translateY(-30vh) translateX(-5vw)', opacity: '0' },
        },
        'collective-shift-wave': {
          '0%': { transform: 'translateX(-100%) skewX(-15deg)', opacity: '0.3' },
          '20%': { transform: 'translateX(0) skewX(0deg)', opacity: '0.1' },
          '100%': { transform: 'translateX(100%) skewX(15deg)', opacity: '0.3' },
        },
        'firework-particle-anim': { // from MilestoneFireworks
          '0%': {
            opacity: '0.8',
            transform: 'translate(-50%, -50%) rotate(var(--particle-initial-rotate)) translateX(0px) scale(0.2)',
          },
          '50%': {
            opacity: '1',
            transform: 'translate(-50%, -50%) rotate(var(--particle-mid-rotate)) translateX(var(--particle-mid-translate-x)) scale(1)',
          },
          '100%': {
            opacity: '0',
            transform: 'translate(-50%, -50%) rotate(var(--particle-final-rotate)) translateX(var(--particle-final-translate-x)) scale(0.3) translateY(40px)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'global-pulse': 'global-pulse 2s ease-in-out', // Spec: 1s to contract, 1s to return (2s total)
        'orb-pulse': 'orb-pulse 3s ease-in-out infinite', // Spec: 3s loop
        'typewriter': 'typewriter 2s steps(40) 1s 1 normal both',
        'fade-in': 'fade-in 1s ease-out forwards',
        'global-ripple-effect': 'global-ripple-effect 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards', // easeOutQuart like
        'particle-float': 'particle-float 10s ease-in-out infinite',
        'collective-shift-wave': 'collective-shift-wave 1.5s ease-out forwards', // Spec: 1.5s easeOutSine
        'firework-particle-anim': 'firework-particle-anim var(--animation-duration, 2s) var(--animation-timing-function, ease-out) var(--animation-delay, 0s) forwards',
      },
      backdropBlur: {
        '24px': '24px', // Kept from original, can be '2xl' from tailwind default if preferred.
        '2xl': '24px', // Ensure this specific value is available
      },
      boxShadow: {
        'soft': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
