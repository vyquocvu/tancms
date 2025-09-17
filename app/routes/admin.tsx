import { createFileRoute } from '@tanstack/react-router'
import AdminDashboard from './admin/index'

export const Route = createFileRoute('/admin')({
  component: AdminDashboard,
})