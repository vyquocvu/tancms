import { useState } from 'react'
import { useAuth } from '~/lib/auth-context'
import LoginForm from '~/components/auth/login-form'
import RegisterForm from '~/components/auth/register-form'

interface AuthUser {
  id: string
  email: string
  name: string | null
  role: string
}

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false)
  const { user } = useAuth()

  // Redirect if already logged in
  if (user) {
    window.location.href = '/admin'
    return null
  }

  const handleLoginSuccess = (user: AuthUser) => {
    // Redirect to admin dashboard
    window.location.href = '/admin'
  }

  const handleRegisterSuccess = (user: AuthUser) => {
    // Redirect to admin dashboard
    window.location.href = '/admin'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            TanCMS
          </h1>
          <p className="text-gray-600">
            Content Management System
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {isRegistering ? (
          <RegisterForm
            onSuccess={handleRegisterSuccess}
            onLoginClick={() => setIsRegistering(false)}
          />
        ) : (
          <LoginForm
            onSuccess={handleLoginSuccess}
            onRegisterClick={() => setIsRegistering(true)}
          />
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          © 2024 TanCMS. All rights reserved.
        </p>
      </div>
    </div>
  )
}