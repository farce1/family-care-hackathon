"use client"

import { useState } from "react"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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
import { AlertCircle, Plus, Loader2, MapPin, Calendar, Phone, Building2, Clock, Check } from "lucide-react"
import { getApiBaseUrl, API_ENDPOINTS } from "@/lib/api/config"
import { UpcomingAppointment } from "@/lib/api/appointments"
import { cn } from "@/lib/utils"

// Medical specialties list from README.md (lines 2-152)
const medicalSpecialties = [
  "PORADNIA ALERGOLOGICZNA",
  "PORADNIA ALERGOLOGICZNA DLA DZIECI",
  "PORADNIA ANESTEZJOLOGICZNA",
  "PORADNIA ANESTEZJOLOGICZNA DLA DZIECI",
  "PORADNIA ANTYNIKOTYNOWA",
  "PORADNIA AUDIOLOGICZNA",
  "PORADNIA AUDIOLOGICZNA DLA DZIECI",
  "PORADNIA CHIRURGII KLATKI PIERSIOWEJ",
  "PORADNIA CHIRURGII KLATKI PIERSIOWEJ DLA DZIECI",
  "PORADNIA CHIRURGII NACZYNIOWEJ",
  "PORADNIA CHIRURGII NACZYNIOWEJ DLA DZIECI",
  "PORADNIA CHIRURGII OGÓLNEJ",
  "PORADNIA CHIRURGII OGÓLNEJ DLA DZIECI",
  "PORADNIA CHIRURGII ONKOLOGICZNEJ",
  "PORADNIA CHIRURGII ONKOLOGICZNEJ DLA DZIECI",
  "PORADNIA CHIRURGII PLASTYCZNEJ",
  "PORADNIA CHIRURGII PLASTYCZNEJ DLA DZIECI",
  "PORADNIA CHIRURGII RĘKI",
  "PORADNIA CHIRURGII RĘKI DLA DZIECI",
  "PORADNIA CHIRURGII STOMATOLOGICZNEJ",
  "PORADNIA CHIRURGII STOMATOLOGICZNEJ DLA DZIECI",
  "PORADNIA CHIRURGII SZCZĘKOWO-TWARZOWEJ",
  "PORADNIA CHIRURGII SZCZĘKOWO-TWARZOWEJ DLA DZIECI",
  "PORADNIA CHORÓB METABOLICZNYCH",
  "PORADNIA CHORÓB METABOLICZNYCH DLA DZIECI",
  "PORADNIA CHORÓB NACZYŃ",
  "PORADNIA CHORÓB NACZYŃ DLA DZIECI",
  "PORADNIA CHORÓB ODZWIERZĘCYCH I PASOŻYTNICZYCH",
  "PORADNIA CHORÓB ODZWIERZĘCYCH I PASOŻYTNICZYCH DLA DZIECI",
  "PORADNIA CHORÓB TROPIKALNYCH",
  "PORADNIA CHORÓB TROPIKALNYCH DLA DZIECI",
  "PORADNIA CHORÓB ZAKAŹNYCH",
  "PORADNIA CHORÓB ZAKAŹNYCH DLA DZIECI",
  "PORADNIA DERMATOLOGICZNA",
  "PORADNIA DERMATOLOGICZNA DLA DZIECI",
  "PORADNIA DLA OSÓB Z AUTYZMEM DZIECIĘCYM",
  "PORADNIA DOMOWEGO LECZENIA TLENEM",
  "PORADNIA DOMOWEGO LECZENIA TLENEM DLA DZIECI",
  "PORADNIA ENDOKRYNOLOGICZNA OSTEOPOROZY",
  "PORADNIA ENDOKRYNOLOGICZNA OSTEOPOROZY DLA DZIECI",
  "PORADNIA FONIATRYCZNA",
  "PORADNIA FONIATRYCZNA DLA DZIECI",
  "PORADNIA GENETYCZNA",
  "PORADNIA GENETYCZNA DLA DZIECI",
  "PORADNIA GENETYCZNO-ONKOLOGICZNA",
  "PORADNIA GENETYCZNO-ONKOLOGICZNA DLA DZIECI",
  "PORADNIA GERIATRYCZNA",
  "PORADNIA GINEKOLOGICZNA",
  "PORADNIA GINEKOLOGICZNA DLA DZIEWCZĄT",
  "PORADNIA HEMATOLOGICZNA",
  "PORADNIA HEMATOLOGICZNA DLA DZIECI",
  "PORADNIA HEPATOLOGICZNA",
  "PORADNIA HEPATOLOGICZNA DLA DZIECI",
  "PORADNIA IMMUNOLOGICZNA",
  "PORADNIA IMMUNOLOGICZNA DLA DZIECI",
  "PORADNIA KARDIOCHIRURGICZNA",
  "PORADNIA KARDIOCHIRURGICZNA DLA DZIECI",
  "PORADNIA KONTROLI ROZRUSZNIKÓW I KARDIOWERTERÓW",
  "PORADNIA KONTROLI ROZRUSZNIKÓW I KARDIOWERTERÓW DLA DZIECI",
  "PORADNIA KONTROLI SYSTEMÓW NEUROMODULACJI",
  "PORADNIA KONTROLI SYSTEMÓW NEUROMODULACJI DLA DZIECI",
  "PORADNIA LECZENIA BÓLU",
  "PORADNIA LECZENIA BÓLU DLA DZIECI",
  "PORADNIA LECZENIA MUKOWISCYDOZY",
  "PORADNIA LECZENIA MUKOWISCYDOZY DLA DZIECI",
  "PORADNIA LECZENIA NERWIC",
  "PORADNIA LECZENIA NERWIC DLA DZIECI",
  "PORADNIA LECZENIA OBRZĘKU LIMFATYCZNEGO",
  "PORADNIA LECZENIA OBRZĘKU LIMFATYCZNEGO DLA DZIECI",
  "PORADNIA LECZENIA OPARZEŃ",
  "PORADNIA LECZENIA OPARZEŃ DLA DZIECI",
  "PORADNIA LECZENIA RAN PRZEWLEKŁYCH",
  "PORADNIA LECZENIA RAN PRZEWLEKŁYCH DLA DZIECI",
  "PORADNIA LECZENIA UZALEŻNIEŃ",
  "PORADNIA LECZENIA UZALEŻNIEŃ DLA DZIECI",
  "PORADNIA LECZENIA ZESPOŁU STOPY CUKRZYCOWEJ",
  "PORADNIA LECZENIA ZESPOŁU STOPY CUKRZYCOWEJ DLA DZIECI",
  "PORADNIA LECZENIA ZEZA",
  "PORADNIA LECZENIA ZEZA DLA DZIECI",
  "PORADNIA LOGOPEDYCZNA",
  "PORADNIA LOGOPEDYCZNA DLA DZIECI",
  "PORADNIA MEDYCYNY NUKLEARNEJ",
  "PORADNIA MEDYCYNY NUKLEARNEJ DLA DZIECI",
  "PORADNIA MEDYCYNY PALIATYWNEJ",
  "PORADNIA MEDYCYNY PALIATYWNEJ DLA DZIECI",
  "PORADNIA MEDYCYNY SPORTOWEJ",
  "PORADNIA MEDYCYNY SPORTOWEJ DLA DZIECI",
  "PORADNIA NEONATOLOGICZNA",
  "PORADNIA NEUROCHIRURGICZNA",
  "PORADNIA NEUROCHIRURGICZNA DLA DZIECI",
  "PORADNIA NOWOTWORÓW KRWI",
  "PORADNIA NOWOTWORÓW KRWI DLA DZIECI",
  "PORADNIA ORTODONTYCZNA (UDZIELA ŚWIADCZEŃ DLA DZIECI I MŁODZIEŻY W RAMACH UMOWY Z NFZ DO 18 R.Ż).",
  "PORADNIA ORTODONTYCZNA DLA DZIECI",
  "PORADNIA OSTEOPOROZY",
  "PORADNIA OSTEOPOROZY DLA DZIECI",
  "PORADNIA PATOLOGII CIĄŻY",
  "PORADNIA PEDIATRYCZNA SZCZEPIEŃ DLA DZIECI Z GRUP WYSOKIEGO RYZYKA",
  "PORADNIA PERIODONTOLOGICZNA ORAZ CHORÓB BŁON ŚLUZOWYCH PRZYZĘBIA",
  "PORADNIA PERIODONTOLOGICZNA ORAZ CHORÓB BŁON ŚLUZOWYCH PRZYZĘBIA DLA DZIECI",
  "PORADNIA POŁOŻNICZO-GINEKOLOGICZNA",
  "PORADNIA PRELUKSACYJNA",
  "PORADNIA PROFILAKTYCZNO-LECZNICZA (HIV/AIDS)",
  "PORADNIA PROFILAKTYCZNO-LECZNICZA (HIV/AIDS) DLA DZIECI",
  "PORADNIA PROFILAKTYKI CHORÓB PIERSI",
  "PORADNIA PROKTOLOGICZNA",
  "PORADNIA PROTETYKI STOMATOLOGICZNEJ",
  "PORADNIA PSYCHOGERIATRYCZNA",
  "PORADNIA PSYCHOLOGICZNA",
  "PORADNIA PSYCHOLOGICZNA DLA DZIECI",
  "PORADNIA PSYCHOSOMATYCZNA",
  "PORADNIA PSYCHOSOMATYCZNA DLA DZIECI",
  "PORADNIA REHABILITACJI KARDIOLOGICZNEJ",
  "PORADNIA REHABILITACJI KARDIOLOGICZNEJ DLA DZIECI",
  "PORADNIA REHABILITACJI NARZĄDU RUCHU",
  "PORADNIA REHABILITACJI NARZĄDU RUCHU DLA DZIECI",
  "PORADNIA REHABILITACJI NEUROLOGICZNEJ",
  "PORADNIA REHABILITACJI NEUROLOGICZNEJ DLA DZIECI",
  "PORADNIA REHABILITACYJNA",
  "PORADNIA REHABILITACYJNA DLA DZIECI",
  "PORADNIA REUMATOLOGICZNA",
  "PORADNIA REUMATOLOGICZNA DLA DZIECI",
  "PORADNIA SEKSUOLOGICZNA I PATOLOGII WSPÓŁŻYCIA",
  "PORADNIA STOMATOLOGICZNA",
  "PORADNIA STOMATOLOGICZNA DLA DZIECI",
  "PORADNIA TERAPII UZALEŻNIENIA OD ALKOHOLU I WSPÓŁUZALEŻNIENIA",
  "PORADNIA TERAPII UZALEŻNIENIA OD ALKOHOLU I WSPÓŁUZALEŻNIENIA DLA DZIECI",
  "PORADNIA TERAPII UZALEŻNIENIA OD SUBSTANCJI PSYCHOAKTYWNYCH",
  "PORADNIA TERAPII UZALEŻNIENIA OD SUBSTANCJI PSYCHOAKTYWNYCH DLA DZIECI",
  "PORADNIA TOKSYKOLOGICZNA",
  "PORADNIA TOKSYKOLOGICZNA DLA DZIECI",
  "PORADNIA TRANSPLANTOLOGICZNA",
  "PORADNIA TRANSPLANTOLOGICZNA DLA DZIECI",
  "PORADNIA WAD POSTAWY",
  "PORADNIA WENEROLOGICZNA",
  "PORADNIA ZABURZEŃ I WAD ROZWOJOWYCH DZIECI",
  "PORADNIA ZDROWIA PSYCHICZNEGO",
  "PORADNIA ZDROWIA PSYCHICZNEGO DLA DZIECI",
  "PORADNIA ŻYWIENIOWA",
  "PORADNIA ŻYWIENIOWA DLA DZIECI",
  "ŚWIADCZENIA Z ZAKRESU ENDOKRYNOLOGII",
  "ŚWIADCZENIA Z ZAKRESU GASTROENTEROLOGII",
  "ŚWIADCZENIA Z ZAKRESU GRUŹLICY I CHORÓB PŁUC",
  "ŚWIADCZENIA Z ZAKRESU KARDIOLOGII",
  "ŚWIADCZENIA Z ZAKRESU NEFROLOGII",
  "ŚWIADCZENIA Z ZAKRESU NEUROLOGII",
  "ŚWIADCZENIA Z ZAKRESU OKULISTYKI",
  "ŚWIADCZENIA Z ZAKRESU ONKOLOGII",
  "ŚWIADCZENIA Z ZAKRESU ORTOPEDII I TRAUMATOLOGII NARZĄDU RUCHU",
  "ŚWIADCZENIA Z ZAKRESU OTOLARYNGOLOGII",
  "ŚWIADCZENIA Z ZAKRESU UROLOGII",
]

const specialtySchema = z.object({
  specialty: z.string().min(1, "Please select a medical specialty"),
})

type SpecialtyFormData = z.infer<typeof specialtySchema>
type ValidationErrors = Partial<Record<keyof SpecialtyFormData, string>>

export function BookAppointmentDialog() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [specialty, setSpecialty] = useState<string>("")
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [appointments, setAppointments] = useState<UpcomingAppointment[]>([])
  const [savedAppointmentIds, setSavedAppointmentIds] = useState<Set<string>>(new Set())

  // Mutation for saving a single appointment
  const saveAppointmentMutation = useMutation({
    mutationFn: async (appointment: UpcomingAppointment) => {
      const baseUrl = getApiBaseUrl()
      const url = `${baseUrl}/save_appointment`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: appointment.id,
          place: appointment.place,
          provider: appointment.provider,
          phone: appointment.phone,
          address: appointment.address,
          locality: appointment.locality,
          date: appointment.date,
          benefit: appointment.benefit,
          averageWaitDays: appointment.average_wait_days,
          latitude: appointment.latitude,
          longitude: appointment.longitude,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to save appointment: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    },
    onSuccess: (data, appointment) => {
      setSavedAppointmentIds(prev => new Set(prev).add(appointment.id))
      // Invalidate and refetch upcoming appointments query to refresh the appointments table
      queryClient.invalidateQueries({ queryKey: ['upcoming-appointments'] })
    },
  })

  // Mutation for fetching appointments from NFZ API
  const fetchAppointmentsMutation = useMutation({
    mutationFn: async (benefit: string) => {
      const baseUrl = getApiBaseUrl()
      const url = `${baseUrl}${API_ENDPOINTS.FETCH_NFZ_APPOINTMENTS}?benefit=${encodeURIComponent(benefit)}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch appointments: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Convert NFZ API response to UpcomingAppointment format
      interface NFZAppointmentResponse {
        id: string
        place: string
        provider: string
        phone: string | null
        address: string
        locality: string
        date: string
        benefit: string
        averageWaitDays: number
        latitude: number | string | null
        longitude: number | string | null
      }

      const appointments = (data.appointments || []).map((apt: NFZAppointmentResponse) => ({
        id: apt.id,
        place: apt.place,
        provider: apt.provider,
        phone: apt.phone,
        address: apt.address,
        locality: apt.locality,
        date: apt.date,
        benefit: apt.benefit,
        average_wait_days: apt.averageWaitDays,
        latitude: apt.latitude,
        longitude: apt.longitude,
      }))

      return appointments
    },
    onSuccess: (data) => {
      setAppointments(data)
    },
    onError: (error) => {
      console.error('Error fetching appointments:', error)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validate form
    const result = specialtySchema.safeParse({
      specialty,
    })

    if (!result.success) {
      const fieldErrors: ValidationErrors = {}
      result.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as keyof SpecialtyFormData] = error.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    // Fetch appointments
    fetchAppointmentsMutation.mutate(specialty)
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      // Reset form when closing
      setSpecialty("")
      setErrors({})
      setAppointments([])
      setSavedAppointmentIds(new Set())
      fetchAppointmentsMutation.reset()
      saveAppointmentMutation.reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 h-12 px-6 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white">
          <Plus className="w-5 h-5" />
          Book Next Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 pb-6 border-b border-orange-100">
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent font-[family-name:var(--font-quicksand)]">
            Find Available Appointments
          </DialogTitle>
          <DialogDescription className="text-center text-base text-gray-600">
            Select a medical specialty to view available appointments from NFZ
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 mt-6">
          {/* Medical Specialty Selector */}
          <div className="space-y-3 max-w-2xl mx-auto">
            <Label htmlFor="specialty" className="text-base font-semibold text-gray-700 block text-center">
              Medical Specialty
            </Label>
            <Select
              value={specialty}
              onValueChange={(value) => {
                setSpecialty(value)
                if (errors.specialty) {
                  setErrors((prev) => ({ ...prev, specialty: undefined }))
                }
              }}
            >
              <SelectTrigger
                id="specialty"
                className={cn(
                  "w-full h-14 bg-white border-2 border-gray-200 hover:border-orange-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-2xl shadow-sm transition-all text-base",
                  errors.specialty && "border-red-400 focus:border-red-400 focus:ring-red-100"
                )}
              >
                <SelectValue placeholder="Choose a medical specialty..." className="text-gray-500" />
              </SelectTrigger>
              <SelectContent className="max-h-[400px] rounded-xl border-2 border-gray-200 shadow-lg">
                {medicalSpecialties.map((spec) => (
                  <SelectItem
                    key={spec}
                    value={spec}
                    className="py-3 px-4 hover:bg-orange-50 focus:bg-orange-50 cursor-pointer"
                  >
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.specialty && (
              <div className="flex items-center justify-center gap-2 text-red-600 text-sm mt-2">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.specialty}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-2 max-w-2xl mx-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="flex-1 h-12 rounded-xl border-2 border-gray-200 hover:bg-gray-50 font-medium"
              disabled={fetchAppointmentsMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={fetchAppointmentsMutation.isPending}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 shadow-md hover:shadow-lg transition-all text-white font-semibold"
            >
              {fetchAppointmentsMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                "Show Available Appointments"
              )}
            </Button>
          </div>
        </form>

        {/* Error State */}
        {fetchAppointmentsMutation.isError && (
          <div className="mt-8 p-6 bg-red-50 border-2 border-red-200 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 text-red-800">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-lg">Failed to load appointments</p>
                <p className="text-sm text-red-600 mt-1">
                  {fetchAppointmentsMutation.error?.message || "An error occurred while fetching appointments"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {fetchAppointmentsMutation.isPending && (
          <div className="mt-8 flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
            <p className="text-gray-600 font-medium">Searching for available appointments...</p>
          </div>
        )}

        {/* Appointments List */}
        {fetchAppointmentsMutation.isSuccess && appointments.length > 0 && (
          <div className="mt-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b-2 border-orange-100">
              <h3 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-quicksand)]">
                Available Appointments
              </h3>
              <span className="px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                {appointments.length} found
              </span>
            </div>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-gray-100">
              {appointments.map((appointment) => {
                const isSaved = savedAppointmentIds.has(appointment.id)
                const isSaving = saveAppointmentMutation.isPending && saveAppointmentMutation.variables?.id === appointment.id

                return (
                  <div
                    key={appointment.id}
                    className="p-5 bg-gradient-to-br from-white to-orange-50/30 border-2 border-gray-200 rounded-2xl hover:border-orange-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1 space-y-3">
                        {/* Provider and Place */}
                        <div>
                          <h4 className="font-bold text-lg text-gray-900">{appointment.provider}</h4>
                          <p className="text-sm text-gray-600 font-medium">{appointment.place}</p>
                        </div>

                        {/* Location */}
                        <div className="flex items-start gap-2.5 text-sm text-gray-700">
                          <div className="p-1.5 bg-orange-100 rounded-lg">
                            <MapPin className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium">{appointment.address}</p>
                            <p className="text-gray-600">{appointment.locality}</p>
                          </div>
                        </div>

                        {/* Phone */}
                        {appointment.phone && (
                          <div className="flex items-center gap-2.5 text-sm text-gray-700">
                            <div className="p-1.5 bg-orange-100 rounded-lg">
                              <Phone className="w-4 h-4 text-orange-600" />
                            </div>
                            <span className="font-medium">{appointment.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Right Side: Date, Wait Time, and Book Button */}
                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 rounded-xl shadow-sm">
                          <Calendar className="w-5 h-5" />
                          <span className="font-bold text-base">
                            {new Date(appointment.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg">
                          <Clock className="w-4 h-4" />
                          <span className="font-semibold">{appointment.average_wait_days} days</span>
                        </div>

                        {/* Book Appointment Button */}
                        <Button
                          onClick={() => saveAppointmentMutation.mutate(appointment)}
                          disabled={isSaved || isSaving}
                          className={cn(
                            "w-full mt-2 rounded-xl font-semibold transition-all",
                            isSaved
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600"
                          )}
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : isSaved ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Saved
                            </>
                          ) : (
                            "Book Appointment"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {fetchAppointmentsMutation.isSuccess && appointments.length === 0 && (
          <div className="mt-8 p-10 bg-gradient-to-br from-gray-50 to-orange-50/20 border-2 border-gray-200 rounded-2xl text-center">
            <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
              <Building2 className="w-16 h-16 text-gray-400" />
            </div>
            <p className="text-gray-700 font-bold text-lg">No appointments available</p>
            <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
              There are currently no available appointments for this specialty. Try selecting a different specialty or check back later.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
