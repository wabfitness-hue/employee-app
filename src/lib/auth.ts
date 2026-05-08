import { NextAuthOptions, getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export type UserRole = 'ADMIN' | 'MANAGER' | 'VIEWER'

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60,
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        })

        if (!user || !user.passwordHash) {
          await bcrypt.compare('dummy', '$2a$12$dummyhashfortimingattackprevention00000000000000000000000')
          throw new Error('Invalid credentials')
        }

        if (!user.isActive) {
          throw new Error('Account deactivated')
        }

        const passwordValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!passwordValid) {
          throw new Error('Invalid credentials')
        }

        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.email,
          role: user.role as UserRole,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
}

export async function getSession() {
  return getServerSession(authOptions)
}

export async function requireAuth() {
  const session = await getSession()
  if (!session?.user) {
    throw new Error('Unauthorised')
  }
  return session
}

export async function requireRole(roles: UserRole[]) {
  const session = await requireAuth()
  if (!roles.includes((session.user as any).role as UserRole)) {
    throw new Error('Forbidden')
  }
  return session
}
