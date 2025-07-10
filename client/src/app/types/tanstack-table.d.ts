declare module "@tanstack/react-table" {
  import { ReactNode } from "react"

  export interface ColumnDef<TData, TValue = unknown> {
    accessorKey?: keyof TData
    id?: string
    header?: string | ((props: { column: any }) => ReactNode)
    cell?: (props: { row: { original: TData; getValue: (key: keyof TData) => TValue } }) => ReactNode
  }

  export type SortingState = Array<{ id: string; desc: boolean }>
  export type ColumnFiltersState = Array<{ id: string; value: unknown }>
  export type VisibilityState = Record<string, boolean>

  export interface Table<TData> {
    getVisibleLeafColumns: () => Array<{
      id: string
      getIsVisible: () => boolean
      toggleVisibility: (value: boolean) => void
    }>
    getAllColumns: () => Array<{
      id: string
      getCanHide: () => boolean
      getIsVisible: () => boolean
      toggleVisibility: (value: boolean) => void
      getCanSort: () => boolean
      getIsSorted: () => boolean | "asc" | "desc"
      toggleSorting: () => void
    }>
    getColumn: (id: string) => {
      getFilterValue: () => unknown
      setFilterValue: (value: unknown) => void
    } | undefined
    getHeaderGroups: () => Array<{
      id: string
      headers: Array<{
        id: string
        isPlaceholder: boolean
        column: {
          columnDef: ColumnDef<TData, any>
        }
        getContext: () => any
      }>
    }>
    getRowModel: () => {
      rows: Array<{
        id: string
        getIsSelected: () => boolean
        original: TData
        getVisibleCells: () => Array<{
          id: string
          column: {
            columnDef: ColumnDef<TData, any>
          }
          getContext: () => any
        }>
      }>
    }
    previousPage: () => void
    nextPage: () => void
    getCanPreviousPage: () => boolean
    getCanNextPage: () => boolean
  }

  export function useReactTable<TData>(options: {
    data: TData[]
    columns: ColumnDef<TData, any>[]
    getCoreRowModel: () => any
    getPaginationRowModel: () => any
    onColumnFiltersChange: (updater: any) => void
    getFilteredRowModel: () => any
    onColumnVisibilityChange: (updater: any) => void
    onSortingChange: (updater: any) => void
    getSortedRowModel: () => any
    state: {
      columnFilters: ColumnFiltersState
      columnVisibility: VisibilityState
      sorting: SortingState
    }
  }): Table<TData>

  export function flexRender(component: any, props: any): ReactNode
  export function getCoreRowModel(): any
  export function getPaginationRowModel(): any
  export function getFilteredRowModel(): any
  export function getSortedRowModel(): any
} 