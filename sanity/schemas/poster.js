import { SECTION_OPTIONS } from '../../lib/sections';

export default {
  name: 'poster',
  title: 'Poster',
  type: 'document',
  fields: [
    {
      name: 'image',
      title: 'Poster image',
      type: 'image',
      description: 'Upload the finished PNG or JPG.',
      validation: (R) => R.required(),
    },
    {
      name: 'section',
      title: 'Section',
      type: 'string',
      options: { list: SECTION_OPTIONS, layout: 'radio' },
      validation: (R) => R.required(),
    },
    {
      name: 'title',
      title: 'Title (optional)',
      type: 'string',
      description: 'Shown when someone opens the poster.',
    },
    {
      name: 'order',
      title: 'Order (optional)',
      type: 'number',
      description: 'Lower numbers show first. Leave empty to show newest first.',
    },
  ],
  preview: {
    select: { title: 'title', section: 'section', media: 'image' },
    prepare({ title, section, media }) {
      const s = SECTION_OPTIONS.find((o) => o.value === section);
      return { title: title || 'Untitled poster', subtitle: s ? s.title : 'No section', media };
    },
  },
};
