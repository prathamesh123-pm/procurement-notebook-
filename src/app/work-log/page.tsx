"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Task } from "@/lib/types"
import { Plus, Search, ListTodo, User, Hash, Trash2, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

export default function WorkLogPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDesc, setNewTaskDesc] = useState("")
  const [newTaskSupplierName, setNewTaskSupplierName] = useState("")
  const [newTaskSupplierId, setNewTaskSupplierId] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [tempRemark, setTempRemark] = useState("")
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    const stored = JSON.parse(localStorage.getItem('procurepal_tasks') || '[]')
    setTasks(stored.filter((t: Task) => t.status === 'pending'))
  }, [])

  const saveTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks)
    const allStored = JSON.parse(localStorage.getItem('procurepal_tasks') || '[]')
    const completedTasks = allStored.filter((t: any) => t.status === 'completed')
    localStorage.setItem('procurepal_tasks', JSON.stringify([...updatedTasks, ...completedTasks]))
  }

  const addTask = () => {
    if (!newTaskTitle) return
    const newTask: Task = { 
      id: crypto.randomUUID(), 
      title: newTaskTitle, 
      description: newTaskDesc, 
      remark: "", 
      supplierName: newTaskSupplierName, 
      supplierId: newTaskSupplierId, 
      assignedTo: "Manager", 
      status: 'pending', 
      createdAt: new Date().toISOString() 
    }
    const updated = [newTask, ...tasks]
    saveTasks(updated)
    setNewTaskTitle(""); setNewTaskDesc(""); setNewTaskSupplierName(""); setNewTaskSupplierId("")
    toast({ title: "टास्क जतन झाला", description: "माहिती यशस्वीरित्या सेव्ह झाली." })
  }

  const completeTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    const updated = tasks.filter(t => t.id !== taskId)
    saveTasks(updated)
    
    // Add to reports
    const storedReports = JSON.parse(localStorage.getItem('procurepal_reports') || '[]')
    const newReport = { 
      id: crypto.randomUUID(), 
      type: 'Daily Task', 
      date: new Date().toISOString().split('T')[0], 
      summary: `गवळी: ${task.supplierName || 'N/A'}. टास्क: ${task.title}. शेरा: ${tempRemark}`, 
      fullData: { ...task, remark: tempRemark, status: 'completed' } 
    }
    localStorage.setItem('procurepal_reports', JSON.stringify([newReport, ...storedReports]))
    
    // Update the master task list
    const allStored = JSON.parse(localStorage.getItem('procurepal_tasks') || '[]')
    const updatedMaster = allStored.map((t: any) => t.id === taskId ? { ...t, status: 'completed', remark: tempRemark } : t)
    localStorage.setItem('procurepal_tasks', JSON.stringify(updatedMaster))

    setIsDetailOpen(false)
    toast({ title: "पूर्ण झाले", description: "टास्क पूर्ण झाला आणि अहवालात जोडला गेला." })
  }

  const deleteTask = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation()
    if (!confirm("हा टास्क कायमचा हटवायचा आहे का?")) return
    
    const updated = tasks.filter(t => t.id !== taskId)
    setTasks(updated)
    
    const allStored = JSON.parse(localStorage.getItem('procurepal_tasks') || '[]')
    const updatedMaster = allStored.filter((t: any) => String(t.id) !== String(taskId))
    localStorage.setItem('procurepal_tasks', JSON.stringify(updatedMaster))
    
    toast({ title: "हटवले", description: "टास्क यशस्वीरित्या काढून टाकला आहे." })
  }

  const filteredTasks = tasks.filter(t => {
    const q = searchQuery.toLowerCase()
    return t.title.toLowerCase().includes(q) || (t.supplierName?.toLowerCase().includes(q) ?? false)
  })

  if (!mounted) return null

  return (
    <div className="space-y-3 max-w-5xl mx-auto w-full pb-10">
      <div className="flex flex-col gap-0.5 border-b pb-1 px-1">
        <h2 className="text-lg font-black text-foreground flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-primary" /> कामकाज नोंद (Work Log)
        </h2>
      </div>

      <Card className="border shadow-none bg-white rounded-xl overflow-hidden">
        <CardContent className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5"><Label className="text-[10px] font-black uppercase">गवळी नाव</Label><Input value={newTaskSupplierName} onChange={e => setNewTaskSupplierName(e.target.value)} className="h-8 text-[11px] bg-muted/20 border-none rounded-md" placeholder="उदा. सागर" /></div>
            <div className="space-y-0.5"><Label className="text-[10px] font-black uppercase">कोड (Code)</Label><Input value={newTaskSupplierId} onChange={e => setNewTaskSupplierId(e.target.value)} className="h-8 text-[11px] bg-muted/20 border-none rounded-md" placeholder="123" /></div>
          </div>
          <div className="space-y-0.5"><Label className="text-[10px] font-black uppercase">टास्क / कामाचे नाव</Label><Input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} className="h-8 text-[11px] bg-muted/20 border-none rounded-md font-bold" placeholder="उदा. थकीत बाकी वसुली" /></div>
          <div className="space-y-0.5"><Label className="text-[10px] font-black uppercase">माहिती (Details)</Label><Textarea value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} className="min-h-[60px] text-[11px] bg-muted/20 border-none rounded-md p-2" placeholder="..." /></div>
          <Button onClick={addTask} className="w-full font-black h-9 rounded-lg text-xs shadow-md"><Plus className="h-4 w-4 mr-1.5" /> जतन करा (Save)</Button>
        </CardContent>
      </Card>

      <div className="space-y-2 px-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="शोधा (Search)..." className="pl-9 h-9 w-full text-[11px] bg-white rounded-lg shadow-sm border-none outline-none focus:ring-1 focus:ring-primary" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 gap-2">
          {filteredTasks.length > 0 ? filteredTasks.map(task => (
            <Card key={task.id} className="border-none shadow-sm bg-white hover:bg-muted/5 cursor-pointer border-l-4 border-l-primary rounded-lg overflow-hidden relative" onClick={() => { setSelectedTask(task); setTempRemark(task.remark || ""); setIsDetailOpen(true); }}>
              <div className="p-3 flex items-center justify-between gap-2">
                <div className="flex flex-col gap-1 min-w-0">
                  <h4 className="font-black text-[13px] text-slate-900 truncate">{task.title}</h4>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase">
                    {task.supplierName && <span className="flex items-center gap-1"><User className="h-3 w-3 text-primary" /> {task.supplierName}</span>}
                    {task.supplierId && <span className="flex items-center gap-1"><Hash className="h-3 w-3 text-primary" /> {task.supplierId}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 relative z-10">
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive rounded-full hover:bg-red-50" onClick={(e) => deleteTask(e, task.id)}>
                    <Trash2 className="h-4.5 w-4.5" />
                  </Button>
                </div>
              </div>
            </Card>
          )) : (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200 flex flex-col items-center gap-3 opacity-50">
              <ListTodo className="h-10 w-10 text-slate-300" />
              <p className="text-[11px] font-black uppercase text-slate-400">प्रलंबित टास्क नाहीत</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
          <DialogHeader className="p-4 bg-primary text-white flex flex-row items-center justify-between">
            <DialogTitle className="text-sm font-black flex items-center gap-2"><ListTodo className="h-4 w-4" /> टास्क तपशील</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsDetailOpen(false)} className="text-white hover:bg-white/10 rounded-full h-8 w-8"><X className="h-5 w-5" /></Button>
          </DialogHeader>
          <div className="p-5 space-y-5 bg-white">
            <div className="p-4 rounded-xl bg-primary/5 border-2 border-primary/10">
              <h3 className="text-sm font-black text-slate-900 mb-1">{selectedTask?.title}</h3>
              <p className="text-[11px] font-medium text-slate-600 leading-relaxed italic">"{selectedTask?.description || "तपशील नाही."}"</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-1.5"><Edit className="h-3.5 w-3.5" /> कार्यवाही / शेरा (Remark)</Label>
              <Textarea placeholder="पूर्ण केल्यावर माहिती लिहा..." value={tempRemark} onChange={e => setTempRemark(e.target.value)} className="min-h-[100px] text-[12px] font-bold rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-primary shadow-inner" />
            </div>
          </div>
          <DialogFooter className="p-4 border-t bg-slate-50 flex gap-3">
            <Button variant="outline" className="flex-1 h-10 text-xs font-black rounded-xl border-slate-300" onClick={() => setIsDetailOpen(false)}>रद्द</Button>
            <Button className="flex-1 h-10 text-xs font-black rounded-xl bg-primary shadow-lg shadow-primary/20" onClick={() => selectedTask && completeTask(selectedTask.id)}>
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> पूर्ण करा (Complete)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
