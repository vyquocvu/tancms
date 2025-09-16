import * as React from "react"
import { useState, useMemo } from "react"
import { cn } from "~/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table"
import { Button } from "./button"
import { Input } from "./input"
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown, 
  Eye, 
  EyeOff,
  Settings,
  Search
} from "lucide-react"

export interface DataTableColumn<T> {
  id: string
  header: string
  accessorKey?: keyof T
  accessorFn?: (row: T) => any
  cell?: (row: T) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  hidden?: boolean
  width?: number
  minWidth?: number
  maxWidth?: number
}

export interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  onRowClick?: (row: T) => void
  className?: string
  enableColumnToggle?: boolean
  enableSorting?: boolean
  enableSearch?: boolean
  // Selection props
  selectedRows?: T[]
  onSelectionChange?: (selectedRows: T[]) => void
  enableSelection?: boolean
  getRowId?: (row: T) => string
}

type SortDirection = "asc" | "desc" | null

interface SortState {
  column: string | null
  direction: SortDirection
}

export function DataTable<T>({
  data,
  columns,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  onRowClick,
  className,
  enableColumnToggle = true,
  enableSorting = true,
  enableSearch = true,
  selectedRows = [],
  onSelectionChange,
  enableSelection = false,
  getRowId = (row: T) => String(data.indexOf(row)),
}: DataTableProps<T>) {
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    direction: null,
  })
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
    Object.fromEntries(columns.map(col => [col.id, !col.hidden]))
  )
  const [showColumnSettings, setShowColumnSettings] = useState(false)

  // Get visible columns
  const visibleColumns = columns.filter(col => columnVisibility[col.id])

  // Selection logic
  const isRowSelected = (row: T): boolean => {
    if (!enableSelection || !selectedRows) return false
    const rowId = getRowId(row)
    return selectedRows.some(selectedRow => getRowId(selectedRow) === rowId)
  }

  const isAllSelected = enableSelection && selectedRows && data.length > 0 && selectedRows.length === data.length
  const isIndeterminate = enableSelection && selectedRows && selectedRows.length > 0 && selectedRows.length < data.length

  const toggleRowSelection = (row: T) => {
    if (!enableSelection || !onSelectionChange) return
    
    const rowId = getRowId(row)
    const isSelected = selectedRows.some(selectedRow => getRowId(selectedRow) === rowId)
    
    if (isSelected) {
      onSelectionChange(selectedRows.filter(selectedRow => getRowId(selectedRow) !== rowId))
    } else {
      onSelectionChange([...selectedRows, row])
    }
  }

  const toggleSelectAll = () => {
    if (!enableSelection || !onSelectionChange) return
    
    if (isAllSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange([...data])
    }
  }

  // Handle sorting
  const handleSort = (columnId: string) => {
    if (!enableSorting) return
    
    const column = columns.find(col => col.id === columnId)
    if (!column?.sortable) return

    setSortState(prev => {
      if (prev.column === columnId) {
        // Cycle through: asc -> desc -> none
        const newDirection = prev.direction === "asc" ? "desc" : prev.direction === "desc" ? null : "asc"
        return { column: newDirection ? columnId : null, direction: newDirection }
      } else {
        return { column: columnId, direction: "asc" }
      }
    })
  }

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortState.column || !sortState.direction) return data

    const column = columns.find(col => col.id === sortState.column)
    if (!column) return data

    return [...data].sort((a, b) => {
      let aValue: any
      let bValue: any

      if (column.accessorFn) {
        aValue = column.accessorFn(a)
        bValue = column.accessorFn(b)
      } else if (column.accessorKey) {
        aValue = a[column.accessorKey]
        bValue = b[column.accessorKey]
      } else {
        return 0
      }

      // Handle different data types
      if (aValue instanceof Date && bValue instanceof Date) {
        aValue = aValue.getTime()
        bValue = bValue.getTime()
      } else if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortState.direction === "asc" ? -1 : 1
      if (aValue > bValue) return sortState.direction === "asc" ? 1 : -1
      return 0
    })
  }, [data, sortState, columns])

  // Get sort icon for column
  const getSortIcon = (columnId: string) => {
    const column = columns.find(col => col.id === columnId)
    if (!column?.sortable) return null

    if (sortState.column === columnId) {
      return sortState.direction === "asc" ? (
        <ChevronUp className="h-4 w-4" />
      ) : (
        <ChevronDown className="h-4 w-4" />
      )
    }
    return <ChevronsUpDown className="h-4 w-4 opacity-50" />
  }

  // Toggle column visibility
  const toggleColumnVisibility = (columnId: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }))
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Column Settings */}
      {(enableSearch || enableColumnToggle) && (
        <div className="flex items-center justify-between">
          {enableSearch && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
          
          {enableColumnToggle && (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowColumnSettings(!showColumnSettings)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Columns
              </Button>
              
              {showColumnSettings && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-popover border rounded-md shadow-lg z-50 p-2">
                  <div className="space-y-2">
                    <div className="text-sm font-medium px-2 py-1">Toggle Columns</div>
                    {columns.map(column => (
                      <div
                        key={column.id}
                        className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-accent cursor-pointer"
                        onClick={() => toggleColumnVisibility(column.id)}
                      >
                        {columnVisibility[column.id] ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                        <span className="text-sm">{column.header}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Data Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {enableSelection && (
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate
                    }}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </TableHead>
              )}
              {visibleColumns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    column.sortable && enableSorting && "cursor-pointer select-none hover:bg-accent",
                    "relative"
                  )}
                  onClick={() => handleSort(column.id)}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.header}</span>
                    {getSortIcon(column.id)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + (enableSelection ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground"
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row, index) => (
                <TableRow
                  key={index}
                  className={cn(
                    onRowClick && "cursor-pointer hover:bg-muted/50",
                    isRowSelected(row) && "bg-muted/50"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {enableSelection && (
                    <TableCell className="w-12">
                      <input
                        type="checkbox"
                        checked={isRowSelected(row)}
                        onChange={(e) => {
                          e.stopPropagation()
                          toggleRowSelection(row)
                        }}
                        className="rounded"
                      />
                    </TableCell>
                  )}
                  {visibleColumns.map((column) => (
                    <TableCell key={column.id}>
                      {column.cell 
                        ? column.cell(row)
                        : column.accessorFn 
                          ? column.accessorFn(row)
                          : column.accessorKey 
                            ? String(row[column.accessorKey] ?? "")
                            : ""
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Click outside to close column settings */}
      {showColumnSettings && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowColumnSettings(false)}
        />
      )}
    </div>
  )
}