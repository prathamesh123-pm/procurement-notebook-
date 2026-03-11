
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { 
  Warehouse, Plus, Search, MapPin, User, Trash2, Edit, Package, ChevronRight,
  Milk, Truck, FlaskConical, Battery, Laptop, Zap, Sun, X
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { CollectionCenter, EquipmentItem, Route } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"

export default function CentersPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const centersQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'centers')
  }, [db, user])

  const routesQuery = useMemoFirebase(() => {
    if (!db) return null
    return collection(db, 'routes')
  }, [db])

  const { data: centers, isLoading } = useCollection(centersQuery)
  const { data: routes } = useCollection(routesQuery)

  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedCenter, setSelectedCenter] = useState<CollectionCenter | null>(null)
  
  const [formData, setFormData] = useState({
    name: "", code: "", operatorName: "", mobile: "", village: "", routeId: "",
    fssaiNumber: "", fssaiExpiry: "",
    cowQty: "0", cowFat: "0", cowSnf: "0",
    bufQty: "0", bufFat: "0", bufSnf: "0",
    iceBlocks: "0", cattleFeedBrand: "", competition: "", additionalNotes: "",
    weighingScaleBrand: "", fatMachineBrand: "", chemicalsStock: "",
    batteryCondition: "", milkCansCount: "0",
    computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
    equipment: [] as EquipmentItem[]
  })

  useEffect(() => setMounted(true), [])

  const handleOpenAdd = () => {
    setDialogMode('add')
    setEditingId(null)
    setFormData({
      name: "", code: "", operatorName: "", mobile: "", village: "", routeId: "",
      fssaiNumber: "", fssaiExpiry: "", cowQty: "0", cowFat: "0", cowSnf: "0",
      bufQty: "0", bufFat: "0", bufSnf: "0", iceBlocks: "0", cattleFeedBrand: "",
      competition: "", additionalNotes: "", weighingScaleBrand: "", fatMachineBrand: "",
      chemicalsStock: "", batteryCondition: "", milkCansCount: "0",
      computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
      equipment: []
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (center: CollectionCenter) => {
    setDialogMode('edit')
    setEditingId(center.id)
    setFormData({
      name: center.name, code: center.code, operatorName: center.operatorName,
      mobile: center.mobile, village: center.village, routeId: center.routeId || "",
      fssaiNumber: center.fssaiNumber || "", fssaiExpiry: center.fssaiExpiry || "",
      cowQty: String(center.cowMilk?.quantity || 0),
      cowFat: String(center.cowMilk?.fat || 0),
      cowSnf: String(center.cowMilk?.snf || 0),
      bufQty: String(center.buffaloMilk?.quantity || 0),
      bufFat: String(center.buffaloMilk?.fat || 0),
      bufSnf: String(center.buffaloMilk?.snf || 0),
      iceBlocks: String(center.iceBlocks || 0),
      cattleFeedBrand: center.cattleFeedBrand || "",
      competition: center.competition || "",
      additionalNotes: center.additionalNotes || "",
      weighingScaleBrand: center.material.weighingScaleBrand || "",
      fatMachineBrand: center.material.fatMachineBrand || "",
      chemicalsStock: center.material.chemicalsStock || "",
      batteryCondition: center.material.batteryCondition || "",
      milkCansCount: String(center.material.milkCansCount || 0),
      computerAvailable: center.material.computerAvailable || false,
      upsInverterAvailable: center.material.upsInverterAvailable || false,
      solarAvailable: center.material.solarAvailable || false,
      equipment: center.material.equipment || []
    })
    setIsDialogOpen(true)
  }

  const handleSaveCenter = () => {
    if (!formData.name || !formData.code || !db || !user) {
      toast({ title: "त्रुटी", description: "माहिती आवश्यक आहे.", variant: "destructive" })
      return
    }

    const centerData = {
      name: formData.name, code: formData.code, operatorName: formData.operatorName,
      mobile: formData.mobile, village: formData.village, fssaiNumber: formData.fssaiNumber,
      fssaiExpiry: formData.fssaiExpiry, routeId: formData.routeId,
      cowMilk: { quantity: Number(formData.cowQty), fat: Number(formData.cowFat), snf: Number(formData.cowSnf) },
      buffaloMilk: { quantity: Number(formData.bufQty), fat: Number(formData.bufFat), snf: Number(formData.bufSnf) },
      iceBlocks: Number(formData.iceBlocks), cattleFeedBrand: formData.cattleFeedBrand,
      competition: formData.competition, additionalNotes: formData.additionalNotes,
      material: {
        weighingScaleBrand: formData.weighingScaleBrand, fatMachineBrand: formData.fatMachineBrand,
        chemicalsStock: formData.chemicalsStock, batteryCondition: formData.batteryCondition,
        milkCansCount: Number(formData.milkCansCount), computerAvailable: formData.computerAvailable,
        upsInverterAvailable: formData.upsInverterAvailable, solarAvailable: formData.solarAvailable,
        equipment: formData.equipment
      }
    }

    if (dialogMode === 'add') {
      const colRef = collection(db, 'users', user.uid, 'centers')
      addDocumentNonBlocking(colRef, centerData)
    } else if (editingId) {
      const docRef = doc(db, 'users', user.uid, 'centers', editingId)
      updateDocumentNonBlocking(docRef, centerData)
    }
    
    setIsDialogOpen(false)
    toast({ title: "जतन केले", description: "केंद्राची माहिती यशस्वीरित्या सेव्ह झाली." })
  }

  const handleDeleteCenter = (id: string) => {
    if (!db || !user) return
    if (!confirm("तुम्हाला खात्री आहे की हे केंद्र हटवायचे आहे?")) return
    
    const docRef = doc(db, 'users', user.uid, 'centers', id)
    deleteDocumentNonBlocking(docRef)
    
    if (selectedCenter?.id === id) setSelectedCenter(null)
    toast({ title: "हटवले", description: "केंद्र काढून टाकले आहे." })
  }

  const filteredCenters = centers?.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  if (!mounted || isLoading) return <div className="p-10 text-center italic">लोड होत आहे...</div>

  return (
    <div className="space-y-3 max-w-7xl mx-auto w-full pb-10 px-1">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-1">
        <h2 className="text-lg font-black text-foreground flex items-center gap-2"><Warehouse className="h-5 w-5 text-primary" /> संकलन केंद्र (Centers)</h2>
        <Button onClick={handleOpenAdd} size="sm" className="w-full sm:w-auto font-black h-8 text-[11px] rounded-lg"><Plus className="h-3.5 w-3.5" /> नवीन केंद्र</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start">
        <Card className={`lg:col-span-4 border-none shadow-sm bg-white flex flex-col rounded-xl overflow-hidden ${selectedCenter ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-2 border-b bg-muted/5">
            <div className="relative"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" /><input placeholder="शोधा..." className="w-full pl-7 h-8 text-[11px] bg-white border rounded-md" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
          </div>
          <ScrollArea className="h-[600px]">
            <div className="divide-y">
              {filteredCenters.map(center => (
                <div key={center.id} className={`p-2.5 cursor-pointer hover:bg-muted/50 flex justify-between items-center ${selectedCenter?.id === center.id ? 'bg-primary/5 border-l-2 border-primary' : ''}`} onClick={() => setSelectedCenter(center)}>
                  <div className="min-w-0"><h4 className="font-black text-[11px] text-foreground truncate">{center.name}</h4><div className="flex items-center gap-1.5 mt-0.5"><Badge variant="secondary" className="text-[8px] font-black h-3.5">{center.code}</Badge><span className="text-[9px] text-muted-foreground truncate"><MapPin className="h-2.5 w-2.5" /> {center.village}</span></div></div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteCenter(center.id); }}><Trash2 className="h-3 w-3" /></Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50" />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className={`lg:col-span-8 border-none shadow-sm bg-white rounded-xl min-h-[450px] ${!selectedCenter ? 'hidden lg:flex' : 'block'}`}>
          {selectedCenter ? (
            <div className="flex flex-col h-full">
              <div className="p-2.5 border-b flex items-center justify-between bg-primary/5 sticky top-0 z-10">
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSelectedCenter(null)}><X className="h-4 w-4" /></Button>
                <div className="flex-1 px-2 min-w-0"><h3 className="text-sm font-black truncate">{selectedCenter.name}</h3><p className="text-[9px] font-black text-muted-foreground uppercase">Code: {selectedCenter.code} | {selectedCenter.village}</p></div>
                <div className="flex gap-1.5"><Button variant="outline" size="icon" className="h-7 w-7 text-primary" onClick={() => handleOpenEdit(selectedCenter)}><Edit className="h-3 w-3" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteCenter(selectedCenter.id)}><Trash2 className="h-3 w-3" /></Button></div>
              </div>
              <ScrollArea className="flex-1 h-[600px]">
                <div className="p-3 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5"><h4 className="text-[9px] font-black uppercase text-primary">ऑपरेटर व परवाना</h4><div className="bg-muted/20 p-2.5 rounded-lg border space-y-2"><div className="grid grid-cols-2 gap-2"><div><p className="text-[8px] text-muted-foreground uppercase">नाव</p><p className="text-[10px] font-black">{selectedCenter.operatorName || "-"}</p></div><div><p className="text-[8px] text-muted-foreground uppercase">संपर्क</p><p className="text-[10px] font-black">{selectedCenter.mobile || "-"}</p></div></div><div className="pt-1.5 border-t border-dashed grid grid-cols-2 gap-2"><div><p className="text-[8px] text-muted-foreground uppercase">FSSAI</p><p className="text-[10px] font-black">{selectedCenter.fssaiNumber || "N/A"}</p></div><div><p className="text-[8px] text-muted-foreground uppercase">Expiry</p><p className="text-[10px] font-black">{selectedCenter.fssaiExpiry || "-"}</p></div></div></div></div>
                    <div className="space-y-1.5"><h4 className="text-[9px] font-black uppercase text-primary">तांत्रिक स्थिती</h4><div className="bg-muted/20 p-2.5 rounded-lg border grid grid-cols-2 gap-2"><div className="flex items-center gap-2"><Truck className="h-3 w-3 text-primary" /><div className="min-w-0"><p className="text-[8px] text-muted-foreground uppercase">काटा</p><p className="text-[9px] font-black">{selectedCenter.material.weighingScaleBrand || "-"}</p></div></div><div className="flex items-center gap-2"><FlaskConical className="h-3 w-3 text-primary" /><div className="min-w-0"><p className="text-[8px] text-muted-foreground uppercase">फॅट मशीन</p><p className="text-[9px] font-black">{selectedCenter.material.fatMachineBrand || "-"}</p></div></div></div></div>
                  </div>
                  <div className="space-y-1.5"><h4 className="text-[9px] font-black uppercase text-primary">दूध संकलन सरांश (Avg Milk)</h4><div className="grid grid-cols-3 gap-2"><div className="p-2.5 bg-blue-50/50 border rounded-lg text-center"><p className="text-[8px] font-black text-blue-600 uppercase">गाय</p><p className="text-[11px] font-black">{selectedCenter.cowMilk?.quantity || 0} L</p></div><div className="p-2.5 bg-amber-50/50 border rounded-lg text-center"><p className="text-[8px] font-black text-amber-600 uppercase">म्हेस</p><p className="text-[11px] font-black">{selectedCenter.buffaloMilk?.quantity || 0} L</p></div><div className="p-2.5 bg-indigo-50/50 border rounded-lg text-center"><p className="text-[8px] font-black text-indigo-600 uppercase">बर्फ</p><p className="text-[11px] font-black">{selectedCenter.iceBlocks || 0}</p></div></div></div>
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-center gap-2 p-10"><Warehouse className="h-12 w-12 text-muted-foreground/20" /><h4 className="text-[11px] font-black text-muted-foreground uppercase">केंद्र निवडा</h4></div>
          )}
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white"><DialogHeader className="p-3 bg-primary text-white"><DialogTitle className="text-sm font-black uppercase">{dialogMode === 'add' ? 'नवीन केंद्र' : 'माहिती बदला'}</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[85vh] p-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1">१) प्राथमिक माहिती</h4>
            <div className="grid grid-cols-2 gap-2.5"><div className="col-span-2 space-y-1"><Label className="text-[9px] font-black uppercase">केंद्राचे नाव</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-9 text-xs" /></div><div className="space-y-1"><Label className="text-[9px] font-black uppercase">कोड</Label><Input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="h-9 text-xs" /></div><div className="space-y-1"><Label className="text-[9px] font-black uppercase">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-9 text-xs" /></div></div>
          </div></div></ScrollArea>
          <DialogFooter className="p-3 border-t bg-muted/5 gap-2 flex justify-end"><Button variant="outline" onClick={() => setIsDialogOpen(false)}>रद्द</Button><Button onClick={handleSaveCenter}>जतन करा</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
