import bcrypt from 'bcryptjs'
import { prisma } from './db'

export type Role = 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'VIEWER'

export interface AuthUser {
  id: string
  email: string
  name: string | null
  role: Role
}

export interface SessionData {
  userId: string
  email: string
  role: Role
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// User authentication
export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      return null
    }

    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

// Session management
export async function createSession(userId: string): Promise<string> {
  // Create session that expires in 30 days
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  
  const session = await prisma.session.create({
    data: {
      userId,
      expiresAt
    }
  })

  return session.id
}

export async function getSessionUser(sessionId: string): Promise<AuthUser | null> {
  try {
    const session = await prisma.session.findUnique({
      where: { 
        id: sessionId,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    })

    if (!session || !session.user) {
      return null
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role
    }
  } catch (error) {
    console.error('Session validation error:', error)
    return null
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  try {
    await prisma.session.delete({
      where: { id: sessionId }
    })
  } catch (error) {
    console.error('Session deletion error:', error)
  }
}

export async function cleanupExpiredSessions(): Promise<void> {
  try {
    await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })
  } catch (error) {
    console.error('Session cleanup error:', error)
  }
}

// User management
export async function createUser(
  email: string, 
  password: string, 
  name?: string, 
  role: Role = 'VIEWER'
): Promise<AuthUser> {
  const hashedPassword = await hashPassword(password)
  
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name || null,
      role
    }
  })

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  }
}

export async function getUserById(userId: string): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  } catch (error) {
    console.error('Get user error:', error)
    return null
  }
}

// Role checking utilities
export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  const roleHierarchy: Record<Role, number> = {
    'VIEWER': 1,
    'AUTHOR': 2,
    'EDITOR': 3,
    'ADMIN': 4
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export function requireRole(userRole: Role, requiredRole: Role): void {
  if (!hasPermission(userRole, requiredRole)) {
    throw new Error(`Insufficient permissions. Required: ${requiredRole}, Current: ${userRole}`)
  }
}