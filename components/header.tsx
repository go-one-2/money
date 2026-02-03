"use client";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 pixel-header">
      <div className="container flex h-14 items-center px-4">
        <h1>{title}</h1>
      </div>
    </header>
  );
}
