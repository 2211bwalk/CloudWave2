export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
  cover?: string;
}

export const PLAYLIST: Track[] = [
  {
    id: 'track-1',
    title: "This Feels Like Paradise (Remix)",
    artist: "CloudWave Artist",
    url: "https://res.cloudinary.com/dsw3jfgdy/video/upload/q_auto/f_auto/v1775620641/This_Feels_Like_Paradise_Remix_pwqthf.mp3",
    duration: 225
  },
  {
    id: 'track-2',
    title: "Sweet Heat",
    artist: "CloudWave Artist",
    url: "https://res.cloudinary.com/dsw3jfgdy/video/upload/q_auto/f_auto/v1776369449/Sweet_Heat_cy25fc.mp3",
    duration: 180
  },
  {
    id: 'track-3',
    title: "Flawless",
    artist: "CloudWave Artist",
    url: "https://res.cloudinary.com/dsw3jfgdy/video/upload/q_auto/f_auto/v1776369464/Flawless_ke0iqd.mp3",
    duration: 195
  },
  {
    id: 'track-4',
    title: "Where I Need To Be",
    artist: "CloudWave Artist",
    url: "https://res.cloudinary.com/dsw3jfgdy/video/upload/q_auto/f_auto/v1776369484/Where_I_Need_To_Be_nd6ez1.mp3",
    duration: 210
  },
  {
    id: 'track-5',
    title: "Baskin Robbins",
    artist: "CloudWave Artist",
    url: "https://res.cloudinary.com/dsw3jfgdy/video/upload/q_auto/f_auto/v1776369505/Baskin_Robbins_bu5vlm.mp3",
    duration: 165
  },
  {
    id: 'track-6',
    title: "What If",
    artist: "CloudWave Artist",
    url: "https://res.cloudinary.com/dsw3jfgdy/video/upload/q_auto/f_auto/v1776370685/What_If_awapz6.mp3",
    duration: 192
  },
  {
    id: 'track-7',
    title: "After Party",
    artist: "CloudWave Artist",
    url: "https://res.cloudinary.com/dsw3jfgdy/video/upload/q_auto/f_auto/v1776371188/After_Party_flx2vu.mp3",
    duration: 204
  },
  {
    id: 'track-8',
    title: "Shake That Body",
    artist: "CloudWave Artist",
    url: "https://res.cloudinary.com/dsw3jfgdy/video/upload/q_auto/f_auto/v1776371221/Shake_That_Body_zgthmp.mp3",
    duration: 188
  },
  {
    id: 'track-9',
    title: "Aura",
    artist: "CloudWave Artist",
    url: "https://res.cloudinary.com/dsw3jfgdy/video/upload/q_auto/f_auto/v1776371261/Aura_jgwmxv.mp3",
    duration: 215
  },
  {
    id: 'track-10',
    title: "The Pioneer",
    artist: "CloudWave Artist",
    url: "https://res.cloudinary.com/dsw3jfgdy/video/upload/q_auto/f_auto/v1776371293/Pioneer_ngadbd.mp3",
    duration: 197
  },
  {
    id: 'track-11',
    title: "What Do You Want",
    artist: "CloudWave Artist",
    url: "https://res.cloudinary.com/dsw3jfgdy/video/upload/q_auto/f_auto/v1776371310/What_Do_You_Want_uzz44u.mp3",
    duration: 182
  },
  {
    id: 'track-12',
    title: "Sweetie Pie",
    artist: "CloudWave Artist",
    url: "https://res.cloudinary.com/dsw3jfgdy/video/upload/q_auto/f_auto/v1776371329/Sweetie_Pie_lmck1e.mp3",
    duration: 175
  }
];
