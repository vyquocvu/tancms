import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { 
  Activity, 
  Database, 
  Memory, 
  HardDrive, 
  Shield, 
  Users, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface HealthCheck {
  status: 'pass' | 'fail' | 'warn'
  responseTime?: number
  error?: string
  details?: Record<string, unknown>
}

interface HealthData {
  timestamp: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  version: string
  environment: string
  uptime: number
  checks: Record<string, HealthCheck>
}

export function HealthMonitor() {
  const [healthData, setHealthData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchHealthData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/health?detailed=true')
      const data = await response.json()
      setHealthData(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch health data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthData()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchHealthData()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh])

  const getStatusBadgeProps = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'pass':
        return {
          variant: 'outline' as const,
          className: 'border-green-500 text-green-700 bg-green-50'
        }
      case 'degraded':
      case 'warn':
        return {
          variant: 'outline' as const,
          className: 'border-yellow-500 text-yellow-700 bg-yellow-50'
        }
      case 'unhealthy':
      case 'fail':
        return {
          variant: 'destructive' as const,
          className: ''
        }
      default:
        return {
          variant: 'secondary' as const,
          className: ''
        }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'pass':
        return <CheckCircle className="h-4 w-4" />
      case 'degraded':
      case 'warn':
        return <AlertTriangle className="h-4 w-4" />
      case 'unhealthy':
      case 'fail':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const getCheckIcon = (checkName: string) => {
    switch (checkName) {
      case 'database':
        return <Database className="h-5 w-5" />
      case 'memory':
        return <Memory className="h-5 w-5" />
      case 'filesystem':
        return <HardDrive className="h-5 w-5" />
      case 'security':
        return <Shield className="h-5 w-5" />
      case 'sessions':
        return <Users className="h-5 w-5" />
      default:
        return <Activity className="h-5 w-5" />
    }
  }

  if (loading && !healthData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold tracking-tight">System Health</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-6 w-24 bg-muted rounded mb-2" />
                  <div className="h-4 w-16 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!healthData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Health Data</h3>
            <p className="text-muted-foreground mb-4">
              Unable to fetch system health information.
            </p>
            <Button onClick={fetchHealthData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with overall status */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Health</h2>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <Badge {...getStatusBadgeProps(healthData.status)}>
              {getStatusIcon(healthData.status)}
              <span className="ml-1 capitalize">{healthData.status}</span>
            </Badge>
            <span className="text-sm text-muted-foreground">
              Uptime: {formatUptime(healthData.uptime)}
            </span>
            {lastUpdated && (
              <span className="text-sm text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-pulse' : ''}`} />
            {autoRefresh ? 'Auto-refresh On' : 'Auto-refresh Off'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHealthData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Environment</p>
                <p className="text-xl font-bold capitalize">{healthData.environment}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Version</p>
                <p className="text-xl font-bold">{healthData.version}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Checks</p>
                <p className="text-xl font-bold">{Object.keys(healthData.checks).length}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                <p className="text-xl font-bold">{formatUptime(healthData.uptime)}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Health Checks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(healthData.checks).map(([checkName, check]) => (
          <Card key={checkName}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base capitalize">
                  {getCheckIcon(checkName)}
                  {checkName} Check
                </CardTitle>
                <Badge {...getStatusBadgeProps(check.status)}>
                  {getStatusIcon(check.status)}
                  <span className="ml-1 capitalize">{check.status}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {check.responseTime && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Response Time:</span>
                    <span className="font-medium">{check.responseTime}ms</span>
                  </div>
                )}
                {check.error && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                    <strong>Error:</strong> {check.error}
                  </div>
                )}
                {check.details && (
                  <div className="mt-3">
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        View Details
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
                        {JSON.stringify(check.details, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}