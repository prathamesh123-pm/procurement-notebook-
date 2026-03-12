
"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Supplier, EquipmentItem } from "@/lib/types"
import { 
  Plus, Search, MapPin, Milk, User, 
  Truck, Trash2, Edit, ChevronRight, ArrowLeft, X, Laptop, Zap, Sun
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"

export default function RouteDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const routeId = params.id as string
  const { toast } = useToast()
  const { user } = useUser()
  const db = useFirestore()

  const routesQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'routes')
  }, [db, user])

  const suppliersQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'suppliers')
  }, [db, user])

  const { data: allRoutes } = useCollection(routesQuery)
  const { data: allSuppliers, isLoading } = useCollection(suppliersQuery)

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
      fatMachineBrand: supplier.fatMachineBrand || "", milkCansCount: String(supplier.milkCansCount || 0),
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
      fatMachineBrand: formData.fatMachineBrand, milkCansCount: Number(formData.milkCansCount),
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

  const handleDeleteSupplier = (e: React.MouseEvent | null, id: string) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    if (!db || !id) return
    const confirmDelete = window.confirm("तुम्हाला खात्री आहे की हा पुरवठादार कायमचा हटवायचा आहे? (Are you sure you want to delete this supplier?)")
    if (!confirmDelete) return
    
    try {
      const docRef = doc(db, 'suppliers', id)
      deleteDocumentNonBlocking(docRef)
      if (selectedSupplier?.id === id) setSelectedSupplier(null)
      toast({ title: "यशस्वी", description: "पुरवठादार यशस्वीरित्या हटवण्यात आला." })
    } catch (err) {
      toast({ title: "त्रुटी", description: "पुरवठादार हटवताना अडचण आली.", variant: "destructive" })
    }
  }

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => (s.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()))
  }, [suppliers, searchQuery])

  if (!mounted || isLoading) return <div className="p-10 text-center italic text-muted-foreground">लोड होत आहे...</div>

  return (
    <div className="space-y-2 max-w-7xl mx-auto w-full pb-10 px-1">
      <div className="flex items-center justify-between border-b pb-2 px-1">
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => router.push('/routes')}><ArrowLeft className="h-4 w-4" /></Button>
          <div className="min-w-0"><h2 className="text-sm sm:text-lg font-black truncate">सप्लायर (Suppliers)</h2><p className="text-[9px] text-muted-foreground font-black uppercase truncate">RT: {route?.name || routeId}</p></div>
        </div>
        <Button type="button" onClick={openAddDialog} size="sm" className="h-8 font-black gap-1.5 rounded-lg text-[11px] px-3"><Plus className="h-3.5 w-3.5" /> नवीन</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        <Card className={`lg:col-span-4 border-none shadow-sm bg-white overflow-hidden flex flex-col ${selectedSupplier ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-2 border-b bg-muted/5"><div className="relative"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" /><input placeholder="शोधा..." className="w-full pl-7 h-8 text-[11px] bg-white border rounded-md" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div></div>
          <ScrollArea className="h-[650px]"><div className="divide-y">{filteredSuppliers.map(s => (<div key={s.id} onClick={() => setSelectedSupplier(s)} className={`p-2.5 cursor-pointer hover:bg-muted/50 flex justify-between items-center ${selectedSupplier?.id === s.id ? 'bg-primary/5 border-l-2 border-primary' : ''}`}><div className="min-w-0"><h4 className="font-black text-[11px] truncate">{s.name}</h4><p className="text-[9px] text-muted-foreground truncate">ID: {s.id?.slice(-6)} | {s.address}</p></div><div className="flex items-center gap-1"><Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/5" onClick={(e) => handleDeleteSupplier(e, s.id)}><Trash2 className="h-3 w-3" /></Button><ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-50" /></div></div>))}</div></ScrollArea>
        </Card>

        <Card className={`lg:col-span-8 border-none shadow-sm bg-white rounded-xl min-h-[450px] ${!selectedSupplier ? 'hidden lg:flex' : 'block'}`}>
          {selectedSupplier ? (
            <div className="flex flex-col h-full">
              <div className="p-3 border-b flex items-center justify-between bg-primary/5 sticky top-0 z-10"><Button type="button" variant="ghost" size="icon" className="lg:hidden" onClick={() => setSelectedSupplier(null)}><ArrowLeft className="h-4 w-4" /></Button><div className="flex-1 px-2 min-w-0"><h3 className="text-xs sm:text-sm font-black truncate">{selectedSupplier.name}</h3><p className="text-[9px] text-muted-foreground uppercase">ID: {selectedSupplier.id} | {selectedSupplier.collectionType}</p></div><div className="flex gap-1.5"><Button type="button" variant="outline" size="icon" className="h-7 w-7 text-primary hover:bg-primary/5" onClick={() => openEditDialog(selectedSupplier)}><Edit className="h-3 w-3" /></Button><Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/5" onClick={(e) => handleDeleteSupplier(e, selectedSupplier.id)}><Trash2 className="h-3 w-3" /></Button></div></div>
              <ScrollArea className="flex-1 h-[650px]">
                <div className="p-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2"><div className="bg-muted/20 p-2.5 rounded-lg border space-y-1.5"><h4 className="text-[9px] font-black uppercase text-primary">संपर्क</h4><p className="text-[10px] font-black">{selectedSupplier.mobile || "-"}</p><p className="text-[10px] truncate">{selectedSupplier.address || "-"}</p></div><div className="bg-muted/20 p-2.5 rounded-lg border space-y-1.5"><h4 className="text-[9px] font-black uppercase text-primary">परवाना</h4><p className="text-[10px] font-black">{selectedSupplier.fssaiNumber || "N/A"}</p><Badge className="text-[8px] h-4 px-1.5 font-black">{selectedSupplier.fssaiExpiry || "-"}</Badge></div></div>
                  <div className="grid grid-cols-3 gap-2">{[{icon: Laptop, label: 'कॉम्प्युटर', val: selectedSupplier.computerAvailable}, {icon: Zap, label: 'UPS/Inv', val: selectedSupplier.upsInverterAvailable}, {icon: Sun, label: 'सोलर', val: selectedSupplier.solarAvailable}].map((it, i) => (<div key={i} className={`p-2 rounded-lg border flex flex-col items-center gap-1 ${it.val ? 'bg-green-50 border-green-100' : 'bg-muted/20 opacity-50'}`}><it.icon className={`h-4 w-4 ${it.val ? 'text-green-600' : 'text-muted-foreground'}`} /><span className="text-[8px] font-black uppercase">{it.label}</span></div>))}</div>
                  <div className="space-y-1.5"><h4 className="text-[9px] font-black uppercase text-primary">दूध आकडेवारी</h4><div className="grid grid-cols-2 gap-2"><div className="p-2.5 bg-blue-50 border border-blue-100 rounded-lg text-center"><p className="text-[8px] font-black text-blue-600 uppercase">गाय</p><p className="text-sm font-black">{selectedSupplier.cowMilk?.quantity || 0}L</p></div><div className="p-2.5 bg-amber-50 border border-amber-100 rounded-lg text-center"><p className="text-[8px] font-black text-amber-600 uppercase">म्हेस</p><p className="text-sm font-black">{selectedSupplier.buffaloMilk?.quantity || 0}L</p></div></div></div>
                </div>
              </ScrollArea>
            </div>
          ) : (<div className="hidden lg:flex flex-col items-center gap-2 p-10"><User className="h-10 w-10 text-muted-foreground/20" /><h4 className="font-black text-muted-foreground text-[10px] uppercase tracking-widest">सप्लायर निवडा</h4></div>)}
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white rounded-2xl border-none shadow-2xl">
          <DialogHeader className="p-3 bg-primary text-white"><DialogTitle className="text-sm font-black uppercase tracking-tight">{dialogMode === 'add' ? 'नवीन सप्लायर' : 'माहिती बदला'}</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[85vh] p-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1">१) प्राथमिक माहिती</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="col-span-2 space-y-1"><Label className="text-[9px] uppercase font-black">नाव</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">आयडी</Label><Input value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none" /></div>
                  <div className="col-span-2 space-y-1"><Label className="text-[9px] uppercase font-black">पत्ता</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none" /></div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1">२) तांत्रिक व इतर</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">काटा ब्रँड</Label><Input value={formData.scaleBrand} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">मशीन ब्रँड</Label><Input value={formData.fatMachineBrand} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">बर्फ लाद्या</Label><Input type="number" value={formData.iceBlocks} onChange={e => setFormData({...formData, iceBlocks: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">एकूण कॅन</Label><Input type="number" value={formData.milkCansCount} onChange={e => setFormData({...formData, milkCansCount: e.target.value})} className="h-9 text-xs rounded-xl bg-muted/20 border-none" /></div>
                </div>
                <div className="grid grid-cols-1 gap-2 pt-2">
                  <div className="flex items-center space-x-2 bg-muted/10 p-2 rounded-xl border border-muted-foreground/5 shadow-sm">
                    <Checkbox id="comp-s" checked={formData.computerAvailable} onCheckedChange={(v) => setFormData({...formData, computerAvailable: !!v})} />
                    <Label htmlFor="comp-s" className="text-[10px] font-black uppercase cursor-pointer">कॉम्प्युटर आहे का?</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-muted/10 p-2 rounded-xl border border-muted-foreground/5 shadow-sm">
                    <Checkbox id="ups-s" checked={formData.upsInverterAvailable} onCheckedChange={(v) => setFormData({...formData, upsInverterAvailable: !!v})} />
                    <Label htmlFor="ups-s" className="text-[10px] font-black uppercase cursor-pointer">UPS / इनव्हर्टर</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-muted/10 p-2 rounded-xl border border-muted-foreground/5 shadow-sm">
                    <Checkbox id="solar-s" checked={formData.solarAvailable} onCheckedChange={(v) => setFormData({...formData, solarAvailable: !!v})} />
                    <Label htmlFor="solar-s" className="text-[10px] font-black uppercase cursor-pointer">सोलर उपलब्ध</Label>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-3 border-t bg-muted/5 gap-2 flex justify-end">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-9 text-xs font-black uppercase border-primary/20">रद्द</Button>
            <Button type="button" onClick={handleSaveSupplier} className="rounded-xl h-9 text-xs font-black uppercase shadow-lg shadow-primary/20">जतन करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
