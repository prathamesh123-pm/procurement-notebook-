
"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Supplier, Route, EquipmentItem, SupplierType } from "@/lib/types"
import { Plus, Search, Filter, Phone, MapPin, Trash2, Milk, X, Laptop, Zap, Sun, ShieldAlert, History, Edit, CheckCircle2, Box, UserCheck } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"

function SuppliersContent() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const initialRouteFilter = searchParams.get('route') || 'all'

  const routesQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'routes')
  }, [db, user])

  const suppliersQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, 'suppliers')
  }, [db, user])

  const { data: routes } = useCollection<Route>(routesQuery)
  const { data: suppliers } = useCollection<Supplier>(suppliersQuery)

  const [searchQuery, setSearchQuery] = useState("")
  const [routeFilter, setRouteFilter] = useState(initialRouteFilter)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [mounted, setMounted] = useState(false)

  const [formData, setFormData] = useState({
    supplierId: "", name: "", address: "", mobile: "", routeId: "", 
    supplierType: "Gavali" as SupplierType, competition: "", additionalInfo: "",
    iceBlocks: "0", scaleBrand: "", fatMachineBrand: "", cattleFeedBrand: "", 
    fssaiNumber: "", fssaiExpiry: "", milkCansCount: "0", 
    computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
    adulterationKitInfo: "",
    cowQty: "0", cowFat: "0", cowSnf: "0",
    bufQty: "0", bufFat: "0", bufSnf: "0",
    equipment: [] as EquipmentItem[]
  })

  useEffect(() => setMounted(true), [])

  const resetFormData = () => {
    setFormData({ 
      supplierId: "", name: "", address: "", mobile: "", routeId: "", 
      supplierType: "Gavali", competition: "", additionalInfo: "",
      iceBlocks: "0", scaleBrand: "", fatMachineBrand: "", cattleFeedBrand: "", 
      fssaiNumber: "", fssaiExpiry: "", milkCansCount: "0", 
      computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
      adulterationKitInfo: "",
      cowQty: "0", cowFat: "0", cowSnf: "0",
      bufQty: "0", bufFat: "0", bufSnf: "0",
      equipment: []
    })
  }

  const handleAddSupplier = () => {
    if (!formData.name || !formData.supplierId || !db || !user) {
      toast({ title: "त्रुटी", description: "नाव आणि आयडी आवश्यक आहे.", variant: "destructive" })
      return
    }
    const newSupp = {
      supplierId: formData.supplierId, name: formData.name, address: formData.address, 
      mobile: formData.mobile, routeId: formData.routeId, supplierType: formData.supplierType,
      competition: formData.competition, additionalInfo: formData.additionalInfo,
      additionalNotes: formData.additionalInfo,
      iceBlocks: Number(formData.iceBlocks), scaleBrand: formData.scaleBrand,
      fatMachineBrand: formData.fatMachineBrand, cattleFeedBrand: formData.cattleFeedBrand,
      fssaiNumber: formData.fssaiNumber, fssaiExpiry: formData.fssaiExpiry,
      milkCansCount: Number(formData.milkCansCount), computerAvailable: formData.computerAvailable,
      upsInverterAvailable: formData.upsInverterAvailable, solarAvailable: formData.solarAvailable,
      adulterationKitInfo: formData.adulterationKitInfo,
      cowMilk: { quantity: Number(formData.cowQty), fat: Number(formData.cowFat), snf: Number(formData.cowSnf) },
      buffaloMilk: { quantity: Number(formData.bufQty), fat: Number(formData.bufFat), snf: Number(formData.bufSnf) },
      equipment: formData.equipment,
      operatorName: formData.supplierType === 'Center' ? formData.name : undefined,
      village: formData.address,
      updatedAt: new Date().toISOString()
    }
    const colRef = collection(db, 'suppliers')
    addDocumentNonBlocking(colRef, newSupp)
    toast({ title: "यशस्वी", description: "सप्लायर प्रोफाइल जतन झाले." })

    setIsAdding(false)
    resetFormData()
  }

  const handleUpdateSupplier = () => {
    if (!selectedSupplier || !db) return
    const docRef = doc(db, 'suppliers', selectedSupplier.id)
    
    const updateData = { 
      supplierId: formData.supplierId, name: formData.name, address: formData.address, 
      mobile: formData.mobile, routeId: formData.routeId, supplierType: formData.supplierType,
      competition: formData.competition, additionalInfo: formData.additionalInfo,
      additionalNotes: formData.additionalInfo,
      iceBlocks: Number(formData.iceBlocks), scaleBrand: formData.scaleBrand,
      fatMachineBrand: formData.fatMachineBrand, cattleFeedBrand: formData.cattleFeedBrand,
      fssaiNumber: formData.fssaiNumber, fssaiExpiry: formData.fssaiExpiry,
      milkCansCount: Number(formData.milkCansCount), computerAvailable: formData.computerAvailable,
      upsInverterAvailable: formData.upsInverterAvailable, solarAvailable: formData.solarAvailable,
      adulterationKitInfo: formData.adulterationKitInfo,
      cowMilk: { quantity: Number(formData.cowQty), fat: Number(formData.cowFat), snf: Number(formData.cowSnf) },
      buffaloMilk: { quantity: Number(formData.bufQty), fat: Number(formData.bufFat), snf: Number(formData.bufSnf) },
      equipment: formData.equipment,
      operatorName: formData.supplierType === 'Center' ? formData.name : undefined,
      village: formData.address,
      updatedAt: new Date().toISOString() 
    }
    updateDocumentNonBlocking(docRef, updateData)
    setIsEditing(false)
    setSelectedSupplier(null)
    toast({ title: "यशस्वी", description: "माहिती अद्ययावत झाली." })
  }

  const deleteSupplier = (id: string) => {
    if (!db) return
    if (confirm("तुम्हाला खात्री आहे की हा सप्लायर हटवायचा आहे?")) {
      const docRef = doc(db, 'suppliers', id)
      deleteDocumentNonBlocking(docRef)
      toast({ title: "यशस्वी", description: "सप्लायर हटवला." })
    }
  }

  const addEquipmentRow = () => {
    const newItem: EquipmentItem = { id: crypto.randomUUID(), name: "", quantity: 1, ownership: 'Self' }
    setFormData({ ...formData, equipment: [...(formData.equipment || []), newItem] })
  }

  const removeEquipmentRow = (id: string) => {
    setFormData({ ...formData, equipment: (formData.equipment || []).filter(e => e.id !== id) })
  }

  const updateEquipmentRow = (id: string, updates: Partial<EquipmentItem>) => {
    setFormData({ ...formData, equipment: (formData.equipment || []).map(e => e.id === id ? { ...e, ...updates } : e) })
  }

  const filteredSuppliers = useMemo(() => {
    return (suppliers || []).filter(s => {
      const name = s.name?.toLowerCase() || ""
      const mobile = s.mobile || ""
      const sid = s.supplierId?.toString().toLowerCase() || ""
      const q = searchQuery.toLowerCase()
      const matchesSearch = name.includes(q) || mobile.includes(q) || sid.includes(q)
      const matchesRoute = routeFilter === 'all' || s.routeId === routeFilter
      return matchesSearch && matchesRoute
    })
  }, [suppliers, searchQuery, routeFilter])

  const totalMilk = (s: Supplier) => (s.cowMilk?.quantity || 0) + (s.buffaloMilk?.quantity || 0)

  const prepareEdit = (supp: Supplier) => {
    setSelectedSupplier(supp)
    setFormData({
      supplierId: supp.supplierId || "", name: supp.name || "", address: supp.address || "",
      mobile: supp.mobile || "", routeId: supp.routeId || "", supplierType: supp.supplierType || "Gavali",
      competition: supp.competition || "", additionalInfo: supp.additionalInfo || supp.additionalNotes || "",
      iceBlocks: String(supp.iceBlocks || 0), scaleBrand: supp.scaleBrand || "",
      fatMachineBrand: supp.fatMachineBrand || "", cattleFeedBrand: supp.cattleFeedBrand || "",
      fssaiNumber: supp.fssaiNumber || "", fssaiExpiry: supp.fssaiExpiry || "",
      milkCansCount: String(supp.milkCansCount || 0), computerAvailable: supp.computerAvailable || false,
      upsInverterAvailable: supp.upsInverterAvailable || false, solarAvailable: supp.solarAvailable || false,
      adulterationKitInfo: supp.adulterationKitInfo || "",
      cowQty: String(supp.cowMilk?.quantity || 0), cowFat: String(supp.cowMilk?.fat || 0), cowSnf: String(supp.cowMilk?.snf || 0),
      bufQty: String(supp.buffaloMilk?.quantity || 0), bufFat: String(supp.buffaloMilk?.fat || 0), bufSnf: String(supp.buffaloMilk?.snf || 0),
      equipment: supp.equipment || []
    })
    setIsEditing(true)
  }

  if (!mounted) return <div className="p-10 text-center italic opacity-50">लोड होत आहे...</div>

  return (
    <div className="space-y-4 max-w-[800px] mx-auto w-full pb-10 px-2 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4 text-center md:text-left">
        <div>
          <h2 className="text-xl font-black text-foreground uppercase tracking-tight">सप्लायर (SUPPLIERS)</h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Profiles & Inventory</p>
        </div>
        <Dialog open={isAdding} onOpenChange={(open) => { setIsAdding(open); if (!open) resetFormData(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-xl shadow-primary/20 h-10 px-6 rounded-xl font-black uppercase text-[11px] w-full md:w-auto">
              <Plus className="h-4 w-4" /> नवीन सप्लायर
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[550px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white">
            <DialogHeader className="p-4 bg-primary text-white sticky top-0 z-10">
              <DialogTitle className="text-base font-black uppercase tracking-widest">नवीन सप्लायर प्रोफाइल</DialogTitle>
              <DialogDescription className="text-[9px] text-white/70 uppercase">संपर्क, तांत्रिक आणि साहित्य माहिती भरा.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[80vh] p-6">
              <div className="space-y-6 pb-10">
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase text-primary border-b pb-1 tracking-widest flex items-center gap-2">
                    <Phone className="h-4 w-4" /> १) प्राथमिक माहिती
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5 col-span-2">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground opacity-60">सप्लायर प्रकार (Type)</Label>
                      <Select value={formData.supplierType} onValueChange={(val: SupplierType) => setFormData({...formData, supplierType: val})}>
                        <SelectTrigger className="h-10 text-[12px] bg-muted/20 border-none font-black rounded-xl p-3 shadow-inner">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Gavali" className="text-[12px] font-black">गवळी (Gavali)</SelectItem>
                          <SelectItem value="Gotha" className="text-[12px] font-black">गोठा (Gotha)</SelectItem>
                          <SelectItem value="Center" className="text-[12px] font-black">उत्पादक केंद्र (Center)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5 col-span-2"><Label className="text-[10px] font-black uppercase text-muted-foreground opacity-60">नाव *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl p-3 shadow-inner" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground opacity-60">आयडी (ID) *</Label><Input value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl p-3 shadow-inner" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground opacity-60">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl p-3 shadow-inner" /></div>
                    <div className="space-y-1.5 col-span-2">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground opacity-60">रूट</Label>
                      <Select value={formData.routeId} onValueChange={val => setFormData({...formData, routeId: val})}>
                        <SelectTrigger className="h-10 text-[12px] bg-muted/20 border-none rounded-xl font-bold shadow-inner"><SelectValue placeholder="रूट निवडा" /></SelectTrigger>
                        <SelectContent>{(routes || []).map(r => <SelectItem key={r.id} value={r.id} className="text-[12px] font-black">{r.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground opacity-60">पत्ता</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl p-3 shadow-inner" /></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase text-primary border-b pb-1 tracking-widest flex items-center gap-2">
                    <Laptop className="h-4 w-4" /> २) तांत्रिक व दूध संकलन
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground opacity-60">काटा ब्रँड</Label><Input value={formData.scaleBrand} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl p-3 shadow-inner" /></div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-muted-foreground opacity-60">मशीन ब्रँड</Label><Input value={formData.fatMachineBrand} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl p-3 shadow-inner" /></div>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 mt-1">
                    <div className="flex items-center space-x-2.5 bg-muted/10 p-3 rounded-xl border border-muted-foreground/5 shadow-sm cursor-pointer hover:bg-muted/20 transition-all" onClick={() => setFormData({...formData, computerAvailable: !formData.computerAvailable})}>
                      <Checkbox checked={formData.computerAvailable} />
                      <Label className="text-[11px] font-black uppercase cursor-pointer tracking-wider">POP सिस्टम आहे का?</Label>
                    </div>
                    <div className="flex items-center space-x-2.5 bg-muted/10 p-3 rounded-xl border border-muted-foreground/5 shadow-sm cursor-pointer hover:bg-muted/20 transition-all" onClick={() => setFormData({...formData, upsInverterAvailable: !formData.upsInverterAvailable})}>
                      <Checkbox checked={formData.upsInverterAvailable} />
                      <Label className="text-[11px] font-black uppercase cursor-pointer tracking-wider">UPS / इनव्हर्टर आहे का?</Label>
                    </div>
                    <div className="flex items-center space-x-2.5 bg-muted/10 p-3 rounded-xl border border-muted-foreground/5 shadow-sm cursor-pointer hover:bg-muted/20 transition-all" onClick={() => setFormData({...formData, solarAvailable: !formData.solarAvailable})}>
                      <Checkbox checked={formData.solarAvailable} />
                      <Label className="text-[11px] font-black uppercase cursor-pointer tracking-wider">सोलर उपलब्ध आहे का?</Label>
                    </div>
                  </div>

                  <div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between border-b pb-1">
                      <h4 className="text-[11px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                        <Box className="h-4 w-4" /> ३) साहित्य यादी (INVENTORY)
                      </h4>
                      <Button variant="outline" size="sm" onClick={addEquipmentRow} className="h-7 text-[9px] font-black rounded-xl px-3 border-primary/20 bg-primary/5 text-primary">जोडा</Button>
                    </div>
                    <div className="space-y-2">
                      {(formData.equipment || []).map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-muted/10 p-2 rounded-xl border border-muted-foreground/5 shadow-inner">
                          <div className="col-span-6"><Input value={item.name} onChange={e => updateEquipmentRow(item.id, {name: e.target.value})} className="h-8 text-[11px] px-3 bg-white border-none rounded-lg font-bold" placeholder="साहित्य" /></div>
                          <div className="col-span-2"><Input type="number" value={item.quantity} onChange={e => updateEquipmentRow(item.id, {quantity: Number(e.target.value)})} className="h-8 text-[11px] px-0 text-center bg-white border-none rounded-lg font-black" /></div>
                          <div className="col-span-3">
                            <Select value={item.ownership} onValueChange={v => updateEquipmentRow(item.id, {ownership: v as any})}>
                              <SelectTrigger className="h-8 text-[10px] px-2 bg-white border-none rounded-lg font-black"><SelectValue /></SelectTrigger>
                              <SelectContent><SelectItem value="Self" className="text-[11px] font-black">स्वतः</SelectItem><SelectItem value="Company" className="text-[11px] font-black">डेअरी</SelectItem></SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-1 flex justify-end"><Button variant="ghost" size="icon" onClick={() => removeEquipmentRow(item.id)} className="h-7 w-7 text-destructive rounded-lg"><X className="h-4 w-4" /></Button></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="p-4 border-t bg-muted/5">
              <Button onClick={handleAddSupplier} className="w-full font-black uppercase text-[11px] h-12 rounded-2xl shadow-2xl shadow-primary/20 tracking-[0.2em] transition-all active:scale-95">
                <CheckCircle2 className="h-5 w-5 mr-2" /> प्रोफाइल जतन करा
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border shadow-2xl rounded-3xl overflow-hidden bg-white border-muted-foreground/10 max-w-[650px] mx-auto w-full">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
              <Input 
                placeholder="नाव किंवा मोबाईलने शोधा..." 
                className="pl-10 h-11 rounded-2xl bg-muted/20 border-none font-bold text-sm shadow-inner focus-visible:ring-2 focus-visible:ring-primary" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={routeFilter} onValueChange={setRouteFilter}>
                <SelectTrigger className="w-full sm:w-[180px] h-11 rounded-2xl bg-muted/20 border-none font-black text-[10px] uppercase tracking-widest shadow-inner">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="रूट निवडा" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-[11px] font-black uppercase">सर्व रूट</SelectItem>
                  {(routes || []).map(r => <SelectItem key={r.id} value={r.id} className="text-[11px] font-black uppercase">{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-white rounded-3xl border border-muted-foreground/10 shadow-2xl overflow-hidden max-w-[700px] mx-auto w-full">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b">
              <TableHead className="font-black text-[10px] uppercase text-muted-foreground tracking-widest h-10 px-6">सप्लायर तपशील</TableHead>
              <TableHead className="font-black text-[10px] uppercase text-muted-foreground tracking-widest h-10 text-center">दूध (L)</TableHead>
              <TableHead className="font-black text-[10px] uppercase text-muted-foreground tracking-widest h-10 text-right px-6">क्रिया</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((supp) => (
                <TableRow key={supp.id} className="cursor-pointer hover:bg-primary/5 transition-colors group border-b last:border-0" onClick={() => prepareEdit(supp)}>
                  <TableCell className="py-3 px-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[13px] text-slate-900 truncate max-w-[180px] uppercase group-hover:text-primary transition-colors">{supp.name}</span>
                        {supp.supplierType === 'Center' && <Badge className="bg-emerald-500 h-4 px-1.5 text-[7px] font-black uppercase border-none">Center</Badge>}
                      </div>
                      <span className="text-[9px] text-muted-foreground font-black uppercase flex items-center gap-2">
                        <Badge variant="outline" className="h-4 px-1.5 text-[7px] font-black bg-primary/5 text-primary border-none">ID: {supp.supplierId || supp.id?.slice(-4)}</Badge>
                        <Phone className="h-3 w-3" /> {supp.mobile}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-black text-[13px] text-primary">{totalMilk(supp).toFixed(1)}</TableCell>
                  <TableCell className="text-right px-6">
                    <div className="flex justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-all">
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-primary hover:bg-primary/10 rounded-xl" onClick={(e) => { e.stopPropagation(); prepareEdit(supp); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={(e) => {
                        e.stopPropagation()
                        deleteSupplier(supp.id)
                      }} className="h-9 w-9 text-destructive hover:bg-destructive/10 rounded-xl">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-40 text-center text-muted-foreground font-black uppercase text-[11px] opacity-30 tracking-[0.3em] italic">
                  सप्लायर सापडले नाहीत.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-[550px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white">
          <DialogHeader className="p-4 bg-primary text-white sticky top-0 z-10">
            <DialogTitle className="text-base font-black uppercase tracking-widest">माहिती बदला: {selectedSupplier?.name}</DialogTitle>
            <DialogDescription className="text-[9px] text-white/70 uppercase">सप्लायरची माहिती अद्ययावत करा.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] p-6">
            <div className="space-y-6 pb-10">
              <div className="grid grid-cols-1 gap-4">
                 <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground opacity-60">सप्लायर प्रकार</Label>
                    <Select value={formData.supplierType} onValueChange={(val: SupplierType) => setFormData({...formData, supplierType: val})}>
                      <SelectTrigger className="h-10 text-[12px] bg-muted/20 border-none font-black rounded-xl shadow-inner">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gavali" className="text-[12px] font-black">गवळी</SelectItem>
                        <SelectItem value="Gotha" className="text-[12px] font-black">गोठा</SelectItem>
                        <SelectItem value="Center" className="text-[12px] font-black">उत्पादक केंद्र</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>

                 <div className="flex items-start gap-3 p-4 rounded-2xl bg-muted/20 border border-muted-foreground/5 shadow-inner">
                    <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <Label className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">पत्ता / गाव</Label>
                      <p className="text-[11px] font-bold uppercase truncate">{formData.address}</p>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-2.5">
                    <div className="flex items-center space-x-2.5 bg-muted/10 p-3 rounded-xl border border-muted-foreground/5 cursor-pointer hover:bg-muted/20 transition-all" onClick={() => setFormData({...formData, computerAvailable: !formData.computerAvailable})}>
                      <Checkbox checked={formData.computerAvailable} />
                      <Label className="text-[11px] font-black uppercase cursor-pointer">POP सिस्टम उपलब्ध</Label>
                    </div>
                    <div className="flex items-center space-x-2.5 bg-muted/10 p-3 rounded-xl border border-muted-foreground/5 cursor-pointer hover:bg-muted/20 transition-all" onClick={() => setFormData({...formData, upsInverterAvailable: !formData.upsInverterAvailable})}>
                      <Checkbox checked={formData.upsInverterAvailable} />
                      <Label className="text-[11px] font-black uppercase cursor-pointer">UPS / इनव्हर्टर</Label>
                    </div>
                    <div className="flex items-center space-x-2.5 bg-muted/10 p-3 rounded-xl border border-muted-foreground/5 cursor-pointer hover:bg-muted/20 transition-all" onClick={() => setFormData({...formData, solarAvailable: !formData.solarAvailable})}>
                      <Checkbox checked={formData.solarAvailable} />
                      <Label className="text-[11px] font-black uppercase cursor-pointer">सोलर ऊर्जा</Label>
                    </div>
                 </div>

                 <div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between border-b pb-1">
                      <h4 className="text-[11px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                        <Box className="h-4 w-4" /> साहित्य यादी (INVENTORY)
                      </h4>
                      <Button variant="outline" size="sm" onClick={addEquipmentRow} className="h-7 text-[9px] font-black rounded-xl px-3">साहित्य जोडा</Button>
                    </div>
                    <div className="space-y-2">
                      {(formData.equipment || []).map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-muted/10 p-2 rounded-xl shadow-inner">
                          <div className="col-span-6"><Input value={item.name} onChange={e => updateEquipmentRow(item.id, {name: e.target.value})} className="h-8 text-[11px] px-3 bg-white border-none rounded-lg font-bold" /></div>
                          <div className="col-span-2"><Input type="number" value={item.quantity} onChange={e => updateEquipmentRow(item.id, {quantity: Number(e.target.value)})} className="h-8 text-[11px] px-0 text-center bg-white border-none rounded-lg" /></div>
                          <div className="col-span-3">
                            <Select value={item.ownership} onValueChange={v => updateEquipmentRow(item.id, {ownership: v as any})}>
                              <SelectTrigger className="h-8 text-[10px] px-2 bg-white border-none rounded-lg"><SelectValue /></SelectTrigger>
                              <SelectContent><SelectItem value="Self" className="text-[11px] font-black">स्वतः</SelectItem><SelectItem value="Company" className="text-[11px] font-black">डेअरी</SelectItem></SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-1 flex justify-end"><Button variant="ghost" size="icon" onClick={() => removeEquipmentRow(item.id)} className="h-7 w-7 text-destructive"><X className="h-4 w-4" /></Button></div>
                        </div>
                      ))}
                    </div>
                  </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-4 bg-muted/5 flex gap-3">
            <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1 h-12 rounded-2xl font-black uppercase text-[11px] tracking-widest border-primary/20 shadow-sm">रद्द</Button>
            <Button onClick={handleUpdateSupplier} className="flex-1 h-12 rounded-2xl shadow-2xl shadow-primary/20 font-black uppercase text-[11px] tracking-widest">
              <CheckCircle2 className="h-5 w-5 mr-2" /> बदल जतन करा
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function SuppliersPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center italic opacity-50 font-black uppercase text-[10px]">लोड होत आहे...</div>}>
      <SuppliersContent />
    </Suspense>
  )
}
