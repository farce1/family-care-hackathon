"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Appointment } from "@/types/appointment";

interface FilterOption {
  value: string;
  label: string;
}

interface AppointmentsDataTableProps {
  columns: ColumnDef<Appointment>[];
  data: Appointment[];
  selectedFilter?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
}

export function AppointmentsDataTable({
  columns,
  data,
  selectedFilter = "all",
  onFilterChange,
  filterOptions = [],
}: AppointmentsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "dateTime", desc: false }, // Default sort by date ascending (earliest first)
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  // Reset sorting when filter changes to ensure proper ordering
  React.useEffect(() => {
    // Reset to default sort (by date ascending) when filter changes
    setSorting([{ id: "dateTime", desc: false }]);
  }, [selectedFilter]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="w-full space-y-4">
      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Filter Select */}
        {filterOptions.length > 0 && (
          <Select value={selectedFilter} onValueChange={onFilterChange}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white border-border focus:ring-primary">
              <SelectValue placeholder="Filter appointments" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Search Input */}
        <div className="relative w-full sm:flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search appointments..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-9 bg-white border-border focus-visible:ring-primary"
          />
        </div>

        {/* Column Visibility Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto bg-white border-border hover:bg-primary/5">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id === "familyMemberName"
                      ? "Family Member"
                      : column.id === "facilityName"
                        ? "Doctor/Clinic"
                        : column.id === "appointmentType"
                          ? "Type"
                          : column.id === "dateTime"
                            ? "Date & Time"
                            : column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <Card className="border-border bg-white/80 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[600px]">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-primary/5 hover:bg-primary/5">
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="font-bold text-foreground">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-primary/5 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center py-8">
                        <p className="text-lg font-semibold text-muted-foreground mb-2">
                          No appointments found
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {globalFilter
                            ? "Try adjusting your search"
                            : "No appointments to display"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length > 0 ? (
            <>
              Showing{" "}
              <span className="font-semibold text-foreground">
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-foreground">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {table.getFilteredRowModel().rows.length}
              </span>{" "}
              appointment{table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
            </>
          ) : (
            "No appointments"
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="bg-white border-border hover:bg-primary/5 disabled:opacity-50"
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">
              Page{" "}
              <span className="font-semibold text-foreground">
                {table.getState().pagination.pageIndex + 1}
              </span>{" "}
              of <span className="font-semibold text-foreground">{table.getPageCount()}</span>
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="bg-white border-border hover:bg-primary/5 disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
