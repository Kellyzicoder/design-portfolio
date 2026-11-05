'use client';

import { useEffect, useRef } from 'react';
import { buildModel, createScene, dispose } from '@/lib/print3d';

// 3D preview on the Printing page: drag to turn the item, scroll or pinch to zoom.
export default function Print3D({ itemKey, designs }) {
  const box = useRef(null);
  const view = useRef(null);

  // set up the scene once
  useEffect(() => {
    view.current = createScene(box.current);
    return () => { view.current.destroy(); view.current = null; };
  }, []);

  // rebuild the model when the item or design changes
  useEffect(() => {
    let cancelled = false;
    buildModel(itemKey, designs).then((model) => {
      if (cancelled || !view.current) return dispose(model);
      view.current.setModel(model);
    });
    return () => { cancelled = true; };
  }, [itemKey, designs]);

  return <div ref={box} className="ps-3d" aria-label="3D preview. Drag to turn it around, scroll or pinch to zoom." role="img" />;
}
