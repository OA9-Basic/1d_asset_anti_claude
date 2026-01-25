'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import {
  Menu,
  User,
  Settings,
  LogOut,
  Wallet,
  ChevronRight,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeInUp, staggerContainer, staggerItem, hoverScale } from '@/lib/animations'

interface WalletBalance {
  balance: number
  withdrawableBalance: number
  storeCredit: number
}

interface BreadcrumbItem {
  title: string
  href: string
}

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []

  // Add home as first breadcrumb
  breadcrumbs.push({ title: 'Home', href: '/' })

  // Build path segments
  let currentPath = ''
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`
    const title = segments[i]
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    breadcrumbs.push({ title, href: currentPath })
  }

  return breadcrumbs
}

export function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { toast } = useToast()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(true)

  // Fetch wallet balance
  useEffect(() => {
    async function fetchBalance() {
      if (!user) {
        setBalanceLoading(false)
        return
      }

      try {
        const res = await fetch('/api/wallet/balance')
        if (res.ok) {
          const data = await res.json()
          setWalletBalance(data)
        }
      } catch (error) {
        console.error('Failed to fetch wallet balance:', error)
      } finally {
        setBalanceLoading(false)
      }
    }

    fetchBalance()
  }, [user])

  const handleSignOut = async () => {
    try {
      const res = await fetch('/api/auth/sign-out', { method: 'POST' })
      if (res.ok) {
        toast({
          title: 'Signed out successfully',
          description: 'You have been signed out of your account.',
        })
        router.push('/auth/sign-in')
        router.refresh()
      } else {
        throw new Error('Failed to sign out')
      }
    } catch (error) {
      console.error('Sign out error:', error)
      toast({
        title: 'Sign out failed',
        description: 'There was a problem signing you out. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user?.email?.slice(0, 2).toUpperCase() || 'U'
  }

  const breadcrumbs = getBreadcrumbs(pathname)

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Mobile Menu Trigger */}
        <motion.div {...hoverScale}>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </motion.div>

        {/* Breadcrumbs */}
        <motion.nav
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="flex items-center space-x-2 text-sm text-muted-foreground overflow-hidden"
        >
          {breadcrumbs.map((crumb, index) => (
            <motion.div
              key={crumb.href}
              variants={staggerItem}
              className="flex items-center"
            >
              {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
              {index === breadcrumbs.length - 1 ? (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium text-foreground truncate max-w-[150px] sm:max-w-[200px]"
                >
                  {crumb.title}
                </motion.span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-foreground transition-colors truncate max-w-[150px] sm:max-w-[200px]"
                >
                  {crumb.title}
                </Link>
              )}
            </motion.div>
          ))}
        </motion.nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Wallet Balance Display */}
        {balanceLoading ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden sm:flex items-center gap-2 mr-4"
          >
            <div className="h-8 w-24 bg-muted animate-pulse rounded-md" />
          </motion.div>
        ) : walletBalance ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/wallet" className="hidden sm:flex items-center gap-2 mr-4 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-600/10 hover:from-violet-500/20 hover:to-purple-600/20 transition-all border border-violet-500/20"
              >
                <Wallet className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Balance</span>
                  <motion.span
                    key={walletBalance.balance}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-sm font-semibold text-violet-700 dark:text-violet-300"
                  >
                    ${walletBalance.balance.toFixed(2)}
                  </motion.span>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ) : null}

        {/* User Actions */}
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs font-medium">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1.5 p-2">
                  <p className="text-sm font-medium leading-none">
                    {user.name || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/wallet" className="cursor-pointer">
                    <Wallet className="mr-2 h-4 w-4" />
                    Wallet
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                {user?.role === 'ADMIN' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t md:hidden overflow-hidden"
          >
            <motion.nav
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="container px-4 py-4 space-y-1"
            >
              {[
                { href: '/dashboard', label: 'Dashboard' },
                { href: '/marketplace/available', label: 'Available Assets' },
                { href: '/marketplace/funding', label: 'Funding Assets' },
                { href: '/my-assets', label: 'My Assets' },
                { href: '/wallet', label: 'Wallet' },
                { href: '/create', label: 'Create Asset' },
                { href: '/settings', label: 'Settings' },
              ].map((item) => (
                <motion.div key={item.href} variants={staggerItem}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block"
                  >
                    <Button variant="ghost" className="w-full justify-start">
                      {item.label}
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
