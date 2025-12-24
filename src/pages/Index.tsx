// src\pages\Index.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Trash2, FileSpreadsheet, Database } from "lucide-react";
import { toast } from "sonner";
import { dataApi } from "@/lib/api";
import * as XLSX from "xlsx";

interface DataEntry {
  name: string;
  address: string;
}

const Index = () => {
  const [entries, setEntries] = useState<DataEntry[]>([]);
  const [nameInput, setNameInput] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Add entries from textareas
  const handleAddEntry = () => {
    if (!nameInput.trim() && !addressInput.trim()) {
      toast.error("Please enter name or address");
      return;
    }
    
    const names = nameInput.split('\n').map(n => n.trim());
    const addresses = addressInput.split('\n').map(a => a.trim());
    const maxLen = Math.max(names.length, addresses.length);
    
    const newEntries: DataEntry[] = [];
    for (let i = 0; i < maxLen; i++) {
      const name = names[i] || '';
      const address = addresses[i] || '';
      if (name || address) {
        newEntries.push({ name, address });
      }
    }
    
    if (newEntries.length > 0) {
      setEntries(prev => [...prev, ...newEntries]);
      toast.success(`Added ${newEntries.length} entries`);
      setNameInput('');
      setAddressInput('');
    }
  };

  // Handle Excel file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
        
        // Skip header row, first column = address, second = name
        const newEntries: DataEntry[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row && (row[0] || row[1])) {
            newEntries.push({
              address: String(row[0] || '').trim(),
              name: String(row[1] || '').trim()
            });
          }
        }
        
        setEntries(prev => [...prev, ...newEntries]);
        toast.success(`Loaded ${newEntries.length} entries from Excel`);
      } catch (error) {
        toast.error("Failed to parse Excel file");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Remove entry
  const handleRemoveEntry = (index: number) => {
    setEntries(prev => prev.filter((_, i) => i !== index));
  };

  // Clear all
  const handleClearAll = () => {
    setEntries([]);
    toast.info("All entries cleared");
  };

  // Upload to database
  const handleUploadToDb = async () => {
    if (entries.length === 0) {
      toast.error("No entries to upload");
      return;
    }

    setIsUploading(true);
    try {
      const result = await dataApi.upload(entries);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Uploaded ${result.data?.insertedCount} entries to database`);
        setEntries([]);
      }
    } catch (error) {
      toast.error("Failed to upload data");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Upload Data</h1>
        <p className="text-muted-foreground mt-1">
          Paste data from Excel or upload a file to add entries for scraping
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <Card className="border-border/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Add Entries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Paste addresses here (one per line)"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Textarea
                  id="name"
                  placeholder="Paste names here (one per line)"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={handleAddEntry} variant="secondary">
                Add Entry
              </Button>
              <div className="relative">
                <Input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Button variant="outline" className="pointer-events-none">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="border-border/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Ready to Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-6">
              <div className="text-5xl font-bold text-primary">{entries.length}</div>
              <p className="text-muted-foreground mt-2">entries ready</p>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleUploadToDb} 
                className="flex-1"
                disabled={entries.length === 0 || isUploading}
              >
                {isUploading ? "Uploading..." : "Upload to Database"}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleClearAll}
                disabled={entries.length === 0}
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Table */}
      {entries.length > 0 && (
        <Card className="border-border/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Preview ({entries.length} entries)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border/40 overflow-hidden">
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                        <TableCell className="font-mono text-sm">{entry.address || '-'}</TableCell>
                        <TableCell>{entry.name || '-'}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveEntry(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Index;
