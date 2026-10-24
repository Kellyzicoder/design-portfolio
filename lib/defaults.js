// Used until content is added in the CMS (/studio).
// Once the CMS has posters, the site shows those instead of these.

export const DEFAULT_SETTINGS = {
  headline: 'Flyers with impact. Designed to be seen.',
  subline: 'Graphic design by Kelvin Mensah: church flyers, birthday flyers, social media posts and banners.',
  buttonText: 'See my work',
  statement: 'I design flyers that get people in the room.',
  statementSoft: 'Church services, birthdays, events and everything in between.',
  aboutTitle: 'Designer by craft. Developer by degree.',
  aboutText:
    "I'm Kelvin Mensah, a graphic designer in Auckland, New Zealand. Most of my work is flyers and posters for church programmes, birthdays and social media.\n\nI also studied Computer Science at the University of Auckland, so I build websites too, including this one.",
  location: 'Auckland, New Zealand',
  education: 'Computer Science, University of Auckland',
  contactHeading: "Let's make your next flyer.",
  telegramName: 'Creative Cloud',
  telegramUrl: '',
  fiverrUrl: '',
  youtubeUrl: 'https://www.youtube.com/@kelvstudio_',
  featuredVideoUrl: '',
  featuredVideoTitle: '',
};

// width ÷ height of the starter poster files in /public/posters
const ASPECT = {1:.747,2:.703,3:.567,4:.566,5:.565,6:.606,7:.801,8:.564,9:.563,10:.754,11:1.783,12:1.770,13:1.773,14:.551,15:.563,16:.749,17:.805,18:.560,19:.804,20:1.616};
const SORT = {
  birthday: [7, 17],
  parents: [2],
  international: [3, 4, 5],
  social: [14, 15, 1, 6, 8, 9, 10, 16, 18, 19],
  banners: [11, 12, 13, 20],
};

export const LOCAL_POSTERS = Object.entries(SORT).flatMap(([section, nums]) =>
  nums.map((n) => ({ id: `local-${n}`, title: `Design ${n}`, section, url: `/posters/${n}.webp`, aspect: ASPECT[n] }))
);
export const LOCAL_START = LOCAL_POSTERS.find((p) => p.id === 'local-13');
