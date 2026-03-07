
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Task } from "@/lib/types"
import { Plus, Search, ListTodo, User, Hash, Trash2 } from "lucide-react"
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
    // Only save pending ones to the active tasks list in storage if desired,
    // or keep all and filter. For simplicity with current code, we update the whole list.
    const allStored = JSON.parse(localStorage.getItem('procurepal_tasks') || '[]')
    const others = allStored.filter((t: any) => t.status !== 'pending')
    localStorage.setItem('procurepal_tasks', JSON.stringify([...updatedTasks, ...others]))
  }

  const addTask = () => {
    if (!newTaskTitle) return
    const newTask: Task = { id: crypto.randomUUID(), title: newTaskTitle, description: newTaskDesc, remark: "", supplierName: newTaskSupplierName, supplierId: newTaskSupplierId, assignedTo: "Manager", status: 'pending', createdAt: new Date().toISOString() }
    saveTasks([newTask, ...tasks])
    setNewTaskTitle(""); setNewTaskDesc(""); setNewTaskSupplierName(""); setNewTaskSupplierId("")
    toast({ title: "Task Saved", description: "टास्क जतन झाला." })
  }

  const completeTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    const updated = tasks.filter(t => t.id !== taskId)
    saveTasks(updated)
    const stored = JSON.parse(localStorage.getItem('procurepal_reports') || '[]')
    const newReport = { id: crypto.randomUUID(), type: 'Daily Task', date: new Date().toISOString().split('T')[0], summary: `गवळी: ${task.supplierName}. टास्क: ${task.title}. शेरा: ${tempRemark}`, fullData: { ...task, remark: tempRemark, status: 'completed' } }
    localStorage.setItem('procurepal_reports', JSON.stringify([newReport, ...stored]))
    setIsDetailOpen(false)
    toast({ title: "Completed", description: "टास्क पूर्ण झाला." })
  }

  const deleteTask = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation()
    if (!confirm("हा टास्क हटवायचा आहे का?")) return
    const updated = tasks.filter(t => t.id !== taskId)
    saveTasks(updated)
    toast({ title: "Deleted", description: "टास्क हटवला आहे." })
  }

  const filteredTasks = tasks.filter(t => {
    const q = searchQuery.toLowerCase()
    return t.title.toLowerCase().includes(q) || (t.supplierName?.toLowerCase().includes(q) ?? false)
  })

  if (!mounted) return null

  return (
    <div className="space-y-3 max-w-5xl mx-auto w-full pb-10 px-2 sm:px-0">
      <div className="flex flex-col gap-0.5 border-b pb-1">
        <h2 className="text-lg font-headline font-black text-foreground flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-primary" /> कामकाज नोंद (Log)
        </h2>
      </div>

      <Card className="border shadow-none bg-white rounded-xl overflow-hidden">
        <CardContent className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">गवळी</Label><Input value={newTaskSupplierName} onChange={e => setNewTaskSupplierName(e.target.value)} className="h-8 text-[11px] bg-muted/20 border-none rounded-md" /></div>
            <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">कोड</Label><Input value={newTaskSupplierId} onChange={e => setNewTaskSupplierId(e.target.value)} className="h-8 text-[11px] bg-muted/20 border-none rounded-md" /></div>
          </div>
          <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">टास्क नाव</Label><Input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} className="h-8 text-[11px] bg-muted/20 border-none rounded-md font-bold" /></div>
          <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase">माहिती</Label><Textarea value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} className="min-h-[60px] text-[11px] bg-muted/20 border-none rounded-md p-2" /></div>
          <Button onClick={addTask} className="w-full font-black h-9 rounded-lg text-xs"><Plus className="h-4 w-4 mr-1.5" /> जतन करा</Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="शोधा..." className="pl-9 h-9 text-[11px] bg-white rounded-lg shadow-sm border-none" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 gap-2">
          {filteredTasks.map(task => (
            <Card key={task.id} className="border-none shadow-sm bg-white hover:bg-muted/5 cursor-pointer border-l-4 border-l-primary rounded-lg overflow-hidden" onClick={() => { setSelectedTask(task); setTempRemark(task.remark || ""); setIsDetailOpen(true); }}>
              <div className="p-3 flex items-center justify-between gap-2">
                <div className="flex flex-col gap-1 min-w-0">
                  <h4 className="font-black text-[12px] text-foreground truncate">{task.title}</h4>
                  <div className="flex items-center gap-3 text-[9px] font-black text-muted-foreground uppercase">
                    {task.supplierName && <span className="flex items-center gap-1"><User className="h-3 w-3 text-primary" /> {task.supplierName}</span>}
                    {task.supplierId && <span className="flex items-center gap-1"><Hash className="h-3 w-3 text-primary" /> {task.supplierId}</span>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive rounded-full" onClick={(e) => deleteTask(e, task.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="p-3 bg-primary/5 border-b"><DialogTitle className="text-xs font-black">{selectedTask?.title}</DialogTitle></DialogHeader>
          <div className="p-4 space-y-4">
            <div className="p-3 rounded-lg bg-primary/5 border text-[11px] italic">{selectedTask?.description || "तपशील नाही."}</div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-primary">कार्यवाही / शेरा</Label>
              <Textarea placeholder="..." value={tempRemark} onChange={e => setTempRemark(e.target.value)} className="min-h-[80px] text-[11px] rounded-lg bg-muted/10 border-none" />
            </div>
          </div>
          <DialogFooter className="p-3 border-t bg-muted/5 flex gap-2">
            <Button variant="outline" className="flex-1 h-9 text-xs rounded-lg" onClick={() => setIsDetailOpen(false)}>रद्द</Button>
            <Button className="flex-1 h-9 text-xs rounded-lg" onClick={() => selectedTask && completeTask(selectedTask.id)}>पूर्ण करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
