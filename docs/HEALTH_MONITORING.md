# Health Monitoring System

TanCMS includes a comprehensive health monitoring system that provides real-time visibility into your application's health and performance.

## Features

### Health Dashboard
- **Real-time monitoring** with auto-refresh every 30 seconds
- **System overview** showing environment, version, uptime, and total health checks
- **Detailed health checks** including:
  - Database connectivity and response time
  - Memory usage and heap utilization
  - Filesystem accessibility
  - Security configuration status
  - Session management health
  - Environment configuration validation

### Status Indicators
- **Healthy** (Green): All systems operating normally
- **Degraded** (Yellow): System functioning but with warnings
- **Unhealthy** (Red): Critical issues detected requiring attention

### Dashboard Integration
- **Health summary card** on main admin dashboard
- **Quick status overview** with uptime and check count
- **Direct access** to detailed health monitoring

## Access

### Admin Dashboard
1. Log into the admin panel at `/admin`
2. Navigate to **Health Monitor** in the sidebar
3. Or view the health summary on the main dashboard

### API Endpoint
- **Basic health check**: `GET /api/health`
- **Detailed health check**: `GET /api/health?detailed=true`

## Health Checks

### Database Check
- Verifies database connectivity
- Measures query response time
- Shows database type and connection status

### Memory Check
- Monitors heap memory usage
- Calculates memory utilization percentage
- Warns when memory usage exceeds 90%

### Filesystem Check
- Verifies filesystem accessibility
- Checks working directory permissions
- Ensures file operations are available

### Security Check
- Validates security headers configuration
- Checks HTTPS enforcement in production
- Monitors security configuration status

### Sessions Check
- Monitors active user sessions
- Tracks expired session count
- Warns when expired sessions exceed threshold

### Configuration Check
- Validates required environment variables
- Checks critical configuration settings
- Reports missing or invalid configurations

## Configuration

### Auto-refresh Settings
- Default: 30 seconds interval
- Can be toggled on/off per user
- Manual refresh available at any time

### Alert Thresholds
- Memory usage warning: >90% heap utilization
- Expired sessions warning: >1000 expired sessions
- Configuration warning: Missing required environment variables

## Response Format

### API Response Structure
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "status": "healthy|degraded|unhealthy",
  "version": "0.0.0",
  "environment": "development|staging|production",
  "uptime": 3600,
  "checks": {
    "database": {
      "status": "pass|warn|fail",
      "responseTime": 25,
      "details": {...}
    },
    "memory": {
      "status": "pass|warn|fail",
      "details": {...}
    }
  }
}
```

### HTTP Status Codes
- **200**: Healthy or degraded status
- **503**: Unhealthy status (service unavailable)

## Integration

### Third-party Monitoring
The health endpoint can be integrated with external monitoring tools:
- **Prometheus**: Scrape `/api/health` for metrics
- **Grafana**: Visualize health data over time
- **UptimeRobot**: Monitor endpoint availability
- **Pingdom**: Track uptime and response times

### Alerting
Configure external alerting based on:
- HTTP status code changes
- Response time thresholds
- Specific health check failures
- Overall system status changes

## Troubleshooting

### Common Issues

#### Database Connection Failures
- Check `DATABASE_URL` environment variable
- Verify database server availability
- Review connection pool settings

#### High Memory Usage
- Monitor memory-intensive operations
- Check for memory leaks in custom code
- Consider scaling up server resources

#### Filesystem Access Issues
- Verify directory permissions
- Check disk space availability
- Ensure proper file system mounts

#### Configuration Warnings
- Review required environment variables
- Validate configuration values
- Check environment-specific settings

### Best Practices

1. **Regular Monitoring**: Check health status regularly, especially after deployments
2. **Alert Setup**: Configure external monitoring for production environments
3. **Baseline Metrics**: Establish normal operating ranges for your environment
4. **Trend Analysis**: Monitor health metrics over time to identify patterns
5. **Incident Response**: Have procedures in place for different health status levels

## Development

### Adding Custom Health Checks
To add custom health checks, extend the `/api/health` endpoint:

```typescript
// Add your custom check in app/routes/api/health.ts
checks.myCustomCheck = {
  status: 'pass',
  responseTime: Date.now() - start,
  details: {
    // Custom check details
  }
}
```

### UI Customization
Health monitoring UI components are located in:
- `app/components/health/health-monitor.tsx` - Main health monitoring interface
- `app/routes/admin/health.tsx` - Health monitoring page
- `app/routes/admin/index.tsx` - Dashboard health summary

## Security Considerations

- Health endpoints expose system information; ensure proper access controls
- Detailed health information requires admin authentication
- Consider rate limiting for public health check endpoints
- Sanitize sensitive information in health check responses

## Performance Impact

The health monitoring system is designed with minimal performance overhead:
- Health checks are lightweight and fast
- Auto-refresh can be disabled to reduce load
- Detailed checks only run when explicitly requested
- No persistent storage required for basic functionality