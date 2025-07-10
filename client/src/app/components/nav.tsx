import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { usePrefetch } from "@/hooks/use-prefetch";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLoading } from "@/contexts/loading-context";
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  prefetchData?: boolean;
}

interface NavProps {
  items: NavItem[];
  className?: string;
}

export function Nav({ items, className }: NavProps) {
  const pathname = usePathname();
  const { prefetchPath } = usePrefetch();
  const { startLoading, stopLoading } = useLoading();
  const { user } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [prefetchedPaths, setPrefetchedPaths] = useState<Set<string>>(new Set());

  // Prefetch all navigation items on mount
  useEffect(() => {
    const prefetchAll = async () => {
      for (const item of items) {
        if (!prefetchedPaths.has(item.href)) {
          await prefetchPath(item.href, { prefetchData: item.prefetchData });
          setPrefetchedPaths(prev => new Set(prev).add(item.href));
        }
      }
    };
    prefetchAll();
  }, [items, prefetchPath, prefetchedPaths]);

  const handleMouseEnter = async (item: NavItem) => {
    setHoveredItem(item.href);
    if (!prefetchedPaths.has(item.href)) {
      startLoading();
      await prefetchPath(item.href, { prefetchData: item.prefetchData });
      setPrefetchedPaths(prev => new Set(prev).add(item.href));
      stopLoading();
    }
  };

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      {/* User identity section */}
      {user && (
        <div className="flex items-center space-x-2">
          <img
            src="/path/to/avatar.png" // Replace with dynamic avatar URL if available
            alt="User Avatar"
            className="w-8 h-8 rounded-full"
          />
          <div>
            <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
        </div>
      )}

      {/* Navigation items */}
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        const isHovered = hoveredItem === item.href;

        return (
          <motion.div
            key={item.href}
            className="relative"
            onHoverStart={() => handleMouseEnter(item)}
            onHoverEnd={() => setHoveredItem(null)}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link
              href={item.href}
              onMouseEnter={() => prefetchPath(item.href, { prefetchData: item.prefetchData })}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary relative group",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {Icon && (
                  <motion.div
                    whileHover={{ rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Icon className="h-4 w-4" />
                  </motion.div>
                )}
                {item.title}
              </motion.div>
              <motion.div
                className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isActive ? 1 : 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              />
            </Link>
            <AnimatePresence>
              {isHovered && !isActive && (
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary/50"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  exit={{ opacity: 0, scaleX: 0 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </nav>
  );
}