import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
      {children}
    </div>
  );
}
