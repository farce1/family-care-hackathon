import { TextAnimate } from "@/components/ui/text-animate"
import { Particles } from "@/components/ui/particles"
import { Heart, Users, Activity, Calendar } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-background/90 overflow-hidden p-8">
      <Particles
        className="absolute inset-0"
        quantity={80}
        ease={70}
        color="oklch(0.64 0.08 245)"
        refresh={false}
      />

      <div className="relative z-10 max-w-6xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Heart className="w-16 h-16 text-primary fill-primary animate-pulse" />
            <TextAnimate
              animation="blurIn"
              by="word"
              className="text-7xl font-bold text-primary font-[family-name:var(--font-quicksand)]"
            >
              Welcome Home
            </TextAnimate>
          </div>
          <TextAnimate
            animation="slideUp"
            by="word"
            delay={0.3}
            className="text-secondary text-2xl font-light"
          >
            Your family's health, all in one heartwarming place
          </TextAnimate>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-4 bg-primary/10 rounded-full">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-primary">Family Members</h3>
              <p className="text-sm text-muted-foreground">Track everyone's health together</p>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-4 bg-secondary/10 rounded-full">
                <Activity className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-secondary">Health Stats</h3>
              <p className="text-sm text-muted-foreground">Monitor vital health metrics</p>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-4 bg-accent/10 rounded-full">
                <Calendar className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-accent">Appointments</h3>
              <p className="text-sm text-muted-foreground">Never miss a checkup</p>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-4 bg-primary/20 rounded-full">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-primary">Care Plans</h3>
              <p className="text-sm text-muted-foreground">Personalized health guidance</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
