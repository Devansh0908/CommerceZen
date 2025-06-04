
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon } from 'lucide-react'; // Renamed to avoid conflict if Search component is imported

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery(''); // Optionally clear input after search
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full max-w-md md:max-w-sm">
      <Input
        type="search"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-grow bg-background/80 dark:bg-card/50 placeholder:text-muted-foreground h-9"
        aria-label="Search products"
      />
      <Button type="submit" variant="ghost" size="icon" aria-label="Submit search" className="hover:bg-accent/80">
        <SearchIcon className="h-5 w-5 text-foreground/80" />
      </Button>
    </form>
  );
}
