
// This file provides shimmed implementations for Next.js imports
// that are used for dynamic imports in our components

export interface DynamicOptions {
  loading?: React.ComponentType;
  ssr?: boolean;
}

/**
 * A simple shim for Next.js dynamic import
 */
export default function dynamic(
  importFunc: () => Promise<any>,
  options: DynamicOptions = {}
) {
  const { loading: LoadingComponent, ssr = true } = options;

  return React.lazy(() => {
    if (!ssr && typeof window === 'undefined') {
      return new Promise(resolve => {
        resolve({
          default: () => null,
        });
      });
    }
    return importFunc();
  });
}

// Import React at the top level so lazy can be used
import React from 'react';
