
"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Supplier, Route, EquipmentItem } from "@/lib/types"
import { 
  Plus, Search, MapPin, Phone, Info, Milk, User, 
  Scale, Thermometer, Truck, Package, ShieldCheck, 
  Calendar as CalendarIcon, Trash2, Edit, Laptop, Battery, Sun, ChevronRight, PlusCircle
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function RouteDetailsPage() {
  const params = useParams()
  const routeId = params.id as string
  const { toast } = useToast()

  const [route, setRoute] = useState<Route | null>(null)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    id: "",
    address: "",
    mobile: "",
    competition: "",
    additionalInfo: "",
    cowQty: "0", cowFat: "0", cowSnf: "0",
    bufQty: "0", bufFat: "0", bufSnf: "0",
    iceBlocks: "0",
    collectionType: "Route",
    cattleFeedBrand: "",
    fssaiNumber: "",
    fssaiExpiry: "",
    equipment: [] as EquipmentItem[]
  })

  useEffect(() => {
    setMounted(true)
    const storedRoutes = JSON.parse(localStorage.getItem('procurepal_routes') || '[]')
    const storedSupps = JSON.parse(localStorage.getItem('procurepal_suppliers') || '[]')
    const currentRoute = storedRoutes.find((r: Route) => r.id === routeId)
    setRoute(currentRoute || null)
    setSuppliers(storedSupps.filter((s: Supplier) => s.routeId === routeId))
  }, [routeId])

  const openAddDialog = () => {
    setDialogMode('add')
    setEditingId(null)
    setFormData({
      name: "", id: "", address: "", mobile: "", competition: "", additionalInfo: "",
      cowQty: "0", cowFat: "0", cowSnf: "0", bufQty: "0", bufFat: "0", bufSnf: "0",
      iceBlocks: "0", collectionType: "Route", cattleFeedBrand: "",
      fssaiNumber: "", fssaiExpiry: "",
      equipment: []
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (supplier: Supplier) => {
    setDialogMode('edit')
    setEditingId(supplier.id)
    setFormData({
      name: supplier.name || "",
      id: supplier.id || "",
      address: supplier.address || "",
      mobile: supplier.mobile || "",
      competition: supplier.competition || "",
      additionalInfo: supplier.additionalInfo || "",
      cowQty: String(supplier.cowMilk?.quantity ?? 0),
      cowFat: String(supplier.cowMilk?.fat ?? 0),
      cowSnf: String(supplier.cowMilk?.snf ?? 0),
      bufQty: String(supplier.buffaloMilk?.quantity ?? 0),
      bufFat: String(supplier.buffaloMilk?.fat ?? 0),
      bufSnf: String(supplier.buffaloMilk?.snf ?? 0),
      iceBlocks: String(supplier.iceBlocks ?? 0),
      collectionType: supplier.collectionType || "Route",
      cattleFeedBrand: supplier.cattleFeedBrand || "",
      fssaiNumber: supplier.fssaiNumber || "",
      fssaiExpiry: supplier.fssaiExpiry || "",
      equipment: supplier.equipment || []
    })
    setIsDialogOpen(true)
  }

  const handleAddEquipmentRow = () => {
    const newItem: EquipmentItem = {
      id: crypto.randomUUID(),
      name: "",
      brand: "",
      quantity: 1,
      ownership: 'Self'
    }
    setFormData({ ...formData, equipment: [...formData.equipment, newItem] })
  }

  const handleRemoveEquipmentRow = (id: string) => {
    setFormData({ ...formData, equipment: formData.equipment.filter(item => item.id !== id) })
  }

  const updateEquipmentItem = (id: string, updates: Partial<EquipmentItem>) => {
    setFormData({
      ...formData,
      equipment: formData.equipment.map(item => item.id === id ? { ...item, ...updates } : item)
    })
  }

  const handleSaveSupplier = () => {
    if (!formData.name || !formData.id) {
      toast({ title: "त्रुटी", description: "नाव आणि आयडी भरणे आवश्यक आहे.", variant: "destructive" })
      return
    }

    const supplierData: Supplier = {
      id: formData.id,
      name: formData.name,
      address: formData.address,
      mobile: formData.mobile,
      routeId: routeId,
      competition: formData.competition,
      additionalInfo: formData.additionalInfo,
      cowMilk: { quantity: Number(formData.cowQty), fat: Number(formData.cowFat), snf: Number(formData.cowSnf) },
      buffaloMilk: { quantity: Number(formData.bufQty), fat: Number(formData.bufFat), snf: Number(formData.bufSnf) },
      iceBlocks: Number(formData.iceBlocks),
      collectionType: formData.collectionType,
      cattleFeedBrand: formData.cattleFeedBrand,
      fssaiNumber: formData.fssaiNumber,
      fssaiExpiry: formData.fssaiExpiry,
      equipment: formData.equipment
    }

    const allSupps = JSON.parse(localStorage.getItem('procurepal_suppliers') || '[]')
    let updatedAllSupps: Supplier[]

    if (dialogMode === 'add') {
      updatedAllSupps = [...allSupps, supplierData]
      toast({ title: "यशस्वी", description: "नवीन पुरवठादार जोडला गेला." })
    } else {
      updatedAllSupps = allSupps.map((s: Supplier) => s.id === editingId ? supplierData : s)
      toast({ title: "यशस्वी", description: "माहिती अद्ययावत केली गेली." })
    }

    localStorage.setItem('procurepal_suppliers', JSON.stringify(updatedAllSupps))
    setSuppliers(updatedAllSupps.filter((s: Supplier) => s.routeId === routeId))
    if (editingId === selectedSupplier?.id || formData.id === selectedSupplier?.id) setSelectedSupplier(supplierData)
    setIsDialogOpen(false)
  }

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => (s.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()))
  }, [suppliers, searchQuery])

  if (!mounted) return null

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-10">
      <div className="flex flex-col gap-1 px-4 sm:px-0">
        <h2 className="text-3xl font-headline font-bold text-foreground">Route Details</h2>
        <p className="text-muted-foreground">Path ID: {routeId}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel */}
        <Card className="lg:col-span-4 border-none shadow-sm bg-white h-[750px] flex flex-col overflow-hidden">
          <CardHeader className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <CardTitle className="text-lg">Suppliers</CardTitle>
              <Button size="sm" variant="outline" onClick={openAddDialog} className="font-bold border-primary text-primary"><Plus className="h-4 w-4 mr-1" /> Add</Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8 h-8 text-xs bg-muted/30 border-none" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="divide-y">
              {filteredSuppliers.map(s => (
                <div key={s.id} onClick={() => setSelectedSupplier(s)} className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors flex justify-between items-center ${selectedSupplier?.id === s.id ? 'bg-primary/5 border-l-4 border-primary' : 'border-l-4 border-transparent'}`}>
                  <div><h4 className="font-bold text-sm">{s.name}</h4><p className="text-[10px] uppercase font-bold text-muted-foreground">ID: {s.id}</p></div>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Right Panel */}
        <Card className="lg:col-span-8 border-none shadow-sm bg-white min-h-[750px]">
          {selectedSupplier ? (
            <ScrollArea className="h-[750px]">
              <CardContent className="p-6 sm:p-10 space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
                  <div><h3 className="text-3xl font-bold font-headline">{selectedSupplier.name}</h3><p className="text-sm font-bold text-muted-foreground">ID: {selectedSupplier.id}</p></div>
                  <Button variant="outline" size="sm" className="font-bold" onClick={() => openEditDialog(selectedSupplier)}><Edit className="h-4 w-4 mr-2" /> Edit</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">संपर्क</h4>
                    <div className="bg-muted/20 p-5 rounded-xl border space-y-4">
                      <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" /> <p className="text-sm font-bold">{selectedSupplier.mobile}</p></div>
                      <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" /> <p className="text-sm font-bold">{selectedSupplier.address}</p></div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">साहित्य व इन्व्हेंटरी</h4>
                    <div className="p-4 border rounded-xl bg-muted/5">
                      <Table>
                        <TableHeader><TableRow><TableHead className="h-8 text-[9px] uppercase font-bold">आयटम</TableHead><TableHead className="h-8 text-[9px] uppercase font-bold text-center">Qty</TableHead><TableHead className="h-8 text-[9px] uppercase font-bold text-right">मालकी</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {selectedSupplier.equipment?.map((item) => (
                            <TableRow key={item.id}><TableCell className="py-2 text-[11px] font-bold">{item.name}<p className="text-[8px] text-muted-foreground font-normal">{item.brand}</p></TableCell><TableCell className="text-center font-bold">{item.quantity}</TableCell><TableCell className="text-right"><Badge variant={item.ownership === 'Self' ? 'outline' : 'secondary'} className="text-[8px]">{item.ownership === 'Self' ? 'स्वतःचे' : 'डेअरी'}</Badge></TableCell></TableRow>
                          ))}
                          {(!selectedSupplier.equipment || selectedSupplier.equipment.length === 0) && (<TableRow><TableCell colSpan={3} className="text-center py-4 text-[10px] italic">नोंद नाही.</TableCell></TableRow>)}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Milk Metrics</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 border rounded-xl bg-blue-50/20"><p className="text-[10px] font-bold text-primary uppercase mb-2">Cow Milk</p><p className="font-bold text-lg">{selectedSupplier.cowMilk?.quantity || 0} L</p></div>
                    <div className="p-4 border rounded-xl bg-amber-50/20"><p className="text-[10px] font-bold text-amber-700 uppercase mb-2">Buffalo Milk</p><p className="font-bold text-lg text-amber-900">{selectedSupplier.buffaloMilk?.quantity || 0} L</p></div>
                  </div>
                </div>
              </CardContent>
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center p-12 text-center flex-col gap-5 h-[750px]">
              <User className="h-20 w-20 text-muted-foreground/20" />
              <h4 className="font-bold">पुरवठादार निवडा</h4>
              <Button onClick={openAddDialog} variant="outline" className="font-bold border-primary text-primary">नवीन पुरवठादार जोडा</Button>
            </div>
          )}
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl p-0 bg-white">
          <DialogHeader className="p-4 bg-primary/5 border-b shrink-0">
            <DialogTitle className="text-xl font-bold">{dialogMode === 'add' ? 'नवीन पुरवठादार जोडा' : 'माहिती अपडेट करा'}</DialogTitle>
          </DialogHeader>
          
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 max-h-[80vh] overflow-y-auto">
            <div className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-2 border-b pb-1"><Info className="h-4 w-4" /> १) प्राथमिक माहिती</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold">नाव</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-9 bg-muted/30 border-none text-xs" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold">आयडी/कोड</Label><Input value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="h-9 bg-muted/30 border-none text-xs" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-9 bg-muted/30 border-none text-xs" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold">प्रकार</Label>
                    <Select value={formData.collectionType} onValueChange={v => setFormData({...formData, collectionType: v})}>
                      <SelectTrigger className="h-9 bg-muted/30 border-none text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Route">रूट</SelectItem><SelectItem value="Center">सेंटर</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-1.5"><Label className="text-[10px] uppercase font-bold">पत्ता</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-9 bg-muted/30 border-none text-xs" /></div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-2 border-b pb-1"><Milk className="h-4 w-4" /> २) दूध आकडेवारी</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-xl bg-blue-50/30">
                    <Label className="text-[10px] font-bold text-primary uppercase">गाय</Label>
                    <div className="grid grid-cols-3 gap-1 mt-2">
                      <Input placeholder="Qty" type="number" step="0.1" value={formData.cowQty} onChange={e => setFormData({...formData, cowQty: e.target.value})} className="h-7 text-[10px]" />
                      <Input placeholder="Fat" type="number" step="0.1" value={formData.cowFat} onChange={e => setFormData({...formData, cowFat: e.target.value})} className="h-7 text-[10px]" />
                      <Input placeholder="SNF" type="number" step="0.1" value={formData.cowSnf} onChange={e => setFormData({...formData, cowSnf: e.target.value})} className="h-7 text-[10px]" />
                    </div>
                  </div>
                  <div className="p-3 border rounded-xl bg-amber-50/30">
                    <Label className="text-[10px] font-bold text-amber-700 uppercase">म्हेस</Label>
                    <div className="grid grid-cols-3 gap-1 mt-2">
                      <Input placeholder="Qty" type="number" step="0.1" value={formData.bufQty} onChange={e => setFormData({...formData, bufQty: e.target.value})} className="h-7 text-[10px]" />
                      <Input placeholder="Fat" type="number" step="0.1" value={formData.bufFat} onChange={e => setFormData({...formData, bufFat: e.target.value})} className="h-7 text-[10px]" />
                      <Input placeholder="SNF" type="number" step="0.1" value={formData.bufSnf} onChange={e => setFormData({...formData, bufSnf: e.target.value})} className="h-7 text-[10px]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-1">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-2"><Package className="h-4 w-4" /> ३) मटेरिअल आणि साहित्य</h4>
                  <Button variant="ghost" size="sm" onClick={handleAddEquipmentRow} className="h-7 text-[9px] font-bold uppercase gap-1 text-primary"><PlusCircle className="h-3 w-3" /> Add Item</Button>
                </div>
                
                <div className="space-y-3">
                  {formData.equipment.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-3 rounded-lg bg-muted/10 border">
                      <div className="col-span-4 space-y-1"><Label className="text-[8px] uppercase font-bold">साहित्य</Label><Input value={item.name} onChange={e => updateEquipmentItem(item.id, {name: e.target.value})} className="h-8 text-[10px] bg-white" placeholder="उदा. कॅन" /></div>
                      <div className="col-span-3 space-y-1"><Label className="text-[8px] uppercase font-bold">ब्रँड</Label><Input value={item.brand} onChange={e => updateEquipmentItem(item.id, {brand: e.target.value})} className="h-8 text-[10px] bg-white" placeholder="उदा. टाटा" /></div>
                      <div className="col-span-2 space-y-1"><Label className="text-[8px] uppercase font-bold">Qty</Label><Input type="number" value={item.quantity} onChange={e => updateEquipmentItem(item.id, {quantity: Number(e.target.value)})} className="h-8 text-[10px] bg-white text-center" /></div>
                      <div className="col-span-2 space-y-1"><Label className="text-[8px] uppercase font-bold">मालकी</Label>
                        <Select value={item.ownership} onValueChange={(v: any) => updateEquipmentItem(item.id, {ownership: v})}>
                          <SelectTrigger className="h-8 text-[9px] bg-white px-1"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="Self">स्वतःचे</SelectItem><SelectItem value="Company">डेअरी</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1 flex justify-center"><Button variant="ghost" size="icon" onClick={() => handleRemoveEquipmentRow(item.id)} className="h-8 w-8 text-destructive"><Trash2 className="h-3 w-3" /></Button></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-2 border-b pb-1"><Truck className="h-4 w-4" /> ४) लॉजिस्टिक</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold">बर्फाचे प्रमाण</Label><Input type="number" value={formData.iceBlocks} onChange={e => setFormData({...formData, iceBlocks: e.target.value})} className="h-9 bg-muted/30 border-none text-xs" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] uppercase font-bold">पशुखाद्य</Label><Input value={formData.cattleFeedBrand} onChange={e => setFormData({...formData, cattleFeedBrand: e.target.value})} className="h-9 bg-muted/30 border-none text-xs" /></div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 border-t bg-muted/5 gap-3 shrink-0">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="font-bold">रद्द करा</Button>
            <Button onClick={handleSaveSupplier} className="font-bold px-10">जतन करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
