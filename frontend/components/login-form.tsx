"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TextAnimate } from "@/components/ui/text-animate"
import { Particles } from "@/components/ui/particles"
import { Heart, AlertCircle } from "lucide-react"
import { FamilyHealthDiagram } from "@/components/family-health-diagram"
import { login, storeToken } from "@/lib/api/auth"
import Link from "next/link"

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
})

type LoginFormData = z.infer<typeof loginSchema>
type ValidationErrors = Partial<Record<keyof LoginFormData, string>>

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [generalError, setGeneralError] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setGeneralError("")

    // Validate form
    const result = loginSchema.safeParse({ email })

    if (!result.success) {
      const fieldErrors: ValidationErrors = {}
      result.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as keyof LoginFormData] = error.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    setIsLoading(true)

    try {
      // Call the login API
      const response = await login({ email: result.data.email })

      // Store the token in localStorage
      storeToken(response.access_token)

      // Redirect to dashboard
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error('Login failed:', error)
      setGeneralError(error instanceof Error ? error.message : 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-background/90 overflow-hidden">
      <Particles
        className="absolute inset-0"
        quantity={60}
        ease={70}
        color="oklch(0.64 0.08 245)"
        refresh={false}
      />

      <div className="relative z-10 w-full max-w-6xl px-4 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
        {/* Animated Diagram Section */}
        <div className="hidden lg:flex flex-col items-center justify-center">
          <TextAnimate
            animation="slideUp"
            by="word"
            className="text-2xl font-bold text-primary mb-4 font-[family-name:var(--font-quicksand)] text-center"
          >
            Your Family&apos;s Health Hub
          </TextAnimate>
          <FamilyHealthDiagram />
          <TextAnimate
            animation="blurIn"
            by="word"
            delay={0.5}
            className="text-secondary text-sm text-center mt-4 max-w-md px-4"
          >
            Centralized platform connecting medical records, appointments, medications, health tracking, and family members in one secure place
          </TextAnimate>
        </div>

        {/* Login Form Section */}
        <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-12 h-12 text-primary fill-primary animate-pulse" />
            <TextAnimate
              animation="blurIn"
              by="word"
              className="text-5xl font-bold text-primary font-[family-name:var(--font-quicksand)]"
            >
              Family Care
            </TextAnimate>
          </div>
          <TextAnimate
            animation="slideUp"
            by="word"
            delay={0.3}
            className="text-secondary text-lg font-light"
          >
            Welcome back to your family health home
          </TextAnimate>
        </div>

        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-border p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {generalError && (
              <div className="flex items-center gap-1.5 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{generalError}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-secondary text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@familycare.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  // Clear error when user types
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: undefined }))
                  }
                  // Clear general error when user types
                  if (generalError) {
                    setGeneralError("")
                  }
                }}
                className={`bg-white/70 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary rounded-xl ${
                  errors.email ? "border-destructive focus:border-destructive focus:ring-destructive" : ""
                }`}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <div
                  id="email-error"
                  className="flex items-center gap-1.5 text-destructive text-sm mt-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>


            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold rounded-xl text-white bg-gradient-to-r from-[oklch(0.64_0.08_245)] to-[oklch(0.87_0.03_230)] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign In with Email 💌"}
            </button>
          </form>

        </Card>
        </div>
      </div>
    </div>
  )
}
