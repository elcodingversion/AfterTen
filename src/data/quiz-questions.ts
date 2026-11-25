export interface QuizOption {
  id: string;
  label: string;
  trait: 'artisan' | 'webphp' | 'blade' | 'survivor';
}

export interface QuizQuestion {
  id: number;
  kicker: string;
  question: string;
  options: QuizOption[];
}

export interface QuizPersona {
  trait: 'artisan' | 'webphp' | 'blade' | 'survivor';
  title: string;
  subtitle: string;
  description: string;
  commitTag: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    kicker: 'Pertanyaan 01',
    question: 'Musuh terbesar kamu pas belajar Laravel kemaren apa?',
    options: [
      { id: '1a', label: 'Route not found 404 padahal udah yakin banget bener.', trait: 'webphp' },
      { id: '1b', label: 'Error pas php artisan migrate, langsung merah semua terminalnya.', trait: 'artisan' },
      { id: '1c', label: 'Lupa naro @csrf di form terus kena 419 Page Expired.', trait: 'blade' },
      { id: '1d', label: 'Semuanya sih—apalagi pesan error Laravel yang panjang banget itu.', trait: 'survivor' },
    ],
  },
  {
    id: 2,
    kicker: 'Pertanyaan 02',
    question: 'Pas pertama kali liat folder Laravel (app, routes, resources, database), reaksimu gimana?',
    options: [
      { id: '2a', label: '“Ini kok foldernya banyak banget ya Allah…”', trait: 'survivor' },
      { id: '2b', label: 'Langsung nyari web.php sama folder views biar aman.', trait: 'webphp' },
      { id: '2c', label: 'Excited banget! Berasa ngoding aplikasi beneran.', trait: 'artisan' },
      { id: '2d', label: 'Kalem aja sambil ngikutin layar mentor pelan-pelan.', trait: 'blade' },
    ],
  },
  {
    id: 3,
    kicker: 'Pertanyaan 03',
    question: 'Command Laravel mana yang paling sering kamu ketik sampai hafal di luar kepala?',
    options: [
      { id: '3a', label: 'php artisan serve (ritual wajib tiap pagi!)', trait: 'artisan' },
      { id: '3b', label: 'php artisan make:controller atau make:model.', trait: 'webphp' },
      { id: '3c', label: 'php artisan migrate:fresh — jurus pamungkas pas tabel ngaco.', trait: 'survivor' },
      { id: '3d', label: 'composer install / php artisan route:list buat ngecek.', trait: 'blade' },
    ],
  },
  {
    id: 4,
    kicker: 'Pertanyaan 04',
    question: 'Urusan XAMPP & phpMyAdmin (nyalain Apache/MySQL, port bentrok, atau bikin database), biasanya kamu gimana?',
    options: [
      { id: '4a', label: 'Langsung buka localhost/phpmyadmin buat ngecek tabel & relasinya.', trait: 'webphp' },
      { id: '4b', label: 'Klik Start Apache & MySQL sambil berdoa semoga nggak merah.', trait: 'artisan' },
      { id: '4c', label: 'Cek .env dulu biar konek sebelum lanjut ngerapihin tampilan Blade.', trait: 'blade' },
      { id: '4d', label: 'Gatau deh pusing ngurusinnya.', trait: 'survivor' },
    ],
  },
  {
    id: 5,
    kicker: 'Pertanyaan 05',
    question: 'Abis kelar project Laravel ini, hal apa yang paling bakal kamu inget?',
    options: [
      { id: '5a', label: 'Serunya ngerapihin tampilan Blade & CSS yang suka geser.', trait: 'blade' },
      { id: '5b', label: 'Momen lega pas CRUD akhirnya beneran kesimpan ke database.', trait: 'artisan' },
      { id: '5c', label: 'Ketawa bareng pas ada yang kena 419 atau typo nama kolom.', trait: 'webphp' },
      { id: '5d', label: 'Hmm seru, tapi sebenernya yang bikin seru temen-temennya sih.', trait: 'survivor' },
    ],
  },
];

export const QUIZ_PERSONAS: Record<QuizPersona['trait'], QuizPersona> = {
  artisan: {
    trait: 'artisan',
    title: 'Si Anak Artisan',
    subtitle: 'Sahabat setia terminal & php artisan migrate',
    description:
      'Kamu tipe yang selalu siap buka terminal, ngecek migration satu-satu, dan ngerasain bahagianya liat data akhirnya beneran masuk database.',
    commitTag: 'php artisan make:memory --with-friends',
  },
  webphp: {
    trait: 'webphp',
    title: 'Penjaga routes/web.php',
    subtitle: 'Pawang 404 & pengarah jalan Controller',
    description:
      'Kamu tau persis paniknya pas URL error 404, tapi juga paling cepet nemuin typo kecil di route atau nama method controller.',
    commitTag: "Route::get('/makasih-semuanya', [ClassController::class, 'forever']);",
  },
  blade: {
    trait: 'blade',
    title: 'Master of @csrf & Blade',
    subtitle: 'Penyelamat form 419 & layout yang geser',
    description:
      'Dari @extends sampai @foreach, kamu telaten banget ngerapihin tampilan biar nggak cuma jalan logic-nya, tapi enak juga dilihat.',
    commitTag: "@include('kenangan.terbaik')",
  },
  survivor: {
    trait: 'survivor',
    title: 'Laravel 10-Day Survivor',
    subtitle: 'Dari bingung struktur folder sampai jadi project!',
    description:
      'Kamu lewatin semuanya—bingung MVC hari pertama, drama error merah, sampai senyum puas pas demo day. Bangga sama progressmu!',
    commitTag: 'git commit -m "survived laravel together ♡"',
  },
};
