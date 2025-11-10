import { motion } from 'framer-motion';

export function FloatingBubbles() {
  const bubbles = [
    { size: 60, duration: 20, delay: 0, x: '10vw' },
    { size: 40, duration: 25, delay: 2, x: '80vw' },
    { size: 80, duration: 30, delay: 4, x: '50vw' },
    { size: 50, duration: 22, delay: 6, x: '30vw' },
    { size: 35, duration: 28, delay: 8, x: '70vw' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {bubbles.map((bubble, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: bubble.x,
            background: `radial-gradient(circle at 30% 30%, rgba(216, 180, 254, 0.3), rgba(167, 139, 250, 0.2))`,
            filter: 'blur(1px)',
          }}
          animate={{
            y: [window.innerHeight + 100, -100],
            x: [0, Math.sin(i) * 50, 0],
          }}
          transition={{
            duration: bubble.duration,
            repeat: Infinity,
            delay: bubble.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}
