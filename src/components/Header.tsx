import { Search, Database, Shield } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b bg-card">
      <div className="container py-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Search className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">PeopleSearch Pro</h1>
        </div>
        <p className="text-muted-foreground">
          Bulk address lookup automation tool
        </p>
        
        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Database className="h-4 w-4" />
            <span>Multiple sources</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>US-based processing</span>
          </div>
        </div>
      </div>
    </header>
  );
}
