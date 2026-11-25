export interface SeedParticipant {
  name: string;
  photoUrl: string | null;
  description: string;
  roleLabel: string;
  sortOrder: number;
}

// Data contoh peserta — ganti nama, foto, dan catatan singkatnya kapan saja lewat Owner corner.
export const INITIAL_PARTICIPANTS: SeedParticipant[] = [
  {
    name: 'Peserta 01 (Editable)',
    photoUrl: null,
    description: 'Selalu siap sedia colokan cadangan dan energi debugging yang paling santai.',
    roleLabel: 'Teman Sekelas · Front-End Curious',
    sortOrder: 1,
  },
  {
    name: 'Peserta 02 (Editable)',
    photoUrl: null,
    description: 'Bikin wireframe kosong berubah jadi layout rapi lebih cepet dari perkiraan.',
    roleLabel: 'Teman Sekelas · Layout Builder',
    sortOrder: 2,
  },
  {
    name: 'Peserta 03 (Editable)',
    photoUrl: null,
    description: 'Penyuplai recehan terbaik tiap kelas mulai hening gara-gara JavaScript.',
    roleLabel: 'Teman Sekelas · Mood Lifter',
    sortOrder: 3,
  },
  {
    name: 'Peserta 04 (Editable)',
    photoUrl: null,
    description: 'Selalu nanyain hal yang sebenernya setengah ruangan juga pengen tanya.',
    roleLabel: 'Teman Sekelas · Thoughtful Learner',
    sortOrder: 4,
  },
  {
    name: 'Peserta 05 (Editable)',
    photoUrl: null,
    description: 'Nggak pernah ragu ngesot kursinya buat ikut nyariin titik koma yang ilang.',
    roleLabel: 'Teman Sekelas · Kind Helper',
    sortOrder: 5,
  },
  {
    name: 'Peserta 06 (Editable)',
    photoUrl: null,
    description: 'Pemilik buku catatan paling rapi di seluruh ruang pelatihan Disnaker.',
    roleLabel: 'Teman Sekelas · Note Keeper',
    sortOrder: 6,
  },
  {
    name: 'Peserta 07 (Editable)',
    photoUrl: null,
    description: 'Iseng ngerakit web perpisahan kecil ini sepulang kelas buat kenang-kenangan.',
    roleLabel: 'Teman Sekelas · Archive Maker',
    sortOrder: 7,
  },
  {
    name: 'Peserta 08 (Editable)',
    photoUrl: null,
    description: 'Bukti nyata kalau 10 hari belajar pelan-pelan bisa bawa kita sejauh ini.',
    roleLabel: 'Teman Sekelas · Project Builder',
    sortOrder: 8,
  },
];
