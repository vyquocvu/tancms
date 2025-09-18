import { createFileRoute } from '@tanstack/react-router'
import AnalyticsDemo from './admin/analytics-demo'

export const Route = createFileRoute('/analytics')({
  component: AnalyticsDemo,
})