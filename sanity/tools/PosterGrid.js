'use client';

import { useEffect, useMemo, useState } from 'react';
import { useClient } from 'sanity';
import { IntentLink } from 'sanity/router';
import { Box, Card, Flex, Grid, Heading, Select, Spinner, Stack, Text, TextInput } from '@sanity/ui';
import { useSectionOptions } from '../components/SectionInput';
import { nameFromFile } from '../../lib/fileName';

const QUERY = `*[_type == "poster" && defined(image.asset)] | order(coalesce(order, 999) asc, _createdAt desc){
  _id, title, section,
  "file": image.asset->originalFilename,
  "url": image.asset->url,
  "lqip": image.asset->metadata.lqip
}`;

/*
  "Poster grid" page in /studio:
  see every poster as a picture, filter by section or search by name,
  click one to open and edit it.
*/
export default function PosterGrid() {
  const client = useClient({ apiVersion: '2024-10-01' });
  const sections = useSectionOptions() || [];
  const [posters, setPosters] = useState(null);
  const [section, setSection] = useState('all');
  const [search, setSearch] = useState('');
  const [size, setSize] = useState('medium');

  useEffect(() => {
    let alive = true;
    const load = () => client.fetch(QUERY).then((r) => alive && setPosters(r));
    load();
    // keep the grid up to date while you edit or upload
    const sub = client.listen('*[_type == "poster"]').subscribe(() => setTimeout(load, 800));
    return () => { alive = false; sub.unsubscribe(); };
  }, [client]);

  const name = (p) => p.title || nameFromFile(p.file) || 'Untitled poster';
  const sectionTitle = (key) => (sections.find((o) => o.value === key) || {}).title || 'No section';

  const shown = useMemo(() => {
    if (!posters) return [];
    const q = search.trim().toLowerCase();
    return posters.filter((p) =>
      (section === 'all' || (section === 'none' ? !sections.some((o) => o.value === p.section) : p.section === section)) &&
      (!q || name(p).toLowerCase().includes(q))
    );
  }, [posters, section, search, sections]);

  const cols = size === 'small' ? [3, 4, 6, 8] : size === 'large' ? [1, 2, 3, 4] : [2, 3, 4, 6];
  const countIn = (key) => (posters || []).filter((p) => p.section === key).length;

  return (
    <Box padding={4} style={{ maxWidth: 1400, margin: '0 auto' }}>
      <Stack space={4}>
        <Flex align="flex-end" justify="space-between" gap={3} wrap="wrap">
          <Stack space={3}>
            <Heading size={3}>Poster grid</Heading>
            <Text muted>{posters ? `${shown.length} of ${posters.length} posters` : 'Loading…'} · click a poster to edit it</Text>
          </Stack>
          <Flex gap={2} wrap="wrap">
            <Box style={{ minWidth: 220 }}>
              <Select value={section} onChange={(e) => setSection(e.currentTarget.value)}>
                <option value="all">All sections</option>
                {sections.map((o) => <option key={o.value} value={o.value}>{o.title} ({countIn(o.value)})</option>)}
                <option value="none">No section / removed section</option>
              </Select>
            </Box>
            <Box style={{ minWidth: 200 }}>
              <TextInput placeholder="Search by name" value={search} onChange={(e) => setSearch(e.currentTarget.value)} />
            </Box>
            <Select value={size} onChange={(e) => setSize(e.currentTarget.value)} style={{ minWidth: 110 }}>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </Select>
          </Flex>
        </Flex>

        {!posters && <Flex justify="center" padding={6}><Spinner muted /></Flex>}
        {posters && shown.length === 0 && (
          <Card padding={5} radius={2} border><Text align="center" muted>No posters here yet.</Text></Card>
        )}

        <Grid columns={cols} gap={3}>
          {shown.map((p) => (
            <Card
              key={p._id}
              as={IntentLink}
              intent="edit"
              params={{ id: p._id, type: 'poster' }}
              radius={2}
              border
              overflow="hidden"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                style={{
                  aspectRatio: '3 / 4',
                  backgroundImage: p.lqip ? `url(${p.lqip})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <img
                  src={`${p.url}?w=${size === 'large' ? 600 : 360}&fm=webp&q=75`}
                  alt=""
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <Box padding={2}>
                <Stack space={2}>
                  <Text size={1} weight="semibold" textOverflow="ellipsis">{name(p)}</Text>
                  {section === 'all' && <Text size={0} muted textOverflow="ellipsis">{sectionTitle(p.section)}</Text>}
                </Stack>
              </Box>
            </Card>
          ))}
        </Grid>
      </Stack>
    </Box>
  );
}
