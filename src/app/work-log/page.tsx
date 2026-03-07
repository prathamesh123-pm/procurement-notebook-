
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Task } from "@/lib/types"
import { Plus, Search, ListTodo, Trash2, User, Hash, MessageSquare, Info, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"

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
    localStorage.setItem('procurepal_tasks', JSON.stringify(updatedTasks))
  }

  const addTask = () => {
    if (!newTaskTitle) return
    const newTask: Task = { id: crypto.randomUUID(), title: newTaskTitle, description: newTaskDesc, remark: "", supplierName: newTaskSupplierName, supplierId: newTaskSupplierId, assignedTo: "Procurement Manager", status: 'pending', createdAt: new Date().toISOString() }
    saveTasks([newTask, ...tasks])
    setNewTaskTitle(""); setNewTaskDesc(""); setNewTaskSupplierName(""); setNewTaskSupplierId("")
    toast({ title: "Task Saved", description: "टास्क जतन झाला आहे." })
  }

  const completeTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    const updated = tasks.filter(t => t.id !== taskId)
    saveTasks(updated)
    const stored = JSON.parse(localStorage.getItem('procurepal_reports') || '[]')
    const newReport = { id: crypto.randomUUID(), type: 'Daily Task', date: new Date().toISOString().split('T')[0], summary: `गवळी: ${task.supplierName}. टास्क: ${task.title}. शेरा: ${tempRemark}`, fullData: { ...task, remark: tempRemark } }
    localStorage.setItem('procurepal_reports', JSON.stringify([newReport, ...stored]))
    setIsDetailOpen(false)
    toast({ title: "Completed", description: "टास्क पूर्ण झाला." })
  }

  const filteredTasks = tasks.filter(t => {
    const q = searchQuery.toLowerCase()
    return t.title.toLowerCase().includes(q) || (t.supplierName?.toLowerCase().includes(q) ?? false)
  })

  if (!mounted) return null

  return (
    <div className="space-y-4 max-w-5xl mx-auto w-full pb-10 px-2 sm:px-0">
      <div className="flex flex-col gap-1 border-b pb-2">
        <h2 className="text-xl font-headline font-black text-foreground flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-primary" /> कामकाज नोंद (Work Log)
        </h2>
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Daily Task Management</p>
      </div>

      <Card className="border shadow-none bg-white rounded-2xl overflow-hidden">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-[8px] font-black uppercase text-muted-foreground">गवळी नाव</Label><Input value={newTaskSupplierName} onChange={e => setNewTaskSupplierName(e.target.value)} className="h-8 text-[10px] bg-muted/20 border-none rounded-lg" /></div>
            <div className="space-y-1"><Label className="text-[8px] font-black uppercase text-muted-foreground">कोड</Label><Input value={newTaskSupplierId} onChange={e => setNewTaskSupplierId(e.target.value)} className="h-8 text-[10px] bg-muted/20 border-none rounded-lg" /></div>
          </div>
          <div className="space-y-1"><Label className="text-[8px] font-black uppercase text-muted-foreground">टास्क नाव</Label><Input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} className="h-8 text-[10px] bg-muted/20 border-none rounded-lg font-bold" /></div>
          <div className="space-y-1"><Label className="text-[8px] font-black uppercase text-muted-foreground">माहिती</Label><Textarea value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} className="min-h-[60px] text-[10px] bg-muted/20 border-none rounded-lg" /></div>
          <Button onClick={addTask} size="sm" className="w-full font-black h-9 rounded-xl"><Plus className="h-4 w-4 mr-2" /> जतन करा</Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="शोधा... (Search...)" className="pl-9 h-9 text-xs bg-white rounded-xl shadow-sm border-none" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 gap-2">
          {filteredTasks.map(task => (
            <Card key={task.id} className="border-none shadow-sm bg-white hover:bg-muted/5 transition-all cursor-pointer border-l-4 border-l-primary rounded-xl overflow-hidden" onClick={() => { setSelectedTask(task); setTempRemark(task.remark || ""); setIsDetailOpen(true); }}>
              <div className="p-3 flex flex-col gap-1">
                <h4 className="font-black text-[11px] text-foreground truncate">{task.title}</h4>
                {(task.supplierName || task.supplierId) && (
                  <div className="flex items-center gap-3 text-[8px] font-black text-muted-foreground uppercase">
                    {task.supplierName && <span className="flex items-center gap-1"><User className="h-2.5 w-2.5 text-primary" /> {task.supplierName}</span>}
                    {task.supplierId && <span className="flex items-center gap-1"><Hash className="h-2.5 w-2.5 text-primary" /> {task.supplierId}</span>}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden rounded-3xl w-[95vw] sm:w-full">
          <DialogHeader className="p-4 bg-primary/5 border-b"><DialogTitle className="text-sm font-black">{selectedTask?.title}</DialogTitle></DialogHeader>
          <div className="p-4 space-y-4">
            <div className="p-3 rounded-xl bg-primary/5 border text-[10px] italic font-medium">{selectedTask?.description || "तपशील नाही."}</div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase text-primary">कार्यवाही / शेरा (Remark)</Label>
              <Textarea placeholder="काय कार्यवाही केली?" value={tempRemark} onChange={e => setTempRemark(e.target.value)} className="min-h-[100px] text-xs rounded-xl bg-muted/10" />
            </div>
          </div>
          <DialogFooter className="p-4 border-t bg-muted/5 flex flex-row gap-2">
            <Button variant="outline" className="flex-1 font-black h-10 text-xs rounded-xl" onClick={() => setIsDetailOpen(false)}>रद्द</Button>
            <Button className="flex-1 font-black h-10 text-xs rounded-xl" onClick={() => selectedTask && completeTask(selectedTask.id)}>पूर्ण करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
