import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { FileUpload } from '@/components/FileUpload';
import { DataPreview } from '@/components/DataPreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, FileSpreadsheet, CheckCircle } from 'lucide-react';
import type { ExcelRow } from '@/types/person';

const UploadPage = () => {
  const [uploadedData, setUploadedData] = useState<ExcelRow[]>([]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bulk Upload</h1>
          <p className="text-sm text-muted-foreground">
            Upload Excel or CSV files for batch processing
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <FileUpload onDataParsed={setUploadedData} />
            
            {uploadedData.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    Ready to Process
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Records</span>
                      <span className="font-medium">{uploadedData.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Est. Time</span>
                      <span className="font-medium">{Math.ceil(uploadedData.length * 2.5)} min</span>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Start Bulk Search
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">File Requirements</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Excel (.xlsx) or CSV files</p>
                <p>• First column: Address</p>
                <p>• Second column: Name (optional)</p>
                <p>• Max 1000 rows per file</p>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Data Preview
                </CardTitle>
                <CardDescription>
                  {uploadedData.length > 0 
                    ? `${uploadedData.length} records loaded`
                    : 'Upload a file to preview data'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataPreview data={uploadedData} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UploadPage;
