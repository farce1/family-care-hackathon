"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { TextAnimate } from "@/components/ui/text-animate"
import { BorderBeam } from "@/components/ui/border-beam"
import { Particles } from "@/components/ui/particles"
import { Heart, AlertCircle } from "lucide-react"

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
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-amber-50 to-orange-50 overflow-hidden">
      <Particles
        className="absolute inset-0"
        quantity={60}
        ease={70}
        color="#fb923c"
        refresh={false}
      />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-12 h-12 text-orange-400 fill-orange-400 animate-pulse" />
            <TextAnimate
              animation="blurIn"
              by="word"
              className="text-5xl font-bold text-orange-600 font-[family-name:var(--font-quicksand)]"
            >
              Family Care
            </TextAnimate>
          </div>
          <TextAnimate
            animation="slideUp"
            by="word"
            delay={0.3}
            className="text-orange-700/80 text-lg font-light"
          >
            Welcome back to your family health home
          </TextAnimate>
        </div>

        <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-orange-200/50 p-8 shadow-2xl">
          <BorderBeam
            size={250}
            duration={12}
            delay={0}
            colorFrom="#fb923c"
            colorTo="#fbbf24"
          />

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-orange-800 text-sm font-medium">
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
                className={`bg-white/70 border-orange-200 text-orange-900 placeholder:text-orange-400 focus:border-orange-400 focus:ring-orange-400 rounded-xl ${
                  errors.email ? "border-red-400 focus:border-red-400 focus:ring-red-400" : ""
                }`}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <div
                  id="email-error"
                  className="flex items-center gap-1.5 text-red-600 text-sm mt-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-orange-800 text-sm font-medium">
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
                className={`bg-white/70 border-orange-200 text-orange-900 placeholder:text-orange-400 focus:border-orange-400 focus:ring-orange-400 rounded-xl ${
                  errors.password ? "border-red-400 focus:border-red-400 focus:ring-red-400" : ""
                }`}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              {errors.password && (
                <div
                  id="password-error"
                  className="flex items-center gap-1.5 text-red-600 text-sm mt-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            <ShimmerButton
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold"
              shimmerColor="#ffffff"
              shimmerSize="0.1em"
              shimmerDuration="2s"
              borderRadius="12px"
              background="linear-gradient(135deg, #fb923c 0%, #fbbf24 100%)"
            >
              {isLoading ? "Signing in..." : "Sign In with Love 💕"}
            </ShimmerButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-orange-700 text-sm">
              New to Family Care?{" "}
              <button
                type="button"
                className="text-orange-500 hover:text-orange-600 font-semibold transition-colors"
              >
                Join our family
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
