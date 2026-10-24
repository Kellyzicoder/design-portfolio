export default {
  name: 'section',
  title: 'Section',
  type: 'document',
  fields: [
    { name: 'title', title: 'Name', type: 'string', description: 'e.g. "Weddings" or "Easter"', validation: (R) => R.required() },
    {
      name: 'key',
      title: 'Short ID',
      type: 'slug',
      description: 'Click Generate. Posters are linked by this, so avoid changing it after you add posters.',
      options: { source: 'title', maxLength: 40 },
      validation: (R) => R.required(),
    },
    {
      name: 'parent',
      title: 'Put inside another section (optional)',
      type: 'reference',
      to: [{ type: 'section' }],
      description: 'e.g. put "Easter" inside "Church Flyers". Leave empty for a main section.',
      options: {
        // only main sections, and not itself
        filter: ({ document }) => ({
          filter: '!defined(parent) && _id != $id',
          params: { id: (document._id || '').replace(/^drafts\./, '') },
        }),
      },
    },
    { name: 'order', title: 'Order (optional)', type: 'number', description: 'Lower numbers show first.' },
  ],
  preview: {
    select: { title: 'title', parent: 'parent.title' },
    prepare: ({ title, parent }) => ({ title, subtitle: parent ? `Inside ${parent}` : 'Main section' }),
  },
};
