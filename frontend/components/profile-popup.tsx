"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { LogOut, User, Mail, Phone, Edit2, Calendar, Droplet, AlertCircle, FileText, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { currentUser } from "@/lib/mock-data"
import { useParsedAppointments } from "@/lib/hooks/use-parsed-appointments"
import { logout } from "@/lib/api/auth"

interface UserProfile {
  name: string
  email: string
  phone: string
  avatarUrl?: string
}

export function ProfilePopup() {
  const router = useRouter()
  const [isEditing, setIsEditing] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  // Fetch parsed appointments to get document count
  const { data: documents, isLoading: isLoadingDocs } = useParsedAppointments()

  // Mock user data - in a real app, this would come from auth context or API
  const [profile, setProfile] = React.useState<UserProfile>({
    name: "Adam Kowalski",
    email: "adams.k@example.com",
    phone: "+1 (555) 123-4567",
    avatarUrl: "https://i.pravatar.cc/120?img=12",
  })

  const [editedProfile, setEditedProfile] = React.useState<UserProfile>(profile)

  const handleLogout = () => {
    // Clear authentication token and cookies
    logout()

    // Close the popover
    setOpen(false)

    // Redirect to login page
    router.push("/login")
    router.refresh()
  }

  const handleSave = () => {
    setProfile(editedProfile)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  // Get initials for avatar fallback
  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-lg p-3 transition-colors hover:bg-orange-50/50 cursor-pointer">
          <Avatar className="h-10 w-10 border-2 border-orange-200">
            <AvatarImage src={profile.avatarUrl} alt={profile.name} />
            <AvatarFallback className="bg-orange-100 text-orange-700 font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left">
            <span className="text-sm font-semibold text-orange-900">
              {profile.name}
            </span>
            <span className="text-xs text-orange-600/70">View profile</span>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 border-orange-200 bg-white shadow-lg"
        align="end"
        side="top"
        sideOffset={8}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-orange-200">
                <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                <AvatarFallback className="bg-orange-100 text-orange-700 text-lg font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-orange-900">
                  {profile.name}
                </span>
                <span className="text-xs text-orange-600/70">{currentUser.role}</span>
              </div>
            </div>
            {!isEditing && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-orange-600 hover:bg-orange-50 hover:text-orange-700 cursor-pointer"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Separator className="bg-orange-100" />

          {/* Document Count Badge */}
          <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
            {isLoadingDocs ? (
              <>
                <Loader2 className="w-4 h-4 text-orange-600 animate-spin" />
                <span className="text-sm font-semibold text-orange-700">Loading documents...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-semibold text-orange-700">
                  {documents?.length || 0} {documents?.length === 1 ? "Document" : "Documents"}
                </span>
              </>
            )}
          </div>

          <Separator className="bg-orange-100" />

          {/* Profile Information */}
          {!isEditing ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-orange-400" />
                <span className="text-orange-900">{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-orange-400" />
                <span className="text-orange-900">{profile.phone}</span>
              </div>

              {/* Health Information */}
              <Separator className="bg-orange-100 my-2" />

              {currentUser.dateOfBirth && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-orange-400" />
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Date of Birth</span>
                    <span className="text-orange-900 font-medium">
                      {new Date(currentUser.dateOfBirth).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              )}

              {currentUser.bloodType && (
                <div className="flex items-center gap-3 text-sm">
                  <Droplet className="h-4 w-4 text-orange-400" />
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Blood Type</span>
                    <span className="text-orange-900 font-medium">{currentUser.bloodType}</span>
                  </div>
                </div>
              )}

              {currentUser.allergies && currentUser.allergies.length > 0 && (
                <div className="flex items-center gap-3 text-sm">
                  <AlertCircle className="h-4 w-4 text-orange-400" />
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Allergies</span>
                    <span className="text-orange-900 font-medium">{currentUser.allergies.join(", ")}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Edit Form */
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs text-orange-700">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-400" />
                  <Input
                    id="name"
                    value={editedProfile.name}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, name: e.target.value })
                    }
                    className="pl-9 border-orange-200 focus-visible:border-orange-400 focus-visible:ring-orange-400/20"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs text-orange-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-400" />
                  <Input
                    id="email"
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, email: e.target.value })
                    }
                    className="pl-9 border-orange-200 focus-visible:border-orange-400 focus-visible:ring-orange-400/20"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs text-orange-700">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={editedProfile.phone}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, phone: e.target.value })
                    }
                    className="pl-9 border-orange-200 focus-visible:border-orange-400 focus-visible:ring-orange-400/20"
                  />
                </div>
              </div>
            </div>
          )}

          <Separator className="bg-orange-100" />

          {/* Action Buttons */}
          {isEditing ? (
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                className="flex-1 bg-orange-500 text-white hover:bg-orange-600 cursor-pointer"
              >
                Save Changes
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 border-orange-200 text-orange-700 hover:bg-orange-50 cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-900 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
