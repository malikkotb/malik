'use client';

import { memo } from 'react';
import GalleryMesh from './GalleryMesh';

const GalleryScene = memo(function GalleryScene({ scrollState, config }) {
  return <GalleryMesh scrollState={scrollState} config={config} />;
});

export default GalleryScene;
