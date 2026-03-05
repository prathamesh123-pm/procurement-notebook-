
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
      description: "New task added. Click on it to add a remark or complete it.",
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
      description: "Action plan has been saved.",
    })
  }

  const completeTask = (taskId: string) => {
    const taskToComplete = tasks.find(t => t.id === taskId)
    if (!taskToComplete) return

    // Finalize the remark from current tempRemark
    const finalRemark = tempRemark

    // Remove from tasks list
    const updatedTasks = tasks.filter(t => t.id !== taskId)
    saveTasks(updatedTasks)

    // Create Report Entry
    const storedReports = JSON.parse(localStorage.getItem('procurepal_reports') || '[]')
    
    let reportSummary = `Task: ${taskToComplete.title}.`
    if (taskToComplete.description) reportSummary += ` Details: ${taskToComplete.description}.`
    if (finalRemark) reportSummary += ` Action Taken (Remark): ${finalRemark}.`
    if (taskToComplete.supplierName) reportSummary += ` [Supplier: ${taskToComplete.supplierName} (${taskToComplete.supplierId || 'N/A'})]`

    const newReport = {
      id: crypto.randomUUID(),
      type: 'Daily Log',
      date: new Date().toISOString().split('T')[0],
      workItemsCount: 1,
      interactionsCount: 1,
      summary: reportSummary
    }
    
    localStorage.setItem('procurepal_reports', JSON.stringify([newReport, ...storedReports]))
    setIsDetailOpen(false)

    toast({
      title: "Task Completed",
      description: "Task has been moved to Management Reports.",
    })
  }

  const deleteTask = (taskId: string) => {
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
    <div className="space-y-8 max-w-5xl mx-auto w-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-headline font-bold text-foreground tracking-tight">Work Log</h2>
        <p className="text-muted-foreground font-medium">Manage and track your daily procurement duties. Click tasks to add remarks.</p>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <div className="bg-primary/5 px-6 py-4 border-b">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" /> New Task
          </CardTitle>
        </div>
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-bold text-xs uppercase tracking-wider">Task Title</Label>
              <Input 
                id="title" 
                placeholder="e.g. Monthly collection review" 
                value={newTaskTitle} 
                onChange={(e) => setNewTaskTitle(e.target.value)} 
                className="bg-muted/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplierName" className="font-bold text-xs uppercase tracking-wider">Gavlyache Nav</Label>
                <Input 
                  id="supplierName" 
                  placeholder="Supplier Name" 
                  value={newTaskSupplierName} 
                  onChange={(e) => setNewTaskSupplierName(e.target.value)} 
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplierId" className="font-bold text-xs uppercase tracking-wider">Code Numbar</Label>
                <Input 
                  id="supplierId" 
                  placeholder="Code Number" 
                  value={newTaskSupplierId} 
                  onChange={(e) => setNewTaskSupplierId(e.target.value)} 
                  className="bg-muted/30"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc" className="font-bold text-xs uppercase tracking-wider">Information about the task</Label>
            <Textarea 
              id="desc" 
              placeholder="Enter task details here..." 
              value={newTaskDesc} 
              onChange={(e) => setNewTaskDesc(e.target.value)} 
              className="min-h-[100px] bg-muted/30"
            />
          </div>
          <Button onClick={addTask} className="w-full sm:w-auto font-bold px-12 h-11 shadow-sm">
            Save Task
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="bg-muted/50 p-1 rounded-lg">
              <TabsTrigger value="all" className="px-10 font-bold text-sm rounded-md">Pending List</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative w-full sm:w-[350px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search tasks or suppliers..." 
              className="pl-10 h-10 bg-white shadow-sm" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <Card 
                key={task.id} 
                className="border-none shadow-sm group bg-white hover:shadow-md transition-all cursor-pointer border-l-4 border-primary/20 hover:border-primary"
                onClick={() => handleTaskClick(task)}
              >
                <CardContent className="p-5 flex items-start gap-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                          {task.title}
                        </h4>
                        {(task.supplierName || task.supplierId) && (
                          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {task.supplierName && <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-primary" /> {task.supplierName}</span>}
                            {task.supplierId && <span className="flex items-center gap-1.5"><Hash className="h-3.5 w-3.5 text-primary" /> {task.supplierId}</span>}
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" 
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteTask(task.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <p className="text-sm leading-relaxed text-muted-foreground mt-2 line-clamp-1 italic">
                      {task.description || "No description provided."}
                    </p>

                    {task.remark && (
                      <div className="mt-3 flex items-center gap-2 text-primary text-xs font-bold">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Remark added</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-tighter">
                      <Plus className="h-3 w-3" /> Created: {new Date(task.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-24 bg-white rounded-xl border border-dashed flex flex-col items-center gap-4">
              <div className="bg-muted/30 p-6 rounded-full">
                 <ListTodo className="h-12 w-12 text-muted-foreground/20" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-muted-foreground tracking-tight">No pending tasks found</h3>
                <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto">Create a new task to get started with your procurement work.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Detail & Remark Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-headline">{selectedTask?.title}</DialogTitle>
            <DialogDescription>Review task details and add your action plan or remark.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-muted/30 border space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Supplier Name</Label>
                <p className="font-bold flex items-center gap-2 text-foreground"><User className="h-4 w-4 text-primary" /> {selectedTask?.supplierName || "N/A"}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border space-y-1">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Code Number</Label>
                <p className="font-bold flex items-center gap-2 text-foreground"><Hash className="h-4 w-4 text-primary" /> {selectedTask?.supplierId || "N/A"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Info className="h-3.5 w-3.5" /> Task Information
              </Label>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-sm leading-relaxed text-foreground/80 italic">
                {selectedTask?.description || "No specific details provided for this task."}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="modal-remark" className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5" /> Remark / शेरा (Action Plan)
              </Label>
              <Textarea 
                id="modal-remark" 
                placeholder="उदा. प्रत्यक्ष भेट देऊन समस्या सोडवली, किंवा पुढील कार्यवाही केली." 
                value={tempRemark} 
                onChange={(e) => setTempRemark(e.target.value)} 
                className="min-h-[120px] border-primary/20 focus:border-primary bg-background shadow-inner"
              />
              <p className="text-[10px] text-muted-foreground italic font-medium">हा शेरा रिपोर्टमध्ये जतन केला जाईल.</p>
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-0">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button variant="outline" className="flex-1 font-bold h-12" onClick={updateRemarkOnly}>
                Update Remark
              </Button>
              <Button 
                className="flex-1 font-bold bg-primary hover:bg-primary/90 gap-2 h-12" 
                onClick={() => selectedTask && completeTask(selectedTask.id)}
              >
                <CheckCircle2 className="h-4 w-4" /> Complete Task
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
