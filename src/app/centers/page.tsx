
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { 
  Warehouse, Plus, Search, MapPin, Edit, Truck, X, ChevronRight, Trash2, 
  Laptop, Zap, Sun, ClipboardList, Box, CheckCircle2, Milk, Info, ShieldCheck, Droplets
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { CollectionCenter, EquipmentItem } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
    <div className="space-y-3 max-w-[500px] mx-auto w-full pb-10 px-2 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-3">
        <div className="min-w-0">
          <h2 className="text-lg font-black text-foreground flex items-center gap-2 uppercase tracking-tight">
            <Warehouse className="h-5 w-5 text-primary" /> संकलन केंद्र (CENTERS)
          </h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Profile & Inventory</p>
        </div>
        <Button type="button" onClick={handleOpenAdd} size="sm" className="w-full sm:w-auto font-black h-9 text-[10px] rounded-xl px-5 uppercase shadow-lg shadow-primary/20 transition-all active:scale-95">
          <Plus className="h-3.5 w-3.5 mr-1.5" /> नवीन केंद्र
        </Button>
      </div>

      <div className="space-y-3">
        <Card className="border shadow-none bg-white rounded-xl overflow-hidden border-muted-foreground/10">
          <div className="p-2 border-b bg-muted/5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground opacity-50" />
              <input placeholder="शोधा..." className="w-full pl-8 h-9 text-[11px] bg-white border border-muted-foreground/10 rounded-lg font-black uppercase outline-none focus:ring-1 focus:ring-primary shadow-inner" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <ScrollArea className="h-[300px]">
            <div className="divide-y divide-muted-foreground/5">
              {filteredCenters.map(center => (
                <div key={center.id} className={`p-3 cursor-pointer hover:bg-muted/50 flex justify-between items-center transition-colors ${selectedCenter?.id === center.id ? 'bg-primary/5 border-l-4 border-primary' : ''}`} onClick={() => setSelectedCenter(center)}>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-[12px] text-slate-900 truncate uppercase">{center.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[8px] font-black h-4 px-1.5 rounded-md bg-muted/50 border-none">{center.code}</Badge>
                      <span className="text-[10px] text-muted-foreground truncate flex items-center gap-1 font-bold">
                        <MapPin className="h-3 w-3" /> {center.village}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/5 rounded-lg" onClick={(e) => handleDeleteCenter(center.id, e)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30" />
                  </div>
                </div>
              ))}
              {filteredCenters.length === 0 && (
                <div className="text-center py-20 opacity-20 font-black uppercase text-[10px] tracking-[0.3em]">केंद्र उपलब्ध नाहीत</div>
              )}
            </div>
          </ScrollArea>
        </Card>

        {selectedCenter && (
          <Card className="border shadow-none bg-white rounded-xl overflow-hidden border-muted-foreground/10 animate-in slide-in-from-right-2 duration-300">
            <div className="p-3 border-b flex items-center justify-between bg-primary/5">
              <div className="min-w-0">
                <h3 className="text-xs font-black truncate uppercase text-slate-900">{selectedCenter.name}</h3>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Operator: {selectedCenter.operatorName || "N/A"}</p>
              </div>
              <div className="flex gap-1.5">
                <Button type="button" variant="outline" size="icon" className="h-8 w-8 text-primary border-primary/20 hover:bg-primary/5 rounded-lg" onClick={() => handleOpenEdit(selectedCenter)}>
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-slate-100 rounded-lg" onClick={() => setSelectedCenter(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <ScrollArea className="max-h-[600px]">
              <div className="p-3 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-muted/20 p-2.5 rounded-xl border border-muted-foreground/5 space-y-1.5">
                    <h4 className="text-[9px] font-black uppercase text-primary tracking-widest flex items-center gap-1.5">
                      <Truck className="h-3 w-3" /> तांत्रिक व रसायने
                    </h4>
                    <div className="space-y-1">
                      <div><p className="text-[8px] text-muted-foreground uppercase font-black">काटा ब्रँड</p><p className="text-[10px] font-black">{selectedCenter.material.weighingScaleBrand || "-"}</p></div>
                      <div><p className="text-[8px] text-muted-foreground uppercase font-black">रसायन साठा</p><p className="text-[10px] font-black">{selectedCenter.material.chemicalsStock || "-"}</p></div>
                    </div>
                  </div>
                  <div className="bg-muted/20 p-2.5 rounded-xl border border-muted-foreground/5 space-y-1.5">
                    <h4 className="text-[9px] font-black uppercase text-primary tracking-widest flex items-center gap-1.5">
                      <ShieldCheck className="h-3 w-3" /> परवाना व मुदत
                    </h4>
                    <div className="space-y-1">
                      <div><p className="text-[8px] text-muted-foreground uppercase font-black">FSSAI No</p><p className="text-[10px] font-black">{selectedCenter.fssaiNumber || "-"}</p></div>
                      <div><p className="text-[8px] text-muted-foreground uppercase font-black">Valid Date</p><p className="text-[10px] font-black">{selectedCenter.fssaiExpiry || "-"}</p></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-[9px] font-black uppercase text-primary tracking-widest">सुविधा व ऊर्जा बॅकअप</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${selectedCenter.material.computerAvailable ? 'bg-emerald-50 border-emerald-100 shadow-sm' : 'bg-muted/20 opacity-40 border-muted-foreground/5'}`}>
                      <Laptop className={`h-4 w-4 ${selectedCenter.material.computerAvailable ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span className="text-[8px] font-black uppercase">कॉम्प्युटर</span>
                    </div>
                    <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${selectedCenter.material.upsInverterAvailable ? 'bg-emerald-50 border-emerald-100 shadow-sm' : 'bg-muted/20 opacity-40 border-muted-foreground/5'}`}>
                      <Zap className={`h-4 w-4 ${selectedCenter.material.upsInverterAvailable ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span className="text-[8px] font-black uppercase">UPS/INV</span>
                    </div>
                    <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${selectedCenter.material.solarAvailable ? 'bg-emerald-50 border-emerald-100 shadow-sm' : 'bg-muted/20 opacity-40 border-muted-foreground/5'}`}>
                      <Sun className={`h-4 w-4 ${selectedCenter.material.solarAvailable ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span className="text-[8px] font-black uppercase">सोलर</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-[9px] font-black uppercase text-primary tracking-widest">दूध संकलन सारांश (AVG MILK)</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-center shadow-sm">
                      <p className="text-[8px] font-black text-blue-600 uppercase tracking-tighter mb-1">गाय (COW)</p>
                      <p className="text-sm font-black text-blue-900">{selectedCenter.cowMilk?.quantity || 0} L</p>
                      <p className="text-[8px] font-bold text-blue-400 uppercase mt-0.5">F: {selectedCenter.cowMilk?.fat}% | S: {selectedCenter.cowMilk?.snf}%</p>
                    </div>
                    <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-center shadow-sm">
                      <p className="text-[8px] font-black text-amber-600 uppercase tracking-tighter mb-1">म्हेस (BUF)</p>
                      <p className="text-sm font-black text-amber-900">{selectedCenter.buffaloMilk?.quantity || 0} L</p>
                      <p className="text-[8px] font-bold text-amber-400 uppercase mt-0.5">F: {selectedCenter.buffaloMilk?.fat}% | S: {selectedCenter.buffaloMilk?.snf}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/10 p-2.5 rounded-xl border border-muted-foreground/5 space-y-1">
                  <div className="flex justify-between text-[10px] font-black uppercase"><span className="text-muted-foreground">पशुखाद्य ब्रँड:</span> <span>{selectedCenter.cattleFeedBrand || "-"}</span></div>
                  <div className="flex justify-between text-[10px] font-black uppercase"><span className="text-muted-foreground">बर्फ लाद्या:</span> <span>{selectedCenter.iceBlocks || 0}</span></div>
                  <div className="flex justify-between text-[10px] font-black uppercase"><span className="text-muted-foreground">एकूण कॅन:</span> <span>{selectedCenter.material.milkCansCount || 0}</span></div>
                </div>
              </div>
            </ScrollArea>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[480px] p-0 overflow-hidden bg-white rounded-3xl border-none shadow-2xl">
          <DialogHeader className="p-3 bg-primary text-white sticky top-0 z-10">
            <DialogTitle className="text-sm font-black uppercase tracking-widest">{dialogMode === 'add' ? 'नवीन केंद्र जोडा' : 'माहिती अद्ययावत करा'}</DialogTitle>
            <DialogDescription className="text-[8px] text-white/70 uppercase">केंद्राचे संपूर्ण तांत्रिक व इन्व्हेंटरी तपशील भरा.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] p-4 bg-white">
            <div className="space-y-5 pb-6">
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1 tracking-widest flex items-center gap-2">
                  <Warehouse className="h-3 w-3" /> १) प्राथमिक व परवाना माहिती
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="col-span-2 space-y-1"><Label className="text-[9px] uppercase font-black opacity-60">केंद्राचे नाव *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black opacity-60">कोड *</Label><Input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black opacity-60">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black opacity-60">FSSAI No</Label><Input value={formData.fssaiNumber} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black opacity-60">Expiry Date</Label><Input type="date" value={formData.fssaiExpiry} onChange={e => setFormData({...formData, fssaiExpiry: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" /></div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1 tracking-widest flex items-center gap-2">
                  <Truck className="h-3 w-3" /> २) तांत्रिक व रसायने
                </h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black opacity-60">काटा ब्रँड</Label><Input value={formData.weighingScaleBrand} onChange={e => setFormData({...formData, weighingScaleBrand: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black opacity-60">रसायन स्टॉक</Label><Input value={formData.chemicalsStock} onChange={e => setFormData({...formData, chemicalsStock: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" placeholder="उदा. 5 L" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black opacity-60">बॅटरी स्थिती</Label><Input value={formData.batteryCondition} onChange={e => setFormData({...formData, batteryCondition: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" placeholder="Good / Poor" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black opacity-60">एकूण कॅन</Label><Input type="number" value={formData.milkCansCount} onChange={e => setFormData({...formData, milkCansCount: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" /></div>
                </div>
                
                <div className="grid grid-cols-1 gap-2 pt-1">
                  <div className="flex items-center space-x-2 bg-muted/10 p-2 rounded-xl border border-muted-foreground/5 shadow-sm cursor-pointer" onClick={() => setFormData({...formData, computerAvailable: !formData.computerAvailable})}>
                    <Checkbox id="comp-c" checked={formData.computerAvailable} onCheckedChange={(v) => setFormData({...formData, computerAvailable: !!v})} />
                    <Label htmlFor="comp-c" className="text-[10px] font-black uppercase cursor-pointer tracking-wider">कॉम्प्युटर आहे का?</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-muted/10 p-2 rounded-xl border border-muted-foreground/5 shadow-sm cursor-pointer" onClick={() => setFormData({...formData, upsInverterAvailable: !formData.upsInverterAvailable})}>
                    <Checkbox id="ups-c" checked={formData.upsInverterAvailable} onCheckedChange={(v) => setFormData({...formData, upsInverterAvailable: !!v})} />
                    <Label htmlFor="ups-c" className="text-[10px] font-black uppercase cursor-pointer tracking-wider">UPS / इनव्हर्टर आहे का?</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-muted/10 p-2 rounded-xl border border-muted-foreground/5 shadow-sm cursor-pointer" onClick={() => setFormData({...formData, solarAvailable: !formData.solarAvailable})}>
                    <Checkbox id="solar-c" checked={formData.solarAvailable} onCheckedChange={(v) => setFormData({...formData, solarAvailable: !!v})} />
                    <Label htmlFor="solar-c" className="text-[10px] font-black uppercase cursor-pointer tracking-wider">सोलर उपलब्ध आहे का?</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1 tracking-widest flex items-center gap-2">
                  <Milk className="h-3.5 w-3.5" /> ३) दूध संकलन व पशुखाद्य
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1"><Label className="text-[9px] uppercase font-black opacity-60">पशुखाद्य ब्रँड</Label><Input value={formData.cattleFeedBrand} onChange={e => setFormData({...formData, cattleFeedBrand: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" /></div>
                    <div className="space-y-1"><Label className="text-[9px] uppercase font-black opacity-60">बर्फ लाद्या</Label><Input type="number" value={formData.iceBlocks} onChange={e => setFormData({...formData, iceBlocks: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" /></div>
                  </div>
                  <div className="p-3 border rounded-xl bg-blue-50/20 space-y-2">
                    <p className="text-[9px] font-black text-blue-700 uppercase tracking-widest flex items-center gap-1.5"><Milk className="h-3 w-3" /> गाय दूध (AVG COW)</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1"><Label className="text-[8px] uppercase">Qty (L)</Label><Input type="number" step="0.1" value={formData.cowQty} onChange={e => setFormData({...formData, cowQty: e.target.value})} className="h-8 text-[10px] text-center border-none bg-white rounded-lg shadow-sm" /></div>
                      <div className="space-y-1"><Label className="text-[8px] uppercase">Fat %</Label><Input type="number" step="0.1" value={formData.cowFat} onChange={e => setFormData({...formData, cowFat: e.target.value})} className="h-8 text-[10px] text-center border-none bg-white rounded-lg shadow-sm" /></div>
                      <div className="space-y-1"><Label className="text-[8px] uppercase">SNF %</Label><Input type="number" step="0.1" value={formData.cowSnf} onChange={e => setFormData({...formData, cowSnf: e.target.value})} className="h-8 text-[10px] text-center border-none bg-white rounded-lg shadow-sm" /></div>
                    </div>
                  </div>
                  <div className="p-3 border rounded-xl bg-amber-50/20 space-y-2">
                    <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-1.5"><Milk className="h-3 w-3" /> म्हैस दूध (AVG BUF)</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1"><Label className="text-[8px] uppercase">Qty (L)</Label><Input type="number" step="0.1" value={formData.bufQty} onChange={e => setFormData({...formData, bufQty: e.target.value})} className="h-8 text-[10px] text-center border-none bg-white rounded-lg shadow-sm" /></div>
                      <div className="space-y-1"><Label className="text-[8px] uppercase">Fat %</Label><Input type="number" step="0.1" value={formData.bufFat} onChange={e => setFormData({...formData, bufFat: e.target.value})} className="h-8 text-[10px] text-center border-none bg-white rounded-lg shadow-sm" /></div>
                      <div className="space-y-1"><Label className="text-[8px] uppercase">SNF %</Label><Input type="number" step="0.1" value={formData.bufSnf} onChange={e => setFormData({...formData, bufSnf: e.target.value})} className="h-8 text-[10px] text-center border-none bg-white rounded-lg shadow-sm" /></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between border-b pb-1">
                  <h4 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                    <Box className="h-3 w-3" /> ४) साहित्याची यादी (INVENTORY)
                  </h4>
                  <Button type="button" variant="outline" size="sm" onClick={addEquipmentRow} className="h-6 text-[8px] font-black px-2 rounded-lg border-primary/20 bg-primary/5 text-primary">
                    जोडा
                  </Button>
                </div>
                <div className="space-y-1.5">
                  {formData.equipment.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-1.5 items-center bg-muted/10 p-1.5 rounded-xl border border-muted-foreground/5">
                      <div className="col-span-6">
                        <Input value={item.name} onChange={e => updateEquipmentRow(item.id, {name: e.target.value})} className="h-7 text-[10px] px-2 bg-white border-none rounded-md font-bold" placeholder="साहित्य नाव" />
                      </div>
                      <div className="col-span-2">
                        <Input type="number" value={item.quantity} onChange={e => updateEquipmentRow(item.id, {quantity: Number(e.target.value)})} className="h-7 text-[10px] px-0 text-center bg-white border-none rounded-md font-black" />
                      </div>
                      <div className="col-span-3">
                        <Select value={item.ownership} onValueChange={v => updateEquipmentRow(item.id, {ownership: v as any})}>
                          <SelectTrigger className="h-7 text-[8px] px-1 bg-white border-none rounded-md font-black">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Self" className="text-[10px] font-black">स्वतः</SelectItem>
                            <SelectItem value="Company" className="text-[10px] font-black">डेअरी</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button variant="ghost" size="icon" onClick={() => removeEquipmentRow(item.id)} className="h-6 w-6 text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-3 border-t bg-muted/10 gap-2 flex justify-end">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-10 text-[10px] font-black uppercase tracking-widest border-primary/20 flex-1 sm:flex-none">रद्द</Button>
            <Button type="button" onClick={handleSaveCenter} className="rounded-xl h-10 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 flex-1 sm:flex-none">
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> जतन करा
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
