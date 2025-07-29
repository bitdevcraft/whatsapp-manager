"use client";

import { useEffect } from 'react';

export default function TestPage() {
  useEffect(() => {
    console.log('Test page mounted');
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <p>If you can see this, the page is loading correctly.</p>
    </div>
  );
}
