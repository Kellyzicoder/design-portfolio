import { SECTION_OPTIONS } from '../../lib/sections';
import SectionInput from '../components/SectionInput';
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
      description: 'Add new sections under "Sections" in the left menu.',
      components: { input: SectionInput },
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
      // custom sections show their short ID, e.g. "weddings" -> "Weddings"
      const s = SECTION_OPTIONS.find((o) => o.value === section);
      const label = s ? s.title : section ? section.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase()) : 'No section';
      return { title: title || nameFromFile(file) || 'Untitled poster', subtitle: label, media };
    },
  },
};
