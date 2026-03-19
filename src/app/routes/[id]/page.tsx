
"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Supplier, EquipmentItem } from "@/lib/types"
import { 
  Plus, Search, MapPin, User, 
  Truck, Edit, ChevronRight, ArrowLeft, X, Laptop, Zap, Sun, Trash2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"

export default function RouteDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const routeId = params.id as string
  const { toast } = useToast()
  const { user } = useUser()
  const db = useFirestore()

  const routesQuery = useMemoFirebase(() => {
    if (!db) return null
    return collection(db, 'routes')
  }, [db])

  const suppliersQuery = useMemoFirebase(() => {
    if (!db) return null
    return collection(db, 'suppliers')
  }, [db])

  const { data: allRoutes } = useCollection(routesQuery)
  const { data: allSuppliers, isLoading } = useCollection<Supplier>(suppliersQuery)

  const route = useMemo(() => allRoutes?.find(r => r.id === routeId), [allRoutes, routeId])
  const suppliers = useMemo(() => allSuppliers?.filter(s => s.routeId === routeId) || [], [allSuppliers, routeId])

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "", id: "", address: "", mobile: "", competition: "", additionalInfo: "",
    cowQty: "0", cowFat: "0", cowSnf: "0", bufQty: "0", bufFat: "0", bufSnf: "0",
    iceBlocks: "0", collectionType: "Route", cattleFeedBrand: "",
    fssaiNumber: "", fssaiExpiry: "", scaleBrand: "", fatMachineBrand: "",
    adulterationKitInfo: "",
    milkCansCount: "0", computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
    equipment: [] as EquipmentItem[]
  })

  useEffect(() => setMounted(true), [])

  const openAddDialog = () => {
    setDialogMode('add')
    setEditingId(null)
    setFormData({
      name: "", id: "", address: "", mobile: "", competition: "", additionalInfo: "",
      cowQty: "0", cowFat: "0", cowSnf: "0", bufQty: "0", bufFat: "0", bufSnf: "0",
      iceBlocks: "0", collectionType: "Route", cattleFeedBrand: "",
      fssaiNumber: "", fssaiExpiry: "", scaleBrand: "", fatMachineBrand: "",
      adulterationKitInfo: "",
      milkCansCount: "0", computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
      equipment: []
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (supplier: Supplier) => {
    setDialogMode('edit')
    setEditingId(supplier.id)
    setFormData({
      name: supplier.name || "", id: supplier.id || "", address: supplier.address || "",
      mobile: supplier.mobile || "", competition: supplier.competition || "", additionalInfo: supplier.additionalInfo || "",
      cowQty: String(supplier.cowMilk?.quantity ?? 0), cowFat: String(supplier.cowMilk?.fat ?? 0), cowSnf: String(supplier.cowMilk?.snf ?? 0),
      bufQty: String(supplier.buffaloMilk?.quantity ?? 0), bufFat: String(supplier.buffaloMilk?.fat ?? 0), bufSnf: String(supplier.buffaloMilk?.snf ?? 0),
      iceBlocks: String(supplier.iceBlocks ?? 0), collectionType: supplier.collectionType || "Route",
      cattleFeedBrand: supplier.cattleFeedBrand || "", fssaiNumber: supplier.fssaiNumber || "",
      fssaiExpiry: supplier.fssaiExpiry || "", scaleBrand: supplier.scaleBrand || "",
      fatMachineBrand: supplier.fatMachineBrand || "", 
      adulterationKitInfo: supplier.adulterationKitInfo || "",
      milkCansCount: String(supplier.milkCansCount || 0),
      computerAvailable: supplier.computerAvailable || false, upsInverterAvailable: supplier.upsInverterAvailable || false,
      solarAvailable: supplier.solarAvailable || false, equipment: supplier.equipment || []
    })
    setIsDialogOpen(true)
  }

  const handleSaveSupplier = () => {
    if (!formData.name || !formData.id || !db) {
      toast({ title: "त्रुटी", description: "नाव आणि आयडी आवश्यक आहे.", variant: "destructive" })
      return
    }

    const supplierData = {
      id: formData.id, name: formData.name, address: formData.address, mobile: formData.mobile,
      routeId: routeId, competition: formData.competition, additionalInfo: formData.additionalInfo,
      cowMilk: { quantity: Number(formData.cowQty), fat: Number(formData.cowFat), snf: Number(formData.cowSnf) },
      buffaloMilk: { quantity: Number(formData.bufQty), fat: Number(formData.bufFat), snf: Number(formData.bufSnf) },
      iceBlocks: Number(formData.iceBlocks), collectionType: formData.collectionType,
      cattleFeedBrand: formData.cattleFeedBrand, fssaiNumber: formData.fssaiNumber,
      fssaiExpiry: formData.fssaiExpiry, scaleBrand: formData.scaleBrand,
      fatMachineBrand: formData.fatMachineBrand, adulterationKitInfo: formData.adulterationKitInfo,
      milkCansCount: Number(formData.milkCansCount),
      computerAvailable: formData.computerAvailable, upsInverterAvailable: formData.upsInverterAvailable,
      solarAvailable: formData.solarAvailable, equipment: formData.equipment,
      updatedAt: new Date().toISOString()
    }

    if (dialogMode === 'add') {
      const colRef = collection(db, 'suppliers')
      addDocumentNonBlocking(colRef, supplierData)
      toast({ title: "यशस्वी", description: "पुरवठादार जोडला गेला." })
    } else if (editingId) {
      const docRef = doc(db, 'suppliers', editingId)
      updateDocumentNonBlocking(docRef, supplierData)
      toast({ title: "यशस्वी", description: "माहिती अद्ययावत केली गेली." })
    }
    setIsDialogOpen(false)
  }

  const handleDeleteSupplier = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!db) return
    if (confirm("तुम्हाला खात्री आहे की हा सप्लायर हटवायचा आहे?")) {
      const docRef = doc(db, 'suppliers', id)
      deleteDocumentNonBlocking(docRef)
      if (selectedSupplier?.id === id) setSelectedSupplier(null)
      toast({ title: "यशस्वी", description: "सप्लायर हटवण्यात आला." })
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

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => (s.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()))
  }, [suppliers, searchQuery])

  if (!mounted || isLoading) return <div className="p-10 text-center italic text-muted-foreground uppercase text-[10px] opacity-50">लोड होत आहे...</div>

  return (
    <div className="space-y-2 max-w-7xl mx-auto w-full pb-10 px-1 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b pb-2 px-1">
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => router.push('/routes')}><ArrowLeft className="h-4 w-4" /></Button>
          <div className="min-w-0"><h2 className="text-base font-black uppercase truncate tracking-tight">सप्लायर (Suppliers)</h2><p className="text-[9px] text-muted-foreground font-black uppercase truncate tracking-widest">RT: {route?.name || routeId}</p></div>
        </div>
        <Button type="button" onClick={openAddDialog} size="sm" className="h-8 font-black gap-1.5 rounded-lg text-[10px] px-4 uppercase tracking-widest"><Plus className="h-3.5 w-3.5" /> नवीन</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        <Card className={`lg:col-span-4 border shadow-none bg-white overflow-hidden flex flex-col border-muted-foreground/10 ${selectedSupplier ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-2 border-b bg-muted/5"><div className="relative"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground opacity-50" /><input placeholder="शोधा..." className="w-full pl-7 h-8 text-[11px] bg-white border border-muted-foreground/10 rounded-md font-black uppercase" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div></div>
          <ScrollArea className="h-[650px]"><div className="divide-y">{filteredSuppliers.map(s => (<div key={s.id} onClick={() => setSelectedSupplier(s)} className={`p-2.5 cursor-pointer hover:bg-muted/50 flex justify-between items-center ${selectedSupplier?.id === s.id ? 'bg-primary/5 border-l-2 border-primary' : ''}`}><div className="min-w-0"><h4 className="font-black text-[11px] truncate uppercase">{s.name}</h4><p className="text-[9px] text-muted-foreground truncate font-bold">ID: {s.id?.slice(-6)} | {s.address}</p></div><div className="flex items-center gap-1"><Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/5" onClick={(e) => handleDeleteSupplier(s.id, e)}><Trash2 className="h-3.5 w-3.5" /></Button><ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-50" /></div></div>))}</div></ScrollArea>
        </Card>

        <Card className={`lg:col-span-8 border shadow-none bg-white rounded-xl min-h-[450px] border-muted-foreground/10 ${!selectedSupplier ? 'hidden lg:flex' : 'block'}`}>
          {selectedSupplier ? (
            <div className="flex flex-col h-full">
              <div className="p-3 border-b flex items-center justify-between bg-primary/5 sticky top-0 z-10"><Button type="button" variant="ghost" size="icon" className="lg:hidden" onClick={() => setSelectedSupplier(null)}><ArrowLeft className="h-4 w-4" /></Button><div className="flex-1 px-2 min-w-0"><h3 className="text-xs sm:text-sm font-black truncate uppercase">{selectedSupplier.name}</h3><p className="text-[9px] font-black text-muted-foreground uppercase">ID: {selectedSupplier.id} | {selectedSupplier.collectionType}</p></div><div className="flex gap-1.5"><Button type="button" variant="outline" size="icon" className="h-7 w-7 text-primary hover:bg-primary/5 rounded-lg" onClick={() => openEditDialog(selectedSupplier)}><Edit className="h-3 w-3" /></Button><Button type="button" variant="outline" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/5 rounded-lg" onClick={(e) => handleDeleteSupplier(selectedSupplier.id, e)}><Trash2 className="h-3 w-3" /></Button></div></div>
              <ScrollArea className="flex-1 h-[650px]">
                <div className="p-3 space-y-4">
                  <div className="grid grid-cols-2 gap-3"><div className="bg-muted/20 p-2.5 rounded-xl border border-muted-foreground/5 space-y-1.5"><h4 className="text-[9px] font-black uppercase text-primary tracking-widest">संपर्क व पत्ता</h4><p className="text-[10px] font-black">{selectedSupplier.mobile || "-"}</p><p className="text-[10px] font-medium leading-relaxed">{selectedSupplier.address || "-"}</p></div><div className="bg-muted/20 p-2.5 rounded-xl border border-muted-foreground/5 space-y-1.5"><h4 className="text-[9px] font-black uppercase text-primary tracking-widest">FSSAI परवाना</h4><p className="text-[10px] font-black">{selectedSupplier.fssaiNumber || "N/A"}</p><Badge className="text-[8px] h-4 px-1.5 font-black bg-primary/10 text-primary border-none">VALID: {selectedSupplier.fssaiExpiry || "-"}</Badge></div></div>
                  <div className="grid grid-cols-3 gap-2">{[{icon: Laptop, label: 'कॉम्प्युटर', val: selectedSupplier.computerAvailable}, {icon: Zap, label: 'UPS/Inv', val: selectedSupplier.upsInverterAvailable}, {icon: Sun, label: 'सोलर', val: selectedSupplier.solarAvailable}].map((it, i) => (<div key={i} className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${it.val ? 'bg-green-50 border-green-100 shadow-sm' : 'bg-muted/20 opacity-50 border-muted-foreground/5'}`}><it.icon className={`h-4 w-4 ${it.val ? 'text-green-600' : 'text-muted-foreground'}`} /><span className="text-[8px] font-black uppercase">{it.label}</span></div>))}</div>
                  <div className="space-y-1.5"><h4 className="text-[9px] font-black uppercase text-primary tracking-widest">दूध आकडेवारी (AVG)</h4><div className="grid grid-cols-2 gap-2"><div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-center"><p className="text-[8px] font-black text-blue-600 uppercase tracking-tighter">गाय दूध</p><p className="text-sm font-black text-blue-900">{selectedSupplier.cowMilk?.quantity || 0}L</p><p className="text-[8px] font-bold text-blue-400">F: {selectedSupplier.cowMilk?.fat}% | S: {selectedSupplier.cowMilk?.snf}%</p></div><div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-center"><p className="text-[8px] font-black text-amber-600 uppercase tracking-tighter">म्हेस दूध</p><p className="text-sm font-black text-amber-900">{selectedSupplier.buffaloMilk?.quantity || 0}L</p><p className="text-[8px] font-bold text-amber-400">F: {selectedSupplier.buffaloMilk?.fat}% | S: {selectedSupplier.buffaloMilk?.snf}%</p></div></div></div>
                  {selectedSupplier.equipment && selectedSupplier.equipment.length > 0 && (
                    <div className="space-y-1.5"><h4 className="text-[9px] font-black uppercase text-primary tracking-widest">साहित्य यादी (Material)</h4><div className="border border-muted-foreground/10 rounded-xl overflow-hidden"><table className="w-full text-[10px]"><thead><tr className="bg-muted/20 text-[8px] font-black uppercase border-b"><th className="p-2 text-left">साहित्य</th><th className="p-2 text-center">नग</th><th className="p-2 text-right">मालकी</th></tr></thead><tbody className="divide-y">{selectedSupplier.equipment.map(e => (<tr key={e.id} className="hover:bg-muted/5 transition-colors"><td className="p-2 font-black uppercase text-[9px]">{e.name}</td><td className="p-2 text-center font-black">{e.quantity}</td><td className="p-2 text-right"><Badge variant="outline" className={`text-[7px] font-black uppercase h-4 ${e.ownership === 'Self' ? 'border-amber-200 text-amber-600 bg-amber-50' : 'border-blue-200 text-blue-600 bg-blue-50'}`}>{e.ownership === 'Self' ? 'स्वतः' : 'डेअरी'}</Badge></td></tr>))}</tbody></table></div></div>
                  )}
                </div>
              </ScrollArea>
            </div>
          ) : (<div className="hidden lg:flex flex-col items-center gap-2 p-10 justify-center h-full"><User className="h-12 w-12 text-muted-foreground/10" /><h4 className="font-black text-muted-foreground/30 text-[10px] uppercase tracking-[0.3em]">सप्लायर निवडा</h4></div>)}
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white rounded-3xl border-none shadow-2xl">
          <DialogHeader className="p-3 bg-primary text-white sticky top-0 z-10">
            <DialogTitle className="text-sm font-black uppercase tracking-widest">{dialogMode === 'add' ? 'नवीन सप्लायर प्रोफाइल' : 'माहिती अद्ययावत करा'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[85vh] p-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1 tracking-widest">१) प्राथमिक माहिती</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="col-span-2 space-y-1"><Label className="text-[9px] uppercase font-black tracking-widest opacity-60">पूर्ण नाव</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black tracking-widest opacity-60">आयडी (ID)</Label><Input value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black tracking-widest opacity-60">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" /></div>
                  <div className="col-span-2 space-y-1"><Label className="text-[9px] uppercase font-black tracking-widest opacity-60">पत्ता</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black tracking-widest opacity-60">FSSAI क्र.</Label><Input value={formData.fssaiNumber} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black tracking-widest opacity-60">मुदत</Label><Input value={formData.fssaiExpiry} onChange={e => setFormData({...formData, fssaiExpiry: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" placeholder="DD/MM/YYYY" /></div>
                </div>

                <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1 mt-6 tracking-widest">२) दूध संकलन (Avg)</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="p-3 border rounded-xl bg-blue-50/20 space-y-2">
                    <p className="text-[9px] font-black text-blue-700 uppercase tracking-widest">गाय दूध (Cow)</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1"><Label className="text-[8px] uppercase">Qty (L)</Label><Input type="number" step="0.1" value={formData.cowQty} onChange={e => setFormData({...formData, cowQty: e.target.value})} className="h-8 text-[10px] text-center border-none bg-white rounded-lg" /></div>
                      <div className="space-y-1"><Label className="text-[8px] uppercase">Fat</Label><Input type="number" step="0.1" value={formData.cowFat} onChange={e => setFormData({...formData, cowFat: e.target.value})} className="h-8 text-[10px] text-center border-none bg-white rounded-lg" /></div>
                      <div className="space-y-1"><Label className="text-[8px] uppercase">SNF</Label><Input type="number" step="0.1" value={formData.cowSnf} onChange={e => setFormData({...formData, cowSnf: e.target.value})} className="h-8 text-[10px] text-center border-none bg-white rounded-lg" /></div>
                    </div>
                  </div>
                  <div className="p-3 border rounded-xl bg-amber-50/20 space-y-2">
                    <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">म्हेस दूध (Buf)</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1"><Label className="text-[8px] uppercase">Qty (L)</Label><Input type="number" step="0.1" value={formData.bufQty} onChange={e => setFormData({...formData, bufQty: e.target.value})} className="h-8 text-[10px] text-center border-none bg-white rounded-lg" /></div>
                      <div className="space-y-1"><Label className="text-[8px] uppercase">Fat</Label><Input type="number" step="0.1" value={formData.bufFat} onChange={e => setFormData({...formData, bufFat: e.target.value})} className="h-8 text-[10px] text-center border-none bg-white rounded-lg" /></div>
                      <div className="space-y-1"><Label className="text-[8px] uppercase">SNF</Label><Input type="number" step="0.1" value={formData.bufSnf} onChange={e => setFormData({...formData, bufSnf: e.target.value})} className="h-8 text-[10px] text-center border-none bg-white rounded-lg" /></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1 tracking-widest">३) तांत्रिक व इतर</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black tracking-widest opacity-60">काटा ब्रँड</Label><Input value={formData.scaleBrand} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black tracking-widest opacity-60">मशीन ब्रँड</Label><Input value={formData.fatMachineBrand} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black tracking-widest opacity-60">बर्फ लाद्या</Label><Input type="number" value={formData.iceBlocks} onChange={e => setFormData({...formData, iceBlocks: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black tracking-widest opacity-60">एकूण कॅन</Label><Input type="number" value={formData.milkCansCount} onChange={e => setFormData({...formData, milkCansCount: e.target.value})} className="h-9 text-[11px] rounded-lg bg-muted/20 border-none font-black" /></div>
                </div>
                <div className="grid grid-cols-1 gap-2 pt-2">
                  <div className="flex items-center space-x-2 bg-muted/10 p-2.5 rounded-xl border border-muted-foreground/5 shadow-sm">
                    <Checkbox id="comp-s" checked={formData.computerAvailable} onCheckedChange={(v) => setFormData({...formData, computerAvailable: !!v})} />
                    <Label htmlFor="comp-s" className="text-[10px] font-black uppercase cursor-pointer tracking-widest">कॉम्प्युटर आहे का?</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-muted/10 p-2.5 rounded-xl border border-muted-foreground/5 shadow-sm">
                    <Checkbox id="ups-s" checked={formData.upsInverterAvailable} onCheckedChange={(v) => setFormData({...formData, upsInverterAvailable: !!v})} />
                    <Label htmlFor="ups-s" className="text-[10px] font-black uppercase cursor-pointer tracking-widest">UPS / इनव्हर्टर</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-muted/10 p-2.5 rounded-xl border border-muted-foreground/5 shadow-sm">
                    <Checkbox id="solar-s" checked={formData.solarAvailable} onCheckedChange={(v) => setFormData({...formData, solarAvailable: !!v})} />
                    <Label htmlFor="solar-s" className="text-[10px] font-black uppercase cursor-pointer tracking-widest">सोलर उपलब्ध</Label>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between"><Label className="text-[9px] font-black uppercase text-primary tracking-widest">साहित्य रेकॉर्ड (Materials)</Label><Button type="button" variant="outline" size="sm" onClick={addEquipmentRow} className="h-6 text-[8px] font-black px-2 rounded-lg border-primary/20">जोडा</Button></div>
                  <div className="space-y-1.5">
                    {formData.equipment.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-1 items-center bg-muted/10 p-1.5 rounded-lg border border-muted-foreground/5">
                        <Input value={item.name} onChange={e => updateEquipmentRow(item.id, {name: e.target.value})} className="col-span-6 h-7 text-[10px] px-2 bg-white border-none rounded-md" placeholder="साहित्य नाव" />
                        <Input type="number" value={item.quantity} onChange={e => updateEquipmentRow(item.id, {quantity: Number(e.target.value)})} className="col-span-2 h-7 text-[10px] px-0 text-center bg-white border-none rounded-md" />
                        <Select value={item.ownership} onValueChange={v => updateEquipmentRow(item.id, {ownership: v as any})}>
                          <SelectTrigger className="col-span-3 h-7 text-[8px] px-1 bg-white border-none rounded-md"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="Self" className="text-[10px]">स्वतः</SelectItem><SelectItem value="Company" className="text-[10px]">डेअरी</SelectItem></SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" onClick={() => removeEquipmentRow(item.id)} className="col-span-1 h-6 w-6 text-destructive hover:bg-destructive/5"><X className="h-3.5 w-3.5" /></Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-dashed">
                  <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">भेळस तपासणी किट माहिती</Label>
                  <Input placeholder="..." value={formData.adulterationKitInfo} onChange={e => setFormData({...formData, adulterationKitInfo: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-black rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">गाव स्पर्धा (Competition)</Label>
                  <Input placeholder="उदा. अमूल / गोकुळ" value={formData.competition} onChange={e => setFormData({...formData, competition: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-black rounded-lg" />
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-3 border-t bg-muted/5 gap-2 flex justify-end">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-10 text-[10px] font-black uppercase tracking-widest border-primary/20 flex-1 sm:flex-none">रद्द</Button>
            <Button type="button" onClick={handleSaveSupplier} className="rounded-xl h-10 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 flex-1 sm:flex-none">जतन करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
