import { VisualEditing } from '@sanity/visual-editing/react';

export interface VisualEditingOptions {
  zIndex?: number;
}

export function VisualEditingComponent({ zIndex }: VisualEditingOptions) {
  return (
    <VisualEditing
      zIndex={zIndex}
      refresh={() => {
        return new Promise((resolve) => {
          window.location.reload();
          resolve();
        });
      }}
    />
  );
}
