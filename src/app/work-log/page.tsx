
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Task } from "@/lib/types"
import { Plus, Search, ListTodo, Trash2, User, Hash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function WorkLogPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDesc, setNewTaskDesc] = useState("")
  const [newTaskSupplierName, setNewTaskSupplierName] = useState("")
  const [newTaskSupplierId, setNewTaskSupplierId] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<string>("all")
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    const stored = JSON.parse(localStorage.getItem('procurepal_tasks') || '[]')
    // Only show pending tasks in Work Log
    setTasks(stored.filter((t: Task) => t.status === 'pending'))
  }, [])

  const saveTasks = (updatedTasks: Task[]) => {
    // We only keep pending tasks in this list now
    setTasks(updatedTasks)
    
    // Get all tasks from storage to not lose them, or just manage pending here
    // However, the logic is: once completed, they move to reports. 
    // So 'procurepal_tasks' will only ever hold pending items.
    localStorage.setItem('procurepal_tasks', JSON.stringify(updatedTasks))
  }

  const addTask = () => {
    if (!newTaskTitle) return
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle,
      description: newTaskDesc,
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
      description: "New task added to your work log.",
    })
  }

  const completeTask = (taskId: string) => {
    const taskToComplete = tasks.find(t => t.id === taskId)
    if (!taskToComplete) return

    // 1. Remove from pending tasks
    const updatedTasks = tasks.filter(t => t.id !== taskId)
    saveTasks(updatedTasks)

    // 2. Add to Reports (procurepal_reports)
    const storedReports = JSON.parse(localStorage.getItem('procurepal_reports') || '[]')
    const newReport = {
      id: crypto.randomUUID(),
      type: 'Daily Log',
      date: new Date().toISOString().split('T')[0],
      workItemsCount: 1,
      interactionsCount: 1,
      summary: `Task Completed: ${taskToComplete.title}. ${taskToComplete.description || ''} ${taskToComplete.supplierName ? `[Supplier: ${taskToComplete.supplierName} (${taskToComplete.supplierId})]` : ''}`
    }
    
    localStorage.setItem('procurepal_reports', JSON.stringify([newReport, ...storedReports]))

    toast({
      title: "Task Completed",
      description: "Task moved to Management Reports.",
    })
  }

  const deleteTask = (taskId: string) => {
    saveTasks(tasks.filter(t => t.id !== taskId))
  }

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (t.supplierName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (t.supplierId?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    return matchesSearch
  })

  if (!mounted) return null

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full">
      <div>
        <h2 className="text-3xl font-headline font-bold text-foreground tracking-tight">Work Log</h2>
        <p className="text-muted-foreground mt-1 font-medium">Manage and track your daily procurement duties. Completed tasks move to Reports.</p>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold">New Task</CardTitle>
          <CardDescription>Create a specific task or observation for your log.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-bold">Task Title</Label>
              <Input 
                id="title" 
                placeholder="e.g. Monthly collection review" 
                value={newTaskTitle} 
                onChange={(e) => setNewTaskTitle(e.target.value)} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplierName" className="font-bold">Gavlyache Nav</Label>
                <Input 
                  id="supplierName" 
                  placeholder="Supplier Name" 
                  value={newTaskSupplierName} 
                  onChange={(e) => setNewTaskSupplierName(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplierId" className="font-bold">Code Numbar</Label>
                <Input 
                  id="supplierId" 
                  placeholder="Code Number" 
                  value={newTaskSupplierId} 
                  onChange={(e) => setNewTaskSupplierId(e.target.value)} 
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc" className="font-bold">Information about the task</Label>
            <Textarea 
              id="desc" 
              placeholder="Audit all collection centers for the past month's records." 
              value={newTaskDesc} 
              onChange={(e) => setNewTaskDesc(e.target.value)} 
              className="min-h-[100px]"
            />
          </div>
          <Button onClick={addTask} className="w-full sm:w-auto font-bold px-10">
            Save
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="all" className="px-8 font-bold text-sm">All Pending</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative w-full sm:w-[350px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search tasks..." 
              className="pl-10 h-10 bg-white" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <Card key={task.id} className="border-none shadow-sm group bg-white hover:shadow-md transition-all">
                <CardContent className="p-6 flex items-start gap-5">
                  <div className="mt-1">
                    <Checkbox 
                      id={`task-${task.id}`}
                      onCheckedChange={() => completeTask(task.id)}
                      className="h-5 w-5 border-2"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <h4 className="font-bold text-lg text-foreground">
                          {task.title}
                        </h4>
                        {(task.supplierName || task.supplierId) && (
                          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-primary">
                            {task.supplierName && <span className="flex items-center gap-1"><User className="h-3 w-3" /> {task.supplierName}</span>}
                            {task.supplierId && <span className="flex items-center gap-1"><Hash className="h-3 w-3" /> {task.supplierId}</span>}
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteTask(task.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm mt-1.5 leading-relaxed text-muted-foreground">
                      {task.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground/70">
                      <span className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        Created: {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-24 bg-white rounded-xl border border-dashed flex flex-col items-center gap-4">
              <div className="bg-muted/30 p-5 rounded-full">
                 <ListTodo className="h-12 w-12 text-muted-foreground/20" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-muted-foreground">No pending tasks</h3>
                <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto">All tasks are completed or deleted.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
