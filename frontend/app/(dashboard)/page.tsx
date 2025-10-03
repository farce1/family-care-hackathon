import { Particles } from "@/components/ui/particles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DocumentTimeline } from "@/components/document-timeline";
import { currentUser, currentUserDocuments } from "@/lib/mock-data";
import { Heart, Calendar, Droplet, AlertCircle, FileText } from "lucide-react";

export default function Home() {
  const documentCount = currentUserDocuments.length;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-background/90 overflow-hidden">
      <Particles
        className="absolute inset-0"
        quantity={60}
        ease={70}
        color="oklch(0.64 0.08 245)"
        refresh={false}
      />

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Heart className="w-10 h-10 text-primary fill-primary animate-pulse" />
            <h1 className="text-5xl font-bold text-primary font-[family-name:var(--font-quicksand)]">
              Welcome Back, {currentUser.name.split(" ")[0]}
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Here&apos;s an overview of your health records and documents
          </p>
        </div>

        {/* User Profile Card */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-border overflow-hidden">
          {/* Decorative accent line */}
          <div className="h-2 bg-gradient-to-r from-orange-400 to-orange-500" />

          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar Section */}
              <div className="flex-shrink-0">
                <Avatar className="w-24 h-24 ring-4 ring-primary/20">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback className="text-3xl font-bold bg-orange-100 text-orange-600">
                    {currentUser.initials}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-2 font-[family-name:var(--font-quicksand)]">
                      {currentUser.name}
                    </h2>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                      {currentUser.role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-orange-600" />
                    <span className="font-semibold text-orange-600">
                      {documentCount} {documentCount === 1 ? "Document" : "Documents"}
                    </span>
                  </div>
                </div>

                {/* Health Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {currentUser.dateOfBirth && (
                    <div className="p-4 rounded-lg bg-orange-50">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-orange-600" />
                        <span className="text-xs text-muted-foreground">Date of Birth</span>
                      </div>
                      <p className="font-semibold text-orange-700">
                        {new Date(currentUser.dateOfBirth).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  )}

                  {currentUser.bloodType && (
                    <div className="p-4 rounded-lg bg-orange-50">
                      <div className="flex items-center gap-2 mb-1">
                        <Droplet className="w-4 h-4 text-orange-600" />
                        <span className="text-xs text-muted-foreground">Blood Type</span>
                      </div>
                      <p className="font-semibold text-orange-700">{currentUser.bloodType}</p>
                    </div>
                  )}

                  {currentUser.allergies && currentUser.allergies.length > 0 && (
                    <div className="p-4 rounded-lg bg-orange-50">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                        <span className="text-xs text-muted-foreground">Allergies</span>
                      </div>
                      <p className="font-semibold text-orange-700">
                        {currentUser.allergies.join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Timeline Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-orange-600 mb-2 font-[family-name:var(--font-quicksand)]">
            My Health Records Timeline
          </h2>
          <p className="text-muted-foreground">
            Your complete medical history organized by date
          </p>
        </div>

        <DocumentTimeline documents={currentUserDocuments} accentColor="orange" />
      </div>
    </div>
  );
}
