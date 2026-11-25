export interface SeedInstructor {
  name: string;
  photoUrl: string | null;
  role: string;
  salutation: string;
  message: string;
  closing: string;
  sortOrder: number;
}

export const INITIAL_INSTRUCTORS: SeedInstructor[] = [
  {
    name: 'Pak Salman & Pak Yusup',
    photoUrl: null,
    role: 'Instruktur Kelas Laravel · Disnaker',
    salutation: 'Halo, Pak Salman & Pak Yusup!',
    message:
      "Thank you so much for these past 10 days! Terima kasih sudah sabar membimbing, menjelaskan, dan selalu meluangkan waktu untuk membantu kami memahami hal-hal yang belum kami mengerti.\n\nIt was a short but meaningful journey. More than just the lessons, we'll remember your kindness and patience throughout the process.\n\nSemoga Pak Yusup dan Pak Salman selalu diberi kesehatan, kelancaran dalam setiap urusan, dan terus dipertemukan dengan banyak hal baik. Wishing you both all the best!",
    closing: 'Once again, thank you for everything, Pak!',
    sortOrder: 1,
  },
];
