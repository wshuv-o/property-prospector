// src\pages\Index.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Trash2, FileSpreadsheet, Database, AlertCircle, PlusCircle, List } from "lucide-react";
import { toast } from "sonner";
import { dataApi, Batch } from "@/lib/api";
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
  
  // Batch State
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchMode, setBatchMode] = useState<"existing" | "new">("new");
  const [selectedBatchCode, setSelectedBatchCode] = useState<string>(""); // CHANGED: Now stores batch_code directly
  const [newBatchName, setNewBatchName] = useState<string>("");
  const [batchError, setBatchError] = useState<string>("");

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    const result = await dataApi.getBatches();
    if (result.data) {
      setBatches(result.data);
    }
  };

  // Validation logic for batch name
  const validateBatchName = (name: string) => {
    if (!name) return "Batch name is required";
    if (/\s/.test(name)) return "Batch name cannot contain spaces";
    if (name.length < 3) return "Batch name must be at least 3 characters";
    if (name.length > 50) return "Batch name must be less than 50 characters";
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) return "Only letters, numbers, hyphens, and underscores allowed";
    if (batches.some(b => b.batch_code.toLowerCase() === name.toLowerCase())) {
      return "This batch name already exists";
    }
    return "";
  };

  const handleNewBatchChange = (val: string) => {
    setNewBatchName(val);
    if (batchMode === "new") {
      setBatchError(validateBatchName(val));
    } else {
      setBatchError("");
    }
  };

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

  const handleRemoveEntry = (index: number) => {
    setEntries(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setEntries([]);
    toast.info("All entries cleared");
  };

  const handleUploadToDb = async () => {
    // 1. Check Entries
    if (entries.length === 0) {
      toast.error("No entries to upload");
      return;
    }

    // 2. Get Final Batch Code (FIXED)
    const finalBatchName = batchMode === "existing" ? selectedBatchCode : newBatchName;
    
    if (!finalBatchName) {
      toast.error(batchMode === "existing" ? "Please select a batch" : "Please enter a batch name");
      return;
    }

    // 3. Validate if creating new batch
    if (batchMode === "new") {
      const error = validateBatchName(newBatchName);
      if (error) {
        setBatchError(error);
        toast.error(error);
        return;
      }
    }

    setIsUploading(true);
    try {
      // IMPORTANT: Pass the batch CODE (name), not ID
      const result = await dataApi.upload(entries, finalBatchName);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          `✅ Uploaded ${result.data?.insertedCount} entries to batch: ${finalBatchName}`,
          { duration: 4000 }
        );
        
        // Clear entries and reset form
        setEntries([]);
        setNewBatchName("");
        setSelectedBatchCode("");
        setBatchError("");
        
        // Reload batches
        loadBatches();
      }
    } catch (error) {
      toast.error("Failed to upload data");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Upload Data</h1>
          <p className="text-muted-foreground mt-1">
            Assign data to a batch and prepare for scraping
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Input Section */}
        <Card className="lg:col-span-2 border-border/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              1. Add Content
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
                  className="min-h-[150px] resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Textarea
                  id="name"
                  placeholder="Paste names here (one per line)"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="min-h-[150px] resize-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={handleAddEntry} variant="secondary">
                Add to List
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

        {/* Right: Batch & Upload Section */}
        <Card className="border-border/40 flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              2. Batch & Process
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 flex-1">
            <div className="space-y-4">
              <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Select Destination Batch
              </Label>
              <Tabs 
                value={batchMode} 
                onValueChange={(v) => {
                  setBatchMode(v as "existing" | "new");
                  setBatchError("");
                }}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 h-10">
                  <TabsTrigger value="new" className="gap-2">
                    <PlusCircle className="h-4 w-4" /> New
                  </TabsTrigger>
                  <TabsTrigger value="existing" className="gap-2">
                    <List className="h-4 w-4" /> Existing
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="new" className="mt-4 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="newBatch">New Batch Name</Label>
                    <Input 
                      id="newBatch"
                      placeholder="e.g. Florida_Dec_24"
                      value={newBatchName}
                      onChange={(e) => handleNewBatchChange(e.target.value)}
                      className={batchError ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    {batchError && (
                      <p className="text-[10px] text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {batchError}
                      </p>
                    )}
                    {!batchError && newBatchName && (
                      <p className="text-[10px] text-emerald-600 flex items-center gap-1">
                        ✓ Valid batch name
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="existing" className="mt-4 space-y-3">
                  <div className="space-y-2">
                    <Label>Choose Batch</Label>
                    <Select value={selectedBatchCode} onValueChange={setSelectedBatchCode}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a batch..." />
                      </SelectTrigger>
                      <SelectContent>
                        {batches.length === 0 ? (
                          <div className="p-2 text-xs text-muted-foreground text-center">
                            No batches available
                          </div>
                        ) : (
                          batches.map(b => (
                            <SelectItem key={b.id} value={b.batch_code}>
                              <div className="flex items-center gap-2">
                                <span className="font-mono">{b.batch_code}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  ({b.total_rows} rows, {b.pending} pending)
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {selectedBatchCode && (
                      <p className="text-[10px] text-blue-600 flex items-center gap-1">
                        ✓ Will add to: <strong className="font-mono">{selectedBatchCode}</strong>
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="pt-4 border-t border-dashed border-border/60">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-primary">{entries.length}</div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
                  Entries in queue
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleUploadToDb} 
                  className="w-full h-11"
                  disabled={
                    entries.length === 0 || 
                    isUploading || 
                    (batchMode === "new" && (!!batchError || !newBatchName)) ||
                    (batchMode === "existing" && !selectedBatchCode)
                  }
                >
                  {isUploading ? "Processing..." : "Commit to Database"}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleClearAll}
                  disabled={entries.length === 0}
                  className="text-muted-foreground hover:text-destructive"
                >
                  Discard All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Table */}
      {entries.length > 0 && (
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Data Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border/40 overflow-hidden">
              <div className="max-h-[300px] overflow-auto">
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
                        <TableCell className="font-mono text-xs">{entry.address || '-'}</TableCell>
                        <TableCell className="text-sm">{entry.name || '-'}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
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