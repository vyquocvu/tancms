import { useState } from "react"
import { Button } from "./button"
import { Input } from "./input"
import { Badge } from "./badge"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { 
  Filter,
  X,
  Calendar,
  Search,
  CheckCircle,
  Clock,
  Archive,
  FileText
} from "lucide-react"
import { cn } from "~/lib/utils"
import type { ContentStatus } from "~/lib/mock-api"

export interface ContentFilter {
  status?: ContentStatus[]
  search?: string
  dateRange?: {
    from?: Date
    to?: Date
  }
  createdRange?: {
    from?: Date
    to?: Date
  }
  updatedRange?: {
    from?: Date
    to?: Date
  }
}

export interface ContentFiltersProps {
  filters: ContentFilter
  onFiltersChange: (filters: ContentFilter) => void
  className?: string
  showSearch?: boolean
  showStatus?: boolean
  showDateRanges?: boolean
}

const STATUS_OPTIONS = [
  { value: 'DRAFT' as ContentStatus, label: 'Draft', icon: FileText, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'PUBLISHED' as ContentStatus, label: 'Published', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  { value: 'SCHEDULED' as ContentStatus, label: 'Scheduled', icon: Clock, color: 'bg-blue-100 text-blue-800' },
  { value: 'ARCHIVED' as ContentStatus, label: 'Archived', icon: Archive, color: 'bg-gray-100 text-gray-800' },
]

export function ContentFilters({
  filters,
  onFiltersChange,
  className,
  showSearch = true,
  showStatus = true,
  showDateRanges = true,
}: ContentFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilters = (updates: Partial<ContentFilter>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const clearFilter = (key: keyof ContentFilter) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    onFiltersChange({})
  }

  const toggleStatus = (status: ContentStatus) => {
    const currentStatuses = filters.status || []
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status]
    
    updateFilters({ 
      status: newStatuses.length > 0 ? newStatuses : undefined 
    })
  }

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  const parseDate = (dateString: string): Date | undefined => {
    return dateString ? new Date(dateString) : undefined
  }

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof ContentFilter]
    if (key === 'status') return Array.isArray(value) && value.length > 0
    if (key === 'search') return typeof value === 'string' && value.length > 0
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(v => v !== undefined)
    }
    return false
  })

  const getActiveFilterCount = (): number => {
    let count = 0
    if (filters.status && filters.status.length > 0) count++
    if (filters.search && filters.search.length > 0) count++
    if (filters.dateRange && (filters.dateRange.from || filters.dateRange.to)) count++
    if (filters.createdRange && (filters.createdRange.from || filters.createdRange.to)) count++
    if (filters.updatedRange && (filters.updatedRange.from || filters.updatedRange.to)) count++
    return count
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filter Toggle and Active Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="text-xs">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Active Filter Tags */}
        <div className="flex items-center space-x-2 flex-wrap">
          {filters.status && filters.status.length > 0 && (
            <Badge variant="outline" className="gap-1">
              Status: {filters.status.length}
              <button
                onClick={() => clearFilter('status')}
                className="ml-1 hover:bg-destructive/20 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.search && (
            <Badge variant="outline" className="gap-1">
              Search: "{filters.search}"
              <button
                onClick={() => clearFilter('search')}
                className="ml-1 hover:bg-destructive/20 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {isExpanded && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Filter Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search Filter */}
            {showSearch && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Content</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search in content fields..."
                    value={filters.search || ''}
                    onChange={(e) => updateFilters({ search: e.target.value || undefined })}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            {/* Status Filter */}
            {showStatus && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTIONS.map((option) => {
                    const Icon = option.icon
                    const isSelected = filters.status?.includes(option.value) || false
                    
                    return (
                      <Button
                        key={option.value}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleStatus(option.value)}
                        className="justify-start gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {option.label}
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Date Range Filters */}
            {showDateRanges && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Created Date Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Created Date Range
                  </label>
                  <div className="space-y-2">
                    <Input
                      type="date"
                      placeholder="From"
                      value={filters.createdRange?.from ? formatDate(filters.createdRange.from) : ''}
                      onChange={(e) => updateFilters({ 
                        createdRange: { 
                          ...filters.createdRange, 
                          from: parseDate(e.target.value) 
                        } 
                      })}
                    />
                    <Input
                      type="date"
                      placeholder="To"
                      value={filters.createdRange?.to ? formatDate(filters.createdRange.to) : ''}
                      onChange={(e) => updateFilters({ 
                        createdRange: { 
                          ...filters.createdRange, 
                          to: parseDate(e.target.value) 
                        } 
                      })}
                    />
                  </div>
                </div>

                {/* Updated Date Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Updated Date Range
                  </label>
                  <div className="space-y-2">
                    <Input
                      type="date"
                      placeholder="From"
                      value={filters.updatedRange?.from ? formatDate(filters.updatedRange.from) : ''}
                      onChange={(e) => updateFilters({ 
                        updatedRange: { 
                          ...filters.updatedRange, 
                          from: parseDate(e.target.value) 
                        } 
                      })}
                    />
                    <Input
                      type="date"
                      placeholder="To"
                      value={filters.updatedRange?.to ? formatDate(filters.updatedRange.to) : ''}
                      onChange={(e) => updateFilters({ 
                        updatedRange: { 
                          ...filters.updatedRange, 
                          to: parseDate(e.target.value) 
                        } 
                      })}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}