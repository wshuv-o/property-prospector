// src\components\FileUpload.tsx
import { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ExcelRow } from '@/types/person';

interface FileUploadProps {
  onDataParsed: (data: ExcelRow[]) => void;
}

export function FileUpload({ onDataParsed }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parseCSV = (text: string): ExcelRow[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) throw new Error('File must have at least a header and one data row');

    // Skip header row, just use first column as address, second as name
    return lines.slice(1).map((line, index) => {
      const columns = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => 
        col.replace(/^"|"$/g, '').trim()
      );
      
      return {
        address: columns[0] || '',
        name: columns[1] || `Row ${index + 2}`,
      };
    }).filter(row => row.address);
  };

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setFile(file);

    try {
      const text = await file.text();
      const data = parseCSV(text);
      onDataParsed(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
      setFile(null);
    }
  }, [onDataParsed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx'))) {
      handleFile(droppedFile);
    } else {
      setError('Please upload a CSV or Excel file');
    }
  }, [handleFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    onDataParsed([]);
  };

  return (
    <Card className="p-6">
      <div
        className={cn(
          "border border-dashed rounded-xl p-8 text-center transition-colors",
          isDragging ? "border-primary bg-accent" : "border-border/60",
          error && "border-destructive"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileSpreadsheet className="h-8 w-8 text-primary" />
            <span className="font-medium">{file.name}</span>
            <Button variant="ghost" size="icon" onClick={clearFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Drop your Excel/CSV file here</p>
            <p className="text-sm text-muted-foreground mb-4">
              File should have columns: Address, Name
            </p>
            <label>
              <input
                type="file"
                className="hidden"
                accept=".csv,.xlsx"
                onChange={handleFileInput}
              />
              <Button variant="outline" asChild>
                <span>Browse Files</span>
              </Button>
            </label>
          </>
        )}
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </Card>
  );
}
