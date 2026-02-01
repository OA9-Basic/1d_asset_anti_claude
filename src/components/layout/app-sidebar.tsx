'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ShoppingBag,
  Wallet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Package,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { sidebarStagger, sidebarItem } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: number;
}

const navigation: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Available Assets', href: '/marketplace/available', icon: ShoppingBag },
  { title: 'Funding Assets', href: '/marketplace/funding', icon: DollarSign },
  { title: 'My Assets', href: '/my-assets', icon: Package },
  { title: 'Wallet', href: '/wallet', icon: Wallet },
  { title: 'Settings', href: '/settings', icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || 'U';
  };

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';
  const sidebarItemClass = isCollapsed ? 'justify-center px-3' : 'justify-start px-4';

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'hidden md:flex flex-col fixed left-0 top-0 h-screen bg-background border-r z-40',
          sidebarWidth
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 border-b px-4">
          <motion.div
            initial={false}
            animate={{ scale: isCollapsed ? 0.8 : 1 }}
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold shrink-0">
              D
            </div>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="font-bold whitespace-nowrap"
                >
                  Digital Assets
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Navigation */}
        <motion.nav
          variants={sidebarStagger}
          initial="hidden"
          animate="show"
          className="flex-1 overflow-y-auto py-4 px-2 space-y-1"
        >
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <motion.div key={item.href} variants={sidebarItem}>
                <Link href={item.href} className="block">
                  <motion.div whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full h-10 gap-3 relative group',
                        sidebarItemClass,
                        isActive &&
                          'bg-gradient-to-r from-violet-500/10 to-purple-600/10 text-violet-700 dark:text-violet-400'
                      )}
                    >
                      <motion.div
                        animate={isActive ? { rotate: [0, -10, 10, -10, 0] } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon
                          className={cn(
                            'h-5 w-5 shrink-0',
                            isActive && 'text-violet-600 dark:text-violet-400'
                          )}
                        />
                      </motion.div>
                      <AnimatePresence mode="wait">
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="whitespace-nowrap"
                          >
                            {item.title}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {item.badge && !isCollapsed && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto bg-violet-500 text-white text-xs px-2 py-0.5 rounded-full"
                        >
                          {item.badge}
                        </motion.span>
                      )}
                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          whileHover={{ opacity: 1, x: 0 }}
                          className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50"
                        >
                          {item.title}
                        </motion.div>
                      )}
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </motion.nav>

        {/* User Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="border-t p-2"
        >
          <Link href="/profile">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="ghost"
                className={cn('w-full h-12 gap-3 relative group', sidebarItemClass)}
              >
                <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs font-medium">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col items-start whitespace-nowrap overflow-hidden"
                    >
                      <span className="text-sm font-medium truncate max-w-[140px]">
                        {user?.name || 'User'}
                      </span>
                      <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                        {user?.email}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
                {isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50"
                  >
                    Profile
                  </motion.div>
                )}
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Collapse Toggle Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute -right-3 top-20 z-50"
        >
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6 rounded-full bg-background shadow-md border-2"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <motion.div
                animate={{ rotate: isCollapsed ? 0 : 180 }}
                transition={{ duration: 0.3 }}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-3 w-3" />
                ) : (
                  <ChevronLeft className="h-3 w-3" />
                )}
              </motion.div>
            </Button>
          </motion.div>
        </motion.div>
      </motion.aside>

      {/* Mobile Overlay */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
}
