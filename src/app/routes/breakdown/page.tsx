
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { 
  Truck, AlertTriangle, Trash2, Save, History, PlusCircle, Milk, X, Edit, RotateCcw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { BreakdownRecord, BreakdownLoss } from "@/lib/types"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"

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
    const recordData = { ...formData, date: new Date().toISOString().split('T')[0], totalLossAmount: totalLoss, updatedAt: new Date().toISOString() }

    if (editingId) {
      const docRef = doc(db, 'users', user.uid, 'breakdowns', editingId)
      updateDocumentNonBlocking(docRef, recordData)
      toast({ title: "यशस्वी", description: "माहिती अद्ययावत केली." })
    } else {
      const colRef = collection(db, 'users', user.uid, 'breakdowns')
      addDocumentNonBlocking(colRef, { ...recordData, createdAt: new Date().toISOString() })
      toast({ title: "यशस्वी", description: "नोंद जतन केली." })
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

  if (!mounted || isLoading) return <div className="p-10 text-center italic text-muted-foreground">लोड होत आहे...</div>

  return (
    <div className="space-y-3 max-w-7xl mx-auto w-full pb-10 px-1">
      <div className="flex flex-col gap-0.5 border-b pb-1 px-1"><h2 className="text-base font-black flex items-center gap-2"><Truck className="h-4 w-4 text-destructive" /> वाहन ब्रेकडाऊन</h2></div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start">
        <Card className="lg:col-span-8 border shadow-none bg-white rounded-xl overflow-hidden">
          <CardHeader className="py-2 px-3 border-b flex flex-row items-center justify-between bg-destructive/5"><span className="text-[10px] font-black uppercase flex items-center gap-2"><AlertTriangle className="h-3.5 w-3.5 text-destructive" /> {editingId ? 'माहिती बदला' : 'नवीन नोंद'}</span>{editingId && <Button variant="ghost" size="sm" onClick={resetForm} className="h-6 text-[9px] font-black gap-1"><RotateCcw className="h-3 w-3" /> रद्द</Button>}</CardHeader>
          <CardContent className="p-3 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase text-muted-foreground">रूट</Label><Input value={formData.routeName} onChange={e => setFormData({...formData, routeName: e.target.value})} className="h-8 text-[11px] bg-muted/20 border-none" /></div>
              <div className="space-y-0.5"><Label className="text-[9px] font-black uppercase text-muted-foreground">गाडी नंबर</Label><Input value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} className="h-8 text-[11px] bg-muted/20 border-none" /></div>
            </div>
            <div className="space-y-2"><div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase text-destructive">नुकसान तपशील</span><Button size="sm" onClick={handleAddLossRow} className="h-7 text-[9px] bg-destructive"><PlusCircle className="h-3.5 w-3.5" /> जोडा</Button></div>
              <div className="border rounded-lg overflow-hidden"><table className="w-full text-[10px]"><thead><tr className="bg-muted/50 text-[8px] font-black border-b"><th className="p-1.5">गवळी</th><th className="p-1.5">रक्कम</th><th className="p-1.5 w-8"></th></tr></thead><tbody>
                {formData.losses.map((loss) => (<tr key={loss.id} className="border-b last:border-0"><td className="p-0"><Input value={loss.supplierName} onChange={e => updateLossRow(loss.id, { supplierName: e.target.value })} className="h-7 text-[10px] border-none" /></td><td className="p-0"><Input value={loss.lossAmount} onChange={e => updateLossRow(loss.id, { lossAmount: e.target.value })} className="h-7 text-[10px] border-none text-right font-black" /></td><td className="p-1"><Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveLossRow(loss.id)} className="h-6 w-6 text-destructive"><X className="h-3 w-3" /></Button></td></tr>))}
              </tbody></table></div>
            </div>
            <Button onClick={handleSaveRecord} className="w-full font-black h-9 bg-destructive"><Save className="h-4 w-4 mr-1.5" /> जतन करा</Button>
          </CardContent>
        </Card>
        <Card className="lg:col-span-4 border shadow-none bg-white rounded-xl overflow-hidden"><div className="bg-muted/10 py-2 px-3 border-b font-black text-[10px] uppercase flex items-center gap-2"><History className="h-3.5 w-3.5" /> जुने रेकॉर्ड</div>
          <ScrollArea className="h-[400px]"><div className="p-2 space-y-2">{records?.map((record) => (<Card key={record.id} className="p-2.5 flex items-start justify-between"><div onClick={() => { setEditingId(record.id); setFormData(record); }} className="cursor-pointer min-w-0"><h4 className="font-black text-[11px] truncate">{record.routeName}</h4><p className="text-[9px]">{record.vehicleNumber} | ₹{record.totalLossAmount}</p></div><Button type="button" variant="ghost" size="icon" onClick={(e) => handleDeleteRecord(e, record.id)} className="text-destructive h-7 w-7"><Trash2 className="h-3.5 w-3.5" /></Button></Card>))}</div></ScrollArea>
        </Card>
      </div>
    </div>
  )
}
