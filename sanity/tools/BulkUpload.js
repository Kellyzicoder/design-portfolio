'use client';

import { useCallback, useRef, useState } from 'react';
import { useClient } from 'sanity';
import { Box, Button, Card, Flex, Grid, Heading, Select, Stack, Text } from '@sanity/ui';
import { SECTION_OPTIONS } from '../../lib/sections';

const MAX_MB = 20;
const AT_ONCE = 3; // how many uploads run at the same time

/*
  "Bulk upload" page in /studio:
  drag in many posters, pick one section, click Upload.
  Each image becomes its own published poster.
*/
export default function BulkUpload() {
  const client = useClient({ apiVersion: '2024-10-01' });
  const [items, setItems] = useState([]); // { id, file, preview, status: 'ready'|'uploading'|'done'|'error', error }
  const [section, setSection] = useState('');
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const addFiles = useCallback((fileList) => {
    const next = Array.from(fileList)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
        status: file.size > MAX_MB * 1024 * 1024 ? 'error' : 'ready',
        error: file.size > MAX_MB * 1024 * 1024 ? `Bigger than ${MAX_MB} MB` : '',
      }));
    setItems((prev) => [...prev, ...next]);
  }, []);

  const setStatus = (id, patch) => setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const remove = (id) => setItems((prev) => prev.filter((it) => it.id !== id));

  async function uploadOne(it) {
    setStatus(it.id, { status: 'uploading', error: '' });
    try {
      const asset = await client.assets.upload('image', it.file, { filename: it.file.name });
      await client.create({
        _type: 'poster',
        section,
        image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
      });
      setStatus(it.id, { status: 'done' });
    } catch (e) {
      setStatus(it.id, { status: 'error', error: e && e.message ? e.message : 'Upload failed' });
    }
  }

  async function uploadAll() {
    const queue = items.filter((it) => it.status === 'ready' || (it.status === 'error' && it.error !== `Bigger than ${MAX_MB} MB`));
    if (!section || !queue.length) return;
    setBusy(true);
    let i = 0;
    const worker = async () => { while (i < queue.length) { const it = queue[i++]; await uploadOne(it); } };
    await Promise.all(Array.from({ length: Math.min(AT_ONCE, queue.length) }, worker));
    setBusy(false);
  }

  const clearDone = () => setItems((prev) => prev.filter((it) => it.status !== 'done'));

  const ready = items.filter((it) => it.status === 'ready').length;
  const done = items.filter((it) => it.status === 'done').length;
  const failed = items.filter((it) => it.status === 'error').length;
  const sectionName = (SECTION_OPTIONS.find((o) => o.value === section) || {}).title;

  return (
    <Box padding={4} style={{ maxWidth: 1100, margin: '0 auto' }}>
      <Stack space={5}>
        <Stack space={3}>
          <Heading size={3}>Bulk upload posters</Heading>
          <Text muted>Drop in as many posters as you like, choose their section, then click Upload. Each one goes live on your site within about a minute.</Text>
        </Stack>

        <Card padding={4} radius={3} shadow={1}>
          <Stack space={3}>
            <Text weight="semibold">1. Section for these posters</Text>
            <Select value={section} onChange={(e) => setSection(e.currentTarget.value)} disabled={busy}>
              <option value="">Choose a section…</option>
              {SECTION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.title}</option>)}
            </Select>
            <Text size={1} muted>Uploading posters for different sections? Do one section at a time.</Text>
          </Stack>
        </Card>

        <Card
          padding={5}
          radius={3}
          border
          tone={dragOver ? 'primary' : 'default'}
          style={{ borderStyle: 'dashed', borderWidth: 2, textAlign: 'center', cursor: 'pointer' }}
          onClick={() => inputRef.current && inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        >
          <Stack space={3}>
            <Text weight="semibold">2. Drag posters here, or click to choose files</Text>
            <Text size={1} muted>PNG, JPG or WebP. Select many at once with Shift or Cmd.</Text>
          </Stack>
          <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
        </Card>

        {items.length > 0 && (
          <Stack space={4}>
            <Flex align="center" gap={3} wrap="wrap">
              <Button
                text={busy ? 'Uploading…' : `3. Upload ${ready || ''} to ${sectionName || '…'}`.replace('  ', ' ')}
                tone="primary"
                disabled={busy || !section || (!ready && !failed)}
                onClick={uploadAll}
              />
              {!section && <Text size={1} muted>Choose a section first.</Text>}
              <Text size={1} muted>{done} done · {ready} waiting{failed ? ` · ${failed} failed` : ''}</Text>
              {done > 0 && !busy && <Button mode="ghost" text="Clear finished" onClick={clearDone} />}
            </Flex>

            <Grid columns={[2, 3, 4, 6]} gap={3}>
              {items.map((it) => (
                <Card key={it.id} radius={2} border overflow="hidden" tone={it.status === 'error' ? 'critical' : it.status === 'done' ? 'positive' : 'default'}>
                  <div style={{ position: 'relative', aspectRatio: '3 / 4', background: '#0001' }}>
                    <img src={it.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: it.status === 'uploading' ? 0.5 : 1 }} />
                  </div>
                  <Box padding={2}>
                    <Flex align="center" justify="space-between" gap={2}>
                      <Text size={0} muted textOverflow="ellipsis">
                        {it.status === 'ready' && 'Ready'}
                        {it.status === 'uploading' && 'Uploading…'}
                        {it.status === 'done' && 'Uploaded ✓'}
                        {it.status === 'error' && (it.error || 'Failed')}
                      </Text>
                      {(it.status === 'ready' || it.status === 'error') && !busy && (
                        <Button mode="bleed" fontSize={0} padding={1} text="Remove" onClick={() => remove(it.id)} />
                      )}
                    </Flex>
                  </Box>
                </Card>
              ))}
            </Grid>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
