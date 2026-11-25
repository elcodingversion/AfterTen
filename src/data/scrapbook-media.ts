export interface ScrapbookPhotoEntry {
  id: number;
  mediaUrl: string;
}

export interface ScrapbookVideoEntry {
  id: number;
  mediaUrl: string | null;
  thumbnailUrl: string;
}

export interface BackgroundMusicConfig {
  src: string;
  title: string;
}

/**
 * Daftar 8 foto dokumentasi di folder public/media/photos/
 */
export const SCRAPBOOK_PHOTOS: ScrapbookPhotoEntry[] = [
  { id: 1, mediaUrl: '/media/photos/1.jpeg' },
  { id: 2, mediaUrl: '/media/photos/2.jpeg' },
  { id: 3, mediaUrl: '/media/photos/3.jpeg' },
  { id: 4, mediaUrl: '/media/photos/4.jpeg' },
  { id: 5, mediaUrl: '/media/photos/5.jpeg' },
  { id: 6, mediaUrl: '/media/photos/6.jpeg' },
  { id: 7, mediaUrl: '/media/photos/7.jpeg' },
  { id: 8, mediaUrl: '/media/photos/8.jpeg' },
];

/**
 * Daftar 2 video dokumentasi di folder public/media/videos/
 */
export const SCRAPBOOK_VIDEOS: ScrapbookVideoEntry[] = [
  {
    id: 101,
    mediaUrl: '/media/videos/vid1.mp4',
    thumbnailUrl: '/media/photos/1.jpeg',
  },
  {
    id: 102,
    mediaUrl: '/media/videos/vid2.mp4',
    thumbnailUrl: '/media/photos/2.jpeg',
  },
];

/**
 * Musik latar dari folder public/media/music/bgm.mp3
 */
export const BACKGROUND_MUSIC: BackgroundMusicConfig = {
  src: '/media/music/bgm.mp3',
  title: 'our ten days soundtrack',
};
