
"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Task } from "@/lib/types"
import { Plus, Search, ListTodo, User, Hash, Trash2, CheckCircle2, X, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"

export default function WorkLogPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  const tasksQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'tasks')
  }, [db, user])

  const { data: firestoreTasks, isLoading } = useCollection(tasksQuery)
  
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDesc, setNewTaskDesc] = useState("")
  const [newTaskSupplierName, setNewTaskSupplierName] = useState("")
  const [newTaskSupplierId, setNewTaskSupplierId] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [tempRemark, setTempRemark] = useState("")
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
      description: newTaskDesc, 
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
    
    setNewTaskTitle(""); setNewTaskDesc(""); setNewTaskSupplierName(""); setNewTaskSupplierId("")
    toast({ title: "यशस्वी", description: "टास्क जतन झाला." })
  }

  const completeTask = (taskId: string) => {
    if (!db || !user || !taskId) return
    const task = firestoreTasks?.find(t => t.id === taskId)
    if (!task) return
    
    const reportData = { 
      type: 'Daily Task', 
      date: new Date().toISOString().split('T')[0], 
      reportDate: new Date().toISOString().split('T')[0],
      generatedByUserId: user.uid,
      summary: `गवळी: ${task.supplierName || 'N/A'}. टास्क: ${task.title}. कार्यवाही: ${tempRemark}`, 
      overallSummary: `गवळी: ${task.supplierName || 'N/A'}. टास्क: ${task.title}. कार्यवाही: ${tempRemark}`,
      fullData: { 
        ...task, 
        remark: tempRemark, 
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
      remark: tempRemark, 
      completedAt: new Date().toISOString() 
    });
    
    setIsDetailOpen(false)
    toast({ title: "यशस्वी", description: "टास्क पूर्ण झाला आणि अहवालात जोडला गेला." })
  }

  const handleDeleteTask = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!db || !user || !taskId) return
    
    const confirmDelete = window.confirm("तुम्हाला खात्री आहे की हा टास्क कायमचा हटवायचा आहे?")
    if (!confirmDelete) return
    
    try {
      const docRef = doc(db, 'users', user.uid, 'tasks', taskId)
      deleteDocumentNonBlocking(docRef)
      toast({ title: "यशस्वी", description: "टास्क हटवण्यात आला." })
    } catch (err) {
      toast({ title: "त्रुटी", description: "टास्क हटवताना अडचण आली.", variant: "destructive" })
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
          <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase text-primary/60 tracking-widest">माहिती (DETAILS)</Label><Textarea value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} className="min-h-[60px] text-[11px] bg-muted/20 border-none rounded-lg p-3 font-medium" placeholder="..." /></div>
          <Button type="button" onClick={addTask} className="w-full font-black h-10 rounded-xl text-xs shadow-lg shadow-primary/20"><Plus className="h-4 w-4 mr-1.5" /> जतन करा (SAVE TASK)</Button>
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
            <Card key={task.id} className="border shadow-none bg-white hover:bg-primary/5 cursor-pointer border-l-4 border-l-primary rounded-xl overflow-hidden relative group transition-all" onClick={() => { setSelectedTask(task); setTempRemark(task.remark || ""); setIsDetailOpen(true); }}>
              <div className="p-3 flex items-center justify-between gap-2">
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <h4 className="font-black text-[12px] text-slate-900 truncate uppercase tracking-tight">{task.title}</h4>
                  <div className="flex items-center gap-3 text-[9px] font-black text-muted-foreground uppercase">
                    {task.supplierName && <span className="flex items-center gap-1 bg-primary/5 px-1.5 py-0.5 rounded text-primary border border-primary/10"><User className="h-3 w-3" /> {task.supplierName}</span>}
                    {task.supplierId && <span className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded border border-muted-foreground/5"><Hash className="h-3 w-3" /> {task.supplierId}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 relative z-30">
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive rounded-full hover:bg-destructive/10" onClick={(e) => handleDeleteTask(e, task.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
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
              <DialogDescription className="text-[8px] text-white/70 uppercase">कार्यवाहीची नोंद करा.</DialogDescription>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => setIsDetailOpen(false)} className="text-white hover:bg-white/10 rounded-full h-8 w-8"><X className="h-5 w-5" /></Button>
          </DialogHeader>
          <div className="p-5 space-y-5 bg-white">
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 shadow-inner">
              <h3 className="text-xs font-black text-slate-900 mb-1 uppercase tracking-widest">{selectedTask?.title}</h3>
              <p className="text-[10px] font-bold text-slate-600 leading-relaxed italic border-l-2 border-primary/20 pl-3">
                {selectedTask?.description || "तपशील उपलब्ध नाही."}
              </p>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-1.5"><Edit className="h-3.5 w-3.5" /> कार्यवाही / शेरा (REMARK)</Label>
              <Textarea placeholder="पूर्ण केल्यावर माहिती लिहा..." value={tempRemark} onChange={e => setTempRemark(e.target.value)} className="min-h-[100px] text-[11px] font-black rounded-2xl bg-slate-50 border-none focus-visible:ring-primary shadow-inner p-3" />
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
