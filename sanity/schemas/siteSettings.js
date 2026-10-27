export default {
  name: 'siteSettings',
  title: 'Site text & links',
  type: 'document',
  groups: [
    { name: 'top', title: 'Top of page', default: true },
    { name: 'about', title: 'About' },
    { name: 'links', title: 'Contact & YouTube' },
  ],
  fields: [
    { name: 'headline', title: 'Big headline', type: 'string', group: 'top' },
    { name: 'subline', title: 'Line under the headline', type: 'text', rows: 2, group: 'top' },
    { name: 'buttonText', title: 'Button text', type: 'string', group: 'top' },
    {
      name: 'startPoster',
      title: 'First design (shown big before the zoom out)',
      type: 'reference',
      to: [{ type: 'poster' }],
      description: 'A wide banner looks best here.',
      group: 'top',
    },
    { name: 'statement', title: 'Hello line', type: 'string', group: 'top' },
    { name: 'statementSoft', title: 'Hello line (grey part)', type: 'string', group: 'top' },

    { name: 'aboutTitle', title: 'About heading', type: 'string', group: 'about' },
    { name: 'aboutText', title: 'About text', type: 'text', rows: 6, description: 'Leave an empty line between paragraphs.', group: 'about' },
    { name: 'location', title: 'Based in', type: 'string', group: 'about' },
    { name: 'education', title: 'Education', type: 'string', group: 'about' },

    { name: 'contactHeading', title: 'Contact heading', type: 'string', group: 'links' },
    { name: 'email', title: 'Email', type: 'string', description: 'Shown in the Contact section. People can tap it to email you.', group: 'links' },
    { name: 'fiverrUrl', title: 'Fiverr link', type: 'url', group: 'links' },
    { name: 'youtubeUrl', title: 'YouTube channel link', type: 'url', group: 'links' },
    { name: 'featuredVideoUrl', title: 'Pin a YouTube video (optional)', type: 'url', description: 'Leave empty to always show your newest video. Paste a video link to show that one first instead.', group: 'links' },
    { name: 'featuredVideoTitle', title: 'YouTube section heading', type: 'string', description: 'e.g. "Watch me design."', group: 'links' },
    { name: 'youtubeChannelId', title: 'YouTube channel ID (advanced)', type: 'string', description: 'Starts with UC. Only change this if you move to a different channel.', group: 'links' },
  ],
  preview: { prepare: () => ({ title: 'Site text & links' }) },
};
