
"use client";

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon } from 'lucide-react';
import type React from 'react';

interface SearchBarProps {
  value: string;
  onValueChange: (query: string) => void;
  onSubmit?: (query: string) => void; 
}

export default function SearchBar({ value, onValueChange, onSubmit }: SearchBarProps) {

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange(e.target.value);
  };

  const handleSearchFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.(value); // Use the current value from props for explicit submission
    // console.log('Search form submitted with query:', value.trim()); 
    // Actual filtering is handled live via onValueChange
  };

  return (
    <form onSubmit={handleSearchFormSubmit} className="flex items-center gap-2 w-full max-w-md md:max-w-lg">
      <Input
        type="search"
        placeholder="Search products..."
        value={value}
        onChange={handleInputChange}
        className="flex-grow bg-searchBar text-searchBar-text placeholder:text-searchBar-placeholder h-9 focus-visible:ring-accent"
        aria-label="Search products"
      />
      <Button type="submit" variant="ghost" size="icon" aria-label="Submit search" className="hover:bg-searchBar/80 h-9 w-9">
        <SearchIcon className="h-5 w-5 text-searchBar-placeholder hover:text-searchBar-text" />
      </Button>
    </form>
  );
}
