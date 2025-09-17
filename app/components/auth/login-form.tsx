import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Eye, EyeOff, Lock } from 'lucide-react'

interface AuthUser {
  id: string
  email: string
  name: string | null
  role: string
}

interface LoginFormProps {
  onSuccess?: (user: AuthUser) => void
  onRegisterClick?: () => void
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

export default function LoginForm({ onSuccess, onRegisterClick }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/auth?action=login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ general: data.error || 'Login failed' })
        return
      }

      if (onSuccess) {
        onSuccess(data.user)
      }
    } catch {
      setErrors({ general: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader className='text-center'>
        <div className='mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4'>
          <Lock className='w-6 h-6 text-primary' />
        </div>
        <CardTitle className='text-2xl'>Welcome Back</CardTitle>
        <p className='text-muted-foreground'>Sign in to your TanCMS account</p>
      </CardHeader>

      <CardContent>
        {errors.general && (
          <Alert className='mb-6' variant='destructive'>
            <AlertDescription>{errors.general}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='Enter your email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={errors.email ? 'border-destructive' : ''}
              disabled={loading}
            />
            {errors.email && <p className='text-sm text-destructive'>{errors.email}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <div className='relative'>
              <Input
                id='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='Enter your password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                disabled={loading}
              />
              <button
                type='button'
                className='absolute inset-y-0 right-0 pr-3 flex items-center'
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className='h-4 w-4 text-gray-400' />
                ) : (
                  <Eye className='h-4 w-4 text-gray-400' />
                )}
              </button>
            </div>
            {errors.password && <p className='text-sm text-destructive'>{errors.password}</p>}
          </div>

          <Button type='submit' className='w-full' disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        {onRegisterClick && (
          <div className='mt-6 text-center'>
            <p className='text-sm text-muted-foreground'>
              Need an account?{' '}
              <button
                type='button'
                onClick={onRegisterClick}
                className='text-primary hover:underline font-medium'
                disabled={loading}
              >
                Create one here
              </button>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
