import { useState, useEffect } from 'react'
import AdminLayout from './layout'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Switch } from '~/components/ui/switch'
import { Badge } from '~/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import {
  Activity,
  Shield,
  Key,
  Globe,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Database,
  Link,
  BarChart3,
} from 'lucide-react'
import { mockApi, type ContentType } from '~/lib/mock-api'

interface ApiStatus {
  status: 'healthy' | 'degraded' | 'down'
  uptime: string
  requestCount: number
  errorRate: number
  avgResponseTime: number
}

interface ApiKey {
  id: string
  name: string
  key: string
  created: string
  lastUsed?: string
  isActive: boolean
}

interface MiddlewareInfo {
  name: string
  enabled: boolean
  description: string
  config?: Record<string, unknown>
}

interface RequestLog {
  id: string
  method: string
  endpoint: string
  status: number
  responseTime: number
  timestamp: string
  apiKey?: string
}

interface ContentTypeEndpoint {
  contentType: ContentType
  enabled: boolean
  endpoints: {
    list: { enabled: boolean; requests: number }
    get: { enabled: boolean; requests: number }
    create: { enabled: boolean; requests: number }
    update: { enabled: boolean; requests: number }
    delete: { enabled: boolean; requests: number }
  }
  totalRequests: number
  lastUsed?: string
}

export default function ApiManager() {
  const [apiStatus] = useState<ApiStatus>({
    status: 'healthy',
    uptime: '99.9%',
    requestCount: 1247,
    errorRate: 0.1,
    avgResponseTime: 145,
  })

  const [contentTypeEndpoints, setContentTypeEndpoints] = useState<ContentTypeEndpoint[]>([])

  // Load content types on component mount
  useEffect(() => {
    const loadContentTypes = async () => {
      try {
        const types = await mockApi.getContentTypes()

        // Initialize endpoint configurations for each content type
        const endpointConfigs: ContentTypeEndpoint[] = types.map(contentType => ({
          contentType,
          enabled: true,
          endpoints: {
            list: { enabled: true, requests: Math.floor(Math.random() * 100) + 10 },
            get: { enabled: true, requests: Math.floor(Math.random() * 50) + 5 },
            create: { enabled: true, requests: Math.floor(Math.random() * 20) + 2 },
            update: { enabled: true, requests: Math.floor(Math.random() * 15) + 1 },
            delete: { enabled: true, requests: Math.floor(Math.random() * 5) + 1 },
          },
          totalRequests: 0,
          lastUsed: new Date(Date.now() - Math.random() * 86400000).toISOString().split('T')[0],
        }))

        // Calculate total requests
        endpointConfigs.forEach(config => {
          config.totalRequests = Object.values(config.endpoints).reduce(
            (sum, endpoint) => sum + endpoint.requests,
            0
          )
        })

        setContentTypeEndpoints(endpointConfigs)
      } catch (error) {
        console.error('Failed to load content types:', error)
      }
    }

    loadContentTypes()
  }, [])

  const [config, setConfig] = useState({
    enableAuth: false,
    enableLogging: true,
    corsEnabled: true,
    rateLimit: {
      enabled: false,
      windowMs: 60000,
      maxRequests: 100,
    },
  })

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production App',
      key: 'ak_prod_****************************',
      created: '2024-01-15',
      lastUsed: '2024-01-20',
      isActive: true,
    },
    {
      id: '2',
      name: 'Development',
      key: 'ak_dev_****************************',
      created: '2024-01-10',
      lastUsed: '2024-01-19',
      isActive: true,
    },
  ])

  const [middlewares] = useState<MiddlewareInfo[]>([
    {
      name: 'Authentication',
      enabled: config.enableAuth,
      description: 'API key-based authentication for secure access',
    },
    {
      name: 'Logging',
      enabled: config.enableLogging,
      description: 'Request and response logging with timing information',
    },
    {
      name: 'CORS',
      enabled: config.corsEnabled,
      description: 'Cross-Origin Resource Sharing headers for browser access',
    },
    {
      name: 'Rate Limiting',
      enabled: config.rateLimit.enabled,
      description: 'Limit requests per time window to prevent abuse',
    },
  ])

  const [requestLogs] = useState<RequestLog[]>([
    {
      id: '1',
      method: 'GET',
      endpoint: '/api/product',
      status: 200,
      responseTime: 125,
      timestamp: '2024-01-20 14:30:25',
      apiKey: 'ak_prod_****',
    },
    {
      id: '2',
      method: 'POST',
      endpoint: '/api/product',
      status: 201,
      responseTime: 230,
      timestamp: '2024-01-20 14:28:15',
      apiKey: 'ak_dev_****',
    },
    {
      id: '3',
      method: 'GET',
      endpoint: '/api/status',
      status: 200,
      responseTime: 45,
      timestamp: '2024-01-20 14:25:10',
    },
    {
      id: '4',
      method: 'DELETE',
      endpoint: '/api/product/123',
      status: 404,
      responseTime: 78,
      timestamp: '2024-01-20 14:20:05',
      apiKey: 'ak_prod_****',
    },
  ])

  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({})
  const [newKeyName, setNewKeyName] = useState('')
  const [showNewKeyForm, setShowNewKeyForm] = useState(false)

  const handleConfigChange = (key: string, value: boolean | number) => {
    setConfig(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleRateLimitChange = (key: string, value: boolean | number) => {
    setConfig(prev => ({
      ...prev,
      rateLimit: {
        ...prev.rateLimit,
        [key]: value,
      },
    }))
  }

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId],
    }))
  }

  const generateApiKey = () => {
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `ak_${Date.now()}_${'*'.repeat(24)}`,
      created: new Date().toISOString().split('T')[0],
      isActive: true,
    }
    setApiKeys(prev => [...prev, newKey])
    setNewKeyName('')
    setShowNewKeyForm(false)
  }

  const deleteApiKey = (keyId: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== keyId))
  }

  const toggleApiKey = (keyId: string) => {
    setApiKeys(prev =>
      prev.map(key => (key.id === keyId ? { ...key, isActive: !key.isActive } : key))
    )
  }

  const toggleContentTypeEndpoint = (contentTypeId: string, enabled: boolean) => {
    setContentTypeEndpoints(prev =>
      prev.map(config =>
        config.contentType.id === contentTypeId ? { ...config, enabled } : config
      )
    )
  }

  const toggleSpecificEndpoint = (
    contentTypeId: string,
    endpointType: keyof ContentTypeEndpoint['endpoints'],
    enabled: boolean
  ) => {
    setContentTypeEndpoints(prev =>
      prev.map(config =>
        config.contentType.id === contentTypeId
          ? {
              ...config,
              endpoints: {
                ...config.endpoints,
                [endpointType]: { ...config.endpoints[endpointType], enabled },
              },
            }
          : config
      )
    )
  }

  const getEndpointUrl = (contentTypeSlug: string, endpointType: string) => {
    const baseUrl = '/api'
    switch (endpointType) {
      case 'list':
        return `${baseUrl}/${contentTypeSlug}`
      case 'get':
        return `${baseUrl}/${contentTypeSlug}/:id`
      case 'create':
        return `${baseUrl}/${contentTypeSlug}`
      case 'update':
        return `${baseUrl}/${contentTypeSlug}/:id`
      case 'delete':
        return `${baseUrl}/${contentTypeSlug}/:id`
      default:
        return `${baseUrl}/${contentTypeSlug}`
    }
  }

  const getEndpointMethod = (endpointType: string) => {
    switch (endpointType) {
      case 'list':
      case 'get':
        return 'GET'
      case 'create':
        return 'POST'
      case 'update':
        return 'PUT'
      case 'delete':
        return 'DELETE'
      default:
        return 'GET'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600'
      case 'degraded':
        return 'text-yellow-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) {
      return (
        <Badge variant='default' className='bg-green-100 text-green-800'>
          Success
        </Badge>
      )
    } else if (status >= 400 && status < 500) {
      return <Badge variant='destructive'>Client Error</Badge>
    } else if (status >= 500) {
      return <Badge variant='destructive'>Server Error</Badge>
    }
    return <Badge variant='secondary'>Unknown</Badge>
  }

  return (
    <AdminLayout>
      <div className='space-y-6'>
        <div>
          <h1 className='text-3xl font-bold'>API Manager</h1>
          <p className='text-muted-foreground mt-2'>
            Monitor and configure your REST API endpoints, middleware, and security settings.
          </p>
        </div>

        {/* API Status Overview */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <Activity className={`h-8 w-8 ${getStatusColor(apiStatus.status)}`} />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-muted-foreground'>API Status</p>
                  <p className={`text-2xl font-bold ${getStatusColor(apiStatus.status)}`}>
                    {apiStatus.status.charAt(0).toUpperCase() + apiStatus.status.slice(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <Clock className='h-8 w-8 text-blue-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-muted-foreground'>Uptime</p>
                  <p className='text-2xl font-bold'>{apiStatus.uptime}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <Globe className='h-8 w-8 text-green-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-muted-foreground'>Requests (24h)</p>
                  <p className='text-2xl font-bold'>{apiStatus.requestCount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <AlertCircle className='h-8 w-8 text-yellow-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-muted-foreground'>Error Rate</p>
                  <p className='text-2xl font-bold'>{apiStatus.errorRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Settings className='mr-2 h-5 w-5' />
                API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <Label htmlFor='enable-auth'>Authentication</Label>
                  <p className='text-sm text-muted-foreground'>Require API keys for access</p>
                </div>
                <Switch
                  id='enable-auth'
                  checked={config.enableAuth}
                  onCheckedChange={checked => handleConfigChange('enableAuth', checked)}
                />
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <Label htmlFor='enable-logging'>Request Logging</Label>
                  <p className='text-sm text-muted-foreground'>
                    Log all API requests and responses
                  </p>
                </div>
                <Switch
                  id='enable-logging'
                  checked={config.enableLogging}
                  onCheckedChange={checked => handleConfigChange('enableLogging', checked)}
                />
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <Label htmlFor='enable-cors'>CORS Headers</Label>
                  <p className='text-sm text-muted-foreground'>
                    Enable Cross-Origin Resource Sharing
                  </p>
                </div>
                <Switch
                  id='enable-cors'
                  checked={config.corsEnabled}
                  onCheckedChange={checked => handleConfigChange('corsEnabled', checked)}
                />
              </div>

              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <div>
                    <Label htmlFor='enable-rate-limit'>Rate Limiting</Label>
                    <p className='text-sm text-muted-foreground'>Limit requests per time window</p>
                  </div>
                  <Switch
                    id='enable-rate-limit'
                    checked={config.rateLimit.enabled}
                    onCheckedChange={checked => handleRateLimitChange('enabled', checked)}
                  />
                </div>

                {config.rateLimit.enabled && (
                  <div className='ml-4 space-y-2'>
                    <div>
                      <Label htmlFor='rate-limit-requests'>Max Requests</Label>
                      <Input
                        id='rate-limit-requests'
                        type='number'
                        value={config.rateLimit.maxRequests}
                        onChange={e =>
                          handleRateLimitChange('maxRequests', parseInt(e.target.value))
                        }
                        className='w-24'
                      />
                    </div>
                    <div>
                      <Label htmlFor='rate-limit-window'>Window (ms)</Label>
                      <Input
                        id='rate-limit-window'
                        type='number'
                        value={config.rateLimit.windowMs}
                        onChange={e => handleRateLimitChange('windowMs', parseInt(e.target.value))}
                        className='w-32'
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Middleware Status */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Shield className='mr-2 h-5 w-5' />
                Middleware Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {middlewares.map(middleware => (
                  <div
                    key={middleware.name}
                    className='flex items-start justify-between p-3 border rounded-lg'
                  >
                    <div className='flex-1'>
                      <div className='flex items-center'>
                        <h4 className='font-medium'>{middleware.name}</h4>
                        {middleware.enabled ? (
                          <CheckCircle className='ml-2 h-4 w-4 text-green-600' />
                        ) : (
                          <AlertCircle className='ml-2 h-4 w-4 text-gray-400' />
                        )}
                      </div>
                      <p className='text-sm text-muted-foreground mt-1'>{middleware.description}</p>
                    </div>
                    <Badge variant={middleware.enabled ? 'default' : 'secondary'}>
                      {middleware.enabled ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Type Endpoint Manager */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Database className='mr-2 h-5 w-5' />
              Content Type Endpoints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              <p className='text-sm text-muted-foreground'>
                Manage API endpoints for each content type. Control which operations are available
                and monitor usage.
              </p>

              <div className='space-y-4'>
                {contentTypeEndpoints.map(config => (
                  <div key={config.contentType.id} className='border rounded-lg p-4'>
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center space-x-3'>
                        <div>
                          <h4 className='font-medium text-lg'>{config.contentType.displayName}</h4>
                          <p className='text-sm text-muted-foreground'>
                            {config.contentType.description ||
                              `API endpoints for ${config.contentType.displayName.toLowerCase()}`}
                          </p>
                          <div className='flex items-center space-x-4 mt-2'>
                            <span className='text-sm text-muted-foreground'>
                              Slug:{' '}
                              <code className='bg-muted px-1 rounded'>
                                {config.contentType.slug}
                              </code>
                            </span>
                            <span className='text-sm text-muted-foreground'>
                              Total Requests:{' '}
                              <strong>{config.totalRequests.toLocaleString()}</strong>
                            </span>
                            {config.lastUsed && (
                              <span className='text-sm text-muted-foreground'>
                                Last Used: {config.lastUsed}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Badge variant={config.enabled ? 'default' : 'secondary'}>
                          {config.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                        <Switch
                          checked={config.enabled}
                          onCheckedChange={enabled =>
                            toggleContentTypeEndpoint(config.contentType.id, enabled)
                          }
                        />
                      </div>
                    </div>

                    {config.enabled && (
                      <div className='space-y-3'>
                        <h5 className='font-medium text-sm text-muted-foreground mb-2 flex items-center'>
                          <Link className='mr-1 h-4 w-4' />
                          Available Endpoints
                        </h5>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                          {Object.entries(config.endpoints).map(
                            ([endpointType, endpointConfig]) => (
                              <div key={endpointType} className='border rounded p-3 bg-muted/20'>
                                <div className='flex items-center justify-between mb-2'>
                                  <div className='flex items-center space-x-2'>
                                    <Badge variant='outline' className='text-xs'>
                                      {getEndpointMethod(endpointType)}
                                    </Badge>
                                    <span className='font-medium text-sm capitalize'>
                                      {endpointType}
                                    </span>
                                  </div>
                                  <Switch
                                    checked={endpointConfig.enabled}
                                    onCheckedChange={enabled =>
                                      toggleSpecificEndpoint(
                                        config.contentType.id,
                                        endpointType as keyof ContentTypeEndpoint['endpoints'],
                                        enabled
                                      )
                                    }
                                  />
                                </div>
                                <div className='space-y-1'>
                                  <code className='text-xs bg-background px-2 py-1 rounded block'>
                                    {getEndpointUrl(config.contentType.slug, endpointType)}
                                  </code>
                                  <div className='flex items-center justify-between text-xs text-muted-foreground'>
                                    <span className='flex items-center'>
                                      <BarChart3 className='mr-1 h-3 w-3' />
                                      {endpointConfig.requests} requests
                                    </span>
                                    <Badge
                                      variant={endpointConfig.enabled ? 'default' : 'secondary'}
                                      className='text-xs'
                                    >
                                      {endpointConfig.enabled ? 'Active' : 'Disabled'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {contentTypeEndpoints.length === 0 && (
                <div className='text-center py-8 text-muted-foreground'>
                  <Database className='mx-auto h-12 w-12 mb-4 opacity-50' />
                  <p>No content types found</p>
                  <p className='text-sm'>Create content types to see their API endpoints here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* API Keys Management */}
        {config.enableAuth && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <div className='flex items-center'>
                  <Key className='mr-2 h-5 w-5' />
                  API Keys
                </div>
                <Button
                  onClick={() => setShowNewKeyForm(true)}
                  size='sm'
                  className='flex items-center'
                >
                  <Plus className='mr-1 h-4 w-4' />
                  New Key
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showNewKeyForm && (
                <div className='mb-4 p-4 border rounded-lg bg-muted/50'>
                  <h4 className='font-medium mb-2'>Create New API Key</h4>
                  <div className='flex items-center space-x-2'>
                    <Input
                      placeholder='Key name (e.g., Production App)'
                      value={newKeyName}
                      onChange={e => setNewKeyName(e.target.value)}
                      className='flex-1'
                    />
                    <Button onClick={generateApiKey} disabled={!newKeyName.trim()}>
                      Generate
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() => {
                        setShowNewKeyForm(false)
                        setNewKeyName('')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className='space-y-3'>
                {apiKeys.map(key => (
                  <div
                    key={key.id}
                    className='flex items-center justify-between p-3 border rounded-lg'
                  >
                    <div className='flex-1'>
                      <div className='flex items-center space-x-2'>
                        <h4 className='font-medium'>{key.name}</h4>
                        <Badge variant={key.isActive ? 'default' : 'secondary'}>
                          {key.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className='flex items-center space-x-2 mt-1'>
                        <code className='text-sm bg-muted px-2 py-1 rounded'>
                          {showApiKeys[key.id] ? key.key.replace(/\*/g, 'x') : key.key}
                        </code>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => toggleApiKeyVisibility(key.id)}
                        >
                          {showApiKeys[key.id] ? (
                            <EyeOff className='h-4 w-4' />
                          ) : (
                            <Eye className='h-4 w-4' />
                          )}
                        </Button>
                      </div>
                      <p className='text-sm text-muted-foreground mt-1'>
                        Created: {key.created}
                        {key.lastUsed && ` • Last used: ${key.lastUsed}`}
                      </p>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Button variant='outline' size='sm' onClick={() => toggleApiKey(key.id)}>
                        {key.isActive ? 'Disable' : 'Enable'}
                      </Button>
                      <Button variant='destructive' size='sm' onClick={() => deleteApiKey(key.id)}>
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent API Requests */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Activity className='mr-2 h-5 w-5' />
              Recent API Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Method</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response Time</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requestLogs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge variant='outline'>{log.method}</Badge>
                    </TableCell>
                    <TableCell className='font-mono text-sm'>{log.endpoint}</TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell>{log.responseTime}ms</TableCell>
                    <TableCell>
                      {log.apiKey ? (
                        <code className='text-sm bg-muted px-2 py-1 rounded'>{log.apiKey}</code>
                      ) : (
                        <span className='text-muted-foreground'>No auth</span>
                      )}
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>{log.timestamp}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
