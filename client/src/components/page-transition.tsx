import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useLoading } from '@/contexts/loading-context';

interface PageTransitionProps {
  children: React.ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
  },
};

const contentVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const { isLoading } = useLoading();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        className="relative min-h-screen"
      >
        <motion.div
          variants={contentVariants}
          className="relative z-10"
        >
          {children}
        </motion.div>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50"
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
} 