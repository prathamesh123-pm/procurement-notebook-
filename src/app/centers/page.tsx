
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { 
  Warehouse, Plus, Search, MapPin, Edit, Truck, FlaskConical, X, ChevronRight, Trash2, 
  Laptop, Zap, Sun, ClipboardList, Thermometer, Battery
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { CollectionCenter, EquipmentItem } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"

export default function CentersPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const centersQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'users', user.uid, 'centers')
  }, [db, user])

  const { data: centers, isLoading } = useCollection<CollectionCenter>(centersQuery)

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
      toast({ title: "त्रुटी", description: "नाव आणि कोड आवश्यक आहे.", variant: "destructive" })
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
      },
      updatedAt: new Date().toISOString()
    }

    if (dialogMode === 'add') {
      const colRef = collection(db, 'users', user.uid, 'centers')
      addDocumentNonBlocking(colRef, centerData)
      toast({ title: "यशस्वी", description: "नवीन केंद्र जोडण्यात आले." })
    } else if (editingId) {
      const docRef = doc(db, 'users', user.uid, 'centers', editingId)
      updateDocumentNonBlocking(docRef, centerData)
      toast({ title: "यशस्वी", description: "केंद्राची माहिती अपडेट झाली." })
    }
    
    setIsDialogOpen(false)
  }

  const handleDeleteCenter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!db || !user) return
    if (confirm("तुम्हाला खात्री आहे की हे केंद्र हटवायचे आहे?")) {
      const docRef = doc(db, 'users', user.uid, 'centers', id)
      deleteDocumentNonBlocking(docRef)
      if (selectedCenter?.id === id) setSelectedCenter(null)
      toast({ title: "यशस्वी", description: "केंद्र हटवण्यात आले." })
    }
  }

  const addEquipmentRow = () => {
    const newItem: EquipmentItem = { id: crypto.randomUUID(), name: "", quantity: 1, ownership: 'Self' }
    setFormData({ ...formData, equipment: [...formData.equipment, newItem] })
  }

  const removeEquipmentRow = (id: string) => {
    setFormData({ ...formData, equipment: formData.equipment.filter(e => e.id !== id) })
  }

  const updateEquipmentRow = (id: string, updates: Partial<EquipmentItem>) => {
    setFormData({ ...formData, equipment: formData.equipment.map(e => e.id === id ? { ...e, ...updates } : e) })
  }

  const filteredCenters = centers?.filter(center => 
    center.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    center.code.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  if (!mounted || isLoading) return <div className="p-10 text-center italic font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="space-y-3 max-w-7xl mx-auto w-full pb-10 px-1">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-1">
        <h2 className="text-lg font-black text-foreground flex items-center gap-2"><Warehouse className="h-5 w-5 text-primary" /> संकलन केंद्र (Centers)</h2>
        <Button type="button" onClick={handleOpenAdd} size="sm" className="w-full sm:w-auto font-black h-8 text-[11px] rounded-lg"><Plus className="h-3.5 w-3.5" /> नवीन केंद्र</Button>
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
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => handleDeleteCenter(center.id, e)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
                <Button type="button" variant="ghost" size="icon" className="lg:hidden" onClick={() => setSelectedCenter(null)}><X className="h-4 w-4" /></Button>
                <div className="flex-1 px-2 min-w-0"><h3 className="text-sm font-black truncate">{selectedCenter.name}</h3><p className="text-[9px] font-black text-muted-foreground uppercase">Code: {selectedCenter.code} | {selectedCenter.village}</p></div>
                <div className="flex gap-1.5">
                  <Button type="button" variant="outline" size="icon" className="h-7 w-7 text-primary" onClick={() => handleOpenEdit(selectedCenter)}><Edit className="h-3 w-3" /></Button>
                  <Button type="button" variant="outline" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => handleDeleteCenter(selectedCenter.id, e)}><Trash2 className="h-3.5 w-3" /></Button>
                </div>
              </div>
              <ScrollArea className="flex-1 h-[650px]">
                <div className="p-3 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5"><h4 className="text-[9px] font-black uppercase text-primary">ऑपरेटर व परवाना</h4><div className="bg-muted/20 p-2.5 rounded-lg border space-y-2"><div className="grid grid-cols-2 gap-2"><div><p className="text-[8px] text-muted-foreground uppercase">नाव</p><p className="text-[10px] font-black">{selectedCenter.operatorName || "-"}</p></div><div><p className="text-[8px] text-muted-foreground uppercase">संपर्क</p><p className="text-[10px] font-black">{selectedCenter.mobile || "-"}</p></div></div><div className="pt-1.5 border-t border-dashed grid grid-cols-2 gap-2"><div><p className="text-[8px] text-muted-foreground uppercase">FSSAI</p><p className="text-[10px] font-black">{selectedCenter.fssaiNumber || "N/A"}</p></div><div><p className="text-[8px] text-muted-foreground uppercase">Expiry</p><p className="text-[10px] font-black">{selectedCenter.fssaiExpiry || "-"}</p></div></div></div></div>
                    <div className="space-y-1.5"><h4 className="text-[9px] font-black uppercase text-primary">तांत्रिक स्थिती</h4><div className="bg-muted/20 p-2.5 rounded-lg border grid grid-cols-2 gap-2"><div className="flex items-center gap-2"><Truck className="h-3 w-3 text-primary" /><div className="min-w-0"><p className="text-[8px] text-muted-foreground uppercase">काटा</p><p className="text-[9px] font-black">{selectedCenter.material.weighingScaleBrand || "-"}</p></div></div><div className="flex items-center gap-2"><FlaskConical className="h-3 w-3 text-primary" /><div className="min-w-0"><p className="text-[8px] text-muted-foreground uppercase">फॅट मशीन</p><p className="text-[9px] font-black">{selectedCenter.material.fatMachineBrand || "-"}</p></div></div></div></div>
                  </div>
                  
                  <div className="space-y-1.5"><h4 className="text-[9px] font-black uppercase text-primary">दूध संकलन सरांश (Avg Milk)</h4><div className="grid grid-cols-2 gap-2"><div className="p-3 bg-blue-50/50 border rounded-lg"><p className="text-[8px] font-black text-blue-600 uppercase">गाय</p><p className="text-[11px] font-black">{selectedCenter.cowMilk?.quantity || 0} L</p><p className="text-[8px] text-muted-foreground">F: {selectedCenter.cowMilk?.fat}% | S: {selectedCenter.cowMilk?.snf}%</p></div><div className="p-3 bg-amber-50/50 border rounded-lg"><p className="text-[8px] font-black text-amber-600 uppercase">म्हेस</p><p className="text-[11px] font-black">{selectedCenter.buffaloMilk?.quantity || 0} L</p><p className="text-[8px] text-muted-foreground">F: {selectedCenter.buffaloMilk?.fat}% | S: {selectedCenter.buffaloMilk?.snf}%</p></div></div></div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className={`p-2 rounded-lg border flex flex-col items-center gap-1 ${selectedCenter.material.computerAvailable ? 'bg-green-50' : 'bg-muted/20 opacity-50'}`}><Laptop className="h-4 w-4" /><span className="text-[8px] font-black uppercase">कॉम्प्युटर</span></div>
                    <div className={`p-2 rounded-lg border flex flex-col items-center gap-1 ${selectedCenter.material.upsInverterAvailable ? 'bg-green-50' : 'bg-muted/20 opacity-50'}`}><Zap className="h-4 w-4" /><span className="text-[8px] font-black uppercase">UPS/INV</span></div>
                    <div className={`p-2 rounded-lg border flex flex-col items-center gap-1 ${selectedCenter.material.solarAvailable ? 'bg-green-50' : 'bg-muted/20 opacity-50'}`}><Sun className="h-4 w-4" /><span className="text-[8px] font-black uppercase">सोलर</span></div>
                  </div>

                  {selectedCenter.material.equipment && selectedCenter.material.equipment.length > 0 && (
                    <div className="space-y-1.5"><h4 className="text-[9px] font-black uppercase text-primary">साहित्य यादी</h4><div className="bg-muted/10 rounded-lg border overflow-hidden"><table className="w-full text-[10px]"><thead><tr className="bg-muted/20 text-[8px] font-black uppercase"><th className="p-2 text-left">साहित्य</th><th className="p-2 text-center">नग</th><th className="p-2 text-right">मालकी</th></tr></thead><tbody className="divide-y">{selectedCenter.material.equipment.map(e => (<tr key={e.id}><td className="p-2 font-bold">{e.name}</td><td className="p-2 text-center">{e.quantity}</td><td className="p-2 text-right text-[8px] font-black uppercase text-muted-foreground">{e.ownership}</td></tr>))}</tbody></table></div></div>
                  )}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-center gap-2 p-10"><Warehouse className="h-12 w-12 text-muted-foreground/20" /><h4 className="text-[11px] font-black text-muted-foreground uppercase">एक केंद्र निवडा</h4></div>
          )}
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white rounded-3xl border-none shadow-2xl">
          <DialogHeader className="p-3 bg-primary text-white">
            <DialogTitle className="text-sm font-black uppercase">{dialogMode === 'add' ? 'नवीन केंद्र' : 'माहिती बदला'}</DialogTitle>
            <DialogDescription className="text-[8px] text-white/70 uppercase">केंद्राचे संपूर्ण तपशील भरा.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[85vh] p-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1">१) प्राथमिक माहिती</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="col-span-2 space-y-1"><Label className="text-[9px] uppercase font-black">केंद्राचे नाव</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none font-black" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">कोड</Label><Input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none font-black" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none font-black" /></div>
                  <div className="col-span-2 space-y-1"><Label className="text-[9px] uppercase font-black">ऑपरेटर नाव</Label><Input value={formData.operatorName} onChange={e => setFormData({...formData, operatorName: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none font-black" /></div>
                  <div className="col-span-2 space-y-1"><Label className="text-[9px] uppercase font-black">गाव</Label><Input value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none font-black" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">FSSAI क्र.</Label><Input value={formData.fssaiNumber} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none font-black" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">मुदत</Label><Input value={formData.fssaiExpiry} onChange={e => setFormData({...formData, fssaiExpiry: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none font-black" placeholder="DD/MM/YYYY" /></div>
                </div>

                <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1 mt-6">२) दूध संकलन (Avg)</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50/30 rounded-xl border border-blue-100">
                    <p className="text-[9px] font-black text-blue-600 mb-2 uppercase">गाय (Cow)</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1"><Label className="text-[8px] uppercase">Qty (L)</Label><Input type="number" value={formData.cowQty} onChange={e => setFormData({...formData, cowQty: e.target.value})} className="h-8 text-xs bg-white" /></div>
                      <div className="space-y-1"><Label className="text-[8px] uppercase">Fat</Label><Input type="number" value={formData.cowFat} onChange={e => setFormData({...formData, cowFat: e.target.value})} className="h-8 text-xs bg-white" /></div>
                      <div className="space-y-1"><Label className="text-[8px] uppercase">SNF</Label><Input type="number" value={formData.cowSnf} onChange={e => setFormData({...formData, cowSnf: e.target.value})} className="h-8 text-xs bg-white" /></div>
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50/30 rounded-xl border border-amber-100">
                    <p className="text-[9px] font-black text-amber-600 mb-2 uppercase">म्हेस (Buffalo)</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1"><Label className="text-[8px] uppercase">Qty (L)</Label><Input type="number" value={formData.bufQty} onChange={e => setFormData({...formData, bufQty: e.target.value})} className="h-8 text-xs bg-white" /></div>
                      <div className="space-y-1"><Label className="text-[8px] uppercase">Fat</Label><Input type="number" value={formData.bufFat} onChange={e => setFormData({...formData, bufFat: e.target.value})} className="h-8 text-xs bg-white" /></div>
                      <div className="space-y-1"><Label className="text-[8px] uppercase">SNF</Label><Input type="number" value={formData.bufSnf} onChange={e => setFormData({...formData, bufSnf: e.target.value})} className="h-8 text-xs bg-white" /></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1">३) तांत्रिक व इतर</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">काटा ब्रँड</Label><Input value={formData.weighingScaleBrand} onChange={e => setFormData({...formData, weighingScaleBrand: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none font-black" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">मशीन ब्रँड</Label><Input value={formData.fatMachineBrand} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none font-black" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">केमिकल्स स्टॉक</Label><Input value={formData.chemicalsStock} onChange={e => setFormData({...formData, chemicalsStock: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none font-black" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">बॅटरी स्थिती</Label><Input value={formData.batteryCondition} onChange={e => setFormData({...formData, batteryCondition: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none font-black" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">बर्फ लाद्या</Label><Input type="number" value={formData.iceBlocks} onChange={e => setFormData({...formData, iceBlocks: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none font-black" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">कॅन संख्या</Label><Input type="number" value={formData.milkCansCount} onChange={e => setFormData({...formData, milkCansCount: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none font-black" /></div>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-2">
                  <div className="flex items-center space-x-2 bg-muted/10 p-2 rounded-xl border border-muted-foreground/5 shadow-sm">
                    <Checkbox id="comp-c" checked={formData.computerAvailable} onCheckedChange={(v) => setFormData({...formData, computerAvailable: !!v})} />
                    <Label htmlFor="comp-c" className="text-[10px] font-black uppercase cursor-pointer">कॉम्प्युटर आहे का?</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-muted/10 p-2 rounded-xl border border-muted-foreground/5 shadow-sm">
                    <Checkbox id="ups-c" checked={formData.upsInverterAvailable} onCheckedChange={(v) => setFormData({...formData, upsInverterAvailable: !!v})} />
                    <Label htmlFor="ups-c" className="text-[10px] font-black uppercase cursor-pointer">UPS / इनव्हर्टर आहे का?</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-muted/10 p-2 rounded-xl border border-muted-foreground/5 shadow-sm">
                    <Checkbox id="solar-c" checked={formData.solarAvailable} onCheckedChange={(v) => setFormData({...formData, solarAvailable: !!v})} />
                    <Label htmlFor="solar-c" className="text-[10px] font-black uppercase cursor-pointer">सोलर उपलब्ध आहे का?</Label>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between"><Label className="text-[9px] font-black uppercase">साहित्य यादी</Label><Button type="button" variant="outline" size="sm" onClick={addEquipmentRow} className="h-6 text-[8px] font-black px-2 rounded-md">जोडा</Button></div>
                  <div className="space-y-1.5">
                    {formData.equipment.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-1 items-center bg-muted/10 p-1.5 rounded-lg">
                        <Input value={item.name} onChange={e => updateEquipmentRow(item.id, {name: e.target.value})} className="col-span-6 h-7 text-[10px] bg-white border-none" placeholder="कॅन / बादली" />
                        <Input type="number" value={item.quantity} onChange={e => updateEquipmentRow(item.id, {quantity: Number(e.target.value)})} className="col-span-2 h-7 text-[10px] bg-white border-none px-1 text-center" />
                        <select value={item.ownership} onChange={e => updateEquipmentRow(item.id, {ownership: e.target.value as any})} className="col-span-3 h-7 text-[8px] bg-white border-none rounded-md px-1">
                          <option value="Self">स्वतः</option>
                          <option value="Company">डेअरी</option>
                        </select>
                        <Button variant="ghost" size="icon" onClick={() => removeEquipmentRow(item.id)} className="col-span-1 h-6 w-6 text-destructive"><X className="h-3 w-3" /></Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-3 border-t bg-muted/5 gap-2 flex justify-end">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl border-primary/20 h-9 text-xs font-black uppercase">रद्द</Button>
            <Button type="button" onClick={handleSaveCenter} className="rounded-xl shadow-lg shadow-primary/20 h-9 text-xs font-black uppercase">जतन करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
