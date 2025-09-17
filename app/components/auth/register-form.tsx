import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Eye, EyeOff, UserPlus } from 'lucide-react'

interface AuthUser {
  id: string
  email: string
  name: string | null
  role: string
}

interface RegisterFormProps {
  onSuccess?: (user: AuthUser) => void
  onLoginClick?: () => void
}

interface FormErrors {
  email?: string
  name?: string
  password?: string
  confirmPassword?: string
  general?: string
}

export default function RegisterForm({ onSuccess, onLoginClick }: RegisterFormProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!name) {
      newErrors.name = 'Name is required'
    } else if (name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
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
      const response = await fetch('/api/auth?action=register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, password, confirmPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details) {
          // Handle validation errors from server
          const fieldErrors: FormErrors = {}
          if (data.details.fieldErrors?.email) {
            fieldErrors.email = data.details.fieldErrors.email[0]
          }
          if (data.details.fieldErrors?.password) {
            fieldErrors.password = data.details.fieldErrors.password[0]
          }
          if (data.details.fieldErrors?.name) {
            fieldErrors.name = data.details.fieldErrors.name[0]
          }
          if (data.details.fieldErrors?.confirmPassword) {
            fieldErrors.confirmPassword = data.details.fieldErrors.confirmPassword[0]
          }
          setErrors(fieldErrors)
        } else {
          setErrors({ general: data.error || 'Registration failed' })
        }
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
          <UserPlus className='w-6 h-6 text-primary' />
        </div>
        <CardTitle className='text-2xl'>Create Account</CardTitle>
        <p className='text-muted-foreground'>Join TanCMS to get started</p>
      </CardHeader>

      <CardContent>
        {errors.general && (
          <Alert className='mb-6' variant='destructive'>
            <AlertDescription>{errors.general}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Full Name</Label>
            <Input
              id='name'
              type='text'
              placeholder='Enter your full name'
              value={name}
              onChange={e => setName(e.target.value)}
              className={errors.name ? 'border-destructive' : ''}
              disabled={loading}
            />
            {errors.name && <p className='text-sm text-destructive'>{errors.name}</p>}
          </div>

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
                placeholder='Create a password'
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

          <div className='space-y-2'>
            <Label htmlFor='confirmPassword'>Confirm Password</Label>
            <div className='relative'>
              <Input
                id='confirmPassword'
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder='Confirm your password'
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                disabled={loading}
              />
              <button
                type='button'
                className='absolute inset-y-0 right-0 pr-3 flex items-center'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? (
                  <EyeOff className='h-4 w-4 text-gray-400' />
                ) : (
                  <Eye className='h-4 w-4 text-gray-400' />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className='text-sm text-destructive'>{errors.confirmPassword}</p>
            )}
          </div>

          <Button type='submit' className='w-full' disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        {onLoginClick && (
          <div className='mt-6 text-center'>
            <p className='text-sm text-muted-foreground'>
              Already have an account?{' '}
              <button
                type='button'
                onClick={onLoginClick}
                className='text-primary hover:underline font-medium'
                disabled={loading}
              >
                Sign in here
              </button>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
