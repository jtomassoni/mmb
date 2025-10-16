import { Role } from "@prisma/client"
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: Role
      mustResetPassword?: boolean
    }
  }

  interface User {
    role: Role
    mustResetPassword?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role
    mustResetPassword?: boolean
  }
}
