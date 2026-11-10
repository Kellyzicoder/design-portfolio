// Uses the same field names as the testimonial already saved in this Sanity project
// (name, company, feedback, image), so old and new ones work the same way.
export default {
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string', validation: (R) => R.required() },
    { name: 'company', title: 'Church, business or role', type: 'string', description: 'e.g. "First Love Church" or "Bride, March 2026"' },
    { name: 'feedback', title: 'What they said', type: 'text', rows: 4, validation: (R) => R.required() },
    {
      name: 'source',
      title: 'Where is this review from?',
      type: 'string',
      options: { list: [{ title: 'Fiverr', value: 'fiverr' }, { title: 'Google', value: 'google' }, { title: 'Direct (message, email, in person)', value: 'direct' }], layout: 'radio' },
      initialValue: 'direct',
      description: 'Fiverr and Google show a small badge on the review.',
    },
    { name: 'rating', title: 'Stars (optional)', type: 'number', options: { list: [5, 4, 3, 2, 1] }, description: 'Shows as stars on the review.' },
    { name: 'date', title: 'Date (optional)', type: 'date', description: 'When they left the review. Shows as month and year.' },
    { name: 'link', title: 'Link to the review (optional)', type: 'url', description: 'e.g. your Fiverr profile, so people can check it.' },
    { name: 'image', title: 'Photo (optional)', type: 'image', options: { hotspot: true } },
    {
      name: 'showOnDesignSite',
      title: 'Show on my design portfolio',
      type: 'boolean',
      description: 'Turn off to hide it from kelvstudio.vercel.app without deleting it.',
      initialValue: true,
    },
    { name: 'order', title: 'Order (optional)', type: 'number', description: 'Lower numbers show first.' },
  ],
  preview: {
    select: { title: 'name', subtitle: 'company', media: 'image', on: 'showOnDesignSite' },
    prepare: ({ title, subtitle, media, on }) => ({
      title,
      subtitle: `${subtitle || ''}${on ? '' : ' (hidden on design site)'}`.trim(),
      media,
    }),
  },
};
