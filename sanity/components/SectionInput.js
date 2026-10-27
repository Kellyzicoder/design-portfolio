'use client';

import { useEffect, useState } from 'react';
import { set, unset, useClient } from 'sanity';
import { Card, Flex, Radio, Spinner, Stack, Text } from '@sanity/ui';
import { fetchSections, buildTree, pickable, seedSectionsIfEmpty } from '../../lib/sectionTree';

// The list of sections comes from the CMS, so new sections show up here straight away.
export function useSectionOptions() {
  const client = useClient({ apiVersion: '2024-10-01' });
  const [options, setOptions] = useState(null);
  useEffect(() => {
    let alive = true;
    const load = async () => {
      await seedSectionsIfEmpty(client).catch(() => {});
      const list = await fetchSections(client);
      if (alive) setOptions(pickable(buildTree(list)));
    };
    load();
    // refresh when sections are added, renamed or removed
    const sub = client.listen('*[_type == "section"]').subscribe(() => setTimeout(load, 800));
    return () => { alive = false; sub.unsubscribe(); };
  }, [client]);
  return options;
}

export default function SectionInput({ value, onChange, readOnly }) {
  const options = useSectionOptions();
  if (!options) return <Flex padding={3} justify="center"><Spinner muted /></Flex>;
  const known = options.some((o) => o.value === value);
  return (
    <Card padding={3} radius={2} border>
      <Stack space={3}>
        {options.map((o) => (
          <Flex key={o.value} as="label" align="center" gap={3} style={{ cursor: readOnly ? 'default' : 'pointer' }}>
            <Radio checked={value === o.value} readOnly={readOnly} onChange={() => onChange(set(o.value))} />
            <Text>{o.title}</Text>
          </Flex>
        ))}
        {value && !known && (
          <Flex align="center" gap={3}>
            <Text size={1} muted>This poster is in “{value}”, which no longer exists. Pick a section above.</Text>
          </Flex>
        )}
        {value && !readOnly && (
          <Text size={1} muted>
            <a href="#" onClick={(e) => { e.preventDefault(); onChange(unset()); }}>Clear</a>
          </Text>
        )}
      </Stack>
    </Card>
  );
}
