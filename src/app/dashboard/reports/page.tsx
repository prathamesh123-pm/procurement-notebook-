
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Route, Supplier, Task, VisitReport, DailyReport } from "@/lib/types"
import { Sparkles, Save, FileText, ClipboardList, Loader2 } from "lucide-react"
import { summarizeNotes } from "@/ai/flows/summarize-notes-flow"

export default function ReportsPage() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  
  const [activeTab, setActiveTab] = useState("visit")
  const [isSummarizing, setIsSummarizing] = useState(false)
  
  // Visit Report Form
  const [visitRouteId, setVisitRouteId] = useState("")
  const [visitSupplierId, setVisitSupplierId] = useState("")
  const [visitNotes, setVisitNotes] = useState("")
  const [visitSummary, setVisitSummary] = useState("")

  // Daily Report Form
  const [dailyNotes, setDailyNotes] = useState("")
  const [dailySummary, setDailySummary] = useState("")

  useEffect(() => {
    setRoutes(JSON.parse(localStorage.getItem('procurepal_routes') || '[]'))
    setSuppliers(JSON.parse(localStorage.getItem('procurepal_suppliers') || '[]'))
    setTasks(JSON.parse(localStorage.getItem('procurepal_tasks') || '[]'))
  }, [])

  const filteredSuppliers = suppliers.filter(s => s.routeId === visitRouteId)

  const handleAISummarize = async (notes: string, setter: (val: string) => void) => {
    if (!notes) return
    setIsSummarizing(true)
    try {
      const result = await summarizeNotes({ notes })
      setter(result.summary)
    } catch (error) {
      console.error("AI summarization failed:", error)
    } finally {
      setIsSummarizing(false)
    }
  }

  const saveVisitReport = () => {
    const report: VisitReport = {
      id: crypto.randomUUID(),
      routeId: visitRouteId,
      supplierId: visitSupplierId,
      date: new Date().toISOString(),
      observations: visitNotes,
      summary: visitSummary
    }
    const reports = JSON.parse(localStorage.getItem('procurepal_visit_reports') || '[]')
    localStorage.setItem('procurepal_visit_reports', JSON.stringify([...reports, report]))
    alert("Visit report saved successfully!")
    setVisitNotes(""); setVisitSummary(""); setVisitRouteId(""); setVisitSupplierId("")
  }

  const saveDailyReport = () => {
    const report: DailyReport = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      taskIds: tasks.map(t => t.id),
      routeIds: routes.map(r => r.id),
      notes: dailyNotes,
      summary: dailySummary
    }
    const reports = JSON.parse(localStorage.getItem('procurepal_daily_reports') || '[]')
    localStorage.setItem('procurepal_daily_reports', JSON.stringify([...reports, report]))
    alert("Daily operations report saved successfully!")
    setDailyNotes(""); setDailySummary("")
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-headline font-bold text-foreground">Reporting Center</h2>
        <p className="text-muted-foreground mt-1">Compile field observations and daily operational summaries.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="visit" className="gap-2">
            <ClipboardList className="h-4 w-4" /> Visit Report
          </TabsTrigger>
          <TabsTrigger value="daily" className="gap-2">
            <FileText className="h-4 w-4" /> Daily Operations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visit">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Create Visit Report</CardTitle>
              <CardDescription>Document interactions with suppliers during route collection.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Route</Label>
                  <Select value={visitRouteId} onValueChange={setVisitRouteId}>
                    <SelectTrigger><SelectValue placeholder="Select Route" /></SelectTrigger>
                    <SelectContent>
                      {routes.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Supplier</Label>
                  <Select value={visitSupplierId} onValueChange={setVisitSupplierId} disabled={!visitRouteId}>
                    <SelectTrigger><SelectValue placeholder="Select Supplier" /></SelectTrigger>
                    <SelectContent>
                      {filteredSuppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Detailed Observations</Label>
                <Textarea 
                  placeholder="Enter detailed field notes here..." 
                  className="min-h-[150px]"
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                />
              </div>

              {visitSummary && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                    <Sparkles className="h-4 w-4" /> AI Generated Summary
                  </div>
                  <div className="text-sm prose prose-sm max-w-none">
                    {visitSummary.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto gap-2 border-accent text-accent hover:bg-accent/10"
                onClick={() => handleAISummarize(visitNotes, setVisitSummary)}
                disabled={!visitNotes || isSummarizing}
              >
                {isSummarizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Smart Summarize
              </Button>
              <Button className="w-full sm:w-auto ml-auto gap-2" onClick={saveVisitReport}>
                <Save className="h-4 w-4" /> Save Report
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="daily">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Daily Operations Compiler</CardTitle>
              <CardDescription>Consolidate today's tasks and overall performance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/30 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-[10px] text-muted-foreground uppercase">Tasks Logged</Label>
                  <p className="font-bold text-lg">{tasks.length}</p>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground uppercase">Completed</Label>
                  <p className="font-bold text-lg text-green-600">{tasks.filter(t => t.status === 'completed').length}</p>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground uppercase">Active Routes</Label>
                  <p className="font-bold text-lg">{routes.length}</p>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground uppercase">Date</Label>
                  <p className="font-bold text-sm mt-1">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Operational Summary Notes</Label>
                <Textarea 
                  placeholder="Summarize the overall day's performance, challenges, and highlights..." 
                  className="min-h-[200px]"
                  value={dailyNotes}
                  onChange={(e) => setDailyNotes(e.target.value)}
                />
              </div>

              {dailySummary && (
                <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-accent font-bold text-sm uppercase tracking-wider">
                    <Sparkles className="h-4 w-4" /> Professional Recap
                  </div>
                  <div className="text-sm">
                     {dailySummary}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
               <Button 
                variant="outline" 
                className="w-full sm:w-auto gap-2 border-accent text-accent hover:bg-accent/10"
                onClick={() => handleAISummarize(dailyNotes, setDailySummary)}
                disabled={!dailyNotes || isSummarizing}
              >
                {isSummarizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Summarize Day
              </Button>
              <Button className="w-full sm:w-auto ml-auto gap-2" onClick={saveDailyReport}>
                <Save className="h-4 w-4" /> Finalize Daily Report
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
