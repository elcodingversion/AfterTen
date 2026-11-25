export interface SeedMemory {
  title: string;
  description: string;
  dayNumber: number | null;
  section: 'timeline' | 'gallery' | 'video' | 'behind_screen';
  mediaType: 'photo' | 'video' | 'reel';
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  momentNote: string | null;
  aspectHint: 'landscape' | 'portrait' | 'square' | 'wide';
  sortOrder: number;
}

export const INITIAL_MEMORIES: SeedMemory[] = [
  // Winding story milestones (Dokumentasi Kita — flexible count, not locked to 10!)
  {
    title: 'Awal Kenalan & artisan serve',
    description: 'Buka project Laravel pertama kali dan bingung liat foldernya yang banyak banget.',
    dayNumber: 1,
    section: 'timeline',
    mediaType: 'photo',
    mediaUrl: '/src/assets/images/welcome_desk_notebook_1795593743275.jpg',
    thumbnailUrl: '/src/assets/images/welcome_desk_notebook_1795593743275.jpg',
    momentNote: 'php artisan serve',
    aspectHint: 'landscape',
    sortOrder: 1,
  },
  {
    title: 'Drama Route, Blade & Kopi',
    description: 'Kenalan sama web.php, @csrf, dan es kopi yang nemenin tiap error 419 muncul.',
    dayNumber: 2,
    section: 'timeline',
    mediaType: 'photo',
    mediaUrl: '/src/assets/images/memory_coffee_break_1795593743814.jpg',
    thumbnailUrl: '/src/assets/images/memory_coffee_break_1795593743814.jpg',
    momentNote: '@csrf jangan sampai lupa',
    aspectHint: 'portrait',
    sortOrder: 2,
  },
  {
    title: 'Ngulik CRUD & Debug Bareng',
    description: 'Momen lega sekelas pas data form akhirnya berhasil kesimpan ke database.',
    dayNumber: 3,
    section: 'timeline',
    mediaType: 'photo',
    mediaUrl: '/src/assets/images/memory_debugging_together_1795593743842.jpg',
    thumbnailUrl: '/src/assets/images/memory_debugging_together_1795593743842.jpg',
    momentNote: 'dd($request->all());',
    aspectHint: 'landscape',
    sortOrder: 3,
  },
  {
    title: 'Demo Day & Tepuk Tangan',
    description: 'Presentasi hasil project masing-masing dan sadar sepuluh hari kerasa cepet banget.',
    dayNumber: 4,
    section: 'timeline',
    mediaType: 'photo',
    mediaUrl: '/src/assets/images/memory_team_showcase_1795593745010.jpg',
    thumbnailUrl: '/src/assets/images/memory_team_showcase_1795593745010.jpg',
    momentNote: 'Proud of everyone!',
    aspectHint: 'wide',
    sortOrder: 4,
  },

  // Foto Dokumentasi
  {
    title: 'Meja Pagi Sebelum Mulai',
    description: 'Buku sketsa masih bersih dan kopi hangat sebelum terminal dibuka.',
    dayNumber: null,
    section: 'gallery',
    mediaType: 'photo',
    mediaUrl: '/src/assets/images/welcome_desk_notebook_1795593743275.jpg',
    thumbnailUrl: '/src/assets/images/welcome_desk_notebook_1795593743275.jpg',
    momentNote: 'Ganti dengan foto dokumentasi asli nanti',
    aspectHint: 'landscape',
    sortOrder: 1,
  },
  {
    title: 'Suasana Kelas Sore',
    description: 'Lagi serius nyimak penjelasan sambil sesekali lirik layar sebelah.',
    dayNumber: null,
    section: 'gallery',
    mediaType: 'photo',
    mediaUrl: '/src/assets/images/memory_coding_class_1795593742824.jpg',
    thumbnailUrl: '/src/assets/images/memory_coding_class_1795593742824.jpg',
    momentNote: 'Ganti dengan foto dokumentasi asli nanti',
    aspectHint: 'wide',
    sortOrder: 2,
  },
  {
    title: 'Es Kopi & Sticky Notes',
    description: 'Starter pack paling setia buat nemenin migrasi tabel database.',
    dayNumber: null,
    section: 'gallery',
    mediaType: 'photo',
    mediaUrl: '/src/assets/images/memory_coffee_break_1795593743814.jpg',
    thumbnailUrl: '/src/assets/images/memory_coffee_break_1795593743814.jpg',
    momentNote: 'Ganti dengan foto dokumentasi asli nanti',
    aspectHint: 'portrait',
    sortOrder: 3,
  },
  {
    title: 'Nge-debug Bareng',
    description: 'Dua kepala nyariin satu titik koma yang nyelip di controller.',
    dayNumber: null,
    section: 'gallery',
    mediaType: 'photo',
    mediaUrl: '/src/assets/images/memory_debugging_together_1795593743842.jpg',
    thumbnailUrl: '/src/assets/images/memory_debugging_together_1795593743842.jpg',
    momentNote: 'Ganti dengan foto dokumentasi asli nanti',
    aspectHint: 'square',
    sortOrder: 4,
  },
  {
    title: 'Senyum Pas Demo Day',
    description: 'Akhirnya project-nya jalan lancar pas dipresentasiin!',
    dayNumber: null,
    section: 'gallery',
    mediaType: 'photo',
    mediaUrl: '/src/assets/images/memory_team_showcase_1795593745010.jpg',
    thumbnailUrl: '/src/assets/images/memory_team_showcase_1795593745010.jpg',
    momentNote: 'Ganti dengan foto dokumentasi asli nanti',
    aspectHint: 'wide',
    sortOrder: 5,
  },

  // Video Dokumentasi
  {
    title: 'Klip Suasana Kelas',
    description: 'Potongan video singkat pas semua lagi fokus ngulik bareng.',
    dayNumber: null,
    section: 'video',
    mediaType: 'reel',
    mediaUrl: null,
    thumbnailUrl: '/src/assets/images/memory_coding_class_1795593742824.jpg',
    momentNote: '00:18 · Tambahin link video asli di Owner corner',
    aspectHint: 'wide',
    sortOrder: 1,
  },
  {
    title: 'Momen Demo Day',
    description: 'Dokumentasi tepuk tangan dan senyum lega setelah presentasi.',
    dayNumber: null,
    section: 'video',
    mediaType: 'reel',
    mediaUrl: null,
    thumbnailUrl: '/src/assets/images/memory_team_showcase_1795593745010.jpg',
    momentNote: '00:24 · Tambahin link video asli di Owner corner',
    aspectHint: 'wide',
    sortOrder: 2,
  },
];

export interface LittleThingItem {
  id: string;
  text: string;
  context: string;
}

export const LITTLE_THINGS_ITEMS: LittleThingItem[] = [
  {
    id: 'lt-1',
    text: '“Lupa @csrf lagi kan... pantesan 419.”',
    context: 'Momen klasik tiap bikin form Laravel',
  },
  {
    id: 'lt-2',
    text: '“Jangan disentuh dulu—ini lagi jalan tapi aku nggak tau kenapa.”',
    context: 'Celetukan jam 15.45',
  },
  {
    id: 'lt-3',
    text: '“Coba php artisan migrate:fresh dulu deh.”',
    context: 'Solusi pas kolom database udah beda arah',
  },
  {
    id: 'lt-4',
    text: '“Eh kok di laptopku rapi, di proyektor geser ya?”',
    context: 'Kejutan pas presentasi',
  },
  {
    id: 'lt-5',
    text: 'Patungan colokan, snack, sama kabel charger udah berasa keluarga kecil.',
    context: 'Ruang kelas Disnaker',
  },
  {
    id: 'lt-6',
    text: '“Pelan-pelan aja, yang penting paham alur MVC-nya.”',
    context: 'Kalimat paling nenangin di kelas',
  },
];
