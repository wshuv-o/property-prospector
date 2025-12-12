// src\pages\ResultsPage.tsx
import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ResultsGrid } from '@/components/ResultsGrid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PersonRecord } from '@/types/person';

// Mock saved results
const mockSavedResults: PersonRecord[] = [
  {
    id: '1',
    name: 'LOPEZ, CARLOS D',
    address: '2009 Alston Ave, Fort Worth, TX 76110',
    phones: ['(817) 555-1234'],
    emails: ['carlos.lopez@email.com'],
    relatedAddresses: ['2009 Alston Ave, Fort Worth, TX 76110'],
    relatives: ['Maria Lopez'],
    source: 'truepeoplesearch',
    searchedAddress: '2009 Alston Ave, Fort Worth, TX 76110',
    matchScore: 0.95,
  },
  {
    id: '2',
    name: 'HIGHTOWER, ANTIONETTE',
    address: '2001 Alston Ave, Fort Worth, TX 76110',
    phones: ['(817) 555-5678'],
    emails: [],
    relatedAddresses: ['2001 Alston Ave, Fort Worth, TX 76110'],
    relatives: [],
    source: 'fastpeoplesearch',
    searchedAddress: '2001 Alston Ave, Fort Worth, TX 76110',
    matchScore: 0.88,
  },
  {
    id: '3',
    name: 'NGUYEN, COI THI',
    address: '805 W Arlington Ave, Fort Worth, TX 76110',
    phones: ['(817) 555-9012'],
    emails: ['coi.nguyen@email.com'],
    relatedAddresses: ['805 W Arlington Ave, Fort Worth, TX 76110'],
    relatives: ['Tran Nguyen', 'Minh Nguyen'],
    source: 'searchpeoplefree',
    searchedAddress: '805 W Arlington Ave, Fort Worth, TX 76110',
    matchScore: 0.92,
  },
];

const ResultsPage = () => {
  const [results] = useState<PersonRecord[]>(mockSavedResults);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Results Database</h1>
            <p className="text-sm text-muted-foreground">
              View and export all scraped data
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="truepeoplesearch">TruePeopleSearch</SelectItem>
                <SelectItem value="fastpeoplesearch">FastPeopleSearch</SelectItem>
                <SelectItem value="searchpeoplefree">SearchPeopleFree</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Records</CardDescription>
              <CardTitle className="text-3xl">{results.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>With Phone</CardDescription>
              <CardTitle className="text-3xl">
                {results.filter(r => r.phones.length > 0).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>With Email</CardDescription>
              <CardTitle className="text-3xl">
                {results.filter(r => r.emails.length > 0).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg Match Score</CardDescription>
              <CardTitle className="text-3xl">
                {Math.round((results.reduce((acc, r) => acc + r.matchScore, 0) / results.length) * 100)}%
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              All Results
            </CardTitle>
            <CardDescription>
              {results.length} records from your searches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResultsGrid results={results} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ResultsPage;
