import { ReactNode } from "react"

declare module "@tanstack/react-table" {
  export interface ColumnDef<TData, TValue = unknown> {
    accessorKey?: keyof TData
    id?: string
    header?: string | ((props: { column: any }) => ReactNode)
    cell?: (props: { row: { original: TData; getValue: (key: keyof TData) => TValue } }) => ReactNode
  }
} 