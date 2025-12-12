// src\pages\Index.tsx
import { useState, useCallback } from 'react';
import { Play, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { FileUpload } from '@/components/FileUpload';
import { DataPreview } from '@/components/DataPreview';
import { SearchForm } from '@/components/SearchForm';
import { SearchProgress } from '@/components/SearchProgress';
import { ResultsGrid } from '@/components/ResultsGrid';
import type { ExcelRow, PersonRecord, SearchResult } from '@/types/person';

// Mock data for demonstration
const generateMockResult = (address: string, searchedName: string): PersonRecord[] => {
  const id = Math.random().toString(36).substr(2, 9);
  const sources: ('truepeoplesearch' | 'fastpeoplesearch' | 'searchpeoplefree')[] = 
    ['truepeoplesearch', 'fastpeoplesearch', 'searchpeoplefree'];
  
  return sources.slice(0, Math.floor(Math.random() * 3) + 1).map(source => ({
    id: `${id}-${source}`,
    name: searchedName || `RESIDENT ${Math.floor(Math.random() * 100)}`,
    address,
    phones: [
      `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    ],
    emails: Math.random() > 0.5 ? [`${searchedName.toLowerCase().replace(/[^a-z]/g, '')}@email.com`] : [],
    relatedAddresses: [address],
    relatives: Math.random() > 0.5 ? ['John Doe', 'Jane Smith'] : [],
    source,
    searchedAddress: address,
    matchScore: Math.random() * 0.3 + 0.7,
  }));
};

const Index = () => {
  const { toast } = useToast();
  const [uploadedData, setUploadedData] = useState<ExcelRow[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [allPersons, setAllPersons] = useState<PersonRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');

  const handleDataParsed = useCallback((data: ExcelRow[]) => {
    setUploadedData(data);
    setSearchResults([]);
    setAllPersons([]);
    if (data.length > 0) {
      toast({
        title: 'File uploaded',
        description: `${data.length} records ready to search`,
      });
    }
  }, [toast]);

  const startBulkSearch = async () => {
    if (uploadedData.length === 0) return;
    
    setIsSearching(true);
    setActiveTab('progress');
    
    // Initialize all as pending
    const initialResults: SearchResult[] = uploadedData.map(query => ({
      query,
      status: 'pending',
      results: [],
    }));
    setSearchResults(initialResults);

    // Process each one (simulated - will be real API calls with backend)
    for (let i = 0; i < uploadedData.length; i++) {
      setSearchResults(prev => 
        prev.map((r, idx) => idx === i ? { ...r, status: 'searching' } : r)
      );

      // Simulated delay - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

      const mockResults = generateMockResult(uploadedData[i].address, uploadedData[i].name);
      
      setSearchResults(prev =>
        prev.map((r, idx) =>
          idx === i ? { ...r, status: 'completed', results: mockResults } : r
        )
      );
      
      setAllPersons(prev => [...prev, ...mockResults]);
    }

    setIsSearching(false);
    setActiveTab('results');
    toast({
      title: 'Search complete',
      description: `Found results for ${uploadedData.length} addresses`,
    });
  };

  const handleManualSearch = async (streetAddress: string, cityStateZip: string) => {
    const fullAddress = `${streetAddress}, ${cityStateZip}`;
    setIsSearching(true);
    
    // Simulated search
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockResults = generateMockResult(fullAddress, 'Manual Search');
    setAllPersons(prev => [...prev, ...mockResults]);
    setActiveTab('results');
    setIsSearching(false);
    
    toast({
      title: 'Search complete',
      description: `Found ${mockResults.length} results`,
    });
  };

  const stopSearch = () => {
    setIsSearching(false);
    toast({
      title: 'Search stopped',
      description: 'You can resume or start a new search',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Upload your Excel file and start searching across multiple databases
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="space-y-6">
            <FileUpload onDataParsed={handleDataParsed} />
            
            {uploadedData.length > 0 && (
              <div className="flex gap-2">
                {!isSearching ? (
                  <Button className="flex-1" onClick={startBulkSearch}>
                    <Play className="h-4 w-4 mr-2" />
                    Start Bulk Search
                  </Button>
                ) : (
                  <Button variant="destructive" className="flex-1" onClick={stopSearch}>
                    <StopCircle className="h-4 w-4 mr-2" />
                    Stop Search
                  </Button>
                )}
              </div>
            )}

            <SearchForm onSearch={handleManualSearch} isSearching={isSearching} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="upload">
                  Preview ({uploadedData.length})
                </TabsTrigger>
                <TabsTrigger value="progress">
                  Progress
                </TabsTrigger>
                <TabsTrigger value="results">
                  Results ({allPersons.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload">
                <DataPreview data={uploadedData} />
              </TabsContent>
              
              <TabsContent value="progress">
                <SearchProgress 
                  results={searchResults} 
                  totalCount={uploadedData.length} 
                />
              </TabsContent>
              
              <TabsContent value="results">
                <ResultsGrid results={allPersons} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
