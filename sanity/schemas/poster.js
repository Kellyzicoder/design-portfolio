import { SECTION_OPTIONS } from '../../lib/sections';
import { nameFromFile } from '../../lib/fileName';

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
      description: 'Shown when someone opens the poster. Leave empty to use the file name.',
    },
    {
      name: 'order',
      title: 'Order (optional)',
      type: 'number',
      description: 'Lower numbers show first. Leave empty to show newest first.',
    },
  ],
  preview: {
    select: { title: 'title', file: 'image.asset.originalFilename', section: 'section', media: 'image' },
    prepare({ title, file, section, media }) {
      const s = SECTION_OPTIONS.find((o) => o.value === section);
      return { title: title || nameFromFile(file) || 'Untitled poster', subtitle: s ? s.title : 'No section', media };
    },
  },
};
