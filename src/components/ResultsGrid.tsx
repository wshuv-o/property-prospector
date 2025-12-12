// src\components\ResultsGrid.tsx
import { useState } from 'react';
import { Download, Search as SearchIcon, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PersonCard } from './PersonCard';
import type { PersonRecord } from '@/types/person';

interface ResultsGridProps {
  results: PersonRecord[];
}

export function ResultsGrid({ results }: ResultsGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const filteredResults = results.filter(person => {
    const matchesSearch = 
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.phones.some(p => p.includes(searchQuery)) ||
      person.emails.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSource = sourceFilter === 'all' || person.source === sourceFilter;
    
    return matchesSearch && matchesSource;
  });

  const exportToCSV = () => {
    const headers = ['Name', 'Address', 'Phones', 'Emails', 'Relatives', 'Source', 'Searched Address'];
    const rows = filteredResults.map(p => [
      p.name,
      p.address,
      p.phones.join('; '),
      p.emails.join('; '),
      p.relatives.join('; '),
      p.source,
      p.searchedAddress,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `people-search-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (results.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <SearchIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No results yet</p>
          <p className="text-sm text-muted-foreground">Upload a file or search manually to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg">
            Search Results ({filteredResults.length})
          </CardTitle>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by name, address, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="truepeoplesearch">TruePeopleSearch</SelectItem>
              <SelectItem value="fastpeoplesearch">FastPeopleSearch</SelectItem>
              <SelectItem value="searchpeoplefree">SearchPeopleFree</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredResults.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
