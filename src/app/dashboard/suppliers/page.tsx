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

  // Form state - using supplierId for manual ID to avoid conflict with Firestore id
  const [formData, setFormData] = useState<Partial<Supplier>>({
    supplierId: "", name: "", address: "", mobile: "", routeId: "", supplierType: "Gavali", competition: "", additionalInfo: "",
    iceBlocks: 0, scaleBrand: "", fatMachineBrand: "", cattleFeedBrand: "", fssaiNumber: "", fssaiExpiry: "",
    milkCansCount: 0, computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
    adulterationKitInfo: "",
    cowMilk: { quantity: 0, fat: 0, snf: 0 },
    buffaloMilk: { quantity: 0, fat: 0, snf: 0 },
    equipment: []
  })

  useEffect(() => setMounted(true), [])

  const resetFormData = () => {
    setFormData({ 
      supplierId: "", name: "", address: "", mobile: "", routeId: "", supplierType: "Gavali", competition: "", additionalInfo: "",
      iceBlocks: 0, scaleBrand: "", fatMachineBrand: "", cattleFeedBrand: "", fssaiNumber: "", fssaiExpiry: "",
      milkCansCount: 0, computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
      adulterationKitInfo: "",
      cowMilk: { quantity: 0, fat: 0, snf: 0 },
      buffaloMilk: { quantity: 0, fat: 0, snf: 0 },
      equipment: []
    })
  }

  const handleAddSupplier = () => {
    if (!formData.name || !formData.supplierId || !db || !user) return
    const newSupp = {
      ...formData,
      updatedAt: new Date().toISOString()
    }
    const colRef = collection(db, 'suppliers')
    addDocumentNonBlocking(colRef, newSupp)

    // logic for Utpadak Center: Automatically add to Centers collection
    if (formData.supplierType === 'Center') {
      const centerColRef = collection(db, 'users', user.uid, 'centers')
      const centerData = {
        name: formData.name,
        code: formData.supplierId,
        village: formData.address,
        mobile: formData.mobile,
        operatorName: formData.name,
        routeId: formData.routeId,
        isLinkedToSupplier: true,
        supplierId: formData.supplierId,
        cowMilk: formData.cowMilk,
        buffaloMilk: formData.buffaloMilk,
        material: {
          weighingScaleBrand: formData.scaleBrand,
          fatMachineBrand: formData.fatMachineBrand,
          milkCansCount: formData.milkCansCount,
          computerAvailable: formData.computerAvailable,
          upsInverterAvailable: formData.upsInverterAvailable,
          solarAvailable: formData.solarAvailable,
          equipment: formData.equipment
        },
        updatedAt: new Date().toISOString()
      }
      addDocumentNonBlocking(centerColRef, centerData)
      toast({ title: "यशस्वी", description: "सप्लायर आणि केंद्र दोन्ही जतन झाले." })
    } else {
      toast({ title: "यशस्वी", description: "सप्लायर प्रोफाइल जतन झाले." })
    }

    setIsAdding(false)
    resetFormData()
  }

  const handleUpdateSupplier = () => {
    if (!selectedSupplier || !db) return
    const docRef = doc(db, 'suppliers', selectedSupplier.id)
    updateDocumentNonBlocking(docRef, { ...formData, updatedAt: new Date().toISOString() })
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
      const matchesSearch = s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.mobile?.includes(searchQuery) ||
                          s.supplierId?.includes(searchQuery)
      const matchesRoute = routeFilter === 'all' || s.routeId === routeFilter
      return matchesSearch && matchesRoute
    })
  }, [suppliers, searchQuery, routeFilter])

  const totalMilk = (s: Supplier) => (s.cowMilk?.quantity || 0) + (s.buffaloMilk?.quantity || 0)

  if (!mounted) return <div className="p-10 text-center italic opacity-50">लोड होत आहे...</div>

  return (
    <div className="space-y-4 max-w-[600px] mx-auto w-full pb-10 px-2 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-3">
        <div>
          <h2 className="text-xl font-black text-foreground uppercase tracking-tight">सप्लायर (SUPPLIERS)</h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Profiles & Inventory</p>
        </div>
        <Dialog open={isAdding} onOpenChange={(open) => { setIsAdding(open); if (!open) resetFormData(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20 h-9 px-5 rounded-xl font-black uppercase text-[10px]">
              <Plus className="h-3.5 w-3.5" /> नवीन सप्लायर
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[500px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white">
            <DialogHeader className="p-3 bg-primary text-white sticky top-0 z-10">
              <DialogTitle className="text-sm font-black uppercase tracking-widest">नवीन सप्लायर प्रोफाइल</DialogTitle>
              <DialogDescription className="text-[8px] text-white/70 uppercase">संपर्क, तांत्रिक आणि साहित्य माहिती भरा.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[80vh] p-4">
              <div className="space-y-6 py-2">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1 tracking-widest flex items-center gap-2">
                    <Phone className="h-3 w-3" /> १) प्राथमिक माहिती
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1 col-span-2">
                      <Label className="text-[9px] font-black uppercase text-muted-foreground opacity-60">सप्लायर प्रकार (Type)</Label>
                      <Select value={formData.supplierType} onValueChange={(val: SupplierType) => setFormData({...formData, supplierType: val})}>
                        <SelectTrigger className="h-9 text-[11px] bg-muted/20 border-none font-black rounded-lg p-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Gavali" className="text-[11px] font-black">गवळी (Gavali)</SelectItem>
                          <SelectItem value="Gotha" className="text-[11px] font-black">गोठा (Gotha)</SelectItem>
                          <SelectItem value="Center" className="text-[11px] font-black">उत्पादक केंद्र (Center)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1 col-span-2"><Label className="text-[9px] font-black uppercase text-muted-foreground opacity-60">नाव</Label><Input value={formData.name ?? ""} onChange={e => setFormData({...formData, name: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-bold rounded-lg p-3" placeholder="..." /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase text-muted-foreground opacity-60">आयडी (ID)</Label><Input value={formData.supplierId ?? ""} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-bold rounded-lg p-3" placeholder="..." /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase text-muted-foreground opacity-60">मोबाईल</Label><Input value={formData.mobile ?? ""} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-bold rounded-lg p-3" placeholder="..." /></div>
                    <div className="space-y-1 col-span-2">
                      <Label className="text-[9px] font-black uppercase text-muted-foreground opacity-60">रूट</Label>
                      <Select value={formData.routeId ?? ""} onValueChange={val => setFormData({...formData, routeId: val})}>
                        <SelectTrigger className="h-9 text-[11px] bg-muted/20 border-none rounded-lg font-bold"><SelectValue placeholder="रूट निवडा" /></SelectTrigger>
                        <SelectContent>{(routes || []).map(r => <SelectItem key={r.id} value={r.id} className="text-[11px] font-black">{r.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-1"><Label className="text-[9px] font-black uppercase text-muted-foreground opacity-60">पत्ता</Label><Input value={formData.address ?? ""} onChange={e => setFormData({...formData, address: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-bold rounded-lg p-3" placeholder="..." /></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1 tracking-widest flex items-center gap-2">
                    <Laptop className="h-3 w-3" /> २) तांत्रिक व इन्व्हेंटरी
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase text-muted-foreground opacity-60">काटा ब्रँड</Label><Input value={formData.scaleBrand ?? ""} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-bold rounded-lg p-3" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase text-muted-foreground opacity-60">मशीन ब्रँड</Label><Input value={formData.fatMachineBrand ?? ""} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-bold rounded-lg p-3" /></div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 mt-1">
                    <div className="flex items-center space-x-2 bg-muted/10 p-2.5 rounded-xl border border-muted-foreground/5 shadow-sm active:bg-primary/5 transition-colors cursor-pointer" onClick={() => setFormData({...formData, computerAvailable: !formData.computerAvailable})}>
                      <Checkbox id="comp-s" checked={formData.computerAvailable} onCheckedChange={(v) => setFormData({...formData, computerAvailable: !!v})} />
                      <Label htmlFor="comp-s" className="text-[10px] font-black uppercase cursor-pointer tracking-wider">POP सिस्टम आहे का?</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-muted/10 p-2.5 rounded-xl border border-muted-foreground/5 shadow-sm active:bg-primary/5 transition-colors cursor-pointer" onClick={() => setFormData({...formData, upsInverterAvailable: !formData.upsInverterAvailable})}>
                      <Checkbox id="ups-s" checked={formData.upsInverterAvailable} onCheckedChange={(v) => setFormData({...formData, upsInverterAvailable: !!v})} />
                      <Label htmlFor="ups-s" className="text-[10px] font-black uppercase cursor-pointer tracking-wider">UPS / इनव्हर्टर आहे का?</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-muted/10 p-2.5 rounded-xl border border-muted-foreground/5 shadow-sm active:bg-primary/5 transition-colors cursor-pointer" onClick={() => setFormData({...formData, solarAvailable: !formData.solarAvailable})}>
                      <Checkbox id="solar-s" checked={formData.solarAvailable} onCheckedChange={(v) => setFormData({...formData, solarAvailable: !!v})} />
                      <Label htmlFor="solar-s" className="text-[10px] font-black uppercase cursor-pointer tracking-wider">सोलर उपलब्ध आहे का?</Label>
                    </div>
                  </div>

                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between border-b pb-1">
                      <h4 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                        <Box className="h-3 w-3" /> ३) साहित्य यादी (INVENTORY)
                      </h4>
                      <Button variant="outline" size="sm" onClick={addEquipmentRow} className="h-6 text-[8px] font-black rounded-lg px-2 border-primary/20 bg-primary/5 text-primary">जोडा</Button>
                    </div>
                    <div className="space-y-1.5">
                      {(formData.equipment || []).map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-1.5 items-center bg-muted/10 p-2 rounded-xl border border-muted-foreground/5">
                          <div className="col-span-6"><Input value={item.name} onChange={e => updateEquipmentRow(item.id, {name: e.target.value})} className="h-8 text-[10px] px-2 bg-white border-none rounded-md font-bold" placeholder="साहित्य" /></div>
                          <div className="col-span-2"><Input type="number" value={item.quantity} onChange={e => updateEquipmentRow(item.id, {quantity: Number(e.target.value)})} className="h-8 text-[10px] px-0 text-center bg-white border-none rounded-md font-black" /></div>
                          <div className="col-span-3">
                            <Select value={item.ownership} onValueChange={v => updateEquipmentRow(item.id, {ownership: v as any})}>
                              <SelectTrigger className="h-8 text-[8px] px-1 bg-white border-none rounded-md font-black"><SelectValue /></SelectTrigger>
                              <SelectContent><SelectItem value="Self" className="text-[10px] font-black">स्वतः</SelectItem><SelectItem value="Company" className="text-[10px] font-black">डेअरी</SelectItem></SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-1 flex justify-end"><Button variant="ghost" size="icon" onClick={() => removeEquipmentRow(item.id)} className="h-7 w-7 text-destructive rounded-md"><X className="h-3.5 w-3.5" /></Button></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="p-3 border-t bg-muted/5">
              <Button onClick={handleAddSupplier} className="w-full font-black uppercase text-[10px] h-11 rounded-xl shadow-lg shadow-primary/20 tracking-[0.2em] transition-all active:scale-95">
                <CheckCircle2 className="h-4 w-4 mr-2" /> प्रोफाइल जतन करा
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border shadow-none rounded-2xl overflow-hidden bg-white border-muted-foreground/10">
        <CardContent className="p-2.5">
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground opacity-50" />
              <Input 
                placeholder="नाव किंवा मोबाईलने शोधा..." 
                className="pl-9 h-9 rounded-xl bg-muted/20 border-none font-bold text-xs" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={routeFilter} onValueChange={setRouteFilter}>
                <SelectTrigger className="w-full sm:w-[160px] h-9 rounded-xl bg-muted/20 border-none font-black text-[9px] uppercase tracking-widest">
                  <Filter className="h-3 w-3 mr-1.5" />
                  <SelectValue placeholder="रूट निवडा" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-[10px] font-black uppercase">सर्व रूट</SelectItem>
                  {(routes || []).map(r => <SelectItem key={r.id} value={r.id} className="text-[10px] font-black uppercase">{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-white rounded-2xl border border-muted-foreground/10 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b">
              <TableHead className="font-black text-[9px] uppercase text-muted-foreground tracking-widest h-8 px-4">सप्लायर</TableHead>
              <TableHead className="font-black text-[9px] uppercase text-muted-foreground tracking-widest h-8 text-center">दूध (L)</TableHead>
              <TableHead className="font-black text-[9px] uppercase text-muted-foreground tracking-widest h-8 text-right px-4">क्रिया</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((supp) => (
                <TableRow key={supp.id} className="cursor-pointer hover:bg-primary/5 transition-colors group border-b last:border-0" onClick={() => {
                  setSelectedSupplier(supp)
                  setFormData(supp)
                  setIsEditing(true)
                }}>
                  <TableCell className="py-2 px-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-[11px] text-slate-900 truncate max-w-[120px] uppercase">{supp.name}</span>
                        {supp.supplierType === 'Center' && <Badge className="bg-emerald-500 h-3 px-1 text-[6px] font-black uppercase border-none">Center</Badge>}
                      </div>
                      <span className="text-[8px] text-muted-foreground font-black uppercase flex items-center gap-1">
                        <Badge variant="outline" className="h-3 px-1 text-[6px] font-black bg-primary/5 text-primary border-none">ID: {supp.supplierId || supp.id?.slice(-4)}</Badge>
                        <Phone className="h-2 w-2" /> {supp.mobile}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-black text-[11px] text-primary">{totalMilk(supp).toFixed(1)}</TableCell>
                  <TableCell className="text-right px-4">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); setSelectedSupplier(supp); setFormData(supp); setIsEditing(true); }}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={(e) => {
                        e.stopPropagation()
                        deleteSupplier(supp.id)
                      }} className="h-7 w-7 text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-muted-foreground font-black uppercase text-[9px] opacity-30">
                  सप्लायर सापडले नाहीत.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-[500px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white">
          <DialogHeader className="p-3 bg-primary text-white">
            <DialogTitle className="text-sm font-black uppercase tracking-widest">माहिती बदला: {selectedSupplier?.name}</DialogTitle>
            <DialogDescription className="text-[8px] text-white/70 uppercase">सप्लायरची माहिती अद्ययावत करा.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] p-4">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-3">
                 <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase text-muted-foreground opacity-60">प्रकार</Label>
                    <Select value={formData.supplierType} onValueChange={(val: SupplierType) => setFormData({...formData, supplierType: val})}>
                      <SelectTrigger className="h-9 text-[11px] bg-muted/20 border-none font-black rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gavali" className="text-[11px] font-black">गवळी</SelectItem>
                        <SelectItem value="Gotha" className="text-[11px] font-black">गोठा</SelectItem>
                        <SelectItem value="Center" className="text-[11px] font-black">उत्पादक केंद्र</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>

                 <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/20 border border-muted-foreground/5">
                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <Label className="text-[8px] text-muted-foreground uppercase font-black">पत्ता</Label>
                      <p className="text-[10px] font-bold uppercase">{selectedSupplier?.address}</p>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center space-x-2 bg-muted/10 p-2.5 rounded-xl border border-muted-foreground/5">
                      <Checkbox id="edit-comp" checked={formData.computerAvailable} onCheckedChange={(v) => setFormData({...formData, computerAvailable: !!v})} />
                      <Label htmlFor="edit-comp" className="text-[10px] font-black uppercase cursor-pointer">POP सिस्टम आहे का?</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-muted/10 p-2.5 rounded-xl border border-muted-foreground/5">
                      <Checkbox id="edit-ups" checked={formData.upsInverterAvailable} onCheckedChange={(v) => setFormData({...formData, upsInverterAvailable: !!v})} />
                      <Label htmlFor="edit-ups" className="text-[10px] font-black uppercase cursor-pointer">UPS / इनव्हर्टर</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-muted/10 p-2.5 rounded-xl border border-muted-foreground/5">
                      <Checkbox id="edit-solar" checked={formData.solarAvailable} onCheckedChange={(v) => setFormData({...formData, solarAvailable: !!v})} />
                      <Label htmlFor="edit-solar" className="text-[10px] font-black uppercase cursor-pointer">सोलर उपलब्ध</Label>
                    </div>
                 </div>

                 <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between border-b pb-1">
                      <h4 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                        <Box className="h-3 w-3" /> साहित्य यादी
                      </h4>
                      <Button variant="outline" size="sm" onClick={addEquipmentRow} className="h-6 text-[8px] font-black rounded-lg px-2">जोडा</Button>
                    </div>
                    <div className="space-y-1.5">
                      {(formData.equipment || []).map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-1.5 items-center bg-muted/10 p-2 rounded-xl">
                          <div className="col-span-6"><Input value={item.name} onChange={e => updateEquipmentRow(item.id, {name: e.target.value})} className="h-8 text-[10px] px-2 bg-white border-none rounded-md font-bold" /></div>
                          <div className="col-span-2"><Input type="number" value={item.quantity} onChange={e => updateEquipmentRow(item.id, {quantity: Number(e.target.value)})} className="h-8 text-[10px] px-0 text-center bg-white border-none rounded-md" /></div>
                          <div className="col-span-3">
                            <Select value={item.ownership} onValueChange={v => updateEquipmentRow(item.id, {ownership: v as any})}>
                              <SelectTrigger className="h-8 text-[8px] px-1 bg-white border-none rounded-md"><SelectValue /></SelectTrigger>
                              <SelectContent><SelectItem value="Self" className="text-[10px] font-black">स्वतः</SelectItem><SelectItem value="Company" className="text-[10px] font-black">डेअरी</SelectItem></SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-1 flex justify-end"><Button variant="ghost" size="icon" onClick={() => removeEquipmentRow(item.id)} className="h-7 w-7 text-destructive"><X className="h-3.5 w-3.5" /></Button></div>
                        </div>
                      ))}
                    </div>
                  </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-3 bg-muted/5 flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1 h-10 rounded-xl font-black uppercase text-[10px] tracking-widest border-primary/20">रद्द</Button>
            <Button onClick={handleUpdateSupplier} className="flex-1 h-10 rounded-xl shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest">
              <CheckCircle2 className="h-4 w-4 mr-2" /> बदल जतन करा
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