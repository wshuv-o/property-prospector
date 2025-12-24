import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, ExternalLink, Chrome, Cloud, 
  ShieldCheck, Zap, StepForward, AlertCircle, 
  RefreshCcw, Globe, Cpu 
} from "lucide-react";

const Tools = () => {
  const products = [
    {
      id: "bulkscraper",
      name: "BulkScraper.cloud",
      version: "v2.4.0",
      description: "Cloud-based lead generation and AI data enrichment platform.",
      status: "Stable",
      icon: <Cloud className="h-6 w-6 text-blue-500" />,
      features: ["Excel/CSV Support", "AI Post-Processing", "Advanced Filtering", "Cloud Export"],
      actionText: "Open Platform",
      link: "https://bulkscraper.cloud",
      isExternal: true
    },
    {
      id: "peoplesearch",
      name: "People Search Extension",
      version: "v1.0.0",
      description: "Browser-level automation for deep person-data retrieval.",
      status: "Active",
      icon: <Chrome className="h-6 w-6 text-orange-500" />,
      features: ["Real-time Scraping", "Captcha Bypass Ready", "VPN Compatible", "Batch Processing"],
      actionText: "Download Extension",
      link: "/people_search_extension_v1.zip", // Ensure this file is in your /public folder
      isExternal: false
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight">Product Commonspace</h1>
        <p className="text-muted-foreground text-lg">
          Access and manage all automation tools in our ecosystem.
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="border-2 hover:border-primary/50 transition-all shadow-md overflow-hidden flex flex-col">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-background rounded-xl shadow-sm">
                  {product.icon}
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-background">{product.version}</Badge>
                  <Badge className="bg-emerald-500 hover:bg-emerald-600">{product.status}</Badge>
                </div>
              </div>
              <CardTitle className="text-2xl mt-4">{product.name}</CardTitle>
              <CardDescription className="text-base">{product.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex-grow">
              <div className="grid grid-cols-2 gap-3">
                {product.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    {f}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/10 p-4">
              <Button asChild className="w-full py-6 text-lg font-bold shadow-lg shadow-primary/20">
                <a href={product.link} target={product.isExternal ? "_blank" : "_self"} rel="noreferrer">
                  {product.isExternal ? <ExternalLink className="mr-2 h-5 w-5" /> : <Download className="mr-2 h-5 w-5" />}
                  {product.actionText}
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Guide Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        {/* BulkScraper Instructions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="h-5 w-5 text-blue-500" />
            <h3 className="font-bold text-xl uppercase tracking-wider">BulkScraper Workflow</h3>
          </div>
          <div className="space-y-6 relative border-l-2 border-muted ml-3 pl-6">
            {[
              { t: "Data Input", d: "Upload Excel or paste raw list into the dashboard." },
              { t: "Scraping Engine", d: "Start the process to fetch live web data." },
              { t: "AI Enrichment", d: "Wait for AI processing to clean and verify results." },
              { t: "Final Export", d: "Filter successful records and export to CSV/Excel." }
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[33px] top-1 h-4 w-4 rounded-full bg-primary border-4 border-background" />
                <h4 className="font-bold text-sm uppercase">{step.t}</h4>
                <p className="text-muted-foreground text-sm">{step.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Extension Installation Guide */}
        <div className="lg:col-span-2 bg-card border rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500/10 p-2 rounded-lg">
                <Chrome className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="font-black text-2xl uppercase tracking-tight">Extension Setup Guide</h3>
            </div>
            <Badge variant="destructive" className="px-4">Action Required</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                <div>
                  <p className="font-bold">Extract Files</p>
                  <p className="text-sm text-muted-foreground">Download and unzip the ZIP file to a permanent folder on your PC.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                <div>
                  <p className="font-bold">Dev Mode</p>
                  <p className="text-sm text-muted-foreground">Go to <code className="bg-muted px-1">chrome://extensions</code> and toggle <b>Developer Mode</b> ON.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                <div>
                  <p className="font-bold">Load Extension</p>
                  <p className="text-sm text-muted-foreground">Click <b>"Load unpacked"</b> and select the extracted folder.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">4</div>
                <div>
                  <p className="font-bold">VPN & Login</p>
                  <p className="text-sm text-muted-foreground">Open extension, login, and ensure your <b>VPN is connected to USA</b>.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">5</div>
                <div>
                  <p className="font-bold">Execution</p>
                  <p className="text-sm text-muted-foreground">Click 'Start'. If a captcha tab opens, solve it and the scraper will continue.</p>
                </div>
              </div>
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                <div className="text-xs text-amber-800">
                  <p className="font-bold mb-1">Rate Limit Tip:</p>
                  If you see "Rate Limit", simply change your VPN city to a different US State and refresh.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tools;