import React from 'react';

interface AssociatesLayoutProps {
  children: React.ReactNode;
}

export default function AssociatesLayout({ children }: AssociatesLayoutProps) {
  return (
    <div className="w-full min-h-screen">
      {children}
    </div>
  );
}