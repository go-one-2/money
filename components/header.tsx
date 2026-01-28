'use client';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container flex h-14 items-center px-4">
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
    </header>
  );
}
