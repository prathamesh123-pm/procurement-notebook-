
"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { 
  FileText, Home, Plus, Save, Printer, Share2, Download, Settings, 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, 
  Table as TableIcon, Image as ImageIcon, Type, Search, Undo, Redo,
  ChevronDown, HelpCircle, Pencil, Code, Eye, ZoomIn, ZoomOut,
  Maximize2, Shield, RefreshCw, X, Check, FileCode, Mail, 
  MessageSquare, Layout, Palette, Ruler, Grid3X3, Link, FileUp, Highlighter
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"

export default function WordEditorPage() {
  const [mounted, setMounted] = useState(false)
  const [docTitle, setDocTitle] = useState("नवीन डॉक्युमेंट")
  const [zoom, setZoom] = useState(100)
  const editorRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => setMounted(true), [])

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
  }

  const handleSave = () => {
    const content = editorRef.current?.innerHTML
    localStorage.setItem('procurepal_doc_' + Date.now(), JSON.stringify({ title: docTitle, content }))
    toast({ title: "यशस्वी", description: "डॉक्युमेंट जतन झाले (AutoSave Active)." })
  }

  const handlePrint = () => window.print()

  if (!mounted) return null

  const RibbonGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="flex flex-col items-center border-r border-slate-200 px-2 last:border-0 h-full">
      <div className="flex items-center gap-1 flex-1">{children}</div>
      <span className="text-[8px] font-black uppercase text-slate-400 mt-1">{label}</span>
    </div>
  )

  const ToolBtn = ({ icon: Icon, onClick, active = false, label }: any) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-7 w-7 rounded-md ${active ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100'}`}
            onClick={onClick}
          >
            <Icon className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-[10px] font-black uppercase">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-6xl mx-auto w-full bg-slate-50 overflow-hidden rounded-3xl border shadow-2xl animate-in fade-in duration-500">
      {/* Title Bar */}
      <div className="h-8 bg-primary text-white flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-white rounded shadow-sm"><FileText className="h-3 w-3 text-primary" /></div>
          <Input 
            value={docTitle} 
            onChange={(e) => setDocTitle(e.target.value)}
            className="h-6 bg-transparent border-none text-[11px] font-black uppercase text-white placeholder:text-white/50 w-48 focus-visible:ring-0 p-0"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[9px] font-black opacity-70"><Shield className="h-2.5 w-2.5" /> Protected Mode</div>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/10" onClick={() => window.location.reload()}><RefreshCw className="h-3 w-3" /></Button>
        </div>
      </div>

      {/* Ribbon Toolbar */}
      <Tabs defaultValue="home" className="w-full shrink-0 bg-white border-b shadow-sm">
        <ScrollArea className="w-full border-b">
          <TabsList className="h-8 bg-transparent justify-start px-2 gap-1 overflow-visible">
            {["file", "home", "insert", "design", "layout", "references", "mailings", "review", "view", "draw", "developer", "help"].map((tab) => (
              <TabsTrigger 
                key={tab} 
                value={tab} 
                className="text-[9px] font-black uppercase h-7 px-3 data-[state=active]:bg-slate-50 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none transition-all"
              >
                {tab === 'file' ? 'File (फाईल)' : 
                 tab === 'home' ? 'Home (होम)' :
                 tab === 'insert' ? 'Insert (इन्सर्ट)' : 
                 tab === 'design' ? 'Design' : 
                 tab === 'layout' ? 'Layout' : tab.toUpperCase()}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>

        <div className="h-14 bg-slate-50/50 p-1.5 overflow-hidden">
          <TabsContent value="file" className="m-0 h-full">
            <div className="flex items-center gap-1 h-full px-2">
              <RibbonGroup label="डॉक्युमेंट">
                <Button variant="outline" size="sm" className="h-10 w-12 flex-col gap-0.5 rounded-lg border-none hover:bg-white hover:shadow-sm" onClick={() => window.location.reload()}><Plus className="h-4 w-4" /><span className="text-[7px] font-black">NEW</span></Button>
                <Button variant="outline" size="sm" className="h-10 w-12 flex-col gap-0.5 rounded-lg border-none hover:bg-white hover:shadow-sm" onClick={handleSave}><Save className="h-4 w-4" /><span className="text-[7px] font-black">SAVE</span></Button>
                <Button variant="outline" size="sm" className="h-10 w-12 flex-col gap-0.5 rounded-lg border-none hover:bg-white hover:shadow-sm" onClick={handlePrint}><Printer className="h-4 w-4" /><span className="text-[7px] font-black">PRINT</span></Button>
                <Button variant="outline" size="sm" className="h-10 w-12 flex-col gap-0.5 rounded-lg border-none hover:bg-white hover:shadow-sm" onClick={() => toast({ title: "Export", description: "PDF तयार होत आहे..." })}><Download className="h-4 w-4" /><span className="text-[7px] font-black">EXPORT</span></Button>
              </RibbonGroup>
            </div>
          </TabsContent>

          <TabsContent value="home" className="m-0 h-full">
            <div className="flex items-center gap-1 h-full px-2">
              <RibbonGroup label="क्लिपबोर्ड">
                <ToolBtn icon={Undo} label="Undo" onClick={() => execCommand('undo')} />
                <ToolBtn icon={Redo} label="Redo" onClick={() => execCommand('redo')} />
              </RibbonGroup>
              <RibbonGroup label="फॉन्ट">
                <select className="h-7 text-[10px] border rounded bg-white px-1 outline-none font-bold" onChange={(e) => execCommand('fontName', e.target.value)}>
                  <option value="Inter">Inter</option>
                  <option value="Arial">Arial</option>
                  <option value="PT Sans">PT Sans</option>
                </select>
                <ToolBtn icon={Bold} label="Bold" onClick={() => execCommand('bold')} />
                <ToolBtn icon={Italic} label="Italic" onClick={() => execCommand('italic')} />
                <ToolBtn icon={Underline} label="Underline" onClick={() => execCommand('underline')} />
                <ToolBtn icon={Highlighter} label="Highlight" onClick={() => execCommand('backColor', 'yellow')} />
              </RibbonGroup>
              <RibbonGroup label="पॅराग्राफ">
                <ToolBtn icon={AlignLeft} label="Align Left" onClick={() => execCommand('justifyLeft')} />
                <ToolBtn icon={AlignCenter} label="Align Center" onClick={() => execCommand('justifyCenter')} />
                <ToolBtn icon={AlignRight} label="Align Right" onClick={() => execCommand('justifyRight')} />
                <ToolBtn icon={List} label="Bullets" onClick={() => execCommand('insertUnorderedList')} />
              </RibbonGroup>
              <RibbonGroup label="एडिटिंग">
                <ToolBtn icon={Search} label="Find & Replace" onClick={() => toast({ title: "Search", description: "Search सुरू झाले." })} />
              </RibbonGroup>
            </div>
          </TabsContent>

          <TabsContent value="insert" className="m-0 h-full">
            <div className="flex items-center gap-1 h-full px-2">
              <RibbonGroup label="पाने">
                <ToolBtn icon={FileText} label="Blank Page" onClick={() => {}} />
              </RibbonGroup>
              <RibbonGroup label="टेबल">
                <Button variant="outline" size="sm" className="h-10 w-12 flex-col gap-0.5 rounded-lg border-none hover:bg-white hover:shadow-sm" onClick={() => execCommand('insertHTML', '<table border="1" style="width:100%; border-collapse:collapse;"><tr><td>&nbsp;</td><td>&nbsp;</td></tr></table>')}><Grid3X3 className="h-4 w-4" /><span className="text-[7px] font-black">TABLE</span></Button>
              </RibbonGroup>
              <RibbonGroup label="इल्मस्ट्रेशन">
                <ToolBtn icon={ImageIcon} label="Picture" onClick={() => {}} />
                <ToolBtn icon={Link} label="Link" onClick={() => execCommand('createLink', prompt('URL टाका') || '')} />
              </RibbonGroup>
              <RibbonGroup label="टेक्स्ट">
                <ToolBtn icon={Type} label="Text Box" />
                <ToolBtn icon={FileCode} label="Signature" onClick={() => execCommand('insertHTML', '<br/><br/>___________________<br/>Signature')} />
              </RibbonGroup>
            </div>
          </TabsContent>

          <TabsContent value="design" className="m-0 h-full">
            <div className="flex items-center gap-1 h-full px-2">
              <RibbonGroup label="थीम">
                <ToolBtn icon={Palette} label="Page Color" />
                <ToolBtn icon={Layout} label="Watermark" />
              </RibbonGroup>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="m-0 h-full">
            <div className="flex items-center gap-1 h-full px-2">
              <RibbonGroup label="पेज सेटअप">
                <ToolBtn icon={Ruler} label="Margins" />
                <ToolBtn icon={FileText} label="Orientation" />
              </RibbonGroup>
            </div>
          </TabsContent>

          <TabsContent value="view" className="m-0 h-full">
            <div className="flex items-center gap-1 h-full px-2">
              <RibbonGroup label="झूम (Zoom)">
                <ToolBtn icon={ZoomIn} label="Zoom In" onClick={() => setZoom(prev => Math.min(prev + 10, 200))} />
                <span className="text-[10px] font-black w-10 text-center">{zoom}%</span>
                <ToolBtn icon={ZoomOut} label="Zoom Out" onClick={() => setZoom(prev => Math.max(prev - 10, 50))} />
              </RibbonGroup>
              <RibbonGroup label="व्ह्यू">
                <ToolBtn icon={Eye} label="Read Mode" />
                <ToolBtn icon={Maximize2} label="Focus Mode" />
              </RibbonGroup>
            </div>
          </TabsContent>

          <TabsContent value="draw" className="m-0 h-full">
            <div className="flex items-center gap-1 h-full px-2">
              <RibbonGroup label="पेन टूल्स">
                <ToolBtn icon={Pencil} label="Draw with Touch" />
              </RibbonGroup>
            </div>
          </TabsContent>

          <TabsContent value="developer" className="m-0 h-full">
            <div className="flex items-center gap-1 h-full px-2">
              <RibbonGroup label="कोड & मॅक्रो">
                <ToolBtn icon={Code} label="Visual Basic" />
                <ToolBtn icon={Settings} label="Macros" />
              </RibbonGroup>
            </div>
          </TabsContent>

          <TabsContent value="help" className="m-0 h-full">
            <div className="flex items-center gap-1 h-full px-2">
              <RibbonGroup label="मदत">
                <ToolBtn icon={HelpCircle} label="Get Help" />
                <ToolBtn icon={MessageSquare} label="Feedback" />
              </RibbonGroup>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Editor Area */}
      <ScrollArea className="flex-1 bg-slate-200 shadow-inner p-4 md:p-8">
        <div 
          className="bg-white mx-auto shadow-2xl min-h-[1056px] p-12 focus:outline-none transition-all duration-300"
          style={{ 
            width: `${zoom === 100 ? '816px' : (816 * (zoom/100)) + 'px'}`,
            maxWidth: '100%',
            transformOrigin: 'top center'
          }}
        >
          <div 
            ref={editorRef}
            contentEditable 
            className="w-full h-full min-h-[900px] text-sm prose max-w-none focus:outline-none font-body"
            onInput={() => {}} // Could trigger AutoSave here
          >
            <h1 className="text-center">संकलन नोंदवही (Official Report)</h1>
            <p className="text-center text-muted-foreground text-xs uppercase font-black tracking-widest mt-2">दैनिक अहवाल व मार्गदर्शिका</p>
            <hr className="my-6 border-slate-300" />
            <p>येथे तुमचा अहवाल लिहिण्यास सुरुवात करा...</p>
          </div>
        </div>
        <ScrollBar orientation="vertical" />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Status Bar */}
      <div className="h-6 bg-slate-100 border-t flex items-center justify-between px-4 text-[9px] font-black text-slate-500 uppercase shrink-0">
        <div className="flex items-center gap-4">
          <span>PAGE 1 OF 1</span>
          <span>WORDS: {editorRef.current?.innerText.trim().split(/\s+/).length || 0}</span>
          <span className="flex items-center gap-1"><Check className="h-2.5 w-2.5 text-green-600" /> AutoSave On</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ZoomOut className="h-2.5 w-2.5" />
            <input 
              type="range" 
              min="50" max="200" 
              value={zoom} 
              onChange={(e) => setZoom(Number(e.target.value))} 
              className="w-24 h-1 accent-primary"
            />
            <ZoomIn className="h-2.5 w-2.5" />
          </div>
          <span>{zoom}%</span>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .shrink-0, .h-8, .h-6, tabs { display: none !important; }
          .flex-1 { background: white !important; padding: 0 !important; }
          .bg-white { shadow: none !important; border: none !important; width: 100% !important; margin: 0 !important; }
        }
        [contenteditable]:empty:before {
          content: attr(placeholder);
          color: #cbd5e1;
          cursor: text;
        }
      `}</style>
    </div>
  )
}
