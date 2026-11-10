import { SECTION_OPTIONS } from '../../lib/sections';
import SectionInput from '../components/SectionInput';
import { nameFromFile } from '../../lib/fileName';

export default {
  name: 'poster',
  title: 'Poster',
  type: 'document',
  fieldsets: [
    {
      name: 'story',
      title: 'Caption (the story behind this design)',
      description: 'Shown next to the design when someone opens it. Leave empty to show no caption. Brief, My role, Process and Tools. 1–3 short sentences each is plenty.',
      options: { collapsible: true, collapsed: false },
    },
  ],
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
      name: 'more',
      title: 'More images from this project',
      type: 'array',
      of: [{
        type: 'image',
        fields: [{ name: 'label', title: 'Label (optional)', type: 'string', description: 'e.g. Colour palette, Moodboard, Bottle mockup' }],
      }],
      options: { layout: 'grid' },
      description: 'Optional. Add the other flyers, mockups, moodboard or colour palette from the same event or logo. Click an image to give it a label. The main image above shows in the grid; people can flip through these when they open it.',
    },
    {
      name: 'brief',
      title: 'Brief',
      type: 'text',
      rows: 3,
      fieldset: 'story',
      description: 'Who it was for and what they needed. e.g. "A countdown series to build excitement for International Sunday on Instagram."',
    },
    {
      name: 'work',
      title: 'My role',
      type: 'text',
      rows: 3,
      fieldset: 'story',
      description: 'Your part: concept, layout, type, colours, photo editing, sizes you delivered.',
    },
    {
      name: 'process',
      title: 'Process',
      type: 'text',
      rows: 3,
      fieldset: 'story',
      description: 'How it changed from first idea to final: feedback, choices you made and why, the result.',
    },
    {
      name: 'tools',
      title: 'Tools',
      type: 'string',
      fieldset: 'story',
      description: 'e.g. Photoshop',
    },
    {
      name: 'onWall',
      title: 'Show in the opening wall',
      type: 'boolean',
      description: 'Tick the designs you want in the moving wall at the top of the site. If none are ticked, every design is used.',
      initialValue: false,
    },
    {
      name: 'featured',
      title: 'Show in Featured (Work section)',
      type: 'boolean',
      description: 'Featured is the first tab people see in Work. Tick your best pieces. If none are ticked, a mix of every section is shown.',
      initialValue: false,
    },
    {
      name: 'order',
      title: 'Order (optional)',
      type: 'number',
      description: 'Lower numbers show first. Leave empty to show newest first.',
    },
  ],
  preview: {
    select: { title: 'title', file: 'image.asset.originalFilename', section: 'section', media: 'image', onWall: 'onWall', featured: 'featured' },
    prepare({ title, file, section, media, onWall, featured }) {
      // custom sections show their short ID, e.g. "weddings" -> "Weddings"
      const s = SECTION_OPTIONS.find((o) => o.value === section);
      const label = s ? s.title : section ? section.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase()) : 'No section';
      return { title: title || nameFromFile(file) || 'Untitled poster', subtitle: [label, featured && 'featured', onWall && 'on wall'].filter(Boolean).join(' · '), media };
    },
  },
};
