'use client';

import { useRef, useState } from 'react';
import { insert, setIfMissing, useClient } from 'sanity';
import { Button, Card, Flex, Stack, Text } from '@sanity/ui';

const key = () => Math.random().toString(36).slice(2, 12);

/*
  "More images from this project": adds an "Upload several images" button,
  so you can pick many files at once instead of one at a time.
  Each image is added to the end of the list (you can still drag to reorder and add labels).
*/
export default function MultiImageInput(props) {
  const { onChange, readOnly } = props;
  const client = useClient({ apiVersion: '2024-10-01' });
  const picker = useRef(null);
  const [status, setStatus] = useState('');

  async function onFiles(e) {
    const files = [...(e.target.files || [])].filter((f) => f.type.startsWith('image/'));
    e.target.value = '';
    if (!files.length) return;
    let done = 0, failed = 0;
    setStatus(`Uploading 0 of ${files.length}…`);
    // upload 3 at a time, keeping the order you picked them in
    const results = new Array(files.length);
    let next = 0;
    async function worker() {
      while (next < files.length) {
        const i = next++;
        try {
          const asset = await client.assets.upload('image', files[i], { filename: files[i].name });
          results[i] = asset;
        } catch {
          failed++;
        }
        done++;
        setStatus(`Uploading ${done} of ${files.length}…`);
      }
    }
    await Promise.all([worker(), worker(), worker()]);
    const items = results.filter(Boolean).map((a) => ({
      _type: 'image',
      _key: key(),
      asset: { _type: 'reference', _ref: a._id },
    }));
    if (items.length) onChange([setIfMissing([]), insert(items, 'after', [-1])]);
    setStatus(failed ? `Added ${items.length}. ${failed} could not be uploaded, please try those again.` : `Added ${items.length} image${items.length === 1 ? '' : 's'}.`);
    setTimeout(() => setStatus(''), 5000);
  }

  return (
    <Stack space={3}>
      {!readOnly && (
        <Card padding={3} radius={2} tone="primary" border>
          <Flex align="center" gap={3} wrap="wrap">
            <Button text="Upload several images" mode="ghost" tone="primary" onClick={() => picker.current && picker.current.click()} disabled={status.startsWith('Uploading')} />
            <Text size={1} muted>{status || 'Pick as many as you like. You can also drag several files onto the box below.'}</Text>
          </Flex>
          <input ref={picker} type="file" accept="image/*" multiple hidden onChange={onFiles} />
        </Card>
      )}
      {props.renderDefault(props)}
    </Stack>
  );
}
