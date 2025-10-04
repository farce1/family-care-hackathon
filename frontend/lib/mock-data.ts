import { Document, FamilyMember } from "@/types/document";
import { Appointment } from "@/types/appointment";

/**
 * Mock data for family members and their documents
 */

export const currentUser: FamilyMember = {
  id: "current",
  name: "Adam Kowalski",
  role: "Father",
  avatar: "https://i.pravatar.cc/120?img=12",
  initials: "AK",
  dateOfBirth: "1985-06-15",
  bloodType: "A+",
  allergies: ["Penicillin"],
  accentColor: "orange",
};

export const familyMembers: FamilyMember[] = [
  {
    id: "1",
    name: "Natalia",
    role: "Wife",
    avatar: "https://i.pravatar.cc/120?img=5",
    initials: "NA",
    dateOfBirth: "1987-03-22",
    bloodType: "B+",
    allergies: ["Pollen", "Dust"],
    accentColor: "orange",
  },
  {
    id: "2",
    name: "Oliwia",
    role: "Daughter",
    avatar: "https://i.pravatar.cc/120?u=oliwia.child@example.com",
    initials: "OL",
    dateOfBirth: "2015-09-10",
    bloodType: "A+",
    allergies: [],
    accentColor: "amber",
  },
  {
    id: "3",
    name: "Marek",
    role: "Son",
    avatar: "https://i.pravatar.cc/120?u=marek.son@example.com",
    initials: "MA",
    dateOfBirth: "2018-12-05",
    bloodType: "B+",
    allergies: ["Peanuts"],
    accentColor: "orange",
  },
  {
    id: "4",
    name: "Maniek",
    role: "Dog",
    avatar:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=120&h=120&fit=crop",
    initials: "MN",
    dateOfBirth: "2020-04-18",
    accentColor: "amber",
  },
];

// Mock documents for current user
export const currentUserDocuments: Document[] = [
  {
    id: "doc-1",
    title: "Annual Physical Examination",
    appointment_type: "Medical Record",
    date: new Date("2025-09-15"),
    description: "Complete physical examination with blood work",
    fileSize: "2.4 MB",
    uploadedBy: "Dr. Jan Nowak",
  },
  {
    id: "doc-2",
    title: "Blood Pressure Medication",
    appointment_type: "Prescription",
    date: new Date("2025-09-20"),
    description: "Amlodipine 5mg - Take once daily",
    fileSize: "156 KB",
    uploadedBy: "Dr. Jan Nowak",
  },
  {
    id: "doc-3",
    title: "Cholesterol Test Results",
    appointment_type: "Lab Result",
    date: new Date("2025-08-10"),
    description: "Lipid panel - All values within normal range",
    fileSize: "892 KB",
    uploadedBy: "LabCorp Wrocław",
  },
  {
    id: "doc-4",
    title: "COVID-19 Booster",
    appointment_type: "Vaccination",
    date: new Date("2025-08-05"),
    description: "Pfizer-BioNTech booster dose",
    fileSize: "445 KB",
    uploadedBy: "Przychodnia Centrum",
  },
  {
    id: "doc-5",
    title: "Chest X-Ray",
    appointment_type: "Imaging",
    date: new Date("2025-06-22"),
    description: "Routine chest radiograph - Clear",
    fileSize: "5.2 MB",
    uploadedBy: "Radiology Department",
  },
  {
    id: "doc-6",
    title: "Dental Checkup",
    appointment_type: "Medical Record",
    date: new Date("2025-06-10"),
    description: "Routine dental examination and cleaning",
    fileSize: "1.1 MB",
    uploadedBy: "Dr. Anna Wiśniewska",
  },
  {
    id: "doc-7",
    title: "Vision Test",
    appointment_type: "Medical Record",
    date: new Date("2025-04-15"),
    description: "Annual eye examination",
    fileSize: "678 KB",
    uploadedBy: "Optyk Profesjonalny",
  },
  {
    id: "doc-8",
    title: "Flu Vaccination",
    appointment_type: "Vaccination",
    date: new Date("2025-03-20"),
    description: "Seasonal influenza vaccine",
    fileSize: "312 KB",
    uploadedBy: "Przychodnia Centrum",
  },
  {
    id: "doc-9",
    title: "Allergy Test Results",
    appointment_type: "Lab Result",
    date: new Date("2025-02-28"),
    description: "Comprehensive allergy panel",
    fileSize: "1.8 MB",
    uploadedBy: "Allergen Testing Lab",
  },
  {
    id: "doc-10",
    title: "Health Insurance Card",
    appointment_type: "Insurance",
    date: new Date("2025-01-05"),
    description: "NFZ health insurance documentation",
    fileSize: "234 KB",
    uploadedBy: "NFZ",
  },
];

// Mock documents for family members
export const familyMemberDocuments: Record<string, Document[]> = {
  "1": [
    // Natalia
    {
      id: "nat-1",
      title: "Prenatal Checkup",
      appointment_type: "Medical Record",
      date: new Date("2025-09-25"),
      description: "Routine prenatal examination",
      fileSize: "1.5 MB",
      uploadedBy: "Dr. Maria Kowalczyk",
    },
    {
      id: "nat-2",
      title: "Ultrasound Results",
      appointment_type: "Imaging",
      date: new Date("2025-09-10"),
      description: "Second trimester ultrasound",
      fileSize: "8.3 MB",
      uploadedBy: "Medical Imaging Center",
    },
    {
      id: "nat-3",
      title: "Vitamin D Prescription",
      appointment_type: "Prescription",
      date: new Date("2025-08-15"),
      description: "Vitamin D3 2000 IU daily",
      fileSize: "145 KB",
      uploadedBy: "Dr. Maria Kowalczyk",
    },
    {
      id: "nat-4",
      title: "Blood Work Results",
      appointment_type: "Lab Result",
      date: new Date("2025-07-20"),
      description: "Complete metabolic panel",
      fileSize: "956 KB",
      uploadedBy: "LabCorp Wrocław",
    },
    {
      id: "nat-5",
      title: "Mammogram",
      appointment_type: "Imaging",
      date: new Date("2025-06-05"),
      description: "Annual screening mammogram - Normal",
      fileSize: "6.7 MB",
      uploadedBy: "Women's Health Center",
    },
    {
      id: "nat-6",
      title: "Thyroid Function Test",
      appointment_type: "Lab Result",
      date: new Date("2025-05-12"),
      description: "TSH and T4 levels - Normal range",
      fileSize: "423 KB",
      uploadedBy: "Endocrinology Lab",
    },
    {
      id: "nat-7",
      title: "Dermatology Consultation",
      appointment_type: "Medical Record",
      date: new Date("2025-03-08"),
      description: "Skin examination and mole check",
      fileSize: "2.1 MB",
      uploadedBy: "Dr. Piotr Lewandowski",
    },
    {
      id: "nat-8",
      title: "Pap Smear Results",
      appointment_type: "Lab Result",
      date: new Date("2025-02-14"),
      description: "Cervical cancer screening - Negative",
      fileSize: "567 KB",
      uploadedBy: "Gynecology Lab",
    },
  ],
  "2": [
    // Oliwia
    {
      id: "oli-1",
      title: "School Physical Exam",
      appointment_type: "Medical Record",
      date: new Date("2025-09-01"),
      description: "Required school health examination",
      fileSize: "1.2 MB",
      uploadedBy: "Dr. Katarzyna Nowak",
    },
    {
      id: "oli-2",
      title: "Growth Chart Update",
      appointment_type: "Medical Record",
      date: new Date("2025-08-20"),
      description: "Height and weight measurements",
      fileSize: "345 KB",
      uploadedBy: "Pediatric Clinic",
    },
    {
      id: "oli-3",
      title: "Dental Sealants",
      appointment_type: "Medical Record",
      date: new Date("2025-07-15"),
      description: "Preventive dental sealant application",
      fileSize: "876 KB",
      uploadedBy: "Pediatric Dentistry",
    },
    {
      id: "oli-4",
      title: "Vision Screening",
      appointment_type: "Medical Record",
      date: new Date("2025-06-10"),
      description: "School vision test - 20/20",
      fileSize: "234 KB",
      uploadedBy: "School Nurse",
    },
    {
      id: "oli-5",
      title: "Tetanus Booster",
      appointment_type: "Vaccination",
      date: new Date("2025-05-03"),
      description: "Tdap vaccine booster",
      fileSize: "298 KB",
      uploadedBy: "Pediatric Clinic",
    },
    {
      id: "oli-6",
      title: "Allergy Medication",
      appointment_type: "Prescription",
      date: new Date("2025-04-12"),
      description: "Cetirizine 10mg for seasonal allergies",
      fileSize: "167 KB",
      uploadedBy: "Dr. Katarzyna Nowak",
    },
    {
      id: "oli-7",
      title: "Sports Physical",
      appointment_type: "Medical Record",
      date: new Date("2025-03-05"),
      description: "Clearance for school sports activities",
      fileSize: "945 KB",
      uploadedBy: "Dr. Katarzyna Nowak",
    },
    {
      id: "oli-8",
      title: "Flu Vaccine",
      appointment_type: "Vaccination",
      date: new Date("2025-02-18"),
      description: "Annual influenza vaccination",
      fileSize: "289 KB",
      uploadedBy: "Pediatric Clinic",
    },
  ],
  "3": [
    // Marek
    {
      id: "mar-1",
      title: "Asthma Checkup",
      appointment_type: "Medical Record",
      date: new Date("2025-09-12"),
      description: "Routine asthma management visit",
      fileSize: "1.6 MB",
      uploadedBy: "Dr. Tomasz Zieliński",
    },
    {
      id: "mar-2",
      title: "Inhaler Prescription",
      appointment_type: "Prescription",
      date: new Date("2025-09-12"),
      description: "Albuterol inhaler - Use as needed",
      fileSize: "178 KB",
      uploadedBy: "Dr. Tomasz Zieliński",
    },
    {
      id: "mar-3",
      title: "Peanut Allergy Test",
      appointment_type: "Lab Result",
      date: new Date("2025-07-08"),
      description: "Confirmed peanut allergy - IgE elevated",
      fileSize: "734 KB",
      uploadedBy: "Allergy Testing Center",
    },
    {
      id: "mar-4",
      title: "EpiPen Prescription",
      appointment_type: "Prescription",
      date: new Date("2025-07-08"),
      description: "Emergency epinephrine auto-injector",
      fileSize: "256 KB",
      uploadedBy: "Dr. Tomasz Zieliński",
    },
    {
      id: "mar-5",
      title: "Well-Child Visit",
      appointment_type: "Medical Record",
      date: new Date("2025-06-15"),
      description: "6-year checkup and development assessment",
      fileSize: "2.3 MB",
      uploadedBy: "Dr. Tomasz Zieliński",
    },
    {
      id: "mar-6",
      title: "Ear Infection Treatment",
      appointment_type: "Prescription",
      date: new Date("2025-04-20"),
      description: "Amoxicillin for acute otitis media",
      fileSize: "145 KB",
      uploadedBy: "Dr. Tomasz Zieliński",
    },
    {
      id: "mar-7",
      title: "Swimming Physical",
      appointment_type: "Medical Record",
      date: new Date("2025-03-10"),
      description: "Medical clearance for swimming lessons",
      fileSize: "567 KB",
      uploadedBy: "Dr. Tomasz Zieliński",
    },
    {
      id: "mar-8",
      title: "MMR Vaccination",
      appointment_type: "Vaccination",
      date: new Date("2025-01-25"),
      description: "Measles, mumps, rubella booster",
      fileSize: "312 KB",
      uploadedBy: "Pediatric Clinic",
    },
  ],
  "4": [
    // Maniek (Dog)
    {
      id: "man-1",
      title: "Annual Veterinary Exam",
      appointment_type: "Medical Record",
      date: new Date("2025-09-05"),
      description: "Complete physical examination - Good health",
      fileSize: "1.8 MB",
      uploadedBy: "Dr. Aleksandra Kowalska DVM",
    },
    {
      id: "man-2",
      title: "Rabies Vaccination",
      appointment_type: "Vaccination",
      date: new Date("2025-09-05"),
      description: "Annual rabies vaccine booster",
      fileSize: "234 KB",
      uploadedBy: "VetClinic Wrocław",
    },
    {
      id: "man-3",
      title: "Dental Cleaning",
      appointment_type: "Medical Record",
      date: new Date("2025-06-18"),
      description: "Professional dental cleaning under anesthesia",
      fileSize: "3.2 MB",
      uploadedBy: "VetClinic Wrocław",
    },
    {
      id: "man-4",
      title: "Heartworm Prevention",
      appointment_type: "Prescription",
      date: new Date("2025-05-10"),
      description: "Monthly heartworm preventive medication",
      fileSize: "189 KB",
      uploadedBy: "Dr. Aleksandra Kowalska DVM",
    },
    {
      id: "man-5",
      title: "Blood Work Panel",
      appointment_type: "Lab Result",
      date: new Date("2025-04-22"),
      description: "Senior wellness blood panel - All normal",
      fileSize: "645 KB",
      uploadedBy: "Veterinary Lab",
    },
    {
      id: "man-6",
      title: "DHPP Vaccination",
      appointment_type: "Vaccination",
      date: new Date("2025-03-15"),
      description: "Distemper, hepatitis, parainfluenza, parvovirus",
      fileSize: "267 KB",
      uploadedBy: "VetClinic Wrocław",
    },
    {
      id: "man-7",
      title: "Skin Condition Treatment",
      appointment_type: "Prescription",
      date: new Date("2025-02-08"),
      description: "Medicated shampoo for dermatitis",
      fileSize: "156 KB",
      uploadedBy: "Dr. Aleksandra Kowalska DVM",
    },
  ],
};

/**
 * Get documents for a specific family member by ID
 */
export function getDocumentsForMember(memberId: string): Document[] {
  if (memberId === "current") {
    return currentUserDocuments;
  }
  return familyMemberDocuments[memberId] || [];
}

/**
 * Get family member by ID
 */
export function getFamilyMember(memberId: string): FamilyMember | undefined {
  if (memberId === "current") {
    return currentUser;
  }
  return familyMembers.find((member) => member.id === memberId);
}

/**
 * Mock appointments data
 */
export const appointments: Appointment[] = [
  // Upcoming appointments
  {
    id: "apt-1",
    familyMemberId: "4",
    familyMemberName: "Maniek",
    facilityName: "Weterynaria VetClinic Wrocław",
    facilityAddress: "ul. Powstańców Śląskich 95, Wrocław",
    appointmentType: "Veterinary",
    dateTime: new Date("2025-10-10T14:00:00"),
    status: "upcoming",
    doctorName: "Dr. Aleksandra Kowalska DVM",
    duration: 30,
    notes: "Annual checkup and vaccination",
    reminder: true,
    accentColor: "amber",
  },
  {
    id: "apt-2",
    familyMemberId: "3",
    familyMemberName: "Marek",
    facilityName: "Przychodnia Rodzinna Med-Care",
    facilityAddress: "ul. Kazimierza Wielkiego 19, Wrocław",
    appointmentType: "Follow-up",
    dateTime: new Date("2025-10-14T10:30:00"),
    status: "upcoming",
    doctorName: "Dr. Tomasz Zieliński",
    duration: 20,
    notes: "Asthma follow-up examination",
    reminder: true,
    accentColor: "orange",
  },
  {
    id: "apt-3",
    familyMemberId: "1",
    familyMemberName: "Natalia",
    facilityName: "Szpital Kliniczny Wrocław",
    facilityAddress: "ul. Borowska 213, Wrocław",
    appointmentType: "Specialist",
    dateTime: new Date("2025-10-15T09:00:00"),
    status: "upcoming",
    doctorName: "Dr. Maria Kowalczyk",
    duration: 45,
    notes: "Prenatal consultation",
    reminder: true,
    accentColor: "orange",
  },
  {
    id: "apt-4",
    familyMemberId: "current",
    familyMemberName: "Adam Kowalski",
    facilityName: "Centrum Medyczne Przyjaźni",
    facilityAddress: "ul. Przyjaźni 20, Wrocław",
    appointmentType: "General Checkup",
    dateTime: new Date("2025-10-18T11:00:00"),
    status: "upcoming",
    doctorName: "Dr. Jan Nowak",
    duration: 30,
    notes: "Annual physical examination",
    reminder: true,
    accentColor: "orange",
  },
  {
    id: "apt-5",
    familyMemberId: "2",
    familyMemberName: "Oliwia",
    facilityName: "Stomatologia Dziecięca Uśmiech",
    facilityAddress: "ul. Piłsudskiego 88, Wrocław",
    appointmentType: "Dental",
    dateTime: new Date("2025-10-22T15:00:00"),
    status: "upcoming",
    doctorName: "Dr. Anna Wiśniewska",
    duration: 40,
    notes: "Routine dental checkup and cleaning",
    reminder: true,
    accentColor: "amber",
  },
  {
    id: "apt-6",
    familyMemberId: "current",
    familyMemberName: "Adam Kowalski",
    facilityName: "Laboratorium Diagnostyczne LabMed",
    facilityAddress: "ul. Grabiszyńska 105, Wrocław",
    appointmentType: "Lab Work",
    dateTime: new Date("2025-10-25T08:00:00"),
    status: "upcoming",
    doctorName: "LabMed Technician",
    duration: 15,
    notes: "Blood work and cholesterol panel",
    reminder: true,
    accentColor: "orange",
  },

  // Archival (completed) appointments
  {
    id: "apt-7",
    familyMemberId: "1",
    familyMemberName: "Natalia",
    facilityName: "Szpital Kliniczny Wrocław",
    facilityAddress: "ul. Borowska 213, Wrocław",
    appointmentType: "Specialist",
    dateTime: new Date("2025-09-25T09:00:00"),
    status: "completed",
    doctorName: "Dr. Maria Kowalczyk",
    duration: 45,
    notes: "Prenatal checkup - all normal",
    accentColor: "orange",
  },
  {
    id: "apt-8",
    familyMemberId: "current",
    familyMemberName: "Adam Kowalski",
    facilityName: "Centrum Medyczne Przyjaźni",
    facilityAddress: "ul. Przyjaźni 20, Wrocław",
    appointmentType: "General Checkup",
    dateTime: new Date("2025-09-15T11:00:00"),
    status: "completed",
    doctorName: "Dr. Jan Nowak",
    duration: 30,
    notes: "Complete physical examination - good health",
    accentColor: "orange",
  },
  {
    id: "apt-9",
    familyMemberId: "3",
    familyMemberName: "Marek",
    facilityName: "Przychodnia Rodzinna Med-Care",
    facilityAddress: "ul. Kazimierza Wielkiego 19, Wrocław",
    appointmentType: "General Checkup",
    dateTime: new Date("2025-09-12T10:30:00"),
    status: "completed",
    doctorName: "Dr. Tomasz Zieliński",
    duration: 30,
    notes: "Asthma checkup and inhaler prescription renewal",
    accentColor: "orange",
  },
  {
    id: "apt-10",
    familyMemberId: "4",
    familyMemberName: "Maniek",
    facilityName: "Weterynaria VetClinic Wrocław",
    facilityAddress: "ul. Powstańców Śląskich 95, Wrocław",
    appointmentType: "Veterinary",
    dateTime: new Date("2025-09-05T14:00:00"),
    status: "completed",
    doctorName: "Dr. Aleksandra Kowalska DVM",
    duration: 30,
    notes: "Annual exam and rabies vaccination completed",
    accentColor: "amber",
  },
  {
    id: "apt-11",
    familyMemberId: "current",
    familyMemberName: "Adam Kowalski",
    facilityName: "Przychodnia Centrum",
    facilityAddress: "ul. Świdnicka 47, Wrocław",
    appointmentType: "Vaccination",
    dateTime: new Date("2025-08-05T13:00:00"),
    status: "completed",
    doctorName: "Nurse Teresa Nowacka",
    duration: 15,
    notes: "COVID-19 booster vaccination",
    accentColor: "orange",
  },
  {
    id: "apt-12",
    familyMemberId: "2",
    familyMemberName: "Oliwia",
    facilityName: "Stomatologia Dziecięca Uśmiech",
    facilityAddress: "ul. Piłsudskiego 88, Wrocław",
    appointmentType: "Dental",
    dateTime: new Date("2025-07-15T15:00:00"),
    status: "completed",
    doctorName: "Dr. Anna Wiśniewska",
    duration: 40,
    notes: "Dental sealants applied successfully",
    accentColor: "amber",
  },
  {
    id: "apt-13",
    familyMemberId: "1",
    familyMemberName: "Natalia",
    facilityName: "Women's Health Center",
    facilityAddress: "ul. Legnicka 55, Wrocław",
    appointmentType: "Specialist",
    dateTime: new Date("2025-06-05T10:00:00"),
    status: "completed",
    doctorName: "Dr. Ewa Kowalczyk",
    duration: 60,
    notes: "Mammogram screening - results normal",
    accentColor: "orange",
  },
  {
    id: "apt-14",
    familyMemberId: "3",
    familyMemberName: "Marek",
    facilityName: "Allergy Testing Center",
    facilityAddress: "ul. Traugutta 57-59, Wrocław",
    appointmentType: "Specialist",
    dateTime: new Date("2025-07-08T09:30:00"),
    status: "completed",
    doctorName: "Dr. Paweł Lewandowski",
    duration: 90,
    notes: "Comprehensive allergy testing - peanut allergy confirmed",
    accentColor: "orange",
  },

  // Cancelled appointment
  {
    id: "apt-15",
    familyMemberId: "current",
    familyMemberName: "Adam Kowalski",
    facilityName: "Optyk Profesjonalny",
    facilityAddress: "ul. Świdnicka 22, Wrocław",
    appointmentType: "Vision",
    dateTime: new Date("2025-08-20T12:00:00"),
    status: "cancelled",
    doctorName: "Optometrist Krzysztof Nowak",
    duration: 30,
    notes: "Cancelled due to scheduling conflict",
    accentColor: "orange",
  },
];

/**
 * Get upcoming appointments (future dates with upcoming status)
 */
export function getUpcomingAppointments(): Appointment[] {
  const now = new Date();
  return appointments
    .filter((apt) => apt.status === "upcoming" && apt.dateTime > now)
    .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
}

/**
 * Get archival appointments (completed, cancelled, or past)
 */
export function getArchivalAppointments(): Appointment[] {
  return appointments
    .filter(
      (apt) =>
        apt.status === "completed" ||
        apt.status === "cancelled" ||
        apt.status === "rescheduled" ||
        apt.status === "no-show"
    )
    .sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());
}

/**
 * Get appointments for a specific family member
 */
export function getAppointmentsForMember(memberId: string): Appointment[] {
  return appointments.filter((apt) => apt.familyMemberId === memberId);
}
