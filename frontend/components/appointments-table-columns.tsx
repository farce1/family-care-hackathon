"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { ArrowUpDown, MoreHorizontal, Eye, Edit, XCircle } from "lucide-react"
import { Appointment } from "@/types/appointment"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { currentUser, familyMembers } from "@/lib/mock-data"

// Helper function to get family member info
const getFamilyMemberInfo = (memberId: string) => {
  if (memberId === "current") return currentUser
  return familyMembers.find((member) => member.id === memberId)
}

// Helper function to get status badge configuration
const getStatusBadge = (status: Appointment["status"]) => {
  const statusConfig = {
    upcoming: { label: "Upcoming", className: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100" },
    completed: { label: "Completed", className: "bg-green-100 text-green-700 border-green-200 hover:bg-green-100" },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700 border-red-200 hover:bg-red-100" },
    rescheduled: { label: "Rescheduled", className: "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100" },
    "no-show": { label: "No Show", className: "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100" },
  }

  const config = statusConfig[status]
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}

export const appointmentsTableColumns: ColumnDef<Appointment>[] = [
  {
    accessorKey: "dateTime",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-primary/5"
        >
          Date & Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("dateTime") as Date
      return (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">
            {format(date, "MMM d, yyyy")}
          </span>
          <span className="text-sm text-muted-foreground">
            {format(date, "h:mm a")}
          </span>
        </div>
      )
    },
    sortingFn: "datetime",
  },
  {
    accessorKey: "familyMemberName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-primary/5"
        >
          Family Member
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const appointment = row.original
      const memberInfo = getFamilyMemberInfo(appointment.familyMemberId)
      const accentColor = appointment.accentColor || memberInfo?.accentColor || "orange"

      return (
        <div className="flex items-center gap-3">
          {memberInfo && (
            <Avatar className="w-10 h-10 ring-2 ring-primary/10">
              <AvatarImage src={memberInfo.avatar} alt={memberInfo.name} />
              <AvatarFallback
                className={`text-sm font-bold ${
                  accentColor === "orange"
                    ? "bg-primary/10 text-primary"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {memberInfo.initials}
              </AvatarFallback>
            </Avatar>
          )}
          <div>
            <div className="font-semibold text-foreground">
              {appointment.familyMemberName}
            </div>
            {memberInfo?.role && (
              <div className="text-sm text-muted-foreground">{memberInfo.role}</div>
            )}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "facilityName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-primary/5"
        >
          Doctor/Clinic
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const appointment = row.original
      return (
        <div className="flex flex-col max-w-xs">
          <span className="font-semibold text-foreground truncate">
            {appointment.facilityName}
          </span>
          {appointment.doctorName && (
            <span className="text-sm text-muted-foreground truncate">
              {appointment.doctorName}
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "appointmentType",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-primary/5"
        >
          Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const type = row.getValue("appointmentType") as string
      return (
        <div className="font-medium text-foreground">{type}</div>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-primary/5"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as Appointment["status"]
      return getStatusBadge(status)
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const appointment = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/5">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {appointment.status === "upcoming" && (
              <>
                <DropdownMenuItem className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  Reschedule
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
