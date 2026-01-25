'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Wallet,
  PlusCircle,
} from 'lucide-react'
import { buttonTap } from '@/lib/animations'

interface NavItem {
  title: string
  href: string
  icon: typeof LayoutDashboard
}

const navigation: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Marketplace', href: '/marketplace/available', icon: ShoppingBag },
  { title: 'My Assets', href: '/my-assets', icon: Package },
  { title: 'Wallet', href: '/wallet', icon: Wallet },
  { title: 'Create', href: '/create', icon: PlusCircle },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <motion.nav
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={item.href} className="flex-1 block">
                <motion.div
                  {...buttonTap}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-colors relative',
                    isActive
                      ? 'text-violet-600 dark:text-violet-400'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-purple-600/10 rounded-lg"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <motion.div
                    animate={isActive ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon className={cn(
                      'h-5 w-5 relative z-10',
                      isActive && 'text-violet-600 dark:text-violet-400'
                    )} />
                  </motion.div>
                  <span className={cn(
                    'text-[10px] font-medium relative z-10',
                    isActive && 'text-violet-600 dark:text-violet-400'
                  )}>
                    {item.title}
                  </span>
                </motion.div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Safe area padding for iOS */}
      <div className="h-safe-area-bottom w-full bg-background" />
    </motion.nav>
  )
}
