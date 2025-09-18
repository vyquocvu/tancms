import { createFileRoute } from '@tanstack/react-router'
import AdminLayout from './layout'
import { HealthMonitor } from '~/components/health/health-monitor'

export const Route = createFileRoute('/admin/health')({
  component: AdminHealthPage,
})

function AdminHealthPage() {
  return (
    <AdminLayout>
      <HealthMonitor />
    </AdminLayout>
  )
}