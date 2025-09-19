import { createFileRoute } from '@tanstack/react-router'
import LoginForm from '~/components/auth/login-form'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const handleLoginSuccess = () => {
    // Redirect to admin dashboard after successful login
    window.location.href = '/admin'
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div className='text-center mb-8'>
          <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
            Sign in to TanCMS
          </h2>
          <p className='mt-2 text-sm text-gray-600'>Access your admin dashboard</p>
        </div>
        
        <LoginForm onSuccess={handleLoginSuccess} />
        
        <div className='text-center'>
          <a href='/' className='text-indigo-600 hover:text-indigo-500 text-sm'>
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  )
}
