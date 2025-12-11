import React from 'react';

// This is the root layout. It does not contain any visible UI.
// The actual UI is in src/app/[locale]/layout.tsx
export default function RootLayout({children}: {children: React.ReactNode}) {
  return <>{children}</>;
}
