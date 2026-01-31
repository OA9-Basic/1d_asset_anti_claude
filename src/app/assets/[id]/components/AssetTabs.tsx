'use client';

import { ShoppingCart, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatePresence } from 'framer-motion';
import type { Asset, Contribution, Purchase } from '../types';
import { prismaDecimalToNumber } from '@/lib/prisma-decimal';

interface AssetTabsProps {
  asset: Asset;
  contributions: Contribution[];
  purchases: Purchase[];
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function AssetTabs({ asset, contributions, purchases }: AssetTabsProps) {
  return (
    <Card className="border-2">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger
            value="details"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4"
          >
            Details
          </TabsTrigger>
          <TabsTrigger
            value="contributors"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4"
          >
            Contributors ({contributions.length})
          </TabsTrigger>
          <TabsTrigger
            value="purchases"
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-4"
          >
            Purchases ({purchases.length})
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="details" className="mt-0">
            <CardContent className="p-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold">About This Asset</h3>
                <p className="text-muted-foreground leading-relaxed">
                  This asset is currently in the{' '}
                  <strong>{asset.status.toLowerCase()}</strong> phase.
                  {asset.status === 'COLLECTING' &&
                    ' It requires community funding to be purchased and made available to all contributors.'}
                  {asset.status === 'AVAILABLE' &&
                    ' It has been fully funded and is now available for purchase.'}
                  {asset.status === 'PURCHASED' &&
                    ' It has been purchased and is currently being processed for delivery.'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="p-4 rounded-xl bg-muted/50 border">
                    <p className="text-sm text-muted-foreground mb-1">Created</p>
                    <p className="font-medium">
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50 border">
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Purchases
                    </p>
                    <p className="font-medium">{asset.totalPurchases}</p>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </TabsContent>

          <TabsContent value="contributors" className="mt-0">
            <CardContent className="p-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {contributions.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No Contributors Yet"
                    description="Be the first to contribute to this asset!"
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Contributor</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Investment</TableHead>
                          <TableHead className="text-right">Profit Received</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contributions.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-semibold">
                                  {c.user.firstName?.charAt(0) ||
                                    c.user.email.charAt(0).toUpperCase()}
                                </div>
                                {c.user.firstName || c.user.email}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ${prismaDecimalToNumber(c.amount).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              {prismaDecimalToNumber(c.excessAmount) > 0 ? (
                                <span className="text-blue-600 font-medium">
                                  ${prismaDecimalToNumber(c.excessAmount).toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {prismaDecimalToNumber(c.totalProfitReceived) > 0 ? (
                                <span className="text-green-600 font-medium">
                                  ${prismaDecimalToNumber(c.totalProfitReceived).toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </motion.div>
            </CardContent>
          </TabsContent>

          <TabsContent value="purchases" className="mt-0">
            <CardContent className="p-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {purchases.length === 0 ? (
                  <EmptyState
                    icon={ShoppingCart}
                    title="No Purchases Yet"
                    description="This asset hasn't been purchased yet"
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Buyer</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {purchases.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white text-sm font-semibold">
                                  {p.user.firstName?.charAt(0) ||
                                    p.user.email.charAt(0).toUpperCase()}
                                </div>
                                {p.user.firstName || p.user.email}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ${prismaDecimalToNumber(p.purchaseAmount).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {new Date(p.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </motion.div>
            </CardContent>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </Card>
  );
}
