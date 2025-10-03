"use client"

import { useState } from "react"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { CalendarIcon, AlertCircle, Plus } from "lucide-react"
import { format } from "date-fns"
import { AppointmentType } from "@/types/appointment"
import { cn } from "@/lib/utils"

const appointmentTypes: AppointmentType[] = [
  "General Checkup",
  "Dental",
  "Vision",
  "Specialist",
  "Vaccination",
  "Follow-up",
  "Lab Work",
  "Physical Therapy",
  "Mental Health",
  "Veterinary",
]

const cities = ["Wrocław"]

const appointmentSchema = z.object({
  appointmentType: z.string().min(1, "Please select an appointment type"),
  date: z.date({
    required_error: "Please select a date",
  }).refine((date) => date > new Date(), {
    message: "Appointment date must be in the future",
  }),
  city: z.string().min(1, "Please select a city"),
})

type AppointmentFormData = z.infer<typeof appointmentSchema>
type ValidationErrors = Partial<Record<keyof AppointmentFormData, string>>

export function BookAppointmentDialog() {
  const [open, setOpen] = useState(false)
  const [appointmentType, setAppointmentType] = useState<string>("")
  const [date, setDate] = useState<Date>()
  const [city, setCity] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validate form
    const result = appointmentSchema.safeParse({
      appointmentType,
      date,
      city,
    })

    if (!result.success) {
      const fieldErrors: ValidationErrors = {}
      result.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as keyof AppointmentFormData] = error.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Booking appointment:", result.data)
      setIsLoading(false)
      setOpen(false)
      // Reset form
      setAppointmentType("")
      setDate(undefined)
      setCity("")
      setErrors({})
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ShimmerButton
          className="flex items-center gap-2"
          shimmerColor="#ffffff"
          shimmerSize="0.1em"
          shimmerDuration="2s"
          borderRadius="12px"
          background="linear-gradient(135deg, oklch(0.64 0.08 245) 0%, oklch(0.87 0.03 230) 100%)"
        >
          <Plus className="w-5 h-5" />
          Book Next Appointment
        </ShimmerButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary font-[family-name:var(--font-quicksand)]">
            Book New Appointment
          </DialogTitle>
          <DialogDescription>
            Schedule your next medical appointment. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Appointment Type */}
          <div className="space-y-2">
            <Label htmlFor="appointment-type" className="text-secondary text-sm font-medium">
              Appointment Type
            </Label>
            <Select
              value={appointmentType}
              onValueChange={(value) => {
                setAppointmentType(value)
                if (errors.appointmentType) {
                  setErrors((prev) => ({ ...prev, appointmentType: undefined }))
                }
              }}
            >
              <SelectTrigger
                id="appointment-type"
                className={cn(
                  "bg-white/70 border-border focus:border-primary focus:ring-primary rounded-xl",
                  errors.appointmentType && "border-destructive focus:border-destructive focus:ring-destructive"
                )}
              >
                <SelectValue placeholder="Select appointment type" />
              </SelectTrigger>
              <SelectContent>
                {appointmentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.appointmentType && (
              <div className="flex items-center gap-1.5 text-destructive text-sm mt-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.appointmentType}</span>
              </div>
            )}
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-secondary text-sm font-medium">
              Desired Appointment Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-white/70 border-border hover:bg-white/90 rounded-xl",
                    !date && "text-muted-foreground",
                    errors.date && "border-destructive focus:border-destructive focus:ring-destructive"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate)
                    if (errors.date) {
                      setErrors((prev) => ({ ...prev, date: undefined }))
                    }
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <div className="flex items-center gap-1.5 text-destructive text-sm mt-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.date}</span>
              </div>
            )}
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city" className="text-secondary text-sm font-medium">
              City
            </Label>
            <Select
              value={city}
              onValueChange={(value) => {
                setCity(value)
                if (errors.city) {
                  setErrors((prev) => ({ ...prev, city: undefined }))
                }
              }}
            >
              <SelectTrigger
                id="city"
                className={cn(
                  "bg-white/70 border-border focus:border-primary focus:ring-primary rounded-xl",
                  errors.city && "border-destructive focus:border-destructive focus:ring-destructive"
                )}
              >
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((cityName) => (
                  <SelectItem key={cityName} value={cityName}>
                    {cityName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.city && (
              <div className="flex items-center gap-1.5 text-destructive text-sm mt-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.city}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <ShimmerButton
              type="submit"
              disabled={isLoading}
              className="flex-1"
              shimmerColor="#ffffff"
              shimmerSize="0.1em"
              shimmerDuration="2s"
              borderRadius="12px"
              background="linear-gradient(135deg, oklch(0.64 0.08 245) 0%, oklch(0.87 0.03 230) 100%)"
            >
              {isLoading ? "Booking..." : "Book Appointment"}
            </ShimmerButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
