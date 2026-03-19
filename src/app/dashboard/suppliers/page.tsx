
"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Supplier, Route, EquipmentItem } from "@/lib/types"
import { Plus, Search, Filter, Phone, MapPin, Trash2, Milk, X, Laptop, Zap, Sun, ShieldAlert, History, Edit } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"

function SuppliersContent() {
  const { user } = useUser()
  const db = useFirestore()
  const searchParams = useSearchParams()
  const initialRouteFilter = searchParams.get('route') || 'all'

  const routesQuery = useMemoFirebase(() => {
    if (!db) return null
    return collection(db, 'routes')
  }, [db])

  const suppliersQuery = useMemoFirebase(() => {
    if (!db) return null
    return collection(db, 'suppliers')
  }, [db])

  const { data: routes } = useCollection<Route>(routesQuery)
  const { data: suppliers } = useCollection<Supplier>(suppliersQuery)

  const [searchQuery, setSearchQuery] = useState("")
  const [routeFilter, setRouteFilter] = useState(initialRouteFilter)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Form state
  const [formData, setFormData] = useState<Partial<Supplier>>({
    id: "", name: "", address: "", mobile: "", routeId: "", competition: "", additionalInfo: "",
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
      id: "", name: "", address: "", mobile: "", routeId: "", competition: "", additionalInfo: "",
      iceBlocks: 0, scaleBrand: "", fatMachineBrand: "", cattleFeedBrand: "", fssaiNumber: "", fssaiExpiry: "",
      milkCansCount: 0, computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
      adulterationKitInfo: "",
      cowMilk: { quantity: 0, fat: 0, snf: 0 },
      buffaloMilk: { quantity: 0, fat: 0, snf: 0 },
      equipment: []
    })
  }

  const handleAddSupplier = () => {
    if (!formData.name || !formData.id || !db) return
    const newSupp = {
      ...formData,
      updatedAt: new Date().toISOString()
    }
    const colRef = collection(db, 'suppliers')
    addDocumentNonBlocking(colRef, newSupp)
    setIsAdding(false)
    resetFormData()
  }

  const handleUpdateSupplier = () => {
    if (!selectedSupplier || !db) return
    const docRef = doc(db, 'suppliers', selectedSupplier.id)
    updateDocumentNonBlocking(docRef, { ...formData, updatedAt: new Date().toISOString() })
    setIsEditing(false)
    setSelectedSupplier(null)
  }

  const deleteSupplier = (id: string) => {
    if (!db) return
    if (confirm("तुम्हाला खात्री आहे की हा सप्लायर हटवायचा आहे?")) {
      const docRef = doc(db, 'suppliers', id)
      deleteDocumentNonBlocking(docRef)
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
                          s.mobile?.includes(searchQuery)
      const matchesRoute = routeFilter === 'all' || s.routeId === routeFilter
      return matchesSearch && matchesRoute
    })
  }, [suppliers, searchQuery, routeFilter])

  const totalMilk = (s: Supplier) => (s.cowMilk?.quantity || 0) + (s.buffaloMilk?.quantity || 0)

  if (!mounted) return <div className="p-10 text-center italic opacity-50">लोड होत आहे...</div>

  return (
    <div className="space-y-4 max-w-6xl mx-auto w-full pb-10 px-2 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-3">
        <div>
          <h2 className="text-xl font-black text-foreground uppercase tracking-tight">सप्लायर व्यवस्थापन (SUPPLIERS)</h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Profiles & Inventory</p>
        </div>
        <Dialog open={isAdding} onOpenChange={(open) => { setIsAdding(open); if (!open) resetFormData(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20 h-9 px-5 rounded-xl font-black uppercase text-[10px]">
              <Plus className="h-3.5 w-3.5" /> नवीन सप्लायर
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white">
            <DialogHeader className="p-3 bg-primary text-white sticky top-0 z-10">
              <DialogTitle className="text-sm font-black uppercase tracking-widest">नवीन सप्लायर प्रोफाइल</DialogTitle>
              <DialogDescription className="text-[8px] text-white/70 uppercase">संपर्क आणि तांत्रिक माहिती भरा.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[80vh] p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1">१) प्राथमिक माहिती</h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1 col-span-2"><Label className="text-[9px] font-black uppercase text-muted-foreground">नाव</Label><Input value={formData.name ?? ""} onChange={e => setFormData({...formData, name: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-bold rounded-lg" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase text-muted-foreground">आयडी (ID)</Label><Input value={formData.id ?? ""} onChange={e => setFormData({...formData, id: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-bold rounded-lg" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase text-muted-foreground">मोबाईल</Label><Input value={formData.mobile ?? ""} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-bold rounded-lg" /></div>
                    <div className="space-y-1 col-span-2">
                      <Label className="text-[9px] font-black uppercase text-muted-foreground">रूट</Label>
                      <Select value={formData.routeId ?? ""} onValueChange={val => setFormData({...formData, routeId: val})}>
                        <SelectTrigger className="h-9 text-[11px] bg-muted/20 border-none rounded-lg"><SelectValue placeholder="रूट निवडा" /></SelectTrigger>
                        <SelectContent>{(routes || []).map(r => <SelectItem key={r.id} value={r.id} className="text-[11px]">{r.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-1"><Label className="text-[9px] font-black uppercase text-muted-foreground">पत्ता</Label><Input value={formData.address ?? ""} onChange={e => setFormData({...formData, address: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-bold rounded-lg" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase text-muted-foreground">FSSAI क्र.</Label><Input value={formData.fssaiNumber ?? ""} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-bold rounded-lg" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase text-muted-foreground">मुदत</Label><Input value={formData.fssaiExpiry ?? ""} onChange={e => setFormData({...formData, fssaiExpiry: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-bold rounded-lg" placeholder="DD/MM/YYYY" /></div>
                  </div>

                  <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1 mt-6">२) दूध संकलन (Avg)</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 border rounded-xl bg-blue-50/20 space-y-2">
                      <p className="text-[9px] font-black text-blue-700 uppercase tracking-widest">गाय दूध (Cow)</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1"><Label className="text-[8px] uppercase">Qty (L)</Label><Input type="number" step="0.1" value={formData.cowMilk?.quantity ?? 0} onChange={e => setFormData({...formData, cowMilk: {...(formData.cowMilk || {quantity:0, fat:0, snf:0}), quantity: Number(e.target.value)}})} className="h-8 text-[10px] text-center border-none bg-white rounded-lg" /></div>
                        <div className="space-y-1"><Label className="text-[8px] uppercase">Fat (%)</Label><Input type="number" step="0.1" value={formData.cowMilk?.fat ?? 0} onChange={e => setFormData({...formData, cowMilk: {...(formData.cowMilk || {quantity:0, fat:0, snf:0}), fat: Number(e.target.value)}})} className="h-8 text-[10px] text-center border-none bg-white rounded-lg" /></div>
                        <div className="space-y-1"><Label className="text-[8px] uppercase">SNF (%)</Label><Input type="number" step="0.1" value={formData.cowMilk?.snf ?? 0} onChange={e => setFormData({...formData, cowMilk: {...(formData.cowMilk || {quantity:0, fat:0, snf:0}), snf: Number(e.target.value)}})} className="h-8 text-[10px] text-center border-none bg-white rounded-lg" /></div>
                      </div>
                    </div>
                    <div className="p-3 border rounded-xl bg-amber-50/20 space-y-2">
                      <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">म्हेस दूध (Buf)</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1"><Label className="text-[8px] uppercase">Qty (L)</Label><Input type="number" step="0.1" value={formData.buffaloMilk?.quantity ?? 0} onChange={e => setFormData({...formData, buffaloMilk: {...(formData.buffaloMilk || {quantity:0, fat:0, snf:0}), quantity: Number(e.target.value)}})} className="h-8 text-[10px] text-center border-none bg-white rounded-lg" /></div>
                        <div className="space-y-1"><Label className="text-[8px] uppercase">Fat (%)</Label><Input type="number" step="0.1" value={formData.buffaloMilk?.fat ?? 0} onChange={e => setFormData({...formData, buffaloMilk: {...(formData.buffaloMilk || {quantity:0, fat:0, snf:0}), fat: Number(e.target.value)}})} className="h-8 text-[10px] text-center border-none bg-white rounded-lg" /></div>
                        <div className="space-y-1"><Label className="text-[8px] uppercase">SNF (%)</Label><Input type="number" step="0.1" value={formData.buffaloMilk?.snf ?? 0} onChange={e => setFormData({...formData, buffaloMilk: {...(formData.buffaloMilk || {quantity:0, fat:0, snf:0}), snf: Number(e.target.value)}})} className="h-8 text-[10px] text-center border-none bg-white rounded-lg" /></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1">३) तांत्रिक व इन्व्हेंटरी</h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase text-muted-foreground">काटा ब्रँड</Label><Input value={formData.scaleBrand ?? ""} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-bold rounded-lg" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase text-muted-foreground">मशीन ब्रँड</Label><Input value={formData.fatMachineBrand ?? ""} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-bold rounded-lg" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase text-muted-foreground">बर्फ लाद्या</Label><Input type="number" value={formData.iceBlocks ?? 0} onChange={e => setFormData({...formData, iceBlocks: Number(e.target.value)})} className="h-9 text-[11px] bg-muted/20 border-none font-bold rounded-lg" /></div>
                    <div className="space-y-1"><Label className="text-[9px] font-black uppercase text-muted-foreground">एकूण कॅन</Label><Input type="number" value={formData.milkCansCount ?? 0} onChange={e => setFormData({...formData, milkCansCount: Number(e.target.value)})} className="h-9 text-[11px] bg-muted/20 border-none font-bold rounded-lg" /></div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 mt-2">
                    <div className="flex items-center space-x-2 bg-muted/10 p-2 rounded-xl border border-muted-foreground/5 shadow-sm">
                      <Checkbox id="computer-s" checked={formData.computerAvailable} onCheckedChange={(v) => setFormData({...formData, computerAvailable: !!v})} />
                      <Label htmlFor="computer-s" className="text-[9px] font-black uppercase cursor-pointer">कॉम्प्युटर उपलब्ध?</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-muted/10 p-2 rounded-xl border border-muted-foreground/5 shadow-sm">
                      <Checkbox id="ups-s" checked={formData.upsInverterAvailable} onCheckedChange={(v) => setFormData({...formData, upsInverterAvailable: !!v})} />
                      <Label htmlFor="ups-s" className="text-[9px] font-black uppercase cursor-pointer">UPS उपलब्ध?</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-muted/10 p-2 rounded-xl border border-muted-foreground/5 shadow-sm">
                      <Checkbox id="solar-s" checked={formData.solarAvailable} onCheckedChange={(v) => setFormData({...formData, solarAvailable: !!v})} />
                      <Label htmlFor="solar-s" className="text-[9px] font-black uppercase cursor-pointer">सोलर उपलब्ध?</Label>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between"><Label className="text-[9px] font-black uppercase text-primary tracking-widest">साहित्य यादी (Material Record)</Label><Button variant="outline" size="sm" onClick={addEquipmentRow} className="h-6 text-[8px] font-black rounded-lg px-2 border-primary/20">जोडा</Button></div>
                    <div className="space-y-1.5">
                      {(formData.equipment || []).map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-1 items-center bg-muted/10 p-1.5 rounded-lg border border-muted-foreground/5">
                          <Input value={item.name} onChange={e => updateEquipmentRow(item.id, {name: e.target.value})} className="col-span-6 h-7 text-[10px] px-2 bg-white border-none rounded-md" placeholder="साहित्य" />
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
                    <Label className="text-[9px] font-black uppercase text-muted-foreground">भेळस तपासणी किट माहिती</Label>
                    <Input placeholder="..." value={formData.adulterationKitInfo ?? ""} onChange={e => setFormData({...formData, adulterationKitInfo: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-bold rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-muted-foreground">गावामधील स्पर्धा (Competition)</Label>
                    <Input placeholder="उदा. अमूल / गोकुळ सेंटर" value={formData.competition ?? ""} onChange={e => setFormData({...formData, competition: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-bold rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-muted-foreground">इतर माहिती</Label>
                    <Input placeholder="..." value={formData.additionalInfo ?? ""} onChange={e => setFormData({...formData, additionalInfo: e.target.value})} className="h-9 text-[11px] bg-muted/20 border-none font-bold rounded-lg" />
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="p-3 border-t bg-muted/5">
              <Button onClick={handleAddSupplier} className="w-full font-black uppercase text-[10px] h-10 rounded-xl shadow-lg shadow-primary/20 tracking-[0.2em]">प्रोफाइल जतन करा</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border shadow-none rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-3">
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
                <SelectTrigger className="w-full sm:w-[180px] h-9 rounded-xl bg-muted/20 border-none font-black text-[9px] uppercase tracking-widest">
                  <Filter className="h-3 w-3 mr-1.5" />
                  <SelectValue placeholder="रूट निवडा" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-[10px]">सर्व रूट</SelectItem>
                  {(routes || []).map(r => <SelectItem key={r.id} value={r.id} className="text-[10px]">{r.name}</SelectItem>)}
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
              <TableHead className="font-black text-[9px] uppercase text-muted-foreground tracking-widest h-8 text-center">रूट</TableHead>
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
                      <span className="font-black text-[11px] text-slate-900 truncate max-w-[120px]">{supp.name}</span>
                      <span className="text-[8px] text-muted-foreground font-black uppercase flex items-center gap-1">
                        <Phone className="h-2 w-2" /> {supp.mobile}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-black text-[7px] uppercase border-primary/20 bg-primary/5 text-primary py-0 h-4">
                      {routes?.find(r => r.id === supp.routeId)?.name || 'Unassigned'}
                    </Badge>
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
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground font-black uppercase text-[9px] opacity-30">
                  सप्लायर सापडले नाहीत.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white">
          <DialogHeader className="p-3 bg-primary text-white">
            <DialogTitle className="text-sm font-black uppercase tracking-widest">माहिती बदला: {selectedSupplier?.name}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh] p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
              <div className="space-y-4">
                 <div className="flex items-start gap-2 p-2.5 rounded-xl bg-muted/20 border border-muted-foreground/5">
                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <Label className="text-[8px] text-muted-foreground uppercase font-black">पत्ता</Label>
                      <p className="text-[10px] font-bold">{selectedSupplier?.address}</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                   <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                      <Label className="text-[8px] text-blue-600 uppercase font-black tracking-widest">Cow Milk</Label>
                      <p className="text-sm font-black text-blue-900">{selectedSupplier?.cowMilk?.quantity} L</p>
                      <p className="text-[8px] text-muted-foreground font-bold">F: {selectedSupplier?.cowMilk?.fat}% | S: {selectedSupplier?.cowMilk?.snf}%</p>
                   </div>
                   <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                      <Label className="text-[8px] text-amber-700 uppercase font-black tracking-widest">Buffalo Milk</Label>
                      <p className="text-sm font-black text-amber-900">{selectedSupplier?.buffaloMilk?.quantity} L</p>
                      <p className="text-[8px] text-muted-foreground font-bold">F: {selectedSupplier?.buffaloMilk?.fat}% | S: {selectedSupplier?.buffaloMilk?.snf}%</p>
                   </div>
                 </div>
                 <div className="bg-muted/20 p-2.5 rounded-xl grid grid-cols-2 gap-3 border border-muted-foreground/5">
                    <div><Label className="text-[8px] text-muted-foreground uppercase font-black">FSSAI</Label><p className="text-[10px] font-black">{selectedSupplier?.fssaiNumber || '-'}</p></div>
                    <div><Label className="text-[8px] text-muted-foreground uppercase font-black">मुदत</Label><p className="text-[10px] font-black">{selectedSupplier?.fssaiExpiry || '-'}</p></div>
                 </div>
              </div>
              
              <div className="space-y-4 md:border-l md:pl-6">
                 <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1">माहिती अपडेट करा</h4>
                 <div className="space-y-3">
                   <div className="grid grid-cols-2 gap-2">
                     <div className="space-y-1"><Label className="text-[9px] font-black uppercase">Cow Qty (L)</Label><Input type="number" step="0.1" value={formData.cowMilk?.quantity ?? 0} onChange={e => setFormData({...formData, cowMilk: {...(formData.cowMilk || {quantity:0, fat:0, snf:0}), quantity: Number(e.target.value)}})} className="h-9 text-[11px] bg-muted/20 border-none font-bold rounded-lg" /></div>
                     <div className="space-y-1"><Label className="text-[9px] font-black uppercase">Buf Qty (L)</Label><Input type="number" step="0.1" value={formData.buffaloMilk?.quantity ?? 0} onChange={e => setFormData({...formData, buffaloMilk: {...(formData.buffaloMilk || {quantity:0, fat:0, snf:0}), quantity: Number(e.target.value)}})} className="h-9 text-[11px] bg-muted/20 border-none font-bold rounded-lg" /></div>
                   </div>
                   
                   <div className="space-y-1">
                     <Label className="text-[9px] font-black uppercase">रूट बदला</Label>
                     <Select value={formData.routeId ?? ""} onValueChange={val => setFormData({...formData, routeId: val})}>
                       <SelectTrigger className="h-9 text-[11px] bg-muted/20 border-none rounded-lg"><SelectValue /></SelectTrigger>
                       <SelectContent>
                         {(routes || []).map(r => <SelectItem key={r.id} value={r.id} className="text-[11px]">{r.name}</SelectItem>)}
                       </SelectContent>
                     </Select>
                   </div>

                   <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between"><Label className="text-[9px] font-black uppercase text-primary tracking-widest">साहित्य यादी</Label><Button variant="outline" size="sm" onClick={addEquipmentRow} className="h-6 text-[8px] font-black rounded-lg px-2 border-primary/20">जोडा</Button></div>
                    <div className="space-y-1.5">
                      {(formData.equipment || []).map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-1 items-center bg-muted/10 p-1.5 rounded-lg border border-muted-foreground/5">
                          <Input value={item.name} onChange={e => updateEquipmentRow(item.id, {name: e.target.value})} className="col-span-6 h-7 text-[10px] px-2 bg-white border-none rounded-md" placeholder="साहित्य" />
                          <Input type="number" value={item.quantity} onChange={e => updateEquipmentRow(item.id, {quantity: Number(e.target.value)})} className="col-span-2 h-7 text-[10px] px-0 text-center bg-white border-none rounded-md" />
                          <Select value={item.ownership} onValueChange={v => updateEquipmentRow(item.id, {ownership: v as any})}>
                            <SelectTrigger className="col-span-3 h-7 text-[8px] px-1 bg-white border-none rounded-md"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="Self" className="text-[10px]">स्वतः</SelectItem><SelectItem value="Company" className="text-[10px]">डेअरी</SelectItem></SelectContent>
                          </Select>
                          <Button variant="ghost" size="icon" onClick={() => removeEquipmentRow(item.id)} className="col-span-1 h-6 w-6 text-destructive"><X className="h-3.5 w-3.5" /></Button>
                        </div>
                      ))}
                    </div>
                  </div>
                 </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-3 bg-muted/5 flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1 h-10 rounded-xl font-black uppercase text-[10px] tracking-widest border-primary/20">रद्द</Button>
            <Button onClick={handleUpdateSupplier} className="flex-1 h-10 rounded-xl shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest">माहिती साठवा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function SuppliersPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center italic opacity-50">लोड होत आहे...</div>}>
      <SuppliersContent />
    </Suspense>
  )
}
