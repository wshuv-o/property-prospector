export interface PersonRecord {
  id: string;
  name: string;
  address: string;
  phones: string[];
  emails: string[];
  relatedAddresses: string[];
  relatives: string[];
  source: 'truepeoplesearch' | 'fastpeoplesearch' | 'searchpeoplefree';
  searchedAddress: string;
  matchScore?: number;
}

export interface ExcelRow {
  address: string;
  name: string;
}

export interface SearchResult {
  query: ExcelRow;
  status: 'pending' | 'searching' | 'completed' | 'error';
  results: PersonRecord[];
  error?: string;
}
