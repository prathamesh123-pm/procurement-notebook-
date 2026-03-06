
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  const [activeTab, setActiveTab] = useState<string>("all")
  const [mounted, setMounted] = useState(false)
  
  // Detail Dialog State
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
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle,
      description: newTaskDesc,
      remark: "",
      supplierName: newTaskSupplierName,
      supplierId: newTaskSupplierId,
      assignedTo: "Procurement Manager",
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    saveTasks([newTask, ...tasks])
    setNewTaskTitle("")
    setNewTaskDesc("")
    setNewTaskSupplierName("")
    setNewTaskSupplierId("")
    toast({
      title: "Task Saved",
      description: "नवीन टास्क जोडला आहे. त्यावर क्लिक करून शेरा भरा किंवा पूर्ण करा.",
    })
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setTempRemark(task.remark || "")
    setIsDetailOpen(true)
  }

  const updateRemarkOnly = () => {
    if (!selectedTask) return
    const updatedTasks = tasks.map(t => 
      t.id === selectedTask.id ? { ...t, remark: tempRemark } : t
    )
    saveTasks(updatedTasks)
    setIsDetailOpen(false)
    toast({
      title: "Remark Updated",
      description: "शेरा अपडेट केला आहे.",
    })
  }

  const completeTask = (taskId: string) => {
    const taskToComplete = tasks.find(t => t.id === taskId)
    if (!taskToComplete) return

    const finalRemark = tempRemark

    // Remove from tasks list
    const updatedTasks = tasks.filter(t => t.id !== taskId)
    saveTasks(updatedTasks)

    // Create Report Entry with fullData
    const storedReports = JSON.parse(localStorage.getItem('procurepal_reports') || '[]')
    
    // Construct summary that preserves the structure as requested
    let reportSummary = `गवळी: ${taskToComplete.supplierName || 'N/A'} (${taskToComplete.supplierId || 'N/A'})\n`
    reportSummary += `टास्क: ${taskToComplete.title}\n`
    if (taskToComplete.description) reportSummary += `तपशील: ${taskToComplete.description}\n`
    if (finalRemark) reportSummary += `शेरा (Action Plan): ${finalRemark}`

    const newReport = {
      id: crypto.randomUUID(),
      type: 'Daily Task',
      date: new Date().toISOString().split('T')[0],
      workItemsCount: 1,
      interactionsCount: 1,
      summary: reportSummary,
      fullData: {
        title: taskToComplete.title,
        description: taskToComplete.description,
        supplierName: taskToComplete.supplierName,
        supplierId: taskToComplete.supplierId,
        remark: finalRemark,
        createdAt: taskToComplete.createdAt
      }
    }
    
    localStorage.setItem('procurepal_reports', JSON.stringify([newReport, ...storedReports]))
    setIsDetailOpen(false)

    toast({
      title: "Task Completed",
      description: "टास्क पूर्ण झाला आणि अहवालात जतन केला.",
    })
  }

  const deleteTask = (taskId: string) => {
    if (!confirm("तुम्हाला हा टास्क हटवायचा आहे का?")) return
    saveTasks(tasks.filter(t => t.id !== taskId))
  }

  const filteredTasks = tasks.filter(t => {
    const query = searchQuery.toLowerCase()
    return (
      t.title.toLowerCase().includes(query) || 
      (t.description?.toLowerCase().includes(query) ?? false) ||
      (t.remark?.toLowerCase().includes(query) ?? false) ||
      (t.supplierName?.toLowerCase().includes(query) ?? false) ||
      (t.supplierId?.toLowerCase().includes(query) ?? false)
    )
  })

  if (!mounted) return null

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full pb-10">
      <div className="flex flex-col gap-1 border-b pb-2">
        <h2 className="text-2xl font-headline font-bold text-foreground flex items-center gap-2">
          <ListTodo className="h-6 w-6 text-primary" /> 
          कामकाज नोंद (Work Log)
        </h2>
        <p className="text-xs text-muted-foreground font-medium">तुमची रोजची कामे येथे नोंदवा. टास्कवर क्लिक करून शेरा भरा.</p>
      </div>

      <Card className="border shadow-none bg-white overflow-hidden">
        <div className="bg-primary/5 px-4 py-2 border-b">
          <CardTitle className="text-xs font-bold flex items-center gap-2 uppercase tracking-tight">
            <Plus className="h-4 w-4 text-primary" /> नवीन टास्क जोडा (New Task)
          </CardTitle>
        </div>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="supplierName" className="text-[10px] font-bold uppercase text-muted-foreground">गवळ्याचे नाव (Supplier Name)</Label>
              <Input 
                id="supplierName" 
                placeholder="उदा. राहुल डेअरी" 
                value={newTaskSupplierName} 
                onChange={(e) => setNewTaskSupplierName(e.target.value)} 
                className="h-9 text-xs bg-muted/20"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="supplierId" className="text-[10px] font-bold uppercase text-muted-foreground">कोड नंबर (Code Numbar)</Label>
              <Input 
                id="supplierId" 
                placeholder="उदा. 123/45" 
                value={newTaskSupplierId} 
                onChange={(e) => setNewTaskSupplierId(e.target.value)} 
                className="h-9 text-xs bg-muted/20"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-[10px] font-bold uppercase text-muted-foreground">टास्कचे नाव (Task Title)</Label>
            <Input 
              id="title" 
              placeholder="उदा. फॅट ऑडिट किंवा भेसळ तपासणी" 
              value={newTaskTitle} 
              onChange={(e) => setNewTaskTitle(e.target.value)} 
              className="h-9 text-xs bg-muted/20 font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="desc" className="text-[10px] font-bold uppercase text-muted-foreground">टास्कची माहिती (Information about the task)</Label>
            <Textarea 
              id="desc" 
              placeholder="टास्कबद्दल सविस्तर माहिती येथे लिहा..." 
              value={newTaskDesc} 
              onChange={(e) => setNewTaskDesc(e.target.value)} 
              className="min-h-[80px] text-xs bg-muted/20"
            />
          </div>
          
          <Button onClick={addTask} className="w-full sm:w-auto font-bold px-8 h-9 shadow-sm">
            <Plus className="h-4 w-4 mr-2" /> टास्क जतन करा (Save Task)
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-4 py-1 font-bold text-xs bg-primary/5 text-primary border-primary/20">
              प्रलंबित यादी (Pending List)
            </Badge>
          </div>
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="शोधा (गवळी किंवा टास्क...)" 
              className="pl-10 h-9 bg-white text-xs" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <Card 
                key={task.id} 
                className="border shadow-none group bg-white hover:bg-muted/5 transition-all cursor-pointer border-l-4 border-l-primary"
                onClick={() => handleTaskClick(task)}
              >
                <CardContent className="p-3 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                          {task.title}
                        </h4>
                        {(task.supplierName || task.supplierId) && (
                          <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase">
                            {task.supplierName && <span className="flex items-center gap-1"><User className="h-3 w-3 text-primary" /> {task.supplierName}</span>}
                            {task.supplierId && <span className="flex items-center gap-1"><Hash className="h-3 w-3 text-primary" /> {task.supplierId}</span>}
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-destructive" 
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteTask(task.id)
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    
                    <p className="text-xs leading-relaxed text-muted-foreground mt-1.5 line-clamp-1 italic">
                      {task.description || "माहिती उपलब्ध नाही."}
                    </p>

                    {task.remark && (
                      <div className="mt-2 flex items-center gap-1.5 text-primary text-[10px] font-bold bg-primary/5 px-2 py-0.5 rounded-full w-fit">
                        <MessageSquare className="h-3 w-3" />
                        <span>शेरा जोडला आहे (Remark Added)</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed flex flex-col items-center gap-3">
               <ListTodo className="h-10 w-10 text-muted-foreground/20" />
               <div className="space-y-1">
                 <h3 className="text-sm font-bold text-muted-foreground">एकही प्रलंबित टास्क नाही</h3>
                 <p className="text-[10px] text-muted-foreground/60">नवीन टास्क जोडण्यासाठी वरचा फॉर्म वापरा.</p>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Detail & Remark Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden">
          <DialogHeader className="p-4 bg-primary/5 border-b">
            <DialogTitle className="text-lg font-bold font-headline">{selectedTask?.title}</DialogTitle>
            <DialogDescription className="text-xs">टास्कची माहिती तपासा आणि पुढील कार्यवाहीसाठी शेरा भरा.</DialogDescription>
          </DialogHeader>
          
          <div className="p-4 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-lg bg-muted/30 border space-y-0.5">
                <Label className="text-[9px] font-bold uppercase text-muted-foreground">गवळी (Supplier)</Label>
                <p className="text-xs font-bold flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-primary" /> {selectedTask?.supplierName || "N/A"}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/30 border space-y-0.5">
                <Label className="text-[9px] font-bold uppercase text-muted-foreground">कोड (Code)</Label>
                <p className="text-xs font-bold flex items-center gap-1.5"><Hash className="h-3.5 w-3.5 text-primary" /> {selectedTask?.supplierId || "N/A"}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[9px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" /> टास्क तपशील (Task Info)
              </Label>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-xs leading-relaxed italic">
                {selectedTask?.description || "या टास्कसाठी कोणताही तपशील दिलेला नाही."}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-remark" className="text-[10px] font-bold uppercase text-primary flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> Remark / शेरा (Action Plan)
              </Label>
              <Textarea 
                id="modal-remark" 
                placeholder="उदा. प्रत्यक्ष भेट देऊन समस्या सोडवली किंवा नोटीस दिली." 
                value={tempRemark} 
                onChange={(e) => setTempRemark(e.target.value)} 
                className="min-h-[100px] text-xs border-primary/20 focus:border-primary"
              />
              <p className="text-[9px] text-muted-foreground italic">हा शेरा अंतिम रिपोर्टमध्ये दिसणार आहे.</p>
            </div>
          </div>

          <DialogFooter className="p-4 border-t bg-muted/5 flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="flex-1 font-bold h-9 text-xs" onClick={updateRemarkOnly}>
              शेरा अपडेट करा (Update)
            </Button>
            <Button 
              className="flex-1 font-bold bg-primary hover:bg-primary/90 gap-1.5 h-9 text-xs" 
              onClick={() => selectedTask && completeTask(selectedTask.id)}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> टास्क पूर्ण करा (Complete)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
