"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { 
  ArrowLeft, Save, Truck, Plus, Trash2, CheckCircle2, RefreshCw, Layers
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, addDocumentNonBlocking, useDoc, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"

interface AllocationEntry {
  id: string;
  routeId: string;
  routeName: string;
  requested: boolean;
  allocated: boolean;
}

function RouteAllocationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const editId = searchParams.get('edit')

  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    reportHeading: "Daily Tanker & Can Route Request & Allocation Report",
    date: new Date().toISOString().split('T')[0],
    morningRoutes: [] as AllocationEntry[],
    eveningRoutes: [] as AllocationEntry[],
    tankerRoutes: [] as AllocationEntry[]
  })

  const reportRef = useMemoFirebase(() => {
    if (!db || !user || !editId) return null
    return doc(db, 'users', user.uid, 'dailyWorkReports', editId)
  }, [db, user, editId])

  const { data: existingReport, isLoading } = useDoc(reportRef)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (existingReport && existingReport.fullData) {
      setFormData(prev => ({ ...prev, ...existingReport.fullData }))
    }
  }, [existingReport])

  const addEntry = (section: 'morningRoutes' | 'eveningRoutes' | 'tankerRoutes') => {
    const newEntry: AllocationEntry = {
      id: crypto.randomUUID(),
      routeId: "",
      routeName: "",
      requested: false,
      allocated: false
    }
    setFormData(prev => ({ ...prev, [section]: [...prev[section], newEntry] }))
  }

  const updateEntry = (section: 'morningRoutes' | 'eveningRoutes' | 'tankerRoutes', id: string, updates: Partial<AllocationEntry>) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].map(e => e.id === id ? { ...e, ...updates } : e)
    }))
  }

  const removeEntry = (section: 'morningRoutes' | 'eveningRoutes' | 'tankerRoutes', id: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter(e => e.id !== id)
    }))
  }

  const handleSave = () => {
    if (!db || !user) return
    
    const reportData = {
      type: 'Route Allocation Report',
      date: formData.date,
      reportDate: formData.date,
      generatedByUserId: user.uid,
      summary: formData.reportHeading,
      overallSummary: formData.reportHeading,
      fullData: { ...formData, name: user.displayName || "सुपरवायझर" },
      updatedAt: new Date().toISOString()
    }

    if (editId) {
      const docRef = doc(db, 'users', user.uid, 'dailyWorkReports', editId)
      updateDocumentNonBlocking(docRef, reportData)
      toast({ title: "यशस्वी", description: "अहवाल अपडेट झाला." })
    } else {
      addDocumentNonBlocking(collection(db, 'users', user.uid, 'dailyWorkReports'), {
        ...reportData,
        createdAt: new Date().toISOString()
      })
      toast({ title: "यशस्वी", description: "अहवाल जतन झाला." })
    }
    router.push('/reports')
  }

  if (!mounted || isLoading) return <div className="p-20 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  const Section = ({ title, section, color }: { title: string, section: 'morningRoutes' | 'eveningRoutes' | 'tankerRoutes', color: string }) => (
    <Card className="compact-card p-3 border-muted-foreground/10">
      <div className="flex items-center justify-between border-b pb-1 mb-2">
        <h3 className={`text-[10px] font-black uppercase ${color} tracking-widest flex items-center gap-1.5`}>
          <Layers className="h-3 w-3" /> {title}
        </h3>
        <Button size="sm" variant="outline" onClick={() => addEntry(section)} className="h-6 text-[8px] font-black uppercase px-2 rounded-lg">
          <Plus className="h-3 w-3 mr-1" /> जोडा
        </Button>
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-1 px-1 text-[7px] font-black uppercase text-muted-foreground">
          <div className="col-span-2">Route ID</div>
          <div className="col-span-6">Route Name</div>
          <div className="col-span-2 text-center">Req</div>
          <div className="col-span-2 text-center">Alloc</div>
        </div>
        {formData[section].map((entry) => (
          <div key={entry.id} className="grid grid-cols-12 gap-1 items-center bg-muted/5 p-1 rounded-lg border border-muted-foreground/5">
            <Input value={entry.routeId} onChange={e => updateEntry(section, entry.id, { routeId: e.target.value })} className="col-span-2 h-7 text-[10px] p-1 bg-white border-none font-black" />
            <Input value={entry.routeName} onChange={e => updateEntry(section, entry.id, { routeName: e.target.value })} className="col-span-6 h-7 text-[10px] p-1 bg-white border-none font-bold" />
            <div className="col-span-2 flex justify-center">
              <input type="checkbox" checked={entry.requested} onChange={e => updateEntry(section, entry.id, { requested: e.target.checked })} className="h-4 w-4 accent-primary" />
            </div>
            <div className="col-span-1 flex justify-center">
              <input type="checkbox" checked={entry.allocated} onChange={e => updateEntry(section, entry.id, { allocated: e.target.checked })} className="h-4 w-4 accent-primary" />
            </div>
            <div className="col-span-1 flex justify-end">
              <Button variant="ghost" size="icon" onClick={() => removeEntry(section, entry.id)} className="h-6 w-6 text-rose-400">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )

  return (
    <div className="compact-form-container max-w-[600px] pb-20 px-2">
      <div className="flex items-center gap-2 border-b pb-2 mb-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/reports')} className="h-8 w-8 shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
        <div className="min-w-0">
          <h2 className="text-sm font-black uppercase truncate flex items-center gap-1.5"><Truck className="h-4 w-4 text-primary" /> रूट मागणी व वाटप</h2>
          <p className="text-[8px] font-black text-muted-foreground uppercase">{formData.date}</p>
        </div>
      </div>

      <div className="space-y-3">
        <Card className="compact-card p-3 border-primary/20 bg-primary/5">
          <div className="space-y-1">
            <Label className="compact-label text-primary">अहवालाचे शीर्षक *</Label>
            <Input className="compact-input h-10 border-primary/20 font-black text-primary text-base" value={formData.reportHeading} onChange={e => setFormData({...formData, reportHeading: e.target.value})} />
          </div>
        </Card>

        <Card className="compact-card p-3"><div className="space-y-0.5"><Label className="compact-label">तारीख</Label><Input type="date" className="compact-input h-9" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div></Card>

        <Section title="Can Route Morning" section="morningRoutes" color="text-blue-600" />
        <Section title="Can Route Evening" section="eveningRoutes" color="text-indigo-600" />
        <Section title="Tanker Route" section="tankerRoutes" color="text-rose-600" />

        <Button onClick={handleSave} className="compact-button w-full bg-primary text-white shadow-xl shadow-primary/20 mb-10 h-12 uppercase font-black tracking-widest transition-all active:scale-95">
          {editId ? <RefreshCw className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />} अहवाल जतन करा
        </Button>
      </div>
    </div>
  )
}

export default function RouteAllocationPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>}>
      <RouteAllocationForm />
    </Suspense>
  )
}
