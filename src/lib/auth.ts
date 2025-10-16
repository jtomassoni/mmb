import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import { Role } from "@prisma/client"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user || credentials.password !== user.password) {
            return null
          }

          // Check if user is active
          if (!user.isActive) {
            console.log(`Login attempt for disabled user: ${user.email}`)
            return null
          }
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            mustResetPassword: user.mustResetPassword,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.mustResetPassword = user.mustResetPassword
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as Role
        session.user.mustResetPassword = token.mustResetPassword as boolean
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Check if user needs to reset password (this won't work here, we'll handle in middleware)
      // If it's a relative URL, make it absolute
      if (url.startsWith('/')) {
        return new URL(url, baseUrl).toString()
      }
      // If it's already absolute, return as is
      if (url.startsWith('http')) {
        return url
      }
      // Default to admin page
      return new URL('/admin', baseUrl).toString()
    },
  },
  pages: {
    signIn: '/login',
  },
}
