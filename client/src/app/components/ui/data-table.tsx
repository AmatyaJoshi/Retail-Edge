"use client";

import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ArrowUpDown, Columns } from "lucide-react";

// Local pagination state type
type LocalPaginationState = { pageIndex: number; pageSize: number };

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey: string;
  onRowClick?: (row: TData) => void;
  onTableReady?: (table: ReturnType<typeof useReactTable<TData>>) => void;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  hideToolbar?: boolean;
  showOnlyTableRows?: boolean; // Only render table rows
  showOnlyPagination?: boolean; // Only render pagination/slider
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  onRowClick,
  onTableReady,
  sorting,
  onSortingChange,
  pageSize = 5,
  onPageSizeChange,
  hideToolbar = false,
  showOnlyTableRows = false,
  showOnlyPagination = false,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [internalSorting, setInternalSorting] = useState<SortingState>(sorting || []);
  const [pagination, setPagination] = useState<LocalPaginationState>({ pageIndex: 0, pageSize });

  // Sync pageSize prop with local pagination state
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageSize }));
  }, [pageSize]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: (updater: ((old: SortingState) => SortingState) | SortingState) => {
      const newSorting = typeof updater === 'function' ? updater(internalSorting) : updater;
      setInternalSorting(newSorting);
      onSortingChange?.(newSorting);
    },
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnFilters,
      columnVisibility,
      sorting: internalSorting,
      pagination: pagination as any,
    } as any,
  });

  useEffect(() => {
    onTableReady?.(table);
  }, [table, onTableReady]);

  useEffect(() => {
    if (sorting) {
      setInternalSorting(sorting);
    }
  }, [sorting]);

  // Handle page size change from pagination controls
  const handlePageSizeChange = (size: number) => {
    setPagination((prev) => ({ ...prev, pageSize: size, pageIndex: 0 }));
    onPageSizeChange?.(size);
  };

  if (showOnlyTableRows) {
    return (
      <div className="flex flex-col w-full h-full min-h-full">
        <div className="rounded-md border w-full overflow-y-auto custom-scrollbar h-full min-h-full bg-transparent flex-1">
          <Table className="h-full min-h-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="h-full min-h-full">
              {table.getRowModel().rows.length ? (
                <>
                  {table.getRowModel().rows.map((row: any) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      onClick={() => onRowClick && onRowClick(row.original)}
                      className={`border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900 ${onRowClick ? "cursor-pointer" : ""}`}
                    >
                      {row.getVisibleCells().map((cell: any) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {/* Filler row to push last row to bottom if not enough rows */}
                  <TableRow style={{ height: '100%', background: 'transparent' }}>
                    <TableCell colSpan={columns.length} style={{ padding: 0, border: 'none', height: '100%' }} />
                  </TableRow>
                </>
              ) : (
                <TableRow style={{ height: '100%' }}>
                  <TableCell colSpan={columns.length} className="h-24 text-center" style={{ height: '100%' }}>
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
  if (showOnlyPagination) {
    return (
      <div className="flex items-center justify-center w-full px-4 py-1 bg-white rounded-b-xl dark:bg-gray-800 dark:text-gray-100">
        <div className="flex items-center gap-4">
          <button
            className="rounded-full px-3 py-1 bg-gray-100 text-gray-700 hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
            onClick={() => {
              setPagination((prev) => ({ ...prev, pageIndex: Math.max(0, prev.pageIndex - 1) }));
              if (table.previousPage) table.previousPage();
            }}
            disabled={pagination.pageIndex === 0}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-100">
            <span className="font-semibold">{pagination.pageIndex + 1}</span> / {Math.ceil(data.length / pagination.pageSize) || 1}
          </span>
          <button
            className="rounded-full px-3 py-1 bg-gray-100 text-gray-700 hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
            onClick={() => {
              setPagination((prev) => ({ ...prev, pageIndex: Math.min(Math.ceil(data.length / pagination.pageSize) - 1, prev.pageIndex + 1) }));
              if (table.nextPage) table.nextPage();
            }}
            disabled={pagination.pageIndex + 1 >= Math.ceil(data.length / pagination.pageSize)}
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }
  // Only render the default full table+pagination if both are false
  if (!showOnlyTableRows && !showOnlyPagination) {
  return (
    <div className="flex flex-col w-full">
      {!hideToolbar && (
        <div className="flex items-center py-2 w-full gap-1">
          <Input
            placeholder={`Filter ${searchKey}s...`}
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className="max-w-xs h-8 text-sm px-2"
          />
          <div className="ml-auto flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1 h-8 px-2 text-sm">
                  <ArrowUpDown className="h-4 w-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanSort() && column.id !== "actions")
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsSorted() !== false}
                        onCheckedChange={() => column.toggleSorting()}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1 h-8 px-2 text-sm">
                  <Columns className="h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter(
                    (column) => column.getCanHide() && column.id !== "actions"
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
      <div className="rounded-md border w-full overflow-y-auto custom-scrollbar h-[340px] bg-transparent">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row: any) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick && onRowClick(row.original)}
                  className={`border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900 ${onRowClick ? "cursor-pointer" : ""}`}
                >
                  {row.getVisibleCells().map((cell: any) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-center w-full px-4 py-1 bg-white rounded-b-xl mt-2 dark:bg-gray-800 dark:text-gray-100">
        <div className="flex items-center gap-4">
          <button
            className="rounded-full px-3 py-1 bg-gray-100 text-gray-700 hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
            onClick={() => {
              setPagination((prev) => ({ ...prev, pageIndex: Math.max(0, prev.pageIndex - 1) }));
              if (table.previousPage) table.previousPage();
            }}
            disabled={pagination.pageIndex === 0}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-100">
            <span className="font-semibold">{pagination.pageIndex + 1}</span> / {Math.ceil(data.length / pagination.pageSize) || 1}
          </span>
          <button
            className="rounded-full px-3 py-1 bg-gray-100 text-gray-700 hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
            onClick={() => {
              setPagination((prev) => ({ ...prev, pageIndex: Math.min(Math.ceil(data.length / pagination.pageSize) - 1, prev.pageIndex + 1) }));
              if (table.nextPage) table.nextPage();
            }}
            disabled={pagination.pageIndex + 1 >= Math.ceil(data.length / pagination.pageSize)}
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
  }
  return null;
} 