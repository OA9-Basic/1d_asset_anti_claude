import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

import { db } from './db';

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateTime: 60 * 60,
  },
  advanced: {
    cookiePrefix: 'asset_market',
    crossSubDomainCookies: {
      enabled: false,
    },
  },
  socialProviders: {},
});

export type Session = typeof auth.$Infer.Session;
