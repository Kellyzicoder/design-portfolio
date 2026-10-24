'use client';

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import poster from './sanity/schemas/poster';
import siteSettings from './sanity/schemas/siteSettings';
import testimonial from './sanity/schemas/testimonial';
import BulkUpload from './sanity/tools/BulkUpload';
import { UploadIcon } from '@sanity/icons';
import { SECTION_OPTIONS } from './lib/sections';
import { projectId, dataset } from './lib/sanity';

export default defineConfig({
  name: 'default',
  title: 'Kelvin Mensah',
  basePath: '/studio',
  projectId,
  dataset,
  schema: {
    types: [poster, siteSettings, testimonial],
    // there is only one "Site text & links" document
    templates: (prev) => prev.filter((t) => t.schemaType !== 'siteSettings'),
  },
  document: {
    actions: (prev, ctx) =>
      ctx.schemaType === 'siteSettings'
        ? prev.filter((a) => !['duplicate', 'delete', 'unpublish'].includes(a.action))
        : prev,
  },
  // extra page in the top bar of /studio
  tools: (prev) => [...prev, { name: 'bulk-upload', title: 'Bulk upload', icon: UploadIcon, component: BulkUpload }],
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Site text & links')
              .id('siteSettings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            S.divider(),
            S.documentTypeListItem('poster').title('All posters'),
            S.listItem()
              .title('Posters by section')
              .child(
                S.list()
                  .title('Sections')
                  .items(
                    SECTION_OPTIONS.map((o) =>
                      S.listItem()
                        .id(o.value)
                        .title(o.title)
                        .child(
                          S.documentList()
                            .title(o.title)
                            .schemaType('poster')
                            .filter('_type == "poster" && section == $s')
                            .params({ s: o.value })
                            .initialValueTemplates([])
                        )
                    )
                  )
              ),
            S.divider(),
            S.documentTypeListItem('testimonial').title('Testimonials'),
          ]),
    }),
  ],
});
