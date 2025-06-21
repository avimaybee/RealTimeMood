
"use client";

import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

interface RadialBloomEffectProps {
  point: {
    x: number;
    y: number;
  };
}

const RadialBloomEffect: React.FC<RadialBloomEffectProps> = ({ point }) => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      '--mask-size': '150vmax',
      transition: { duration: 0.6, ease: 'easeOut' },
    });
  }, [controls]);

  return (
    <motion.div
      className="fixed inset-0 z-30 pointer-events-none"
      style={{
        backdropFilter: 'blur(24px)',
        '--mask-size': '0px',
         // The mask creates the growing circle effect
        maskImage: `radial-gradient(circle at ${point.x}px ${point.y}px, black 0%, black var(--mask-size), transparent var(--mask-size))`,
        WebkitMaskImage: `radial-gradient(circle at ${point.x}px ${point.y}px, black 0%, black var(--mask-size), transparent var(--mask-size))`,
      }}
      initial={{ '--mask-size': '0px' }}
      animate={controls}
    />
  );
};

export default RadialBloomEffect;
