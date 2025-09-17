import { cn } from '~/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />
}

export function DashboardStatsSkeleton() {
  return (
    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
      {[...Array(3)].map((_, i) => (
        <div key={i} className='rounded-lg border bg-card text-card-foreground shadow-sm'>
          <div className='p-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <Skeleton className='h-6 w-6' />
              </div>
              <div className='ml-5 w-0 flex-1'>
                <Skeleton className='h-4 w-20 mb-2' />
                <Skeleton className='h-6 w-8' />
              </div>
            </div>
            <div className='mt-2 flex items-center'>
              <Skeleton className='h-4 w-4 mr-1' />
              <Skeleton className='h-4 w-16' />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function RecentActivitySkeleton() {
  return (
    <div className='rounded-lg border bg-card text-card-foreground shadow-sm'>
      <div className='flex flex-col space-y-1.5 p-6'>
        <Skeleton className='h-6 w-32' />
      </div>
      <div className='p-6 pt-0'>
        <div className='flow-root'>
          <ul className='-my-5 divide-y divide-border'>
            {[...Array(3)].map((_, i) => (
              <li key={i} className='py-4'>
                <div className='flex items-center space-x-4'>
                  <div className='flex-shrink-0'>
                    <Skeleton className='h-5 w-5' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <Skeleton className='h-4 w-32 mb-1' />
                    <Skeleton className='h-3 w-24' />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export function CardListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {[...Array(count)].map((_, i) => (
        <div key={i} className='rounded-lg border bg-card text-card-foreground shadow-sm'>
          <div className='p-6'>
            <div className='flex items-center justify-between'>
              <div className='flex-1'>
                <Skeleton className='h-5 w-24 mb-2' />
                <Skeleton className='h-3 w-16' />
              </div>
              <div className='flex space-x-2'>
                <Skeleton className='h-8 w-8' />
                <Skeleton className='h-8 w-8' />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

interface LoadingSpinnerProps extends React.HTMLAttributes<SVGElement> {
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingSpinner({ className, size = 'md', ...props }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <svg
      className={cn('animate-spin text-muted-foreground', sizeClasses[size], className)}
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      {...props}
    >
      <circle
        className='opacity-25'
        cx='12'
        cy='12'
        r='10'
        stroke='currentColor'
        strokeWidth='4'
      ></circle>
      <path
        className='opacity-75'
        fill='currentColor'
        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
      ></path>
    </svg>
  )
}
