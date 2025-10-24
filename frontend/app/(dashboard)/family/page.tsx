import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, Building2, ArrowRight } from "lucide-react";
import { TextAnimate } from "@/components/ui/text-animate";
import Link from "next/link";

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  initials: string;
  documentsCount: number;
  appointmentDate?: string;
  facilityVisit?: string;
  accentColor: string;
}

const familyMembers: FamilyMember[] = [
  {
    id: "1",
    name: "Natalia",
    role: "Wife",
    avatar: "https://i.pravatar.cc/120?img=5",
    initials: "NA",
    documentsCount: 24,
    appointmentDate: "Oct 15, 2025",
    facilityVisit: "Szpital Kliniczny Wrocław",
    accentColor: "orange",
  },
  {
    id: "2",
    name: "Oliwia",
    role: "Daughter",
    avatar: "https://i.pravatar.cc/120?u=oliwia.child@example.com",
    initials: "OL",
    documentsCount: 18,
    accentColor: "amber",
  },
  {
    id: "3",
    name: "Marek",
    role: "Son",
    avatar: "https://i.pravatar.cc/120?u=marek.son@example.com",
    initials: "MA",
    documentsCount: 15,
    appointmentDate: "Oct 14, 2025",
    facilityVisit: "Przychodnia Rodzinna Med-Care",
    accentColor: "orange",
  },
  {
    id: "4",
    name: "Maniek",
    role: "Dog",
    avatar: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=120&h=120&fit=crop",
    initials: "MN",
    documentsCount: 8,
    appointmentDate: "Oct 10, 2025",
    facilityVisit: "Weterynaria VetClinic Wrocław",
    accentColor: "amber",
  },
];

export default function FamilyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/90 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <TextAnimate
            animation="blurIn"
            by="word"
            className="text-4xl font-bold text-primary mb-2 font-[family-name:var(--font-quicksand)]"
          >
            Family Members
          </TextAnimate>
          <p className="text-secondary text-lg">
            Manage health records and appointments for your loved ones
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {familyMembers.map((member, index) => (
            <Link key={member.id} href={`/family/${member.id}`}>
              <Card
                className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-border bg-white/80 backdrop-blur-sm overflow-hidden relative cursor-pointer h-full flex flex-col"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Decorative accent line */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                    member.accentColor === "orange"
                      ? "from-primary to-primary/80"
                      : "from-secondary to-secondary/80"
                  }`}
                />

                <CardHeader className="text-center pb-4 pt-6">
                  {/* Large Avatar */}
                  <div className="flex justify-center mb-4">
                    <Avatar className="w-24 h-24 ring-4 ring-primary/10 group-hover:ring-primary/20 transition-all">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback
                        className={`text-2xl font-bold ${
                          member.accentColor === "orange"
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary/10 text-secondary"
                        }`}
                      >
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Name and Role */}
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">{member.name}</h3>
                    <Badge
                      variant="secondary"
                      className={`${
                        member.accentColor === "orange"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-secondary/10 text-secondary border-secondary/20"
                      }`}
                    >
                      {member.role}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <div className="space-y-4 flex-1">
                    {/* Documents Count */}
                    <div
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        member.accentColor === "orange" ? "bg-primary/5" : "bg-secondary/5"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-md ${
                          member.accentColor === "orange" ? "bg-primary/10" : "bg-secondary/10"
                        }`}
                      >
                        <FileText
                          className={`w-4 h-4 ${
                            member.accentColor === "orange" ? "text-primary" : "text-secondary"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Documents</p>
                        <p
                          className={`font-semibold ${
                            member.accentColor === "orange" ? "text-primary" : "text-secondary"
                          }`}
                        >
                          {member.documentsCount} uploaded
                        </p>
                      </div>
                    </div>

                    {/* Appointment Date */}
                    <div
                      className={`flex items-center gap-3 p-3 rounded-lg min-h-[68px] ${
                        member.accentColor === "orange" ? "bg-primary/5" : "bg-secondary/5"
                      }`}
                    >
                      {member.appointmentDate ? (
                        <>
                          <div
                            className={`p-2 rounded-md ${
                              member.accentColor === "orange" ? "bg-primary/10" : "bg-secondary/10"
                            }`}
                          >
                            <Calendar
                              className={`w-4 h-4 ${
                                member.accentColor === "orange" ? "text-primary" : "text-secondary"
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Next Appointment</p>
                            <p
                              className={`font-semibold ${
                                member.accentColor === "orange" ? "text-primary" : "text-secondary"
                              }`}
                            >
                              {member.appointmentDate}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1" />
                      )}
                    </div>

                    {/* Facility Visit */}
                    <div
                      className={`flex items-center gap-3 p-3 rounded-lg min-h-[68px] ${
                        member.accentColor === "orange" ? "bg-primary/5" : "bg-secondary/5"
                      }`}
                    >
                      {member.facilityVisit ? (
                        <>
                          <div
                            className={`p-2 rounded-md ${
                              member.accentColor === "orange" ? "bg-primary/10" : "bg-secondary/10"
                            }`}
                          >
                            <Building2
                              className={`w-4 h-4 ${
                                member.accentColor === "orange" ? "text-primary" : "text-secondary"
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Facility Visit</p>
                            <p
                              className={`font-semibold text-sm ${
                                member.accentColor === "orange" ? "text-primary" : "text-secondary"
                              }`}
                            >
                              {member.facilityVisit}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1" />
                      )}
                    </div>
                  </div>

                  {/* View Details Button */}
                  <div className="mt-auto pt-4 border-t border-border">
                    <div
                      className={`flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                        member.accentColor === "orange"
                          ? "text-primary group-hover:text-primary/80"
                          : "text-secondary group-hover:text-secondary/80"
                      }`}
                    >
                      View Details
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
