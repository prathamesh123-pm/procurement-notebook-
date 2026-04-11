
"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { 
  ArrowLeft, Save, Truck, Plus, Trash2, CheckCircle2, RefreshCw, Layers, CopyCheck, LayoutList, Settings2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, addDocumentNonBlocking, useDoc, useMemoFirebase, updateDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { cn } from "@/lib/utils"

interface AllocationEntry {
  id: string;
  routeId: string;
  routeName: string;
  requested: boolean;
  allocated: boolean;
}

const AllocationSection = ({ 
  title, 
  section, 
  color, 
  formData, 
  isManageMode, 
  addEntry, 
  updateEntry, 
  removeEntry 
}: { 
  title: string, 
  section: string, 
  color: string, 
  formData: any, 
  isManageMode: boolean,
  addEntry: (s: any) => void,
  updateEntry: (s: any, id: string, u: any) => void,
  removeEntry: (s: any, id: string) => void
}) => (
  <Card className="compact-card p-3 border-muted-foreground/10">
    <div className="flex items-center justify-between border-b pb-1 mb-2">
      <h3 className={`text-[10px] font-black uppercase ${color} tracking-widest flex items-center gap-1.5`}>
        <Layers className="h-3 w-3" /> {title}
      </h3>
      {isManageMode && (
        <Button size="sm" variant="outline" onClick={() => addEntry(section)} className="h-6 text-[8px] font-black uppercase px-2 rounded-lg">
          <Plus className="h-3 w-3 mr-1" /> जोडा
        </Button>
      )}
    </div>
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-1 px-1 text-[7px] font-black uppercase text-muted-foreground">
        <div className="col-span-2">ID</div>
        <div className="col-span-6">Route Name</div>
        <div className="col-span-2 text-center">Req</div>
        <div className={cn(isManageMode ? "col-span-1 text-center" : "col-span-2 text-center")}>Alloc</div>
        {isManageMode && <div className="col-span-1"></div>}
      </div>
      {(formData[section] as AllocationEntry[]).map((entry) => (
        <div key={entry.id} className="grid grid-cols-12 gap-1 items-center bg-muted/5 p-1 rounded-lg border border-muted-foreground/5">
          {isManageMode ? (
            <>
              <Input value={entry.routeId} onChange={e => updateEntry(section, entry.id, { routeId: e.target.value })} className="col-span-2 h-7 text-[10px] p-1 bg-white border-none font-black" />
              <Input value={entry.routeName} onChange={e => updateEntry(section, entry.id, { routeName: e.target.value })} className="col-span-6 h-7 text-[10px] p-1 bg-white border-none font-bold" />
            </>
          ) : (
            <>
              <div className="col-span-2 text-[9px] font-black truncate px-1">{entry.routeId || "---"}</div>
              <div className="col-span-6 text-[10px] font-bold truncate px-1 uppercase">{entry.routeName || "---"}</div>
            </>
          )}
          
          <div className="col-span-2 flex justify-center">
            <input type="checkbox" checked={entry.requested} onChange={e => updateEntry(section, entry.id, { requested: e.target.checked })} className="h-4 w-4 accent-primary cursor-pointer" />
          </div>
          
          <div className={cn(isManageMode ? "col-span-1 flex justify-center" : "col-span-2 flex justify-center")}>
            <input type="checkbox" checked={entry.allocated} onChange={e => updateEntry(section, entry.id, { allocated: e.target.checked })} className="h-4 w-4 accent-primary cursor-pointer" />
          </div>

          {isManageMode && (
            <div className="col-span-1 flex justify-end">
              <Button variant="ghost" size="icon" onClick={() => removeEntry(section, entry.id)} className="h-6 w-6 text-rose-400 hover:bg-rose-50 rounded-md">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      ))}
      {(formData[section] as AllocationEntry[]).length === 0 && (
        <p className="text-[8px] text-center italic opacity-30 py-2">रूट यादी कोरी आहे.</p>
      )}
    </div>
  </Card>
)

function RouteAllocationForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const editId = searchParams.get('edit')

  const [mounted, setMounted] = useState(false)
  const [isManageMode, setIsManageMode] = useState(false) 
  
  const [formData, setFormData] = useState({
    reportHeading: "Daily Tanker & Can Route Request & Allocation Report",
    date: new Date().toISOString().split('T')[0],
    morningRoutes: [] as AllocationEntry[],
    eveningRoutes: [] as AllocationEntry[],
    tankerRoutes: [] as AllocationEntry[],
    extCanRoutes: [] as AllocationEntry[],
    extTankerRoutes: [] as AllocationEntry[]
  })

  const templateRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, 'users', user.uid, 'settings', 'routeAllocationTemplate')
  }, [db, user])

  const reportRef = useMemoFirebase(() => {
    if (!db || !user || !editId) return null
    return doc(db, 'users', user.uid, 'dailyWorkReports', editId)
  }, [db, user, editId])

  const { data: templateData } = useDoc(templateRef)
  const { data: existingReport, isLoading } = useDoc(reportRef)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (templateData && !editId && mounted) {
      setFormData(prev => ({
        ...prev,
        morningRoutes: (templateData.morningRoutes || []).map((r: any) => ({ ...r, requested: false, allocated: false })),
        eveningRoutes: (templateData.eveningRoutes || []).map((r: any) => ({ ...r, requested: false, allocated: false })),
        tankerRoutes: (templateData.tankerRoutes || []).map((r: any) => ({ ...r, requested: false, allocated: false })),
        extCanRoutes: (templateData.extCanRoutes || []).map((r: any) => ({ ...r, requested: false, allocated: false })),
        extTankerRoutes: (templateData.extTankerRoutes || []).map((r: any) => ({ ...r, requested: false, allocated: false })),
      }))
    }
  }, [templateData, editId, mounted])

  useEffect(() => {
    if (existingReport && existingReport.fullData) {
      setFormData(prev => ({ ...prev, ...existingReport.fullData }))
    }
  }, [existingReport])

  const addEntry = (section: any) => {
    const newEntry: AllocationEntry = {
      id: crypto.randomUUID(),
      routeId: "",
      routeName: "",
      requested: false,
      allocated: false
    }
    setFormData(prev => ({ ...prev, [section]: [...(prev[section] as AllocationEntry[]), newEntry] }))
  }

  const updateEntry = (section: any, id: string, updates: Partial<AllocationEntry>) => {
    setFormData(prev => ({
      ...prev,
      [section]: (prev[section] as AllocationEntry[]).map(e => e.id === id ? { ...e, ...updates } : e)
    }))
  }

  const removeEntry = (section: any, id: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: (prev[section] as AllocationEntry[]).filter(e => e.id !== id)
    }))
  }

  const saveAsTemplate = () => {
    if (!db || !user) return
    const template = {
      morningRoutes: formData.morningRoutes.map(({ id, routeId, routeName }) => ({ id, routeId, routeName })),
      eveningRoutes: formData.eveningRoutes.map(({ id, routeId, routeName }) => ({ id, routeId, routeName })),
      tankerRoutes: formData.tankerRoutes.map(({ id, routeId, routeName }) => ({ id, routeId, routeName })),
      extCanRoutes: formData.extCanRoutes.map(({ id, routeId, routeName }) => ({ id, routeId, routeName })),
      extTankerRoutes: formData.extTankerRoutes.map(({ id, routeId, routeName }) => ({ id, routeId, routeName })),
      updatedAt: new Date().toISOString()
    }
    setDocumentNonBlocking(templateRef!, template, { merge: true })
    toast({ title: "टेम्पलेट जतन झाले", description: "पुढच्या वेळी हे रूट्स आपोआप येतील." })
    setIsManageMode(false)
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

  return (
    <div className="compact-form-container max-w-[650px] pb-20 px-2">
      <div className="flex items-center gap-2 border-b pb-2 mb-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/reports')} className="h-8 w-8 shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
        <div className="min-w-0">
          <h2 className="text-sm font-black uppercase truncate flex items-center gap-1.5"><Truck className="h-4 w-4 text-primary" /> ERP रिपोर्ट</h2>
          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{formData.date}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4 bg-white p-1 rounded-xl border border-muted-foreground/10 shadow-sm">
        <Button 
          variant={!isManageMode ? "default" : "ghost"} 
          className="flex-1 h-9 font-black uppercase text-[9px] rounded-lg gap-1.5"
          onClick={() => setIsManageMode(false)}
        >
          <LayoutList className="h-3.5 w-3.5" /> रूट लिस्ट पहा
        </Button>
        <Button 
          variant={isManageMode ? "default" : "ghost"} 
          className="flex-1 h-9 font-black uppercase text-[9px] rounded-lg gap-1.5"
          onClick={() => setIsManageMode(true)}
        >
          <Settings2 className="h-3.5 w-3.5" /> लिस्ट बदल करा
        </Button>
      </div>

      <div className="space-y-3">
        <Card className="compact-card p-3 border-primary/20 bg-primary/5">
          <div className="space-y-1">
            <Label className="compact-label text-primary">अहवालाचे शीर्षक *</Label>
            <Input className="compact-input h-10 border-primary/20 font-black text-primary text-base" value={formData.reportHeading} onChange={e => setFormData({...formData, reportHeading: e.target.value})} />
          </div>
        </Card>

        <Card className="compact-card p-3"><div className="space-y-0.5"><Label className="compact-label">तारीख</Label><Input type="date" className="compact-input h-9" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div></Card>

        <AllocationSection title="Can Route Morning (Internal)" section="morningRoutes" color="text-blue-600" formData={formData} isManageMode={isManageMode} addEntry={addEntry} updateEntry={updateEntry} removeEntry={removeEntry} />
        <AllocationSection title="Can Route Evening (Internal)" section="eveningRoutes" color="text-indigo-600" formData={formData} isManageMode={isManageMode} addEntry={addEntry} updateEntry={updateEntry} removeEntry={removeEntry} />
        <AllocationSection title="Internal Tanker Route" section="tankerRoutes" color="text-rose-600" formData={formData} isManageMode={isManageMode} addEntry={addEntry} updateEntry={updateEntry} removeEntry={removeEntry} />
        <AllocationSection title="External Can Route" section="extCanRoutes" color="text-emerald-600" formData={formData} isManageMode={isManageMode} addEntry={addEntry} updateEntry={updateEntry} removeEntry={removeEntry} />
        <AllocationSection title="External Tanker Route" section="extTankerRoutes" color="text-amber-600" formData={formData} isManageMode={isManageMode} addEntry={addEntry} updateEntry={updateEntry} removeEntry={removeEntry} />

        <div className="flex flex-col gap-2 pt-4">
          {isManageMode ? (
            <Button type="button" onClick={saveAsTemplate} className="w-full h-11 font-black uppercase text-[10px] tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
              <CopyCheck className="h-4 w-4 mr-2" /> ही यादी टेम्पलेट म्हणून जतन करा
            </Button>
          ) : (
            <Button onClick={handleSave} className="w-full bg-primary text-white shadow-xl shadow-primary/20 h-12 uppercase font-black tracking-widest rounded-xl transition-all active:scale-95">
              {editId ? <RefreshCw className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />} {editId ? 'अहवाल अद्ययावत करा' : 'अहवाल जतन करा (SUBMIT)'}
            </Button>
          )}
        </div>
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
