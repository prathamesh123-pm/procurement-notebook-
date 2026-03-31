
"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Task } from "@/lib/types"
import { Plus, Search, ListTodo, User, Hash, CheckCircle2, X, Edit, Trash2, PlusCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { AIGuidanceCard } from "@/components/ai-guidance-card"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function WorkLogPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  const tasksQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'tasks')
  }, [db, user])

  const { data: firestoreTasks, isLoading } = useCollection<Task>(tasksQuery)
  
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskSupplierName, setNewTaskSupplierName] = useState("")
  const [newTaskSupplierId, setNewTaskSupplierId] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  
  // State for multiple remark points
  const [remarkPoints, setRemarkPoints] = useState<string[]>([""])
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const addTask = () => {
    if (!newTaskTitle || !db || !user) {
      if (!newTaskTitle) toast({ title: "त्रुटी", description: "टास्कचे नाव आवश्यक आहे.", variant: "destructive" })
      return
    }
    
    const newTask = { 
      title: newTaskTitle, 
      description: "", 
      remark: "", 
      supplierName: newTaskSupplierName, 
      supplierId: newTaskSupplierId, 
      assignedTo: "Manager", 
      assignedToUserId: user.uid,
      status: 'pending', 
      createdAt: new Date().toISOString() 
    }
    
    const colRef = collection(db, 'users', user.uid, 'tasks');
    addDocumentNonBlocking(colRef, newTask);
    
    setNewTaskTitle(""); setNewTaskSupplierName(""); setNewTaskSupplierId("")
    toast({ title: "यशस्वी", description: "टास्क जतन झाला." })
  }

  const addRemarkPoint = () => setRemarkPoints([...remarkPoints, ""])
  const removeRemarkPoint = (index: number) => {
    if (remarkPoints.length > 1) {
      setRemarkPoints(remarkPoints.filter((_, i) => i !== index))
    }
  }
  const updateRemarkPoint = (index: number, value: string) => {
    const updated = [...remarkPoints]
    updated[index] = value
    setRemarkPoints(updated)
  }

  const completeTask = (taskId: string) => {
    if (!db || !user || !taskId) return
    const task = firestoreTasks?.find(t => t.id === taskId)
    if (!task) return
    
    // Format points into a numbered string for the report
    const formattedRemark = remarkPoints
      .filter(p => p.trim())
      .map((p, i) => `${i + 1}. ${p}`)
      .join(' | ')
    
    const reportData = { 
      type: 'Daily Task', 
      date: new Date().toISOString().split('T')[0], 
      reportDate: new Date().toISOString().split('T')[0],
      generatedByUserId: user.uid,
      summary: `गवळी: ${task.supplierName || 'N/A'}. टास्क: ${task.title}. कार्यवाही: ${formattedRemark}`, 
      overallSummary: `गवळी: ${task.supplierName || 'N/A'}. टास्क: ${task.title}. कार्यवाही: ${formattedRemark}`,
      fullData: { 
        ...task, 
        remark: formattedRemark, 
        status: 'completed',
        name: user.displayName || "Procurement Officer"
      },
      createdAt: new Date().toISOString()
    }
    const reportsRef = collection(db, 'users', user.uid, 'dailyWorkReports');
    addDocumentNonBlocking(reportsRef, reportData);
    
    const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
    updateDocumentNonBlocking(taskRef, { 
      status: 'completed', 
      remark: formattedRemark, 
      completedAt: new Date().toISOString() 
    });
    
    setIsDetailOpen(false)
    toast({ title: "यशस्वी", description: "टास्क पूर्ण झाला आणि अहवालात जोडला गेला." })
  }

  const handleDeleteTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!db || !user) return
    if (confirm("तुम्हाला खात्री आहे की हा टास्क हटवायचा आहे?")) {
      const taskRef = doc(db, 'users', user.uid, 'tasks', taskId)
      deleteDocumentNonBlocking(taskRef)
      toast({ title: "यशस्वी", description: "टास्क हटवण्यात आला." })
    }
  }

  const pendingTasks = useMemo(() => {
    return (firestoreTasks || [])
      .filter(t => t.status === 'pending')
      .filter(t => {
        const q = searchQuery.toLowerCase()
        return t.title.toLowerCase().includes(q) || (t.supplierName?.toLowerCase().includes(q) ?? false)
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [firestoreTasks, searchQuery])

  if (!mounted) return null

  return (
    <div className="space-y-3 max-w-5xl mx-auto w-full pb-10 px-1 animate-in fade-in duration-500">
      <div className="flex flex-col gap-0.5 border-b pb-3 px-1">
        <h2 className="text-lg font-black text-foreground flex items-center gap-2 uppercase">
          <ListTodo className="h-5 w-5 text-primary" /> कामकाज नोंद (WORK LOG)
        </h2>
      </div>

      <Card className="border shadow-none bg-white rounded-xl overflow-hidden border-muted-foreground/10">
        <CardContent className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase text-primary/60 tracking-widest">गवळी नाव</Label><Input value={newTaskSupplierName} onChange={e => setNewTaskSupplierName(e.target.value)} className="h-9 text-[11px] bg-muted/20 border-none rounded-lg p-3 font-black" placeholder="उदा. सागर" /></div>
            <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase text-primary/60 tracking-widest">कोड (CODE)</Label><Input value={newTaskSupplierId} onChange={e => setNewTaskSupplierId(e.target.value)} className="h-9 text-[11px] bg-muted/20 border-none rounded-lg p-3 font-black" placeholder="123" /></div>
          </div>
          <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase text-primary/60 tracking-widest">टास्क / कामाचे नाव</Label><Input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} className="h-9 text-[11px] bg-muted/20 border-none rounded-lg font-black p-3" placeholder="उदा. थकीत बाकी वसुली" /></div>
          
          <AIGuidanceCard context={newTaskTitle} formType="task" />
          
          <Button type="button" onClick={addTask} className="w-full font-black h-10 rounded-xl text-xs shadow-lg shadow-primary/20 mt-2"><Plus className="h-4 w-4 mr-1.5" /> जतन करा (SAVE TASK)</Button>
        </CardContent>
      </Card>

      <div className="space-y-2 pt-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
          <input placeholder="प्रलंबित टास्क शोधा (SEARCH)..." className="pl-9 h-10 w-full text-[10px] bg-white rounded-xl shadow-sm border-muted-foreground/10 outline-none focus:ring-1 focus:ring-primary font-black uppercase" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 gap-2">
          {isLoading ? (
            <div className="text-center py-10 italic text-muted-foreground font-black uppercase text-[9px] opacity-50">लोड होत आहे...</div>
          ) : pendingTasks.length > 0 ? pendingTasks.map(task => (
            <Card key={task.id} className="border shadow-none bg-white hover:bg-primary/5 cursor-pointer border-l-4 border-l-primary rounded-xl overflow-hidden relative group transition-all" onClick={() => { 
              setSelectedTask(task); 
              setRemarkPoints([""]); // Reset points when opening new task
              setIsDetailOpen(true); 
            }}>
              <div className="p-3 flex items-center justify-between gap-2">
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <h4 className="font-black text-[12px] text-slate-900 truncate uppercase tracking-tight">{task.title}</h4>
                  <div className="flex items-center gap-3 text-[9px] font-black text-muted-foreground uppercase">
                    {task.supplierName && <span className="flex items-center gap-1 bg-primary/5 px-1.5 py-0.5 rounded text-primary border border-primary/10"><User className="h-3 w-3" /> {task.supplierName}</span>}
                    {task.supplierId && <span className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded border border-muted-foreground/5"><Hash className="h-3 w-3" /> {task.supplierId}</span>}
                  </div>
                </div>
                <Button type="button" size="icon" variant="ghost" onClick={(e) => handleDeleteTask(task.id, e)} className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )) : (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center gap-3 opacity-20">
              <ListTodo className="h-10 w-10" />
              <p className="text-[10px] font-black uppercase tracking-widest">एकही प्रलंबित टास्क नाही</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
          <DialogHeader className="p-4 bg-primary text-white flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-xs font-black flex items-center gap-2 uppercase tracking-widest"><ListTodo className="h-4 w-4" /> टास्क तपशील (TASK DETAIL)</DialogTitle>
              <DialogDescription className="text-[8px] text-white/70 uppercase">कार्यवाहीची नोंद करा (मुद्द्यांनुसार).</DialogDescription>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => setIsDetailOpen(false)} className="text-white hover:bg-white/10 rounded-full h-8 w-8"><X className="h-5 w-5" /></Button>
          </DialogHeader>
          <div className="p-5 space-y-5 bg-white">
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 shadow-inner">
              <h3 className="text-xs font-black text-slate-900 mb-1 uppercase tracking-widest">{selectedTask?.title}</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-[9px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-1.5"><Edit className="h-3.5 w-3.5" /> कार्यवाही / शेरा (REMARK POINTS)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addRemarkPoint} className="h-7 text-[9px] font-black gap-1 rounded-lg border-primary/20 text-primary">
                  <PlusCircle className="h-3 w-3" /> मुद्दा जोडा
                </Button>
              </div>
              
              <ScrollArea className="max-h-[300px] pr-2">
                <div className="space-y-2">
                  {remarkPoints.map((point, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center font-black text-[10px] text-primary shrink-0 border border-primary/5">{index + 1}</div>
                      <Input 
                        value={point} 
                        onChange={e => updateRemarkPoint(index, e.target.value)} 
                        placeholder="मुद्दा लिहा..." 
                        className="h-9 text-[11px] font-bold bg-slate-50 border-none rounded-xl px-3 focus-visible:ring-primary shadow-inner"
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeRemarkPoint(index)} className="h-8 w-8 text-rose-400 hover:bg-rose-50 rounded-lg shrink-0">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          <DialogFooter className="p-4 border-t bg-slate-50 flex gap-2 justify-end">
            <Button type="button" variant="outline" className="h-10 text-[10px] font-black rounded-xl border-primary/20 px-6 uppercase" onClick={() => setIsDetailOpen(false)}>रद्द</Button>
            <Button type="button" className="h-10 text-[10px] font-black rounded-xl bg-primary shadow-lg shadow-primary/20 px-8 uppercase" onClick={() => selectedTask && completeTask(selectedTask.id)}>
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> पूर्ण करा (COMPLETE)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
