export const recommendationLetterTeachers = [
  {
    id: "prof-1",
    fullName: "Pr. Karim Moussaoui",
    department: "Génie Informatique",
    specialty: "Développement logiciel",
    profilePicture: "",
  },
  {
    id: "prof-2",
    fullName: "Pr. Yasmine Benjelloun",
    department: "Génie Industriel",
    specialty: "Management des systèmes",
    profilePicture: "",
  },
  {
    id: "prof-3",
    fullName: "Pr. Imane Berrada",
    department: "Réseaux et Télécommunications",
    specialty: "Cloud et cybersécurité",
    profilePicture: "",
  },
];

export const recommendationLetterStudent = {
  id: "student-1",
  fullName: "Mohamed Zaaboul",
  major: "Génie Informatique",
  level: "5e année",
  profilePicture: "",
};

export const studentRecommendationLetters = [
  {
    id: "letter-1",
    title: "Candidature Master Data Science",
    requestMessage:
      "Je souhaite solliciter une lettre de recommandation pour accompagner ma candidature au Master Data Science.",
    letterContent:
      "Je recommande vivement cet étudiant pour son admission au Master Data Science. Son sérieux, sa curiosité scientifique et sa maîtrise des fondamentaux informatiques lui permettront de réussir pleinement dans ce programme.",
    type: "MASTER",
    validationStatus: "APPROVED",
    documentUrl: "/files/lettre-master-data-science.pdf",
    downloadable: true,
    createdAt: "2026-05-14T10:30:00.000Z",
    validatedAt: "2026-05-18T09:15:00.000Z",
    rejectionReason: "",
    author: recommendationLetterTeachers[0],
    validator: {
      fullName: "Administration ENSA Tanger",
    },
    student: recommendationLetterStudent,
  },
  {
    id: "letter-2",
    title: "Candidature stage de fin d'études",
    requestMessage:
      "Cette lettre accompagnera mes candidatures pour un stage de fin d'études en développement logiciel.",
    letterContent: "",
    type: "INTERNSHIP",
    validationStatus: "PENDING",
    documentUrl: "",
    downloadable: false,
    createdAt: "2026-06-07T14:20:00.000Z",
    validatedAt: null,
    rejectionReason: "",
    author: recommendationLetterTeachers[2],
    validator: null,
    student: recommendationLetterStudent,
  },
  {
    id: "letter-3",
    title: "Programme international",
    requestMessage:
      "Je prépare un dossier pour un programme international et souhaite valoriser mon parcours académique.",
    letterContent: "",
    type: "INTERNATIONAL_PROGRAM",
    validationStatus: "CHANGES_REQUESTED",
    documentUrl: "",
    downloadable: false,
    createdAt: "2026-05-28T11:00:00.000Z",
    validatedAt: null,
    rejectionReason:
      "Veuillez préciser le nom du programme et la date limite de candidature.",
    author: recommendationLetterTeachers[1],
    validator: null,
    student: recommendationLetterStudent,
  },
];
