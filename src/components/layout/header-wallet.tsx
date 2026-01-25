'use client'

import { Wallet, Plus, History } from 'lucide-react'
import Link from 'next/link'
import useSWR from 'swr'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'

interface WalletResponse {
  balance: number
  error?: string
}

const fetcher = async (url: string): Promise<WalletResponse> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch wallet')
  return res.json()
}

export function HeaderWallet() {
  const { user, isLoading: authLoading } = useAuth()

  const { data, isLoading, error } = useSWR<WalletResponse>(
    user ? '/api/wallet/balance' : null,
    fetcher,
    {
      refreshInterval: 10000,
      revalidateOnFocus: false,
    }
  )

  const balance = data?.balance ?? 0
  const loading = authLoading || isLoading

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Wallet className="w-4 h-4" />
          {!user ? (
            <span>Sign In</span>
          ) : loading ? (
            <span>...</span>
          ) : error ? (
            <span className="text-destructive">Error</span>
          ) : (
            <span className="font-medium">${balance.toFixed(2)}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {user ? (
          <>
            <Link href="/wallet">
              <DropdownMenuItem>
                <Plus className="w-4 h-4 mr-2" />
                Add Funds
              </DropdownMenuItem>
            </Link>
            <Link href="/wallet">
              <DropdownMenuItem>
                <History className="w-4 h-4 mr-2" />
                History
              </DropdownMenuItem>
            </Link>
          </>
        ) : (
          <Link href="/auth/sign-in">
            <DropdownMenuItem>
              Sign In to View Wallet
            </DropdownMenuItem>
          </Link>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
