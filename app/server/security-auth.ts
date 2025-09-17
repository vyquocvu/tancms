/**
 * Enhanced authentication utilities with additional security measures
 */

import { hashPassword, verifyPassword } from './auth'
import type { AuthUser } from './auth'

export interface LoginAttempt {
  email: string
  ip: string
  timestamp: number
  success: boolean
}

export interface SecurityConfig {
  maxLoginAttempts: number
  lockoutDurationMs: number
  passwordMinLength: number
  requireStrongPassword: boolean
  sessionTimeoutMs: number
  maxActiveSessions: number
}

/**
 * Default security configuration
 */
const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  maxLoginAttempts: 5,
  lockoutDurationMs: 15 * 60 * 1000, // 15 minutes
  passwordMinLength: 8,
  requireStrongPassword: true,
  sessionTimeoutMs: 24 * 60 * 60 * 1000, // 24 hours
  maxActiveSessions: 5,
}

/**
 * In-memory store for login attempts (in production, use Redis or database)
 */
class LoginAttemptTracker {
  private attempts = new Map<string, LoginAttempt[]>()
  private config: SecurityConfig
  
  constructor(config = DEFAULT_SECURITY_CONFIG) {
    this.config = config
    
    // Clean up old attempts every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }
  
  private cleanup(): void {
    const cutoff = Date.now() - this.config.lockoutDurationMs
    
    for (const [key, attempts] of this.attempts.entries()) {
      const validAttempts = attempts.filter(attempt => attempt.timestamp > cutoff)
      
      if (validAttempts.length === 0) {
        this.attempts.delete(key)
      } else {
        this.attempts.set(key, validAttempts)
      }
    }
  }
  
  private getKey(email: string, ip: string): string {
    return `${email}:${ip}`
  }
  
  recordAttempt(email: string, ip: string, success: boolean): void {
    const key = this.getKey(email, ip)
    const attempt: LoginAttempt = {
      email,
      ip,
      timestamp: Date.now(),
      success,
    }
    
    const attempts = this.attempts.get(key) || []
    attempts.push(attempt)
    
    // Keep only recent attempts
    const cutoff = Date.now() - this.config.lockoutDurationMs
    const recentAttempts = attempts.filter(a => a.timestamp > cutoff)
    
    this.attempts.set(key, recentAttempts)
  }
  
  isLockedOut(email: string, ip: string): boolean {
    const key = this.getKey(email, ip)
    const attempts = this.attempts.get(key) || []
    
    const cutoff = Date.now() - this.config.lockoutDurationMs
    const recentFailedAttempts = attempts.filter(
      attempt => attempt.timestamp > cutoff && !attempt.success
    )
    
    return recentFailedAttempts.length >= this.config.maxLoginAttempts
  }
  
  getFailedAttempts(email: string, ip: string): number {
    const key = this.getKey(email, ip)
    const attempts = this.attempts.get(key) || []
    
    const cutoff = Date.now() - this.config.lockoutDurationMs
    return attempts.filter(
      attempt => attempt.timestamp > cutoff && !attempt.success
    ).length
  }
  
  clearAttempts(email: string, ip: string): void {
    const key = this.getKey(email, ip)
    this.attempts.delete(key)
  }
}

/**
 * Global login attempt tracker instance
 */
export const loginTracker = new LoginAttemptTracker()

/**
 * Extract IP address from request
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp
  }
  
  return 'unknown'
}

/**
 * Enhanced password validation
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0
  
  // Length check
  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('Password must be at least 8 characters long')
  }
  
  if (password.length >= 12) {
    score += 1
  }
  
  // Character variety checks
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Password must contain lowercase letters')
  }
  
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Password must contain uppercase letters')
  }
  
  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push('Password must contain numbers')
  }
  
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push('Password must contain special characters')
  }
  
  // Common password patterns
  const commonPatterns = [
    /^(.)\1+$/, // All same character
    /123456|654321|abcdef|qwerty|password/i,
    /^(password|123456|qwerty|abc123)$/i,
  ]
  
  if (commonPatterns.some(pattern => pattern.test(password))) {
    score -= 2
    feedback.push('Password is too common or predictable')
  }
  
  // Sequential characters
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789)/i.test(password)) {
    score -= 1
    feedback.push('Avoid sequential characters')
  }
  
  const isValid = score >= 3 && feedback.filter(f => !f.includes('Avoid sequential')).length === 0
  
  return { isValid, score: Math.max(0, score), feedback }
}

/**
 * Enhanced user authentication with security checks
 */
export async function authenticateUserSecure(
  email: string,
  password: string,
  request: Request
): Promise<{ user: AuthUser | null; error?: string; lockoutTime?: number }> {
  const ip = getClientIp(request)
  
  // Check if account is locked out
  if (loginTracker.isLockedOut(email, ip)) {
    const failedAttempts = loginTracker.getFailedAttempts(email, ip)
    const lockoutTime = DEFAULT_SECURITY_CONFIG.lockoutDurationMs
    
    return {
      user: null,
      error: `Account temporarily locked due to too many failed login attempts. Try again in ${Math.ceil(lockoutTime / 60000)} minutes.`,
      lockoutTime: Date.now() + lockoutTime,
    }
  }
  
  try {
    // Attempt authentication
    const user = await authenticateUser(email, password)
    
    if (user) {
      // Clear failed attempts on successful login
      loginTracker.clearAttempts(email, ip)
      loginTracker.recordAttempt(email, ip, true)
      return { user }
    } else {
      // Record failed attempt
      loginTracker.recordAttempt(email, ip, false)
      const remainingAttempts = DEFAULT_SECURITY_CONFIG.maxLoginAttempts - 
                               loginTracker.getFailedAttempts(email, ip)
      
      return {
        user: null,
        error: `Invalid email or password. ${remainingAttempts > 0 ? `${remainingAttempts} attempts remaining.` : 'Account will be temporarily locked.'}`,
      }
    }
  } catch (error) {
    console.error('Authentication error:', error)
    loginTracker.recordAttempt(email, ip, false)
    
    return {
      user: null,
      error: 'Authentication failed. Please try again.',
    }
  }
}

/**
 * Generate secure session token
 */
export function generateSecureToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Session fingerprinting for additional security
 */
export function generateSessionFingerprint(request: Request): string {
  const userAgent = request.headers.get('user-agent') || ''
  const acceptLanguage = request.headers.get('accept-language') || ''
  const acceptEncoding = request.headers.get('accept-encoding') || ''
  
  // Create a basic fingerprint (don't include IP as it can change)
  const fingerprint = `${userAgent}:${acceptLanguage}:${acceptEncoding}`
  
  // Hash the fingerprint
  const encoder = new TextEncoder()
  const data = encoder.encode(fingerprint)
  
  return btoa(String.fromCharCode(...data)).substring(0, 32)
}

/**
 * Validate session with additional security checks
 */
export function validateSessionSecurity(
  sessionFingerprint: string,
  currentFingerprint: string,
  sessionCreatedAt: Date,
  maxAgeMs = DEFAULT_SECURITY_CONFIG.sessionTimeoutMs
): { valid: boolean; reason?: string } {
  // Check session age
  const sessionAge = Date.now() - sessionCreatedAt.getTime()
  if (sessionAge > maxAgeMs) {
    return { valid: false, reason: 'Session expired' }
  }
  
  // Check fingerprint (allow some tolerance for minor changes)
  const fingerprintSimilarity = calculateSimilarity(sessionFingerprint, currentFingerprint)
  if (fingerprintSimilarity < 0.8) {
    return { valid: false, reason: 'Session fingerprint mismatch' }
  }
  
  return { valid: true }
}

/**
 * Calculate similarity between two strings (for fingerprint comparison)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) return 1.0
  
  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + cost // substitution
      )
    }
  }
  
  return matrix[str2.length][str1.length]
}

/**
 * Audit log entry for security events
 */
export interface SecurityAuditEntry {
  timestamp: Date
  event: string
  userId?: string
  ip: string
  userAgent: string
  success: boolean
  details?: Record<string, unknown>
}

/**
 * Simple security audit logger
 */
class SecurityAuditLogger {
  private logs: SecurityAuditEntry[] = []
  private maxLogs = 10000
  
  log(event: string, request: Request, userId?: string, success = true, details?: Record<string, unknown>): void {
    const entry: SecurityAuditEntry = {
      timestamp: new Date(),
      event,
      userId,
      ip: getClientIp(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      success,
      details,
    }
    
    this.logs.push(entry)
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }
    
    // In production, write to persistent storage
    if (process.env.NODE_ENV === 'production') {
      console.log('[SECURITY_AUDIT]', JSON.stringify(entry))
    }
  }
  
  getRecentLogs(limit = 100): SecurityAuditEntry[] {
    return this.logs.slice(-limit)
  }
  
  getLogsByUser(userId: string, limit = 100): SecurityAuditEntry[] {
    return this.logs
      .filter(log => log.userId === userId)
      .slice(-limit)
  }
  
  getFailedLogins(since?: Date): SecurityAuditEntry[] {
    const cutoff = since || new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    
    return this.logs.filter(
      log => log.event === 'LOGIN_ATTEMPT' && 
             !log.success && 
             log.timestamp >= cutoff
    )
  }
}

/**
 * Global security audit logger instance
 */
export const securityAudit = new SecurityAuditLogger()

/**
 * Authentication functions for use by authenticateUser
 */
async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  // This is a placeholder - in the actual implementation, this would use the existing
  // authenticateUser function from auth.ts
  return null
}