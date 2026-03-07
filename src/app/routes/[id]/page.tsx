
"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Supplier, Route, EquipmentItem } from "@/lib/types"
import { 
  Plus, Search, MapPin, Phone, Info, Milk, User, 
  Truck, Package, ShieldCheck, 
  Trash2, Edit, ChevronRight, PlusCircle, ArrowLeft, X, CheckCircle2
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function RouteDetailsPage() {
  const params = useParams()
  const router = useRouter()
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
    scaleBrand: "",
    fatMachineBrand: "",
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
      scaleBrand: "", fatMachineBrand: "",
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
      scaleBrand: supplier.scaleBrand || "",
      fatMachineBrand: supplier.fatMachineBrand || "",
      equipment: supplier.equipment || []
    })
    setIsDialogOpen(true)
  }

  const handleAddEquipmentRow = () => {
    const newItem: EquipmentItem = {
      id: crypto.randomUUID(),
      name: "",
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
      scaleBrand: formData.scaleBrand,
      fatMachineBrand: formData.fatMachineBrand,
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

  const handleDeleteSupplier = (id: string) => {
    if (!confirm("तुम्हाला खात्री आहे की हा पुरवठादार हटवायचा आहे?")) return
    const allSupps = JSON.parse(localStorage.getItem('procurepal_suppliers') || '[]')
    const updated = allSupps.filter((s: Supplier) => s.id !== id)
    localStorage.setItem('procurepal_suppliers', JSON.stringify(updated))
    setSuppliers(updated.filter((s: Supplier) => s.routeId === routeId))
    if (selectedSupplier?.id === id) setSelectedSupplier(null)
    toast({ title: "हटवले", description: "पुरवठादार काढून टाकला आहे." })
  }

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => (s.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()))
  }, [suppliers, searchQuery])

  if (!mounted) return null

  return (
    <div className="space-y-2 max-w-7xl mx-auto w-full pb-10 px-1 sm:px-0 animate-in fade-in duration-500">
      {/* Ultra Compact Page Header */}
      <div className="flex items-center justify-between gap-2 border-b pb-2 bg-background sticky top-0 z-20 px-1">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => router.push('/routes')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-lg font-black font-headline text-foreground truncate">
              सप्लायर (Suppliers)
            </h2>
            <p className="text-[8px] text-muted-foreground font-black uppercase tracking-tight truncate max-w-[100px]">Route: {route?.name || routeId}</p>
          </div>
        </div>
        <Button onClick={openAddDialog} size="sm" className="h-8 font-black gap-1 rounded-xl shadow-md text-[10px] px-3">
          <Plus className="h-3 w-3" /> नवीन (Add)
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start">
        {/* Left Panel: High Density List */}
        <Card className={`lg:col-span-4 border-none shadow-sm bg-white flex flex-col rounded-xl overflow-hidden ${selectedSupplier ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-2 border-b bg-muted/5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <input 
                placeholder="सप्लायर शोधा... (Search...)" 
                className="w-full pl-7 h-8 text-[10px] bg-white border-none rounded-lg shadow-inner focus:ring-1 focus:ring-primary outline-none" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-180px)] lg:h-[650px]">
            <div className="divide-y">
              {filteredSuppliers.length > 0 ? filteredSuppliers.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => setSelectedSupplier(s)} 
                  className={`p-2 cursor-pointer hover:bg-muted/50 transition-all flex justify-between items-center ${selectedSupplier?.id === s.id ? 'bg-primary/5 border-l-4 border-primary' : 'border-l-4 border-transparent'}`}
                >
                  <div className="min-w-0">
                    <h4 className="font-black text-[10px] text-foreground truncate">{s.name}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[8px] font-black text-primary uppercase">ID: {s.id}</span>
                      <span className="text-[8px] text-muted-foreground font-bold truncate flex items-center gap-0.5">
                        <MapPin className="h-2 w-2" /> {s.address}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-3 w-3 text-muted-foreground opacity-50 shrink-0" />
                </div>
              )) : (
                <div className="p-10 text-center space-y-2">
                  <User className="h-6 w-6 text-muted-foreground/20 mx-auto" />
                  <p className="text-[8px] font-black text-muted-foreground uppercase">सापडला नाही</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Right Panel: High Density Details */}
        <Card className={`lg:col-span-8 border-none shadow-sm bg-white rounded-xl min-h-[500px] ${!selectedSupplier ? 'hidden lg:flex lg:items-center lg:justify-center' : 'block'}`}>
          {selectedSupplier ? (
            <div className="flex flex-col h-full">
              <div className="p-3 border-b flex items-center justify-between bg-primary/5 sticky top-0 z-10">
                <Button variant="ghost" size="icon" className="lg:hidden h-7 w-7 rounded-full" onClick={() => setSelectedSupplier(null)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1 lg:flex-none px-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-black leading-tight text-foreground truncate">{selectedSupplier.name}</h3>
                  <p className="text-[8px] font-black text-muted-foreground uppercase mt-0.5 tracking-tight truncate">ID: {selectedSupplier.id} | {selectedSupplier.collectionType}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg border-primary/20 text-primary" onClick={() => openEditDialog(selectedSupplier)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive rounded-lg" onClick={() => handleDeleteSupplier(selectedSupplier.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 h-[calc(100vh-180px)] lg:h-[650px]">
                <div className="p-2 space-y-3">
                  {/* Basic & Contact: Compact Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/20 p-2 rounded-lg border space-y-1.5">
                      <h4 className="text-[8px] font-black uppercase text-primary flex items-center gap-1"><User className="h-2 w-2" /> संपर्क</h4>
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-2.5 w-2.5 text-primary shrink-0" />
                        <p className="text-[9px] font-black truncate">{selectedSupplier.mobile || "-"}</p>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <MapPin className="h-2.5 w-2.5 text-primary shrink-0" />
                        <p className="text-[9px] font-black leading-tight truncate">{selectedSupplier.address || "-"}</p>
                      </div>
                    </div>

                    <div className="bg-muted/20 p-2 rounded-lg border space-y-1.5">
                      <h4 className="text-[8px] font-black uppercase text-primary flex items-center gap-1"><ShieldCheck className="h-2 w-2" /> परवाना</h4>
                      <div className="min-w-0">
                        <p className="text-[7px] font-black text-muted-foreground uppercase">FSSAI</p>
                        <p className="text-[9px] font-black text-primary truncate">{selectedSupplier.fssaiNumber || "N/A"}</p>
                      </div>
                      <div className="flex justify-between items-end gap-1">
                        <div><p className="text-[7px] font-black text-muted-foreground uppercase">Expiry</p><p className="text-[8px] font-black">{selectedSupplier.fssaiExpiry || "-"}</p></div>
                        <Badge className="text-[7px] h-3.5 px-1 font-black">{selectedSupplier.collectionType}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Milk Metrics: High Density */}
                  <div className="space-y-1.5">
                    <h4 className="text-[8px] font-black uppercase text-primary flex items-center gap-1"><Milk className="h-2.5 w-2.5" /> दूध संकलन (Milk Metrics)</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-[7px] font-black text-blue-600 uppercase">गाय (Cow)</p>
                          <div className="flex items-baseline gap-0.5"><span className="text-sm font-black text-blue-900">{selectedSupplier.cowMilk?.quantity || 0}</span><span className="text-[8px] font-bold text-blue-700">L</span></div>
                        </div>
                        <div className="space-y-0.5 text-[8px] font-black text-blue-800 text-right">
                          <p>F: {selectedSupplier.cowMilk?.fat || 0}</p>
                          <p>S: {selectedSupplier.cowMilk?.snf || 0}</p>
                        </div>
                      </div>
                      <div className="p-2 bg-amber-50/50 border border-amber-100 rounded-xl flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-[7px] font-black text-amber-600 uppercase">म्हैस (Buf)</p>
                          <div className="flex items-baseline gap-0.5"><span className="text-sm font-black text-amber-900">{selectedSupplier.buffaloMilk?.quantity || 0}</span><span className="text-[8px] font-bold text-amber-700">L</span></div>
                        </div>
                        <div className="space-y-0.5 text-[8px] font-black text-amber-800 text-right">
                          <p>F: {selectedSupplier.buffaloMilk?.fat || 0}</p>
                          <p>S: {selectedSupplier.buffaloMilk?.snf || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Material & Equipment: Tighter */}
                  <div className="space-y-2">
                    <h4 className="text-[8px] font-black uppercase text-primary flex items-center gap-1"><Package className="h-2.5 w-2.5" /> तांत्रिक (Technical)</h4>
                    <div className="bg-muted/10 p-2 rounded-lg border border-dashed grid grid-cols-2 gap-x-4 gap-y-1.5">
                      <div className="flex justify-between border-b border-white/50 pb-0.5"><p className="text-[7px] font-black text-muted-foreground uppercase">काटा</p><p className="text-[9px] font-black">{selectedSupplier.scaleBrand || "-"}</p></div>
                      <div className="flex justify-between border-b border-white/50 pb-0.5"><p className="text-[7px] font-black text-muted-foreground uppercase">मशीन</p><p className="text-[9px] font-black">{selectedSupplier.fatMachineBrand || "-"}</p></div>
                      <div className="flex justify-between"><p className="text-[7px] font-black text-muted-foreground uppercase">बर्फ</p><p className="text-[9px] font-black">{selectedSupplier.iceBlocks || "0"} Blk</p></div>
                      <div className="flex justify-between"><p className="text-[7px] font-black text-muted-foreground uppercase">खाद्य</p><p className="text-[9px] font-black">{selectedSupplier.cattleFeedBrand || "-"}</p></div>
                    </div>

                    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                      <Table>
                        <TableHeader><TableRow className="bg-muted/50 h-6"><TableHead className="text-[7px] font-black uppercase px-2 h-6">साहित्य</TableHead><TableHead className="text-[7px] font-black uppercase text-center h-6">Qty</TableHead><TableHead className="text-[7px] font-black uppercase text-right px-2 h-6">मालकी</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {selectedSupplier.equipment?.map((item) => (
                            <TableRow key={item.id} className="h-8"><TableCell className="py-0.5 px-2 text-[9px] font-black">{item.name}</TableCell><TableCell className="py-0.5 text-center font-black text-[9px]">{item.quantity}</TableCell><TableCell className="py-0.5 px-2 text-right"><Badge variant={item.ownership === 'Self' ? 'outline' : 'secondary'} className="text-[6px] h-3 px-1 font-black">{item.ownership === 'Self' ? 'स्वतः' : 'डेअरी'}</Badge></TableCell></TableRow>
                          ))}
                          {(!selectedSupplier.equipment || selectedSupplier.equipment.length === 0) && (<TableRow><TableCell colSpan={3} className="text-center text-[8px] italic py-2">नोंद नाही.</TableCell></TableRow>)}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Competition & Notes: Minimal */}
                  <div className="grid grid-cols-1 gap-2">
                    <div className="bg-orange-50/30 p-2 rounded-lg border border-orange-100"><p className="text-[7px] font-black text-orange-600 uppercase">गाव स्पर्धा</p><p className="text-[9px] font-medium leading-tight mt-0.5">{selectedSupplier.competition || "-"}</p></div>
                    <div className="bg-muted/10 p-2 rounded-lg border border-dashed"><p className="text-[7px] font-black text-muted-foreground uppercase">टिप्पणी</p><p className="text-[9px] italic leading-tight mt-0.5">{selectedSupplier.additionalInfo || "-"}</p></div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-center gap-2 text-center p-10">
              <User className="h-10 w-10 text-muted-foreground/20" />
              <div className="space-y-1">
                <h4 className="font-black text-muted-foreground text-xs uppercase">सप्लायर निवडा</h4>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Ultra Compact Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl sm:max-h-[90vh] border-none">
          <DialogHeader className="p-3 bg-primary text-white sticky top-0 z-10 shrink-0">
            <DialogTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-tight"><User className="h-4 w-4" /> {dialogMode === 'add' ? 'नवीन सप्लायर' : 'माहिती बदला'}</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[calc(90vh-100px)] p-3 sm:p-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-[9px] font-black uppercase text-primary border-b pb-0.5 flex items-center gap-1.5"><User className="h-2.5 w-2.5" /> १) प्राथमिक माहिती</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2 space-y-0.5"><Label className="text-[8px] uppercase font-black text-muted-foreground">नाव</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-8 text-[10px] rounded-lg bg-muted/20 border-none" /></div>
                    <div className="space-y-0.5"><Label className="text-[8px] uppercase font-black text-muted-foreground">आयडी</Label><Input value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="h-8 text-[10px] rounded-lg bg-muted/20 border-none" /></div>
                    <div className="space-y-0.5"><Label className="text-[8px] uppercase font-black text-muted-foreground">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-8 text-[10px] rounded-lg bg-muted/20 border-none" /></div>
                    <div className="space-y-0.5"><Label className="text-[8px] uppercase font-black text-muted-foreground">प्रकार</Label>
                      <Select value={formData.collectionType} onValueChange={v => setFormData({...formData, collectionType: v})}>
                        <SelectTrigger className="h-8 text-[10px] rounded-lg bg-muted/20 border-none"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Route" className="text-[10px]">Route</SelectItem><SelectItem value="Center" className="text-[10px]">Center</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-0.5"><Label className="text-[8px] uppercase font-black text-muted-foreground">FSSAI मुदत</Label><Input type="date" value={formData.fssaiExpiry} onChange={e => setFormData({...formData, fssaiExpiry: e.target.value})} className="h-8 text-[10px] rounded-lg bg-muted/20 border-none px-1" /></div>
                    <div className="col-span-2 space-y-0.5"><Label className="text-[8px] uppercase font-black text-muted-foreground">FSSAI नंबर</Label><Input value={formData.fssaiNumber} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-8 text-[10px] rounded-lg bg-muted/20 border-none" /></div>
                    <div className="col-span-2 space-y-0.5"><Label className="text-[8px] uppercase font-black text-muted-foreground">गाव/पत्ता</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-8 text-[10px] rounded-lg bg-muted/20 border-none" /></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[9px] font-black uppercase text-primary border-b pb-0.5 flex items-center gap-1.5"><Milk className="h-2.5 w-2.5" /> २) दूध आकडेवारी</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="p-2 border rounded-xl bg-blue-50/30 space-y-1">
                      <p className="text-[8px] font-black text-blue-700 uppercase">गाय दूध (Cow)</p>
                      <div className="grid grid-cols-3 gap-1">
                        <div className="space-y-0.5"><p className="text-[6px] font-black uppercase text-center">Qty</p><Input type="number" value={formData.cowQty} onChange={e => setFormData({...formData, cowQty: e.target.value})} className="h-7 text-[10px] text-center bg-white border-none" /></div>
                        <div className="space-y-0.5"><p className="text-[6px] font-black uppercase text-center">Fat</p><Input type="number" value={formData.cowFat} onChange={e => setFormData({...formData, cowFat: e.target.value})} className="h-7 text-[10px] text-center bg-white border-none" /></div>
                        <div className="space-y-0.5"><p className="text-[6px] font-black uppercase text-center">SNF</p><Input type="number" value={formData.cowSnf} onChange={e => setFormData({...formData, cowSnf: e.target.value})} className="h-7 text-[10px] text-center bg-white border-none" /></div>
                      </div>
                    </div>
                    <div className="p-2 border rounded-xl bg-amber-50/30 space-y-1">
                      <p className="text-[8px] font-black text-amber-700 uppercase">म्हेस दूध (Buf)</p>
                      <div className="grid grid-cols-3 gap-1">
                        <div className="space-y-0.5"><p className="text-[6px] font-black uppercase text-center">Qty</p><Input type="number" value={formData.bufQty} onChange={e => setFormData({...formData, bufQty: e.target.value})} className="h-7 text-[10px] text-center bg-white border-none" /></div>
                        <div className="space-y-0.5"><p className="text-[6px] font-black uppercase text-center">Fat</p><Input type="number" value={formData.bufFat} onChange={e => setFormData({...formData, bufFat: e.target.value})} className="h-7 text-[10px] text-center bg-white border-none" /></div>
                        <div className="space-y-0.5"><p className="text-[6px] font-black uppercase text-center">SNF</p><Input type="number" value={formData.bufSnf} onChange={e => setFormData({...formData, bufSnf: e.target.value})} className="h-7 text-[10px] text-center bg-white border-none" /></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-[9px] font-black uppercase text-primary border-b pb-0.5 flex items-center gap-1.5"><Package className="h-2.5 w-2.5" /> ३) तांत्रिक व इन्व्हेंटरी</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5"><Label className="text-[8px] uppercase font-black text-muted-foreground">काटा ब्रँड</Label><Input value={formData.scaleBrand} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} className="h-8 text-[10px] rounded-lg bg-muted/20 border-none" /></div>
                    <div className="space-y-0.5"><Label className="text-[8px] uppercase font-black text-muted-foreground">मशीन ब्रँड</Label><Input value={formData.fatMachineBrand} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-8 text-[10px] rounded-lg bg-muted/20 border-none" /></div>
                    <div className="space-y-0.5"><Label className="text-[8px] uppercase font-black text-muted-foreground">बर्फ लाद्या</Label><Input type="number" value={formData.iceBlocks} onChange={e => setFormData({...formData, iceBlocks: e.target.value})} className="h-8 text-[10px] rounded-lg bg-muted/20 border-none" /></div>
                    <div className="space-y-0.5"><Label className="text-[8px] uppercase font-black text-muted-foreground">पशुखाद्य</Label><Input value={formData.cattleFeedBrand} onChange={e => setFormData({...formData, cattleFeedBrand: e.target.value})} className="h-8 text-[10px] rounded-lg bg-muted/20 border-none" /></div>
                  </div>
                  
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-[8px] font-black uppercase text-muted-foreground">साहित्य यादी</Label>
                      <Button variant="ghost" size="sm" onClick={handleAddEquipmentRow} className="h-5 text-[7px] font-black gap-1 uppercase text-primary bg-primary/5 rounded border border-primary/10">
                        <PlusCircle className="h-2.5 w-2.5" /> जोडा
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {formData.equipment.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-1 items-center p-1.5 rounded-lg bg-muted/10 border border-white/50">
                          <div className="col-span-6"><Input value={item.name} onChange={e => updateEquipmentItem(item.id, {name: e.target.value})} className="h-7 text-[9px] rounded bg-white border-none" placeholder="उदा. कॅन" /></div>
                          <div className="col-span-2"><Input type="number" value={item.quantity} onChange={e => updateEquipmentItem(item.id, {quantity: Number(e.target.value)})} className="h-7 text-[9px] text-center bg-white border-none px-0" /></div>
                          <div className="col-span-3">
                            <Select value={item.ownership} onValueChange={v => updateEquipmentItem(item.id, {ownership: v as any})}>
                              <SelectTrigger className="h-7 text-[8px] px-1 rounded bg-white border-none"><SelectValue /></SelectTrigger>
                              <SelectContent><SelectItem value="Self" className="text-[9px]">स्वतः</SelectItem><SelectItem value="Company" className="text-[9px]">डेअरी</SelectItem></SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-1"><Button variant="ghost" size="icon" onClick={() => handleRemoveEquipmentRow(item.id)} className="h-6 w-6 text-destructive"><X className="h-3 w-3" /></Button></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[9px] font-black uppercase text-primary border-b pb-0.5 flex items-center gap-1.5"><Info className="h-2.5 w-2.5" /> ४) इतर माहिती</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="space-y-0.5"><Label className="text-[8px] uppercase font-black text-muted-foreground">गाव स्पर्धा</Label><Input value={formData.competition} onChange={e => setFormData({...formData, competition: e.target.value})} className="h-8 text-[10px] rounded-lg bg-muted/20 border-none" /></div>
                    <div className="space-y-0.5"><Label className="text-[8px] uppercase font-black text-muted-foreground">टिप्पणी</Label><Input value={formData.additionalInfo} onChange={e => setFormData({...formData, additionalInfo: e.target.value})} className="h-8 text-[10px] rounded-lg bg-muted/20 border-none" /></div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-3 border-t bg-muted/5 gap-2 sticky bottom-0 z-10 flex flex-row shrink-0 sm:justify-end">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1 sm:flex-none font-black h-9 text-[10px] rounded-xl border">रद्द</Button>
            <Button onClick={handleSaveSupplier} className="flex-1 sm:flex-none font-black h-9 text-[10px] rounded-xl shadow-md bg-primary text-white">जतन (Save)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
