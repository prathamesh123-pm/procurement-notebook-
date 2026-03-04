
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Task, TaskStatus } from "@/lib/types"
import { Plus, Search, ListTodo, Trash2 } from "lucide-react"

export default function WorkLogPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDesc, setNewTaskDesc] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<string>("all")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = JSON.parse(localStorage.getItem('procurepal_tasks') || '[]')
    if (stored.length === 0) {
      const initialTasks: Task[] = [
        {
          id: crypto.randomUUID(),
          title: "Monthly Collection Review",
          description: "Audit all collection centers for the past month's records.",
          assignedTo: "Procurement Manager",
          status: 'pending',
          createdAt: "2024-05-20T10:00:00.000Z"
        },
        {
          id: crypto.randomUUID(),
          title: "Route C Verification",
          description: "Verify the new collection path established last week.",
          assignedTo: "Procurement Manager",
          status: 'completed',
          createdAt: "2024-05-19T09:00:00.000Z",
          completedAt: "2024-05-20T15:30:00.000Z"
        },
        {
          id: crypto.randomUUID(),
          title: "Quality Assurance Test – Suppliers",
          description: "Random sampling of milk quality from top 10 suppliers.",
          assignedTo: "Procurement Manager",
          status: 'pending',
          createdAt: "2024-05-20T11:00:00.000Z"
        }
      ]
      setTasks(initialTasks)
      localStorage.setItem('procurepal_tasks', JSON.stringify(initialTasks))
    } else {
      setTasks(stored)
    }
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
      assignedTo: "Procurement Manager",
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    saveTasks([newTask, ...tasks])
    setNewTaskTitle("")
    setNewTaskDesc("")
  }

  const toggleTaskStatus = (taskId: string) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const newStatus: TaskStatus = t.status === 'completed' ? 'pending' : 'completed'
        return { 
          ...t, 
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
        }
      }
      return t
    })
    saveTasks(updated)
  }

  const deleteTask = (taskId: string) => {
    saveTasks(tasks.filter(t => t.id !== taskId))
  }

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    const matchesTab = activeTab === 'all' || t.status === activeTab
    return matchesSearch && matchesTab
  })

  if (!mounted) return null

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-headline font-bold text-foreground">Work Log</h2>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">New Task</CardTitle>
          <CardDescription>Create a specific task or observation for your log.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input 
              id="title" 
              placeholder="e.g. Monthly collection review" 
              value={newTaskTitle} 
              onChange={(e) => setNewTaskTitle(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Information about the task</Label>
            <Textarea 
              id="desc" 
              placeholder="Audit all collection centers for the past month's records." 
              value={newTaskDesc} 
              onChange={(e) => setNewTaskDesc(e.target.value)} 
              className="min-h-[100px]"
            />
          </div>
          <Button onClick={addTask} className="w-full sm:w-auto font-bold px-8">
            Save
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="all" className="px-6 font-bold">All</TabsTrigger>
              <TabsTrigger value="pending" className="px-6 font-bold">Pending</TabsTrigger>
              <TabsTrigger value="completed" className="px-6 font-bold">Done</TabsTrigger>
            </TabsList>
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search tasks..." 
                className="pl-9 h-10 bg-white" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value={activeTab} className="space-y-4 mt-0">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <Card key={task.id} className="border-none shadow-sm group">
                  <CardContent className="p-5 flex items-start gap-4">
                    <Checkbox 
                      id={`task-${task.id}`}
                      checked={task.status === 'completed'}
                      onCheckedChange={() => toggleTaskStatus(task.id)}
                      className="mt-1 h-5 w-5 border-2"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`font-bold text-base transition-colors ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </h4>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteTask(task.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className={`text-sm mt-1 line-clamp-2 ${task.status === 'completed' ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
                        {task.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70">
                        <span className="flex items-center gap-1">Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                        {task.status === 'completed' && task.completedAt && (
                          <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded">Completed {new Date(task.completedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 bg-card rounded-xl border border-dashed flex flex-col items-center">
                <div className="bg-muted/30 p-4 rounded-full mb-4">
                   <ListTodo className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-bold text-muted-foreground">No tasks found</h3>
                <p className="text-sm text-muted-foreground/60">Try changing your search or filter criteria.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
