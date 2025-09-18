import { createFileRoute } from '@tanstack/react-router'
import AnalyticsDashboard from './admin/analytics'

export const Route = createFileRoute('/admin/analytics')({
  component: AnalyticsDashboard,
})