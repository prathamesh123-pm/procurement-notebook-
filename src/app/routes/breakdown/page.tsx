"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { 
  Truck, AlertTriangle, Trash2, Save, History, PlusCircle, X, RotateCcw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BreakdownLoss } from "@/lib/types"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { AIGuidanceCard } from "@/components/ai-guidance-card"

export default function BreakdownPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const breakdownsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'breakdowns')
  }, [db, user])

  const { data: records, isLoading } = useCollection(breakdownsQuery)
  const [mounted, setMounted] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    routeName: "", vehicleType: "", vehicleNumber: "", driverName: "",
    location: "", reason: "", losses: [] as BreakdownLoss[]
  })

  useEffect(() => setMounted(true), [])

  const handleAddLossRow = () => {
    const newLoss: BreakdownLoss = { id: crypto.randomUUID(), supplierCode: "", supplierName: "", bufMilkLossLiters: "", cowMilkLossLiters: "", lossAmount: "" }
    setFormData({ ...formData, losses: [...formData.losses, newLoss] })
  }

  const handleRemoveLossRow = (id: string) => { setFormData({ ...formData, losses: formData.losses.filter(l => l.id !== id) }) }

  const updateLossRow = (id: string, updates: Partial<BreakdownLoss>) => {
    setFormData({ ...formData, losses: formData.losses.map(l => l.id === id ? { ...l, ...updates } : l) })
  }

  const handleSaveRecord = () => {
    if (!formData.routeName || !formData.vehicleNumber || !db || !user) {
      toast({ title: "त्रुटी", description: "माहिती आवश्यक आहे.", variant: "destructive" })
      return
    }

    const totalLoss = formData.losses.reduce((acc, curr) => acc + (Number(curr.lossAmount) || 0), 0)
    const recordData = { 
      ...formData, 
      date: new Date().toISOString().split('T')[0], 
      totalLossAmount: totalLoss, 
      updatedAt: new Date().toISOString() 
    }

    if (editingId) {
      const docRef = doc(db, 'users', user.uid, 'breakdowns', editingId)
      updateDocumentNonBlocking(docRef, recordData)
      toast({ title: "यशस्वी", description: "नोंद अद्ययावत केली." })
    } else {
      const colRef = collection(db, 'users', user.uid, 'breakdowns')
      addDocumentNonBlocking(colRef, { ...recordData, createdAt: new Date().toISOString() })
      
      const reportsRef = collection(db, 'users', user.uid, 'dailyWorkReports')
      addDocumentNonBlocking(reportsRef, {
        type: 'Breakdown',
        date: recordData.date,
        reportDate: recordData.date,
        generatedByUserId: user.uid,
        summary: `रूट: ${formData.routeName}. नुकसान: ₹${totalLoss}. कारण: ${formData.reason || 'N/A'}`,
        overallSummary: `रूट: ${formData.routeName}. नुकसान: ₹${totalLoss}. कारण: ${formData.reason || 'N/A'}`,
        fullData: {
          ...recordData,
          name: user.displayName || "Procurement Officer",
          status: "EMERGENCY"
        },
        createdAt: new Date().toISOString()
      })
      toast({ title: "यशस्वी", description: "नोंद जतन केली आणि अहवालात जोडली." })
    }
    
    resetForm()
  }

  const handleDeleteRecord = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); e.preventDefault();
    if (!db || !user || !id) return
    if (!confirm("तुम्हाला खात्री आहे की हा रेकॉर्ड कायमचा हटवायचा आहे?")) return
    const docRef = doc(db, 'users', user.uid, 'breakdowns', id)
    deleteDocumentNonBlocking(docRef)
    if (editingId === id) resetForm()
    toast({ title: "यशस्वी", description: "नोंद हटवण्यात आली." })
  }

  const resetForm = () => { setEditingId(null); setFormData({ routeName: "", vehicleType: "", vehicleNumber: "", driverName: "", location: "", reason: "", losses: [] }) }

  if (!mounted || isLoading) return <div className="p-10 text-center italic font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="space-y-3 max-w-7xl mx-auto w-full pb-10 px-1 animate-in fade-in duration-500">
      <div className="flex flex-col gap-0.5 border-b pb-3 px-1">
        <h2 className="text-base font-black flex items-center gap-2 text-destructive uppercase tracking-tight">
          <Truck className="h-5 w-5" /> वाहन ब्रेकडाऊन (BREAKDOWN)
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start">
        <Card className="lg:col-span-8 border shadow-none bg-white rounded-xl overflow-hidden border-destructive/10">
          <CardHeader className="py-2 px-3 border-b flex flex-row items-center justify-between bg-destructive/5">
            <span className="text-[10px] font-black uppercase flex items-center gap-2 text-destructive tracking-widest">
              <AlertTriangle className="h-3.5 w-3.5" /> {editingId ? 'माहिती बदला' : 'नवीन नोंद (NEW ENTRY)'}
            </span>
            {editingId && <Button variant="ghost" size="sm" onClick={resetForm} className="h-6 text-[9px] font-black gap-1 uppercase"><RotateCcw className="h-3 w-3" /> रद्द</Button>}
          </CardHeader>
          <CardContent className="p-3 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">रूट (ROUTE)</Label><Input value={formData.routeName} onChange={e => setFormData({...formData, routeName: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-black rounded-lg" placeholder="..." /></div>
              <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">गाडी नंबर (V. NO)</Label><Input value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-black rounded-lg" placeholder="MH 50..." /></div>
            </div>
            
            <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">कारण (REASON)</Label><Input value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-black rounded-lg" placeholder="उदा. इंजिन बिघाड" /></div>
            
            <AIGuidanceCard context={formData.reason} formType="breakdown" />

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase text-destructive tracking-[0.2em]">नुकसान तपशील (LOSS LOG)</span>
                <Button size="sm" onClick={handleAddLossRow} className="h-7 text-[9px] bg-destructive font-black uppercase"><PlusCircle className="h-3.5 w-3.5 mr-1" /> जोडा</Button>
              </div>
              <div className="border rounded-xl overflow-hidden border-muted-foreground/10">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="bg-muted/50 text-[8px] font-black border-b uppercase tracking-widest">
                      <th className="p-2 text-left">कोड/गवळी नाव</th>
                      <th className="p-2 text-right">रक्कम (₹)</th>
                      <th className="p-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.losses.map((loss) => (
                      <tr key={loss.id} className="border-b last:border-0">
                        <td className="p-0 flex">
                          <Input placeholder="ID" value={loss.supplierCode} onChange={e => updateLossRow(loss.id, { supplierCode: e.target.value })} className="h-8 w-14 text-[10px] border-none font-black border-r rounded-none bg-transparent" />
                          <Input placeholder="NAME" value={loss.supplierName} onChange={e => updateLossRow(loss.id, { supplierName: e.target.value })} className="h-8 text-[10px] border-none font-black rounded-none flex-1 bg-transparent" />
                        </td>
                        <td className="p-0">
                          <Input type="number" value={loss.lossAmount} onChange={e => updateLossRow(loss.id, { lossAmount: e.target.value })} className="h-8 text-[10px] border-none text-right font-black bg-transparent" />
                        </td>
                        <td className="p-1">
                          <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveLossRow(loss.id)} className="h-7 w-7 text-destructive hover:bg-destructive/5"><X className="h-3 w-3" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <Button onClick={handleSaveRecord} className="w-full font-black h-10 bg-destructive text-white hover:bg-destructive/90 shadow-lg shadow-destructive/20 rounded-xl uppercase text-[10px]">
              <Save className="h-4 w-4 mr-1.5" /> जतन करा (SAVE & REPORT)
            </Button>
          </CardContent>
        </Card>
        <Card className="lg:col-span-4 border shadow-none bg-white rounded-xl overflow-hidden border-muted-foreground/10">
          <div className="bg-muted/10 py-2.5 px-3 border-b font-black text-[9px] uppercase flex items-center gap-2 tracking-[0.2em]">
            <History className="h-3.5 w-3.5 opacity-50" /> जुने रेकॉर्ड (LOGS)
          </div>
          <ScrollArea className="h-[400px]">
            <div className="p-2 space-y-2">
              {records?.map((record) => (
                <Card key={record.id} className="p-3 flex items-start justify-between border shadow-none bg-muted/5 rounded-xl border-muted-foreground/5 hover:bg-destructive/5 transition-all cursor-pointer group" onClick={() => { setEditingId(record.id); setFormData(record); }}>
                  <div className="min-w-0">
                    <h4 className="font-black text-[11px] truncate uppercase tracking-tight">{record.routeName}</h4>
                    <p className="text-[9px] font-black text-destructive/70 uppercase mt-0.5">{record.vehicleNumber} | ₹{record.totalLossAmount}</p>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={(e) => handleDeleteRecord(e, record.id)} className="text-destructive h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-3.5 w-3.5" /></Button>
                </Card>
              ))}
              {records?.length === 0 && (
                <div className="text-center py-10 opacity-20 font-black uppercase text-[8px] tracking-widest">रेकॉर्ड शून्य</div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  )
}
