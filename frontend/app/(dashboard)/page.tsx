import { TextAnimate } from "@/components/ui/text-animate"
import { Particles } from "@/components/ui/particles"
import { Heart, Users, Activity, Calendar } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-amber-50 to-orange-50 overflow-hidden p-8">
      <Particles
        className="absolute inset-0"
        quantity={80}
        ease={70}
        color="#fb923c"
        refresh={false}
      />

      <div className="relative z-10 max-w-6xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Heart className="w-16 h-16 text-orange-400 fill-orange-400 animate-pulse" />
            <TextAnimate
              animation="blurIn"
              by="word"
              className="text-7xl font-bold text-orange-600 font-[family-name:var(--font-quicksand)]"
            >
              Welcome Home
            </TextAnimate>
          </div>
          <TextAnimate
            animation="slideUp"
            by="word"
            delay={0.3}
            className="text-orange-700/80 text-2xl font-light"
          >
            Your family's health, all in one heartwarming place
          </TextAnimate>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-orange-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-4 bg-orange-100 rounded-full">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-orange-900">Family Members</h3>
              <p className="text-sm text-orange-700/70">Track everyone's health together</p>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-amber-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-4 bg-amber-100 rounded-full">
                <Activity className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-amber-900">Health Stats</h3>
              <p className="text-sm text-amber-700/70">Monitor vital health metrics</p>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-orange-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-4 bg-orange-200 rounded-full">
                <Calendar className="w-8 h-8 text-orange-700" />
              </div>
              <h3 className="text-lg font-semibold text-orange-900">Appointments</h3>
              <p className="text-sm text-orange-700/70">Never miss a checkup</p>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-amber-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-4 bg-amber-200 rounded-full">
                <Heart className="w-8 h-8 text-amber-700" />
              </div>
              <h3 className="text-lg font-semibold text-amber-900">Care Plans</h3>
              <p className="text-sm text-amber-700/70">Personalized health guidance</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
