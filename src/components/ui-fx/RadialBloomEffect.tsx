
"use client";

import { motion } from 'framer-motion';

interface RadialBloomEffectProps {
  point: {
    x: number;
    y: number;
  };
}

const RadialBloomEffect: React.FC<RadialBloomEffectProps> = ({ point }) => {
  return (
    <motion.div
      className="fixed inset-0 z-30 pointer-events-none"
      style={{
        backdropFilter: 'blur(12px)',
        '--mask-size': '0px',
        maskImage: `radial-gradient(circle at ${point.x}px ${point.y}px, black 0%, black var(--mask-size), transparent var(--mask-size))`,
        WebkitMaskImage: `radial-gradient(circle at ${point.x}px ${point.y}px, black 0%, black var(--mask-size), transparent var(--mask-size))`,
      }}
      initial={{ '--mask-size': '0px' }}
      animate={{ '--mask-size': '150vmax', transition: { duration: 0.6, ease: 'easeOut' } }}
      exit={{ '--mask-size': '0px', transition: { duration: 0.4, ease: 'easeIn' } }}
    />
  );
};

export default RadialBloomEffect;
