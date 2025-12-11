import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface SearchFormProps {
  onSearch: (streetAddress: string, cityStateZip: string) => void;
  isSearching: boolean;
}

export function SearchForm({ onSearch, isSearching }: SearchFormProps) {
  const [streetAddress, setStreetAddress] = useState('');
  const [cityStateZip, setCityStateZip] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (streetAddress && cityStateZip) {
      onSearch(streetAddress, cityStateZip);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-primary" />
          Manual Address Search
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="streetAddress">Street Address</Label>
            <Input
              id="streetAddress"
              placeholder="e.g. 2237 College Ave"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cityStateZip">City, State ZIP</Label>
            <Input
              id="cityStateZip"
              placeholder="e.g. Fort Worth, TX 76110"
              value={cityStateZip}
              onChange={(e) => setCityStateZip(e.target.value)}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!streetAddress || !cityStateZip || isSearching}
          >
            <Search className="h-4 w-4 mr-2" />
            {isSearching ? 'Searching...' : 'Search Address'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
