"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Task, TaskStatus } from "@/lib/types"
import { Plus, Trash2, CheckCircle2, Clock, AlertCircle, ListTodo } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskAssignee, setNewTaskAssignee] = useState("")

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('procurepal_tasks') || '[]')
    setTasks(stored)
  }, [])

  const saveTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks)
    localStorage.setItem('procurepal_tasks', JSON.stringify(updatedTasks))
  }

  const addTask = () => {
    if (!newTaskTitle || !newTaskAssignee) return
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle,
      assignedTo: newTaskAssignee,
      status: 'assigned',
      createdAt: new Date().toISOString()
    }
    saveTasks([newTask, ...tasks])
    setNewTaskTitle("")
    setNewTaskAssignee("")
  }

  const updateStatus = (taskId: string, status: TaskStatus) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, status } : t)
    saveTasks(updated)
  }

  const deleteTask = (taskId: string) => {
    saveTasks(tasks.filter(t => t.id !== taskId))
  }

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'pending': return <Clock className="h-4 w-4 text-amber-500" />
      default: return <AlertCircle className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground">Daily Task Log</h2>
          <p className="text-muted-foreground mt-1">Assign and monitor daily procurement duties.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">New Assignment</CardTitle>
          <CardDescription>Create a new task for your team members.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="title">Task Description</Label>
              <Input 
                id="title" 
                placeholder="e.g. Visit North Route Route" 
                value={newTaskTitle} 
                onChange={(e) => setNewTaskTitle(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignee">Assign To</Label>
              <Input 
                id="assignee" 
                placeholder="Team Member Name" 
                value={newTaskAssignee} 
                onChange={(e) => setNewTaskAssignee(e.target.value)} 
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addTask} className="w-full gap-2">
                <Plus className="h-4 w-4" /> Add Task
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <Card key={task.id} className="border-none shadow-sm transition-all hover:shadow-md">
              <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full">
                  <div className="p-2 rounded-full bg-muted">
                    {getStatusIcon(task.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-base truncate">{task.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm text-muted-foreground">Assigned to: {task.assignedTo}</span>
                      <span className="text-xs text-muted-foreground/60">• {new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <span className="sr-only">Status selector</span>
                  <Select 
                    value={task.status} 
                    onValueChange={(val: TaskStatus) => updateStatus(task.id, val)}
                  >
                    <SelectTrigger className="w-[130px] h-9">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete task</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-card rounded-xl border border-dashed border-muted-foreground/30">
            <ListTodo className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <h3 className="text-lg font-medium text-muted-foreground">No tasks logged for today</h3>
            <p className="text-sm text-muted-foreground/60">Fill in the form above to start tracking your work.</p>
          </div>
        )}
      </div>
    </div>
  )
}
