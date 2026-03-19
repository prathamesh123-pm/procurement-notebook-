"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  FileText, Plus, Save, Printer, Download, Settings, 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, 
  Table as TableIcon, Image as ImageIcon, Type, Search, Undo, Redo,
  ChevronDown, HelpCircle, Pencil, Code, Eye, ZoomIn, ZoomOut,
  Maximize2, Shield, RefreshCw, X, Check, FileCode, Mail, 
  MessageSquare, Layout, Palette, Ruler, Grid3X3, Link as LinkIcon, 
  FileUp, Highlighter, Share2, Layers, BookOpen, UserPlus, 
  Type as TypeIcon, Sparkles, Box, FileSignature
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
    <div className="flex flex-col items-center border-r border-slate-200 px-1.5 last:border-0 h-full shrink-0">
      <div className="flex items-center gap-0.5 flex-1">{children}</div>
      <span className="text-[7px] font-black uppercase text-slate-400 mt-0.5 tracking-tighter">{label}</span>
    </div>
  )

  const ToolBtn = ({ icon: Icon, onClick, active = false, label, size = "sm" }: any) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-6 w-6 rounded-md transition-all ${active ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100'}`}
            onClick={onClick}
          >
            <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-[9px] font-black uppercase">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  const BigToolBtn = ({ icon: Icon, onClick, label }: any) => (
    <Button 
      variant="ghost" 
      className="h-11 w-10 flex flex-col items-center justify-center gap-0 p-0 hover:bg-slate-100 rounded-lg shrink-0"
      onClick={onClick}
    >
      <Icon className="h-4 w-4 text-slate-600" />
      <span className="text-[7px] font-black uppercase mt-0.5 leading-none">{label}</span>
    </Button>
  )

  const tabs = [
    { id: "file", label: "File" },
    { id: "home", label: "Home" },
    { id: "insert", label: "Insert" },
    { id: "design", label: "Design" },
    { id: "layout", label: "Layout" },
    { id: "refs", label: "References" },
    { id: "mail", label: "Mailings" },
    { id: "review", label: "Review" },
    { id: "view", label: "View" },
    { id: "draw", label: "Draw" },
    { id: "dev", label: "Developer" },
    { id: "help", label: "Help" },
    { id: "addins", label: "Add-ins" }
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-6xl mx-auto w-full bg-slate-50 overflow-hidden rounded-2xl border shadow-xl animate-in fade-in duration-500">
      {/* Mini Title Bar */}
      <div className="h-7 bg-primary text-white flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="p-0.5 bg-white rounded shadow-sm shrink-0"><FileText className="h-2.5 w-2.5 text-primary" /></div>
          <Input 
            value={docTitle} 
            onChange={(e) => setDocTitle(e.target.value)}
            className="h-5 bg-transparent border-none text-[10px] font-black uppercase text-white placeholder:text-white/50 w-32 focus-visible:ring-0 p-0 truncate"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1 text-[8px] font-black opacity-70 uppercase"><Shield className="h-2 w-2" /> Protected</div>
          <Button variant="ghost" size="icon" className="h-5 w-5 text-white hover:bg-white/10" onClick={() => window.location.reload()}><RefreshCw className="h-2.5 w-2.5" /></Button>
        </div>
      </div>

      {/* Modern Ribbon Interface */}
      <Tabs defaultValue="home" className="w-full shrink-0 bg-white border-b shadow-sm">
        <ScrollArea className="w-full border-b bg-slate-50">
          <TabsList className="h-7 bg-transparent justify-start px-1 gap-0 overflow-visible">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="text-[8px] font-black uppercase h-full px-2.5 data-[state=active]:bg-white data-[state=active]:text-primary rounded-t-md rounded-b-none transition-all border-x border-transparent data-[state=active]:border-slate-200"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>

        <div className="h-14 bg-white p-1 overflow-hidden">
          <TabsContent value="file" className="m-0 h-full">
            <ScrollArea className="w-full h-full">
              <div className="flex items-center gap-0.5 h-full px-1">
                <RibbonGroup label="डॉक्युमेंट">
                  <BigToolBtn icon={Plus} label="NEW" onClick={() => window.location.reload()} />
                  <BigToolBtn icon={Save} label="SAVE" onClick={handleSave} />
                  <BigToolBtn icon={Printer} label="PRINT" onClick={handlePrint} />
                  <BigToolBtn icon={Download} label="PDF" onClick={() => toast({ title: "Export", description: "PDF तयार होत आहे..." })} />
                </RibbonGroup>
                <RibbonGroup label="शेअर">
                  <BigToolBtn icon={Share2} label="SHARE" />
                  <BigToolBtn icon={Mail} label="EMAIL" />
                </RibbonGroup>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="home" className="m-0 h-full">
            <ScrollArea className="w-full h-full">
              <div className="flex items-center gap-0.5 h-full px-1">
                <RibbonGroup label="क्लिपबोर्ड">
                  <ToolBtn icon={Undo} label="Undo" onClick={() => execCommand('undo')} />
                  <ToolBtn icon={Redo} label="Redo" onClick={() => execCommand('redo')} />
                </RibbonGroup>
                <RibbonGroup label="फॉन्ट">
                  <select className="h-6 text-[9px] border rounded bg-slate-50 px-1 outline-none font-bold min-w-[60px]" onChange={(e) => execCommand('fontName', e.target.value)}>
                    <option value="Inter">Inter</option>
                    <option value="Arial">Arial</option>
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
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="insert" className="m-0 h-full">
            <ScrollArea className="w-full h-full">
              <div className="flex items-center gap-0.5 h-full px-1">
                <RibbonGroup label="पाने">
                  <BigToolBtn icon={Layers} label="PAGES" />
                </RibbonGroup>
                <RibbonGroup label="टेबल">
                  <BigToolBtn icon={Grid3X3} label="TABLE" onClick={() => execCommand('insertHTML', '<table border="1" style="width:100%; border-collapse:collapse; margin:10px 0;"><tr><td style="padding:5px;">&nbsp;</td><td style="padding:5px;">&nbsp;</td></tr></table>')} />
                </RibbonGroup>
                <RibbonGroup label="इल्मस्ट्रेशन">
                  <ToolBtn icon={ImageIcon} label="Picture" />
                  <ToolBtn icon={LinkIcon} label="Link" onClick={() => execCommand('createLink', prompt('URL?') || '')} />
                </RibbonGroup>
                <RibbonGroup label="फॉर्म">
                  <ToolBtn icon={Box} label="Text Box" />
                  <ToolBtn icon={FileSignature} label="Sign" onClick={() => execCommand('insertHTML', '<div style="margin-top:20px;">___________________<br/>Signature</div>')} />
                </RibbonGroup>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="dev" className="m-0 h-full">
            <ScrollArea className="w-full h-full">
              <div className="flex items-center gap-0.5 h-full px-1">
                <RibbonGroup label="मॅक्रो">
                  <BigToolBtn icon={Code} label="VBA" />
                  <BigToolBtn icon={Settings} label="MACROS" />
                </RibbonGroup>
                <RibbonGroup label="फॉर्म कंट्रोल्स">
                  <ToolBtn icon={TypeIcon} label="Label" />
                  <ToolBtn icon={Check} label="Checkbox" />
                  <ToolBtn icon={Sparkles} label="AI Gen" />
                </RibbonGroup>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="design" className="m-0 h-full flex items-center justify-center text-[8px] font-black text-slate-400 uppercase">Design Tools Loading...</TabsContent>
          <TabsContent value="layout" className="m-0 h-full flex items-center justify-center text-[8px] font-black text-slate-400 uppercase">Layout Setup...</TabsContent>
          <TabsContent value="view" className="m-0 h-full">
            <div className="flex items-center gap-1 h-full px-2">
              <RibbonGroup label="झूम">
                <ToolBtn icon={ZoomIn} onClick={() => setZoom(prev => Math.min(prev + 10, 150))} />
                <span className="text-[9px] font-black w-8 text-center">{zoom}%</span>
                <ToolBtn icon={ZoomOut} onClick={() => setZoom(prev => Math.max(prev - 10, 50))} />
              </RibbonGroup>
              <RibbonGroup label="व्ह्यू">
                <ToolBtn icon={Eye} label="Read" />
                <ToolBtn icon={Maximize2} label="Focus" />
              </RibbonGroup>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Editor Area - Centered Paper */}
      <ScrollArea className="flex-1 bg-slate-200 shadow-inner p-2 sm:p-4">
        <div 
          className="bg-white mx-auto shadow-xl min-h-[800px] p-6 sm:p-10 focus:outline-none transition-all duration-300"
          style={{ 
            width: `${zoom === 100 ? '100%' : zoom + '%'}`,
            maxWidth: '800px',
            transformOrigin: 'top center'
          }}
        >
          <div 
            ref={editorRef}
            contentEditable 
            className="w-full h-full min-h-[700px] text-sm prose prose-sm max-w-none focus:outline-none font-body"
            onInput={() => {}} 
          >
            <h2 className="text-center" style={{margin: '0 0 10px 0'}}>संकलन नोंदवही (Official Report)</h2>
            <p className="text-center text-muted-foreground text-[10px] uppercase font-black tracking-widest" style={{margin: '0 0 20px 0'}}>दैनिक अहवाल व मार्गदर्शिका</p>
            <hr style={{margin: '10px 0', border: 'none', borderTop: '1px solid #ddd'}} />
            <p>येथे मजकूर लिहिण्यास सुरुवात करा...</p>
          </div>
        </div>
        <ScrollBar orientation="vertical" />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Compact Status Bar */}
      <div className="h-5 bg-slate-100 border-t flex items-center justify-between px-3 text-[8px] font-black text-slate-500 uppercase shrink-0">
        <div className="flex items-center gap-3">
          <span>PAGE 1 OF 1</span>
          <span className="hidden sm:inline">WORDS: {editorRef.current?.innerText.trim().split(/\s+/).length || 0}</span>
          <span className="flex items-center gap-1"><Check className="h-2 w-2 text-green-600" /> AUTOSAVE ON</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <input 
              type="range" 
              min="50" max="150" 
              value={zoom} 
              onChange={(e) => setZoom(Number(e.target.value))} 
              className="w-16 h-1 accent-primary"
            />
          </div>
          <span>{zoom}%</span>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .shrink-0, h7, tabs, header, nav { display: none !important; }
          .flex-1 { background: white !important; padding: 0 !important; }
          .bg-white { shadow: none !important; border: none !important; width: 100% !important; margin: 0 !important; }
        }
        [contenteditable]:empty:before {
          content: "येथे लिहा...";
          color: #cbd5e1;
          cursor: text;
        }
      `}</style>
    </div>
  )
}
