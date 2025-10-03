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

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
})

type LoginFormData = z.infer<typeof loginSchema>
type ValidationErrors = Partial<Record<keyof LoginFormData, string>>

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validate form
    const result = loginSchema.safeParse({ email, password })

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

    // Mock login - set cookie and redirect
    document.cookie = "logged-in=true; path=/; max-age=86400" // 24 hours

    setTimeout(() => {
      router.push("/")
      router.refresh()
    }, 500)
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

            <div className="space-y-2">
              <Label htmlFor="password" className="text-secondary text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password (min 6 characters)"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  // Clear error when user types
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: undefined }))
                  }
                }}
                className={`bg-white/70 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary rounded-xl ${
                  errors.password ? "border-destructive focus:border-destructive focus:ring-destructive" : ""
                }`}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              {errors.password && (
                <div
                  id="password-error"
                  className="flex items-center gap-1.5 text-destructive text-sm mt-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold rounded-xl text-white bg-gradient-to-r from-[oklch(0.64_0.08_245)] to-[oklch(0.87_0.03_230)] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign In with Love 💕"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-secondary text-sm">
              New to Family Care?{" "}
              <button
                type="button"
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                Join our family
              </button>
            </p>
          </div>
        </Card>
        </div>
      </div>
    </div>
  )
}
