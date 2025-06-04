
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      // For now, we'll just log the search.
      // We will implement the actual search page functionality later.
      console.log('Search query:', query.trim());
      // router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      // setQuery(''); // Optionally clear input after search
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full max-w-md md:max-w-lg">
      <Input
        type="search"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-grow bg-searchBar text-searchBar-text placeholder:text-searchBar-placeholder h-9 focus-visible:ring-accent"
        aria-label="Search products"
      />
      <Button type="submit" variant="ghost" size="icon" aria-label="Submit search" className="hover:bg-searchBar/80">
        <SearchIcon className="h-5 w-5 text-searchBar-placeholder hover:text-searchBar-text" />
      </Button>
    </form>
  );
}
