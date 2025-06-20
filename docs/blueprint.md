# **App Name**: RealTimeMood

## Core Features:

- Dynamic Background: The Living Canvas: The entire screen's background color dynamically shifts, serving as the app's primary visual expression. It represents the mathematically calculated average mood of all active users globally.
- Living Particles: The Canvas's Soul: Subtle, ethereal particles gently float across the screen, their behavior (speed, size, intensity, color) dynamically adapting to the collective mood. They are the app's soul.
- Global Ripple (Individual Contribution Affirmation): A thin, glowing, multi-layered ripple expands from the screen's center. It subtly tints towards the contributor's original mood color as it grows.
- Global Pulse (Collective Heartbeat - Expected Reward): The entire canvas (background, particles, UI) performs a deep, slow breath. This is a simultaneous animation of brightness and scale.
- Collective Shift (Major Event - Intermittent "Jackpot" Reward): A powerful, screen-wide, physics-based distortion wave washes over all elements on screen from left to right, visibly warping them as it passes.
- The Orb (Primary Entry Point - The Invitation to Touch): A prominent, perfectly circular floating button at bottom-center with a minimalist + icon. Features a subtle linear-gradient and soft box-shadow.
- The Color Well (Tap Interaction - Personal Imprint): The Orb implodes into a burst of particles that momentarily swirl around the tap point before dissipating. This feels like a powerful, satisfying release.
- The Radial Bloom (Hold & Drag - The Exploratory Delight & Addiction Engine): Background UI fades (opacity: 0.2) and applies backdrop-filter: blur(24px). This blur effect grows outwards from the central hold point, applying a very subtle, fluid refraction distortion to the background canvas, making it feel like liquid glass being disturbed.
- Real-Time UI Updates & Counters (Continuous Affirmation): App uses real-time database listeners to instantly update CollectiveMoodState (color, adjective) and contribution counts without polling.
- Historical Mood Trends: The Mood Nebula (Interactive Data Art & Exploration Hub): Concise, AI-generated interpretation. Text animates by writing itself with a subtle typewriter sound effect. The text glows in the dominant mood color of the summarized period.
- Community Quotes: Drifting Thoughts (Poetic Discoveries & Passive Engagement): Quotes softly materialize as if from the Living Particles themselves, glowing subtly before settling into readable opacity.
- Milestone Celebrations (Global Party! - High-Value Intermittent Reward): Followed by a cascading fireworks display of vibrant particles that burst outwards from the center, matching current mood color.
- Shareable Mood Snapshot (Organic Virality Driver): Allows capturing a high-quality image of the current app screen using a library like html2canvas.

## Style Guidelines:

- Dynamically chosen based on CollectiveMoodState, favoring brighter hues (yellows, oranges, vibrant blues, greens) to enhance visual engagement and feedback.
- Low-alpha rgba(255, 255, 255, 0.08) for light schemes, rgba(0,0,0,0.08) for dark schemes, ensuring background canvas shine-through.
- Dynamically chosen analogous to the current background mood, shifted approximately 30 degrees 'left' on the HSL wheel to create contrast and visual interest for UI elements and interactive components (e.g., button glows, active states).
- Dynamically chosen (off-white #EAEAEA or off-black #1F1F1F) to ensure WCAG AA contrast ratio against the changing background.
- 'Inter' (sans-serif) for all text to ensure universal legibility and maintain a contemporary, minimalist aesthetic.
- Achieved via font-weight and font-size variations.
- Use font-weight or opacity in harmony with the Global Pulse to add gentle visual rhythm, enhancing the living feeling of text elements.
- Apply a very subtle, blurred text-shadow (0px 4px 12px rgba(0, 0, 0, 0.4)) to all text on the canvas for "pop" and enhanced readability.
- Ultra-minimalist, thin line-art icons (e.g., custom set or Feather Icons).
- Icons feature soft glows and adapt their color to mirror and reflect current ambient moods (using the UI Accent/Glow color).
- Apply significant backdrop-filter: blur(24px) to UI panels for a true frosted glass effect.
- All UI elements should minimize intrusion, appear only when necessary, and allow the canvas to shine through. Use generous whitespace.
- Apply generous and consistent border-radius (e.g., 16px to 24px) to all UI containers, buttons, and input elements.
- Key UI elements (Header, Orb, Footer) will subtly shift their position by a few pixels (+/- 2-4px) in response to Collective Shift events, adding to the "living" feel.
- Fluid, physics-based animations via Framer Motion for UI elements. WebGL shaders for complex particle and distortion effects (e.g., Collective Shift, Living Particles).
- Animations are smooth and organic, not just fast. Use spring physics (stiffness, damping) for a natural, weighted feel.
- Elements fade in and out, not just appear instantly. Stagger opacity and transform animations for layered effects.
- Animation for appearance should be inverse to dismissal.
- Animation should guide the user's eye and reinforce the interaction's meaning.
- Incorporate these for effects like Gradient Materialization, Background Blur & Warp, and Collective Shift.
- Use consistently for Orb pulse, button blooms, and number animations for a delightful, responsive feel.