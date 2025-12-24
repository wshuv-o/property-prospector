import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, ExternalLink, Chrome, Cloud, ShieldCheck, 
  Zap, Info, AlertTriangle, CheckCircle2, Terminal,
  Globe, MoveRight, Layers, Box, MousePointer2
} from "lucide-react";

const Tools = () => {
  const [activeTab, setActiveTab] = useState<"bulk" | "extension">("extension");

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-10 pb-32">
      
      {/* --- HERO SECTION --- */}
      <div className="relative overflow-hidden rounded-[3rem] bg-slate-950/40  p-12 border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent opacity-50" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="space-y-4">
            <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-1 rounded-full uppercase tracking-widest text-[10px] font-black">
              Production Environment
            </Badge>
            
            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-br from-foreground via-primary to-blue-700 bg-clip-text text-transparent">
            PRODUCT COMMONSPACE
          </h1>
            <p className="text-slate-400 max-w-xl text-lg font-medium">
              Centrally managed ecosystem for the Property Prospector suite. 
              Access cloud platforms and local automation nodes.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Status</p>
              <p className="text-emerald-400 font-bold flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> ALL SYSTEMS OPERATIONAL
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- PRODUCT SELECTOR --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-3">
          <button 
            onClick={() => setActiveTab("bulk")}
            className={`w-full text-left p-6 rounded-3xl transition-all border-2 flex items-center gap-4 ${activeTab === 'bulk' ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'bg-card border-transparent hover:border-muted-foreground/20 text-muted-foreground'}`}
          >
            <Cloud className="h-6 w-6" />
            <div>
              <p className="font-black uppercase text-xs tracking-wider ">Lead Scraper from URL</p>
              <p className="text-lg font-black">bulkscraper.cloud</p>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab("extension")}
            className={`w-full text-left p-6 rounded-3xl transition-all border-2 flex items-center gap-4 ${activeTab === 'extension' ? 'bg-orange-600 border-orange-600 text-white shadow-xl shadow-orange-600/20' : 'bg-card border-transparent hover:border-muted-foreground/20 text-muted-foreground'}`}
          >
            <Chrome className="h-6 w-6" />
            <div>
              <p className="font-black uppercase text-xs tracking-wider">Chrome Extension</p>
              <p className="text-lg font-black">People Search</p>
            </div>
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          {activeTab === 'bulk' ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <Card className="border-none bg-card shadow-2xl overflow-hidden rounded-[2.5rem]">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-10 space-y-8">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-primary/50 text-primary uppercase font-black text-[10px]">V2.4 Stable</Badge>
                        <Badge variant="secondary" className="uppercase font-black text-[10px]">Web-Based</Badge>
                      </div>
                      <h2 className="text-4xl font-black uppercase tracking-tighter">BulkScraper.cloud</h2>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-primary">Execution Protocol</h4>
                      {[
                        { step: "01", title: "Data Ingestion", desc: "Upload CSV/Excel or direct copy-paste strings." },
                        { step: "02", title: "Cloud Scraping", desc: "Automated extraction via global proxy rotation." },
                        { step: "03", title: "AI Refinement", desc: "GPT-4o processing for data cleanup and verification." },
                        { step: "04", title: "Package Export", desc: "Secure download of filtered high-intent leads." },
                      ].map((item) => (
                        <div key={item.step} className="flex gap-4 group">
                          <span className="font-black text-primary/40 group-hover:text-primary transition-colors">{item.step}</span>
                          <div>
                            <p className="font-black text-sm uppercase">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button asChild className="w-full h-16 rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl">
                      <a href="https://bulkscraper.cloud" target="_blank" rel="noreferrer">
                        Launch Dashboard <ExternalLink className="ml-2 h-5 w-5" />
                      </a>
                    </Button>
                  </div>
                  <div className="bg-slate-900 p-10 flex items-center justify-center relative border-l border-white/5">
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                     <div className="relative text-center space-y-6">
                        <div className="h-40 w-40 bg-primary/20 rounded-full flex items-center justify-center animate-pulse mx-auto">
                           <Cloud className="h-20 w-20 text-primary" />
                        </div>
                        <div className="space-y-2">
                           <div className="flex gap-2 justify-center">
                              <Badge className="bg-emerald-500/20 text-emerald-400 border-none">Fast</Badge>
                              <Badge className="bg-blue-500/20 text-blue-400 border-none">Secure</Badge>
                              <Badge className="bg-purple-500/20 text-purple-400 border-none">AI-Powered</Badge>
                           </div>
                           <p className="text-xs text-slate-500 font-mono">https://bulkscraper.cloud</p>
                        </div>
                     </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
              <Card className="border-none bg-card shadow-2xl rounded-[2.5rem] overflow-hidden">
                <div className="p-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-gradient-to-r from-orange-600/10 to-transparent">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/40">
                      <Chrome className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black uppercase tracking-tighter italic">People Search Extension</h2>
                      <p className="text-sm font-bold text-orange-500/80">Local Browser Automation Node • v1.0.0</p>
                    </div>
                  </div>
              <Button
                asChild
                className="
                  relative
                  h-16 px-10
                  rounded-2xl
                  font-black uppercase tracking-widest
                  bg-orange-600 text-white
                  shadow-2xl shadow-orange-600/50
                  hover:bg-orange-500
                  hover:scale-[1.05]
                  transition-all

                  after:absolute after:inset-0
                  after:rounded-2xl
                  after:bg-orange-600/40
                  after:blur-xl
                  after:opacity-0
                  hover:after:opacity-100
                  after:transition-opacity
                "
              >
                <a href="/people_search_extension_v1.zip" className="relative z-10">
                  <Download className="mr-2 h-6 w-6" />
                  Download Extension
                </a>
              </Button>

                </div>

                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-orange-500">
                      <Terminal className="h-4 w-4" /> Installation Protocol
                    </h4>
                    
                    <div className="space-y-6">
                      {[
                        { i: 1, t: "Prepare Files", d: "Unzip the downloaded package to a secure folder." },
                        { i: 2, t: "Enable Dev Mode", d: "Open Chrome Extensions and toggle Developer Mode (Top Right)." },
                        { i: 3, t: "Load Unpacked", d: "Click 'Load Unpacked' and select the unzipped folder." },
                        { i: 4, t: "Auth & Start", d: "Login to the extension and activate your USA VPN." }
                      ].map((step) => (
                        <div key={step.i} className="flex gap-4 group">
                          <div className="h-10 w-10 shrink-0 rounded-xl bg-muted flex items-center justify-center font-black group-hover:bg-orange-600/20 group-hover:text-orange-500 transition-all">
                            {step.i}
                          </div>
                          <div>
                            <p className="font-black text-sm uppercase tracking-tight">{step.t}</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">{step.d}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-orange-500">
                      <Zap className="h-4 w-4" /> Operational Guidelines
                    </h4>
                    
                    <div className="p-6 rounded-[2rem] bg-orange-600/5 border border-orange-600/20 space-y-4">
                       <div className="flex gap-3">
                          <div className="h-6 w-6 rounded-full bg-orange-600 flex items-center justify-center shrink-0">
                             <CheckCircle2 className="h-4 w-4 text-white" />
                          </div>
                          <p className="text-sm font-bold tracking-tight">SOLVE CAPTCHAS: Manual interaction may be required if new tabs open.</p>
                       </div>
                       <div className="flex gap-3">
                          <div className="h-6 w-6 rounded-full bg-orange-600 flex items-center justify-center shrink-0">
                             <CheckCircle2 className="h-4 w-4 text-white" />
                          </div>
                          <p className="text-sm font-bold tracking-tight">BATCH FLOW: Re-run the extension until the entire batch queue is empty.</p>
                       </div>
                    </div>

                    <div className="p-6 rounded-[2rem] bg-red-600/5 border border-red-600/20 space-y-3">
                       <div className="flex items-center gap-2 text-red-500">
                          <AlertTriangle className="h-5 w-5" />
                          <p className="font-black text-xs uppercase tracking-widest">Rate Limit Recovery</p>
                       </div>
                       <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                          If the target website restricts access: <br/>
                          <span className="text-white font-bold">1. Open your VPN</span> <br/>
                          <span className="text-white font-bold">2. Change to a different USA City</span> <br/>
                          <span className="text-white font-bold">3. Refresh and Resume</span>
                       </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* --- FOOTER UTILITIES --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: ShieldCheck, title: "Secure Access", desc: "Enterprise encryption on all data transfers." },
          { icon: RefreshCcw, title: "Auto Sync", desc: "Results sync instantly to the central database." },
          { icon: Globe, title: "Geo Flexibility", desc: "Optimized for global proxy and VPN nodes." }
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-4 p-6 rounded-3xl bg-card/50 border hover:bg-card transition-colors">
            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
              <item.icon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-black text-sm uppercase">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RefreshCcw = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
);

export default Tools;