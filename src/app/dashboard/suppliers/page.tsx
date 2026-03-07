
"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Supplier, Route, EquipmentItem } from "@/lib/types"
import { Plus, Search, Filter, Phone, MapPin, Trash2, Milk, X, Laptop, Zap, Sun } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

function SuppliersContent() {
  const searchParams = useSearchParams()
  const initialRouteFilter = searchParams.get('route') || 'all'

  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [routeFilter, setRouteFilter] = useState(initialRouteFilter)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Form state
  const [formData, setFormData] = useState<Partial<Supplier>>({
    id: "", name: "", address: "", mobile: "", milkQuality: "", routeId: "", competition: "", additionalInfo: "",
    iceBlocks: 0, scaleBrand: "", fatMachineBrand: "", cattleFeedBrand: "", fssaiNumber: "", fssaiExpiry: "",
    milkCansCount: 0, computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
    cowMilk: { quantity: 0, fat: 0, snf: 0 },
    buffaloMilk: { quantity: 0, fat: 0, snf: 0 },
    equipment: []
  })

  useEffect(() => {
    setMounted(true)
    const storedSupps = JSON.parse(localStorage.getItem('procurepal_suppliers') || '[]')
    const storedRoutes = JSON.parse(localStorage.getItem('procurepal_routes') || '[]')
    setSuppliers(storedSupps)
    setRoutes(storedRoutes)
  }, [])

  const saveSuppliers = (updated: Supplier[]) => {
    setSuppliers(updated)
    localStorage.setItem('procurepal_suppliers', JSON.stringify(updated))
  }

  const handleAddSupplier = () => {
    if (!formData.name || !formData.id) return
    const newSupp: Supplier = {
      ...formData as Supplier,
      id: formData.id || crypto.randomUUID(),
    }
    const updatedSuppliers = [...suppliers, newSupp]
    saveSuppliers(updatedSuppliers)
    
    if (newSupp.routeId) {
      const updatedRoutes = routes.map(r => 
        r.id === newSupp.routeId ? { ...r, supplierIds: [...r.supplierIds, newSupp.id] } : r
      )
      setRoutes(updatedRoutes)
      localStorage.setItem('procurepal_routes', JSON.stringify(updatedRoutes))
    }

    setIsAdding(false)
    resetFormData()
  }

  const resetFormData = () => {
    setFormData({ 
      id: "", name: "", address: "", mobile: "", milkQuality: "", routeId: "", competition: "", additionalInfo: "",
      iceBlocks: 0, scaleBrand: "", fatMachineBrand: "", cattleFeedBrand: "", fssaiNumber: "", fssaiExpiry: "",
      milkCansCount: 0, computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
      cowMilk: { quantity: 0, fat: 0, snf: 0 },
      buffaloMilk: { quantity: 0, fat: 0, snf: 0 },
      equipment: []
    })
  }

  const handleUpdateSupplier = () => {
    if (!selectedSupplier) return
    const updated = suppliers.map(s => s.id === selectedSupplier.id ? { ...s, ...formData } : s)
    saveSuppliers(updated)
    setIsEditing(false)
    setSelectedSupplier(null)
  }

  const deleteSupplier = (id: string) => {
    if (!confirm("तुम्हाला खात्री आहे की हा सप्लायर हटवायचा आहे?")) return
    const updated = suppliers.filter(s => s.id !== id)
    saveSuppliers(updated)
    const updatedRoutes = routes.map(r => ({
      ...r,
      supplierIds: r.supplierIds.filter(sid => sid !== id)
    }))
    setRoutes(updatedRoutes)
    localStorage.setItem('procurepal_routes', JSON.stringify(updatedRoutes))
  }

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.mobile.includes(searchQuery)
      const matchesRoute = routeFilter === 'all' || s.routeId === routeFilter
      return matchesSearch && matchesRoute
    })
  }, [suppliers, searchQuery, routeFilter])

  const totalMilk = (s: Supplier) => (s.cowMilk?.quantity || 0) + (s.buffaloMilk?.quantity || 0)

  if (!mounted) {
    return <div className="p-8 text-center text-muted-foreground italic">Loading suppliers...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground">सप्लायर व्यवस्थापन</h2>
          <p className="text-muted-foreground mt-1">सर्व दूध पुरवठादारांची सविस्तर माहिती.</p>
        </div>
        <Dialog open={isAdding} onOpenChange={(open) => { setIsAdding(open); if (!open) resetFormData(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> नवीन सप्लायर
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden rounded-xl border-none">
            <DialogHeader className="p-4 bg-primary text-white sticky top-0 z-10">
              <DialogTitle className="text-lg font-black uppercase">नवीन सप्लायर प्रोफाइल</DialogTitle>
              <DialogDescription className="text-white/80">संपर्क तपशील आणि दूध आकडेवारी भरा.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[75vh] p-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1">१) वैयक्तिक माहिती</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label className="text-xs">नाव</Label><Input value={formData.name ?? ""} onChange={e => setFormData({...formData, name: e.target.value})} className="h-9 text-xs" /></div>
                    <div className="space-y-1"><Label className="text-xs">आयडी (ID)</Label><Input value={formData.id ?? ""} onChange={e => setFormData({...formData, id: e.target.value})} className="h-9 text-xs" /></div>
                    <div className="space-y-1"><Label className="text-xs">मोबाईल</Label><Input value={formData.mobile ?? ""} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-9 text-xs" /></div>
                    <div className="space-y-1">
                      <Label className="text-xs">रूट</Label>
                      <Select value={formData.routeId ?? ""} onValueChange={val => setFormData({...formData, routeId: val})}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="रूट निवडा" /></SelectTrigger>
                        <SelectContent>{routes.map(r => <SelectItem key={r.id} value={r.id} className="text-xs">{r.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-1"><Label className="text-xs">पत्ता</Label><Input value={formData.address ?? ""} onChange={e => setFormData({...formData, address: e.target.value})} className="h-9 text-xs" /></div>
                    <div className="space-y-1"><Label className="text-xs">FSSAI क्र.</Label><Input value={formData.fssaiNumber ?? ""} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-9 text-xs" /></div>
                    <div className="space-y-1"><Label className="text-xs">मुदत (Expiry)</Label><Input value={formData.fssaiExpiry ?? ""} onChange={e => setFormData({...formData, fssaiExpiry: e.target.value})} className="h-9 text-xs" placeholder="DD/MM/YYYY" /></div>
                  </div>

                  <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1 mt-6">२) दूध संकलन (Avg)</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 border rounded-lg bg-blue-50/20 space-y-2">
                      <p className="text-[10px] font-black text-blue-700 uppercase">गाय दूध (Cow)</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1"><Label className="text-[9px]">Qty (L)</Label><Input type="number" step="0.1" value={formData.cowMilk?.quantity ?? 0} onChange={e => setFormData({...formData, cowMilk: {...(formData.cowMilk || {quantity:0, fat:0, snf:0}), quantity: Number(e.target.value)}})} className="h-8 text-xs text-center" /></div>
                        <div className="space-y-1"><Label className="text-[9px]">Fat (%)</Label><Input type="number" step="0.1" value={formData.cowMilk?.fat ?? 0} onChange={e => setFormData({...formData, cowMilk: {...(formData.cowMilk || {quantity:0, fat:0, snf:0}), fat: Number(e.target.value)}})} className="h-8 text-xs text-center" /></div>
                        <div className="space-y-1"><Label className="text-[9px]">SNF (%)</Label><Input type="number" step="0.1" value={formData.cowMilk?.snf ?? 0} onChange={e => setFormData({...formData, cowMilk: {...(formData.cowMilk || {quantity:0, fat:0, snf:0}), snf: Number(e.target.value)}})} className="h-8 text-xs text-center" /></div>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg bg-amber-50/20 space-y-2">
                      <p className="text-[10px] font-black text-amber-700 uppercase">म्हेस दूध (Buf)</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1"><Label className="text-[9px]">Qty (L)</Label><Input type="number" step="0.1" value={formData.buffaloMilk?.quantity ?? 0} onChange={e => setFormData({...formData, buffaloMilk: {...(formData.buffaloMilk || {quantity:0, fat:0, snf:0}), quantity: Number(e.target.value)}})} className="h-8 text-xs text-center" /></div>
                        <div className="space-y-1"><Label className="text-[9px]">Fat (%)</Label><Input type="number" step="0.1" value={formData.buffaloMilk?.fat ?? 0} onChange={e => setFormData({...formData, buffaloMilk: {...(formData.buffaloMilk || {quantity:0, fat:0, snf:0}), fat: Number(e.target.value)}})} className="h-8 text-xs text-center" /></div>
                        <div className="space-y-1"><Label className="text-[9px]">SNF (%)</Label><Input type="number" step="0.1" value={formData.buffaloMilk?.snf ?? 0} onChange={e => setFormData({...formData, buffaloMilk: {...(formData.buffaloMilk || {quantity:0, fat:0, snf:0}), snf: Number(e.target.value)}})} className="h-8 text-xs text-center" /></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1">३) तांत्रिक व इन्व्हेंटरी</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><Label className="text-xs">काटा ब्रँड</Label><Input value={formData.scaleBrand ?? ""} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} className="h-9 text-xs" /></div>
                    <div className="space-y-1"><Label className="text-xs">मशीन ब्रँड</Label><Input value={formData.fatMachineBrand ?? ""} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-9 text-xs" /></div>
                    <div className="space-y-1"><Label className="text-xs">बर्फ लाद्या</Label><Input type="number" value={formData.iceBlocks ?? 0} onChange={e => setFormData({...formData, iceBlocks: Number(e.target.value)})} className="h-9 text-xs" /></div>
                    <div className="space-y-1"><Label className="text-xs">खाद्य ब्रँड</Label><Input value={formData.cattleFeedBrand ?? ""} onChange={e => setFormData({...formData, cattleFeedBrand: e.target.value})} className="h-9 text-xs" /></div>
                    <div className="space-y-1"><Label className="text-xs">एकूण कॅन</Label><Input type="number" value={formData.milkCansCount ?? 0} onChange={e => setFormData({...formData, milkCansCount: Number(e.target.value)})} className="h-9 text-xs" /></div>
                    <div className="space-y-1">
                      <Label className="text-xs">क्वालिटी ग्रेड</Label>
                      <Select value={formData.milkQuality ?? ""} onValueChange={val => setFormData({...formData, milkQuality: val})}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="निवडा" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+" className="text-xs">A+ Premium</SelectItem>
                          <SelectItem value="A" className="text-xs">A Standard</SelectItem>
                          <SelectItem value="B" className="text-xs">B Average</SelectItem>
                          <SelectItem value="C" className="text-xs">C Monitoring</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 mt-4">
                    <div className="flex items-center space-x-2 bg-muted/10 p-2 rounded-lg">
                      <Checkbox id="computer-s" checked={formData.computerAvailable} onCheckedChange={(v) => setFormData({...formData, computerAvailable: !!v})} />
                      <Label htmlFor="computer-s" className="text-[10px] font-black uppercase cursor-pointer">कॉम्प्युटर उपलब्ध आहे का?</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-muted/10 p-2 rounded-lg">
                      <Checkbox id="ups-s" checked={formData.upsInverterAvailable} onCheckedChange={(v) => setFormData({...formData, upsInverterAvailable: !!v})} />
                      <Label htmlFor="ups-s" className="text-[10px] font-black uppercase cursor-pointer">UPS उपलब्ध आहे का?</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-muted/10 p-2 rounded-lg">
                      <Checkbox id="solar-s" checked={formData.solarAvailable} onCheckedChange={(v) => setFormData({...formData, solarAvailable: !!v})} />
                      <Label htmlFor="solar-s" className="text-[10px] font-black uppercase cursor-pointer">सोलर उपलब्ध आहे का?</Label>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between"><Label className="text-[9px] font-black uppercase">साहित्य यादी</Label><Button variant="outline" size="sm" onClick={() => setFormData({...formData, equipment: [...(formData.equipment || []), {id: crypto.randomUUID(), name: "", quantity: 1, ownership: 'Self'}]})} className="h-6 text-[8px] font-black rounded-md px-2">जोडा</Button></div>
                    <div className="space-y-1.5">
                      {formData.equipment?.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-1 items-center bg-muted/10 p-1.5 rounded-md">
                          <Input value={item.name} onChange={e => setFormData({...formData, equipment: formData.equipment?.map(i => i.id === item.id ? {...i, name: e.target.value} : i)})} className="col-span-6 h-7 text-[10px] px-2 bg-white border-none" placeholder="कॅन" />
                          <Input type="number" value={item.quantity} onChange={e => setFormData({...formData, equipment: formData.equipment?.map(i => i.id === item.id ? {...i, quantity: Number(e.target.value)} : i)})} className="col-span-2 h-7 text-[10px] px-0 text-center bg-white border-none" />
                          <Select value={item.ownership} onValueChange={v => setFormData({...formData, equipment: formData.equipment?.map(i => i.id === item.id ? {...i, ownership: v as any} : i)})}>
                            <SelectTrigger className="col-span-3 h-7 text-[8px] px-1 bg-white border-none"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="Self" className="text-[10px]">स्वतः</SelectItem><SelectItem value="Company" className="text-[10px]">डेअरी</SelectItem></SelectContent>
                          </Select>
                          <Button variant="ghost" size="icon" onClick={() => setFormData({...formData, equipment: formData.equipment?.filter(i => i.id !== item.id)})} className="col-span-1 h-6 w-6 text-destructive"><X className="h-3 w-3" /></Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <Label className="text-xs">गाव स्पर्धा</Label>
                    <Input placeholder="उदा. अमूल सेंटर" value={formData.competition ?? ""} onChange={e => setFormData({...formData, competition: e.target.value})} className="h-9 text-xs" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">अतिरिक्त टिप</Label>
                    <Input placeholder="वेळ, महत्त्वाची नोंद इ." value={formData.additionalInfo ?? ""} onChange={e => setFormData({...formData, additionalInfo: e.target.value})} className="h-9 text-xs" />
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="p-4 border-t bg-muted/5">
              <Button onClick={handleAddSupplier} className="w-full font-black uppercase text-xs h-10">प्रोफाइल जतन करा</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or mobile..." 
                className="pl-9" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={routeFilter} onValueChange={setRouteFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by Route" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Routes</SelectItem>
                  {routes.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Supplier</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Total Milk (L)</TableHead>
              <TableHead>Quality</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((supp) => (
                <TableRow key={supp.id} className="cursor-pointer" onClick={() => {
                  setSelectedSupplier(supp)
                  setFormData(supp)
                  setIsEditing(true)
                }}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{supp.name}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {supp.mobile}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {routes.find(r => r.id === supp.routeId)?.name || 'Unassigned'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{totalMilk(supp)}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      supp.milkQuality.startsWith('A') ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {supp.milkQuality}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={(e) => {
                      e.stopPropagation()
                      deleteSupplier(supp.id)
                    }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No suppliers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 bg-primary text-white">
            <DialogTitle>माहिती बदला: {selectedSupplier?.name}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[75vh] p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                 <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                    <MapPin className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <Label className="text-[10px] text-muted-foreground uppercase">पत्ता</Label>
                      <p className="text-sm font-medium">{selectedSupplier?.address}</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                   <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <Label className="text-[10px] text-primary uppercase font-bold">Cow Milk</Label>
                      <p className="text-lg font-bold">{selectedSupplier?.cowMilk?.quantity} L</p>
                      <p className="text-[10px] text-muted-foreground">Fat: {selectedSupplier?.cowMilk?.fat}% | SNF: {selectedSupplier?.cowMilk?.snf}%</p>
                   </div>
                   <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                      <Label className="text-[10px] text-amber-700 uppercase font-bold">Buffalo Milk</Label>
                      <p className="text-lg font-bold">{selectedSupplier?.buffaloMilk?.quantity} L</p>
                      <p className="text-[10px] text-muted-foreground">Fat: {selectedSupplier?.buffaloMilk?.fat}% | SNF: {selectedSupplier?.buffaloMilk?.snf}%</p>
                   </div>
                 </div>
                 <div className="bg-muted/20 p-3 rounded-lg grid grid-cols-2 gap-4">
                    <div><Label className="text-[10px] text-muted-foreground uppercase">FSSAI</Label><p className="text-sm font-bold">{selectedSupplier?.fssaiNumber || '-'}</p></div>
                    <div><Label className="text-[10px] text-muted-foreground uppercase">मुदत</Label><p className="text-sm font-bold">{selectedSupplier?.fssaiExpiry || '-'}</p></div>
                 </div>
                 <div className="p-3 rounded-lg bg-muted/20">
                    <Label className="text-[10px] text-muted-foreground uppercase">गाव स्पर्धा</Label>
                    <p className="text-sm font-medium">{selectedSupplier?.competition || 'None'}</p>
                 </div>
              </div>
              
              <div className="space-y-4 border-l pl-6">
                 <h4 className="text-sm font-bold font-headline uppercase text-muted-foreground">Update Details</h4>
                 <div className="space-y-3">
                   <div className="grid grid-cols-2 gap-2">
                     <div className="space-y-1"><Label className="text-xs">Cow Milk Qty (L)</Label><Input type="number" step="0.1" value={formData.cowMilk?.quantity ?? 0} onChange={e => setFormData({...formData, cowMilk: {...(formData.cowMilk || {quantity:0, fat:0, snf:0}), quantity: Number(e.target.value)}})} className="h-8 text-xs" /></div>
                     <div className="space-y-1"><Label className="text-xs">Buf Milk Qty (L)</Label><Input type="number" step="0.1" value={formData.buffaloMilk?.quantity ?? 0} onChange={e => setFormData({...formData, buffaloMilk: {...(formData.buffaloMilk || {quantity:0, fat:0, snf:0}), quantity: Number(e.target.value)}})} className="h-8 text-xs" /></div>
                   </div>
                   
                   <div className="space-y-1">
                     <Label className="text-xs">क्वालिटी ग्रेड</Label>
                     <Select value={formData.milkQuality ?? ""} onValueChange={val => setFormData({...formData, milkQuality: val})}>
                       <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                       <SelectContent>
                         <SelectItem value="A+" className="text-xs">A+ Premium</SelectItem>
                         <SelectItem value="A" className="text-xs">A Standard</SelectItem>
                         <SelectItem value="B" className="text-xs">B Average</SelectItem>
                         <SelectItem value="C" className="text-xs">C Monitoring</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>

                   <div className="space-y-1">
                     <Label className="text-xs">रूट बदला</Label>
                     <Select value={formData.routeId ?? ""} onValueChange={val => setFormData({...formData, routeId: val})}>
                       <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                       <SelectContent>
                         {routes.map(r => <SelectItem key={r.id} value={r.id} className="text-xs">{r.name}</SelectItem>)}
                       </SelectContent>
                     </Select>
                   </div>

                   <div className="grid grid-cols-2 gap-2 pt-2">
                     <div className="space-y-1"><Label className="text-xs">काटा ब्रँड</Label><Input value={formData.scaleBrand ?? ""} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} className="h-8 text-xs" /></div>
                     <div className="space-y-1"><Label className="text-xs">मशीन ब्रँड</Label><Input value={formData.fatMachineBrand ?? ""} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-8 text-xs" /></div>
                   </div>
                 </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-4 bg-muted/5">
            <Button variant="outline" onClick={() => setIsEditing(false)} className="h-9 text-xs">Close</Button>
            <Button onClick={handleUpdateSupplier} className="h-9 text-xs px-8">Update Information</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function SuppliersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground italic">Loading suppliers center...</div>}>
      <SuppliersContent />
    </Suspense>
  )
}
