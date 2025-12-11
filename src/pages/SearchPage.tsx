import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { SearchForm } from '@/components/SearchForm';
import { PersonCard } from '@/components/PersonCard';
import { useToast } from '@/hooks/use-toast';
import type { PersonRecord } from '@/types/person';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, History } from 'lucide-react';

const SearchPage = () => {
  const { toast } = useToast();
  const [results, setResults] = useState<PersonRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches] = useState([
    '2237 College Ave, Fort Worth, TX 76110',
    '805 W Arlington Ave, Fort Worth, TX 76110',
    '2011 Lipscomb St, Fort Worth, TX 76110',
  ]);

  const handleSearch = async (streetAddress: string, cityStateZip: string) => {
    const fullAddress = `${streetAddress}, ${cityStateZip}`;
    setIsSearching(true);
    
    // Simulated search
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockResults: PersonRecord[] = [
      {
        id: '1',
        name: 'SAMPLE PERSON',
        address: fullAddress,
        phones: ['(817) 555-1234'],
        emails: ['sample@email.com'],
        relatedAddresses: [fullAddress],
        relatives: ['John Doe'],
        source: 'truepeoplesearch',
        searchedAddress: fullAddress,
        matchScore: 0.95,
      }
    ];
    
    setResults(mockResults);
    setIsSearching(false);
    
    toast({
      title: 'Search complete',
      description: `Found ${mockResults.length} results`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Manual Search</h1>
          <p className="text-sm text-muted-foreground">
            Search for individuals by address across multiple databases
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <SearchForm onSearch={handleSearch} isSearching={isSearching} />
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Recent Searches
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentSearches.map((search, idx) => (
                  <button
                    key={idx}
                    className="w-full text-left text-sm p-2 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {search}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Results
                </CardTitle>
                <CardDescription>
                  {results.length > 0 
                    ? `Found ${results.length} matching records`
                    : 'Enter an address to search'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {results.length > 0 ? (
                  <div className="grid gap-4">
                    {results.map((person) => (
                      <PersonCard key={person.id} person={person} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No search results yet</p>
                    <p className="text-sm">Use the form to search for an address</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SearchPage;
