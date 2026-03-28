"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  FileText, Plus, Save, Printer, Download, Settings, 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, 
  Table as TableIcon, Image as ImageIcon, Undo, Redo,
  Eye, ZoomIn, ZoomOut, Maximize2, Shield, RefreshCw, X, Check, 
  Mail, Share2, Layers, Grid3X3, Link as LinkIcon, 
  Highlighter, Code, Sparkles, Box, FileSignature, Type as TypeIcon
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
    toast({ title: "यशस्वी", description: "डॉक्युमेंट जतन झाले." })
  }

  const handlePrint = () => window.print()

  if (!mounted) return null

  const RibbonGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="flex flex-col items-center border-r border-slate-200 px-1 last:border-0 h-full shrink-0">
      <div className="flex items-center gap-0.5 flex-1">{children}</div>
      <span className="text-[5px] font-black uppercase text-slate-400 mt-0.5 tracking-tighter">{label}</span>
    </div>
  )

  const ToolBtn = ({ icon: Icon, onClick, active = false, label, size = "sm" }: any) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-5 w-5 rounded-md transition-all ${active ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100'}`}
            onClick={onClick}
          >
            <Icon className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="text-[7px] font-black uppercase">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  const BigToolBtn = ({ icon: Icon, onClick, label }: any) => (
    <Button 
      variant="ghost" 
      className="h-10 w-8 flex flex-col items-center justify-center gap-0 p-0 hover:bg-slate-100 rounded-lg shrink-0"
      onClick={onClick}
    >
      <Icon className="h-3 w-3 text-slate-600" />
      <span className="text-[5px] font-black uppercase mt-0.5 leading-none">{label}</span>
    </Button>
  )

  const tabs = [
    { id: "file", label: "File" },
    { id: "home", label: "Home" },
    { id: "insert", label: "Insert" },
    { id: "design", label: "Design" },
    { id: "layout", label: "Layout" },
    { id: "view", label: "View" },
    { id: "review", label: "Review" },
    { id: "dev", label: "Dev" }
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-5xl mx-auto w-full bg-slate-50 overflow-hidden rounded-xl border shadow-xl animate-in fade-in duration-500">
      {/* Title Bar - Ultra Slim */}
      <div className="h-5 bg-primary text-white flex items-center justify-between px-2 shrink-0">
        <div className="flex items-center gap-1 min-w-0">
          <FileText className="h-2 w-2" />
          <Input 
            value={docTitle} 
            onChange={(e) => setDocTitle(e.target.value)}
            className="h-3 bg-transparent border-none text-[8px] font-black uppercase text-white placeholder:text-white/50 w-24 focus-visible:ring-0 p-0 truncate"
          />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[6px] font-black opacity-70 uppercase">Protected</span>
          <Button variant="ghost" size="icon" className="h-3 w-3 text-white" onClick={() => window.location.reload()}><RefreshCw className="h-2 w-2" /></Button>
        </div>
      </div>

      {/* Ribbon - Ultra Compact */}
      <Tabs defaultValue="home" className="w-full shrink-0 bg-white border-b shadow-sm">
        <ScrollArea className="w-full bg-slate-100 border-b">
          <TabsList className="h-5 bg-transparent justify-start px-1 gap-0 overflow-visible">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="text-[6px] font-black uppercase h-full px-2 data-[state=active]:bg-white data-[state=active]:text-primary rounded-t-sm rounded-b-none border-x border-transparent data-[state=active]:border-slate-200"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>

        <div className="h-11 bg-white p-0.5">
          <ScrollArea className="w-full h-full">
            <div className="flex items-center gap-0.5 h-full px-1 min-w-max">
              <TabsContent value="file" className="m-0 h-full flex items-center">
                <RibbonGroup label="FILE">
                  <BigToolBtn icon={Plus} label="NEW" />
                  <BigToolBtn icon={Save} label="SAVE" onClick={handleSave} />
                  <BigToolBtn icon={Printer} label="PRINT" onClick={handlePrint} />
                  <BigToolBtn icon={Download} label="PDF" />
                </RibbonGroup>
                <RibbonGroup label="SHARE">
                  <BigToolBtn icon={Share2} label="SHARE" />
                  <BigToolBtn icon={Mail} label="EMAIL" />
                </RibbonGroup>
              </TabsContent>

              <TabsContent value="home" className="m-0 h-full flex items-center">
                <RibbonGroup label="EDIT">
                  <ToolBtn icon={Undo} onClick={() => execCommand('undo')} />
                  <ToolBtn icon={Redo} onClick={() => execCommand('redo')} />
                </RibbonGroup>
                <RibbonGroup label="FONT">
                  <select className="h-4 text-[7px] border rounded bg-slate-50 px-0.5 outline-none font-black" onChange={(e) => execCommand('fontName', e.target.value)}>
                    <option value="Inter">Inter</option>
                    <option value="Arial">Arial</option>
                  </select>
                  <ToolBtn icon={Bold} onClick={() => execCommand('bold')} />
                  <ToolBtn icon={Italic} onClick={() => execCommand('italic')} />
                  <ToolBtn icon={Underline} onClick={() => execCommand('underline')} />
                </RibbonGroup>
                <RibbonGroup label="PARA">
                  <ToolBtn icon={AlignLeft} onClick={() => execCommand('justifyLeft')} />
                  <ToolBtn icon={AlignCenter} onClick={() => execCommand('justifyCenter')} />
                  <ToolBtn icon={AlignRight} onClick={() => execCommand('justifyRight')} />
                  <ToolBtn icon={List} onClick={() => execCommand('insertUnorderedList')} />
                </RibbonGroup>
              </TabsContent>

              <TabsContent value="insert" className="m-0 h-full flex items-center">
                <RibbonGroup label="OBJECTS">
                  <BigToolBtn icon={Layers} label="PAGES" />
                  <BigToolBtn icon={Grid3X3} label="TABLE" onClick={() => execCommand('insertHTML', '<table border="1" style="width:100%; border-collapse:collapse; margin:5px 0;"><tr><td style="padding:2px;">&nbsp;</td><td style="padding:2px;">&nbsp;</td></tr></table>')} />
                  <ToolBtn icon={ImageIcon} label="Pic" />
                  <ToolBtn icon={LinkIcon} label="Link" />
                </RibbonGroup>
              </TabsContent>

              <TabsContent value="dev" className="m-0 h-full flex items-center">
                <RibbonGroup label="DEV">
                  <BigToolBtn icon={Code} label="VBA" />
                  <BigToolBtn icon={Settings} label="MACROS" />
                </RibbonGroup>
                <RibbonGroup label="UI">
                  <ToolBtn icon={TypeIcon} label="Label" />
                  <ToolBtn icon={Check} label="Check" />
                  <ToolBtn icon={Sparkles} label="AI" />
                </RibbonGroup>
              </TabsContent>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </Tabs>

      {/* Editor Area */}
      <ScrollArea className="flex-1 bg-slate-200 shadow-inner p-1">
        <div 
          className="bg-white mx-auto shadow-lg min-h-[1000px] p-4 sm:p-8 focus:outline-none transition-all duration-300"
          style={{ 
            width: `${zoom === 100 ? '100%' : zoom + '%'}`,
            maxWidth: '800px',
            transformOrigin: 'top center'
          }}
        >
          <div 
            ref={editorRef}
            contentEditable 
            suppressContentEditableWarning={true}
            className="w-full h-full min-h-[900px] text-[11px] prose prose-xs max-w-none focus:outline-none font-body"
          >
            <h2 className="text-center" style={{margin: '0 0 5px 0', fontSize: '14px'}}>संकलन नोंदवही (Official Report)</h2>
            <p className="text-center text-muted-foreground text-[7px] uppercase font-black tracking-widest" style={{margin: '0 0 10px 0'}}>दैनिक अहवाल व मार्गदर्शिका</p>
            <hr style={{margin: '5px 0', border: 'none', borderTop: '1px solid #ddd'}} />
            <p>येथे मजकूर लिहिण्यास सुरुवात करा...</p>
          </div>
        </div>
        <ScrollBar orientation="vertical" />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Status Bar */}
      <div className="h-3.5 bg-slate-100 border-t flex items-center justify-between px-2 text-[6px] font-black text-slate-500 uppercase shrink-0">
        <div className="flex items-center gap-2">
          <span>PAGE 1 OF 1</span>
          <span className="flex items-center gap-1"><Check className="h-1.5 w-1.5 text-green-600" /> AUTOSAVE</span>
        </div>
        <div className="flex items-center gap-1">
          <input 
            type="range" 
            min="50" max="150" 
            value={zoom} 
            onChange={(e) => setZoom(Number(e.target.value))} 
            className="w-10 h-1 accent-primary"
          />
          <span>{zoom}%</span>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .shrink-0, tabs, header, nav, footer { display: none !important; }
          .flex-1 { background: white !important; padding: 0 !important; }
          .bg-white { box-shadow: none !important; border: none !important; width: 100% !important; margin: 0 !important; }
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
