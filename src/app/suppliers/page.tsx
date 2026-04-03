
"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Supplier, Route, EquipmentItem, SupplierType } from "@/lib/types"
import { Plus, Search, Filter, Phone, MapPin, Trash2, Milk, X, Laptop, Zap, Sun, ShieldAlert, History, Edit, CheckCircle2, Box, UserCheck, Wallet, User, ShieldCheck } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"

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
    equipment: [] as EquipmentItem[],
    operatorName: "",
    spaceOwnership: "Self" as 'Self' | 'Rented',
    hygieneGrade: "A",
    chemicalsStock: "",
    batteryCondition: ""
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
      equipment: [],
      operatorName: "",
      spaceOwnership: "Self",
      hygieneGrade: "A",
      chemicalsStock: "",
      batteryCondition: ""
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
      operatorName: formData.operatorName,
      village: formData.address,
      spaceOwnership: formData.spaceOwnership,
      hygieneGrade: formData.hygieneGrade,
      chemicalsStock: formData.chemicalsStock,
      batteryCondition: formData.batteryCondition,
      updatedAt: new Date().toISOString()
    }
    addDocumentNonBlocking(collection(db, 'suppliers'), newSupp)
    toast({ title: "यशस्वी", description: "सप्लायर प्रोफाइल जतन झाले." })
    setIsAdding(false); resetFormData();
  }

  const handleUpdateSupplier = () => {
    if (!selectedSupplier || !db) return
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
      operatorName: formData.operatorName,
      village: formData.address,
      spaceOwnership: formData.spaceOwnership,
      hygieneGrade: formData.hygieneGrade,
      chemicalsStock: formData.chemicalsStock,
      batteryCondition: formData.batteryCondition,
      updatedAt: new Date().toISOString() 
    }
    updateDocumentNonBlocking(doc(db, 'suppliers', selectedSupplier.id), updateData)
    setIsEditing(false); setSelectedSupplier(null);
    toast({ title: "यशस्वी", description: "माहिती अद्ययावत झाली." })
  }

  const deleteSupplier = (id: string) => {
    if (!db) return
    if (confirm("हटवायचे आहे का?")) {
      deleteDocumentNonBlocking(doc(db, 'suppliers', id))
      toast({ title: "यशस्वी", description: "सप्लायर हटवला." })
    }
  }

  const addEquipmentRow = () => {
    setFormData({ ...formData, equipment: [...formData.equipment, { id: crypto.randomUUID(), name: "", quantity: 1, ownership: 'Company' }] })
  }

  const updateEquipmentRow = (id: string, updates: Partial<EquipmentItem>) => {
    setFormData({ ...formData, equipment: formData.equipment.map(e => e.id === id ? { ...e, ...updates } : e) })
  }

  const removeEquipmentRow = (id: string) => {
    setFormData({ ...formData, equipment: formData.equipment.filter(e => e.id !== id) })
  }

  const filteredSuppliers = useMemo(() => {
    return (suppliers || []).filter(s => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = s.name?.toLowerCase().includes(q) || s.mobile?.includes(q) || s.supplierId?.toString().includes(q);
      const matchesRoute = routeFilter === 'all' || s.routeId === routeFilter;
      return matchesSearch && matchesRoute;
    })
  }, [suppliers, searchQuery, routeFilter])

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
      equipment: supp.equipment || [],
      operatorName: supp.operatorName || "",
      spaceOwnership: supp.spaceOwnership || "Self",
      hygieneGrade: supp.hygieneGrade || "A",
      chemicalsStock: supp.chemicalsStock || "",
      batteryCondition: supp.batteryCondition || ""
    })
    setIsEditing(true)
  }

  if (!mounted) return null

  return (
    <div className="space-y-4 max-w-[800px] mx-auto w-full pb-10 px-2 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4 text-center md:text-left">
        <div>
          <h2 className="text-xl font-black text-foreground uppercase tracking-tight">सप्लायर (SUPPLIERS)</h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Profiles & Inventory</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="gap-2 shadow-xl shadow-primary/20 h-10 px-6 rounded-xl font-black uppercase text-[11px] w-full md:w-auto">
          <Plus className="h-4 w-4" /> नवीन सप्लायर
        </Button>
      </div>

      <Card className="border shadow-2xl rounded-3xl overflow-hidden bg-white border-muted-foreground/10 p-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
            <Input placeholder="नाव किंवा कोडने शोधा..." className="pl-10 h-11 rounded-2xl bg-muted/20 border-none font-bold shadow-inner" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <Select value={routeFilter} onValueChange={setRouteFilter}>
            <SelectTrigger className="w-full sm:w-[180px] h-11 rounded-2xl bg-muted/20 border-none font-black text-[10px] uppercase shadow-inner">
              <Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="रूट निवडा" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">सर्व रूट</SelectItem>
              {routes?.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="bg-white rounded-3xl border border-muted-foreground/10 shadow-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-black text-[10px] uppercase px-6">सप्लायर तपशील</TableHead>
              <TableHead className="font-black text-[10px] uppercase text-center">दूध (L)</TableHead>
              <TableHead className="font-black text-[10px] uppercase text-right px-6">क्रिया</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.map((supp) => (
              <TableRow key={supp.id} className="cursor-pointer hover:bg-primary/5 transition-colors group" onClick={() => prepareEdit(supp)}>
                <TableCell className="py-3 px-6">
                  <div className="flex flex-col gap-1">
                    <span className="font-black text-[13px] uppercase">{supp.name}</span>
                    <span className="text-[9px] text-muted-foreground font-black uppercase flex items-center gap-2">
                      <Badge variant="outline" className="h-4 px-1 text-[7px] border-none bg-primary/5 text-primary">ID: {supp.supplierId}</Badge>
                      <Phone className="h-3 w-3" /> {supp.mobile}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center font-black text-[13px] text-primary">
                  {((supp.cowMilk?.quantity || 0) + (supp.buffaloMilk?.quantity || 0)).toFixed(1)}
                </TableCell>
                <TableCell className="text-right px-6">
                  <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-primary" onClick={(e) => { e.stopPropagation(); prepareEdit(supp); }}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={(e) => { e.stopPropagation(); deleteSupplier(supp.id); }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAdding || isEditing} onOpenChange={(open) => { if(!open) { setIsAdding(false); setIsEditing(false); resetFormData(); } }}>
        <DialogContent className="max-w-[600px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white">
          <DialogHeader className="p-4 bg-primary text-white sticky top-0 z-10">
            <DialogTitle className="text-base font-black uppercase tracking-widest">{isAdding ? 'नवीन सप्लायर' : 'माहिती अद्ययावत करा'}</DialogTitle>
            <DialogDescription className="text-[9px] text-white/70 uppercase">सविस्तर तपशील भरा.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] p-6">
            <div className="space-y-6 pb-10">
              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase text-primary border-b pb-1 flex items-center gap-2"><User className="h-4 w-4" /> १) प्राथमिक माहिती</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1.5"><Label className="text-[10px] font-black uppercase">सप्लायर प्रकार</Label>
                    <Select value={formData.supplierType} onValueChange={(v: any) => setFormData({...formData, supplierType: v})}>
                      <SelectTrigger className="h-10 text-[12px] bg-muted/20 border-none rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Gavali">गवळी</SelectItem><SelectItem value="Gotha">गोठा</SelectItem><SelectItem value="Center">उत्पादक केंद्र</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-1.5"><Label className="text-[10px] font-black uppercase">नाव *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">आयडी (ID) *</Label><Input value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">ऑपरेटर नाव</Label><Input value={formData.operatorName} onChange={e => setFormData({...formData, operatorName: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">पत्ता</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase text-primary border-b pb-1 flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> २) परवाना व तांत्रिक</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">FSSAI क्र.</Label><Input value={formData.fssaiNumber} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">मुदत तारीख</Label><Input type="date" value={formData.fssaiExpiry} onChange={e => setFormData({...formData, fssaiExpiry: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">काटा ब्रँड</Label><Input value={formData.scaleBrand} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">मशीन ब्रँड</Label><Input value={formData.fatMachineBrand} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase text-primary border-b pb-1 flex items-center gap-2"><Wallet className="h-4 w-4" /> ३) व्यावसायिक व दूध तपशील</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">पेमेंट सायकल</Label><Input value={formData.paymentCycle} onChange={e => setFormData({...formData, paymentCycle: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none rounded-xl shadow-inner" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">जागा</Label>
                    <Select value={formData.spaceOwnership} onValueChange={(v: any) => setFormData({...formData, spaceOwnership: v})}>
                      <SelectTrigger className="h-10 text-[12px] bg-muted/20 border-none rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Self">स्वतःची</SelectItem><SelectItem value="Rented">भाड्याची</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">स्वच्छता ग्रेड</Label><Input value={formData.hygieneGrade} onChange={e => setFormData({...formData, hygieneGrade: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none font-bold rounded-xl shadow-inner" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">बर्फ लाद्या</Label><Input type="number" value={formData.iceBlocks} onChange={e => setFormData({...formData, iceBlocks: e.target.value})} className="h-10 text-[12px] bg-muted/20 border-none rounded-xl shadow-inner" /></div>
                </div>
                <div className="grid grid-cols-3 gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div className="col-span-3 text-[10px] font-black uppercase text-blue-600 mb-1">गाय (Qty/F/S)</div>
                  <Input type="number" value={formData.cowQty} onChange={e => setFormData({...formData, cowQty: e.target.value})} className="h-8 text-[11px] bg-white border-none font-bold" placeholder="L" />
                  <Input type="number" value={formData.cowFat} onChange={e => setFormData({...formData, cowFat: e.target.value})} className="h-8 text-[11px] bg-white border-none font-bold" placeholder="F" />
                  <Input type="number" value={formData.cowSnf} onChange={e => setFormData({...formData, cowSnf: e.target.value})} className="h-8 text-[11px] bg-white border-none font-bold" placeholder="S" />
                </div>
                <div className="grid grid-cols-3 gap-2 p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                  <div className="col-span-3 text-[10px] font-black uppercase text-amber-600 mb-1">म्हेस (Qty/F/S)</div>
                  <Input type="number" value={formData.bufQty} onChange={e => setFormData({...formData, bufQty: e.target.value})} className="h-8 text-[11px] bg-white border-none font-bold" placeholder="L" />
                  <Input type="number" value={formData.bufFat} onChange={e => setFormData({...formData, bufFat: e.target.value})} className="h-8 text-[11px] bg-white border-none font-bold" placeholder="F" />
                  <Input type="number" value={formData.bufSnf} onChange={e => setFormData({...formData, bufSnf: e.target.value})} className="h-8 text-[11px] bg-white border-none font-bold" placeholder="S" />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase text-primary border-b pb-1 flex items-center gap-2"><Box className="h-4 w-4" /> ४) इन्व्हेंटरी</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center space-x-2 bg-muted/10 p-2 rounded-lg cursor-pointer" onClick={() => setFormData({...formData, computerAvailable: !formData.computerAvailable})}><Checkbox checked={formData.computerAvailable} /><Label className="text-[9px] font-black uppercase cursor-pointer">POP</Label></div>
                  <div className="flex items-center space-x-2 bg-muted/10 p-2 rounded-lg cursor-pointer" onClick={() => setFormData({...formData, upsInverterAvailable: !formData.upsInverterAvailable})}><Checkbox checked={formData.upsInverterAvailable} /><Label className="text-[9px] font-black uppercase cursor-pointer">UPS</Label></div>
                  <div className="flex items-center space-x-2 bg-muted/10 p-2 rounded-lg cursor-pointer" onClick={() => setFormData({...formData, solarAvailable: !formData.solarAvailable})}><Checkbox checked={formData.solarAvailable} /><Label className="text-[9px] font-black uppercase cursor-pointer">सोलर</Label></div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase">साहित्य यादी</span><Button variant="outline" size="sm" onClick={addEquipmentRow} className="h-7 text-[9px] font-black px-3 rounded-lg">जोडा</Button></div>
                  {formData.equipment.map(item => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 bg-muted/10 p-2 rounded-xl">
                      <div className="col-span-6"><Input value={item.name} onChange={e => updateEquipmentRow(item.id, {name: e.target.value})} className="h-8 text-[11px] border-none rounded-lg font-bold" placeholder="साहित्य" /></div>
                      <div className="col-span-2"><Input type="number" value={item.quantity} onChange={e => updateEquipmentRow(item.id, {quantity: Number(e.target.value)})} className="h-8 text-[11px] text-center border-none rounded-lg font-black" /></div>
                      <div className="col-span-3">
                        <Select value={item.ownership} onValueChange={v => updateEquipmentRow(item.id, {ownership: v as any})}>
                          <SelectTrigger className="h-8 text-[9px] bg-white border-none rounded-lg"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="Self">स्वतः</SelectItem><SelectItem value="Company">डेअरी</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1"><Button variant="ghost" size="icon" onClick={() => removeEquipmentRow(item.id)} className="h-7 w-7 text-rose-400"><X className="h-4 w-4" /></Button></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase">विशेष शेरा</Label><Textarea value={formData.additionalInfo} onChange={e => setFormData({...formData, additionalInfo: e.target.value})} className="h-20 text-[12px] bg-muted/20 border-none rounded-xl p-4 shadow-inner" /></div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-4 border-t bg-muted/5">
            <Button onClick={isAdding ? handleAddSupplier : handleUpdateSupplier} className="w-full font-black uppercase text-[11px] h-12 rounded-2xl shadow-xl shadow-primary/20 tracking-widest"><CheckCircle2 className="h-5 w-5 mr-2" /> माहिती जतन करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function SuppliersPage() {
  return <Suspense fallback={<div className="p-10 text-center font-black uppercase text-[10px] opacity-50">लोड होत आहे...</div>}><SuppliersContent /></Suspense>
}
