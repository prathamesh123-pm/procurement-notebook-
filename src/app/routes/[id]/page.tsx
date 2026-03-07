
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
  Trash2, Edit, ChevronRight, PlusCircle, ArrowLeft, X, CheckCircle2,
  Laptop, Zap, Sun
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"

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
    milkCansCount: "0",
    computerAvailable: false,
    upsInverterAvailable: false,
    solarAvailable: false,
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
      milkCansCount: "0", computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
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
      milkCansCount: String(supplier.milkCansCount || 0),
      computerAvailable: supplier.computerAvailable || false,
      upsInverterAvailable: supplier.upsInverterAvailable || false,
      solarAvailable: supplier.solarAvailable || false,
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
      milkCansCount: Number(formData.milkCansCount),
      computerAvailable: formData.computerAvailable,
      upsInverterAvailable: formData.upsInverterAvailable,
      solarAvailable: formData.solarAvailable,
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

  const handleDeleteSupplier = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
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
      <div className="flex items-center justify-between gap-2 border-b pb-2 bg-background sticky top-0 z-20 px-1">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => router.push('/routes')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-lg font-black text-foreground truncate">सप्लायर (Suppliers)</h2>
            <p className="text-[9px] text-muted-foreground font-black uppercase truncate max-w-[100px]">RT: {route?.name || routeId}</p>
          </div>
        </div>
        <Button onClick={openAddDialog} size="sm" className="h-8 font-black gap-1.5 rounded-lg text-[11px] px-3 shadow-sm">
          <Plus className="h-3.5 w-3.5" /> नवीन
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start">
        <Card className={`lg:col-span-4 border-none shadow-sm bg-white flex flex-col rounded-xl overflow-hidden ${selectedSupplier ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-2 border-b bg-muted/5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <input 
                placeholder="शोधा..." 
                className="w-full pl-7 h-8 text-[11px] bg-white border rounded-md shadow-inner focus:ring-1 focus:ring-primary outline-none" 
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
                  className={`p-2.5 cursor-pointer hover:bg-muted/50 transition-all flex justify-between items-center ${selectedSupplier?.id === s.id ? 'bg-primary/5 border-l-2 border-primary' : 'border-l-2 border-transparent'}`}
                >
                  <div className="min-w-0">
                    <h4 className="font-black text-[11px] text-foreground truncate">{s.name}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] font-black text-primary uppercase">ID: {s.id}</span>
                      <span className="text-[9px] text-muted-foreground font-bold truncate">| {s.address}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive rounded-md" onClick={(e) => handleDeleteSupplier(e, s.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-50 shrink-0" />
                  </div>
                </div>
              )) : (
                <div className="p-10 text-center"><p className="text-[10px] font-black text-muted-foreground uppercase">नोंद नाही</p></div>
              )}
            </div>
          </ScrollArea>
        </Card>

        <Card className={`lg:col-span-8 border-none shadow-sm bg-white rounded-xl min-h-[450px] ${!selectedSupplier ? 'hidden lg:flex lg:items-center lg:justify-center' : 'block'}`}>
          {selectedSupplier ? (
            <div className="flex flex-col h-full">
              <div className="p-3 border-b flex items-center justify-between bg-primary/5 sticky top-0 z-10">
                <Button variant="ghost" size="icon" className="lg:hidden h-7 w-7 rounded-full" onClick={() => setSelectedSupplier(null)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1 lg:flex-none px-2 min-w-0">
                  <h3 className="text-xs sm:text-sm font-black leading-tight text-foreground truncate">{selectedSupplier.name}</h3>
                  <p className="text-[9px] font-black text-muted-foreground uppercase mt-0.5 tracking-tight truncate">ID: {selectedSupplier.id} | {selectedSupplier.collectionType}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Button variant="outline" size="icon" className="h-7 w-7 rounded-md border-primary/20 text-primary" onClick={() => openEditDialog(selectedSupplier)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive rounded-md" onClick={(e) => handleDeleteSupplier(e, selectedSupplier.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 h-[calc(100vh-180px)] lg:h-[650px]">
                <div className="p-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/20 p-2.5 rounded-lg border space-y-1.5">
                      <h4 className="text-[9px] font-black uppercase text-primary">संपर्क (Contact)</h4>
                      <p className="text-[10px] font-black truncate">{selectedSupplier.mobile || "-"}</p>
                      <p className="text-[10px] font-black leading-tight line-clamp-1">{selectedSupplier.address || "-"}</p>
                    </div>
                    <div className="bg-muted/20 p-2.5 rounded-lg border space-y-1.5">
                      <h4 className="text-[9px] font-black uppercase text-primary">परवाना (License)</h4>
                      <p className="text-[10px] font-black text-primary truncate">{selectedSupplier.fssaiNumber || "N/A"}</p>
                      <Badge className="text-[8px] h-4 px-1.5 font-black">{selectedSupplier.fssaiExpiry || "-"}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className={`p-2 rounded-lg border flex flex-col items-center gap-1 ${selectedSupplier.computerAvailable ? 'bg-green-50 border-green-100' : 'bg-muted/20 opacity-50'}`}>
                      <Laptop className={`h-4 w-4 ${selectedSupplier.computerAvailable ? 'text-green-600' : 'text-muted-foreground'}`} />
                      <span className="text-[8px] font-black uppercase">कॉम्प्युटर</span>
                    </div>
                    <div className={`p-2 rounded-lg border flex flex-col items-center gap-1 ${selectedSupplier.upsInverterAvailable ? 'bg-orange-50 border-orange-100' : 'bg-muted/20 opacity-50'}`}>
                      <Zap className={`h-4 w-4 ${selectedSupplier.upsInverterAvailable ? 'text-orange-600' : 'text-muted-foreground'}`} />
                      <span className="text-[8px] font-black uppercase">UPS/Inv</span>
                    </div>
                    <div className={`p-2 rounded-lg border flex flex-col items-center gap-1 ${selectedSupplier.solarAvailable ? 'bg-amber-50 border-amber-100' : 'bg-muted/20 opacity-50'}`}>
                      <Sun className={`h-4 w-4 ${selectedSupplier.solarAvailable ? 'text-amber-600' : 'text-muted-foreground'}`} />
                      <span className="text-[8px] font-black uppercase">सोलर</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-[9px] font-black uppercase text-primary">दूध आकडेवारी (Milk Stats)</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-lg flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-[8px] font-black text-blue-600 uppercase">गाय</p>
                          <p className="text-sm font-black text-blue-900">{selectedSupplier.cowMilk?.quantity || 0}L</p>
                        </div>
                        <div className="text-[9px] font-black text-blue-800 text-right">F:{selectedSupplier.cowMilk?.fat} S:{selectedSupplier.cowMilk?.snf}</div>
                      </div>
                      <div className="p-2.5 bg-amber-50/50 border border-amber-100 rounded-lg flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-[8px] font-black text-amber-600 uppercase">म्हेस</p>
                          <p className="text-sm font-black text-amber-900">{selectedSupplier.buffaloMilk?.quantity || 0}L</p>
                        </div>
                        <div className="text-[9px] font-black text-amber-800 text-right">F:{selectedSupplier.buffaloMilk?.fat} S:{selectedSupplier.buffaloMilk?.snf}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-[9px] font-black uppercase text-primary">तांत्रिक व इतर (Technical)</h4>
                    <div className="bg-muted/10 p-2.5 rounded-lg border border-dashed grid grid-cols-2 gap-x-4 gap-y-1.5">
                      <div className="flex justify-between border-b pb-1"><p className="text-[8px] font-black text-muted-foreground uppercase">काटा</p><p className="text-[10px] font-black">{selectedSupplier.scaleBrand || "-"}</p></div>
                      <div className="flex justify-between border-b pb-1"><p className="text-[8px] font-black text-muted-foreground uppercase">मशीन</p><p className="text-[10px] font-black">{selectedSupplier.fatMachineBrand || "-"}</p></div>
                      <div className="flex justify-between border-b pb-1"><p className="text-[8px] font-black text-muted-foreground uppercase">बर्फ</p><p className="text-[10px] font-black">{selectedSupplier.iceBlocks || "0"}</p></div>
                      <div className="flex justify-between border-b pb-1"><p className="text-[8px] font-black text-muted-foreground uppercase">खाद्य</p><p className="text-[10px] font-black">{selectedSupplier.cattleFeedBrand || "-"}</p></div>
                      <div className="flex justify-between col-span-2"><p className="text-[8px] font-black text-muted-foreground uppercase">कॅन संख्या</p><p className="text-[10px] font-black">{selectedSupplier.milkCansCount || "0"}</p></div>
                    </div>
                    <div className="bg-orange-50/30 p-2.5 rounded-lg border border-orange-100"><p className="text-[8px] font-black text-orange-600 uppercase">गाव स्पर्धा (Competition)</p><p className="text-[10px] font-medium leading-tight">{selectedSupplier.competition || "-"}</p></div>
                  </div>

                  <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                    <Table>
                      <TableHeader><TableRow className="bg-muted/50 h-7"><TableHead className="text-[8px] font-black uppercase px-2 h-7">साहित्य (Item)</TableHead><TableHead className="text-[8px] font-black uppercase text-center h-7">Qty</TableHead><TableHead className="text-[8px] font-black uppercase text-right px-2 h-7">मालकी</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {selectedSupplier.equipment?.map((item) => (
                          <TableRow key={item.id} className="h-8"><TableCell className="py-1 px-2 text-[10px] font-black">{item.name}</TableCell><TableCell className="py-1 text-center font-black text-[10px]">{item.quantity}</TableCell><TableCell className="py-1 px-2 text-right"><Badge variant={item.ownership === 'Self' ? 'outline' : 'secondary'} className="text-[7px] h-3.5 px-1 font-black uppercase">{item.ownership === 'Self' ? 'स्वतः' : 'डेअरी'}</Badge></TableCell></TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-center gap-2 p-10"><User className="h-10 w-10 text-muted-foreground/20" /><h4 className="font-black text-muted-foreground text-[10px] uppercase tracking-widest">निवडा (Select)</h4></div>
          )}
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-xl border-none">
          <DialogHeader className="p-3 bg-primary text-white sticky top-0 z-10">
            <DialogTitle className="text-sm font-black uppercase tracking-tight">{dialogMode === 'add' ? 'नवीन सप्लायर' : 'माहिती बदला'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[85vh] p-3 sm:p-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1">१) प्राथमिक माहिती</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="col-span-2 space-y-1"><Label className="text-[9px] uppercase font-black">नाव</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-9 text-xs rounded-md bg-muted/20 border-none" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">आयडी</Label><Input value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="h-9 text-xs rounded-md bg-muted/20 border-none" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">मोबाईल</Label><Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-9 text-xs rounded-md bg-muted/20 border-none" /></div>
                  <div className="col-span-2 space-y-1"><Label className="text-[9px] uppercase font-black">पत्ता</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-9 text-xs rounded-md bg-muted/20 border-none" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">FSSAI क्र.</Label><Input value={formData.fssaiNumber} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-9 text-xs rounded-md bg-muted/20 border-none" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">मुदत</Label><Input value={formData.fssaiExpiry} onChange={e => setFormData({...formData, fssaiExpiry: e.target.value})} className="h-9 text-xs rounded-md bg-muted/20 border-none" placeholder="DD/MM/YYYY" /></div>
                </div>
                <div className="p-2 border rounded-lg bg-blue-50/20 space-y-1.5">
                  <p className="text-[9px] font-black text-blue-700 uppercase text-center">गाय दूध (Cow)</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    <Input type="number" placeholder="Qty" value={formData.cowQty} onChange={e => setFormData({...formData, cowQty: e.target.value})} className="h-8 text-[10px] text-center" />
                    <Input type="number" placeholder="Fat" value={formData.cowFat} onChange={e => setFormData({...formData, cowFat: e.target.value})} className="h-8 text-[10px] text-center" />
                    <Input type="number" placeholder="SNF" value={formData.cowSnf} onChange={e => setFormData({...formData, cowSnf: e.target.value})} className="h-8 text-[10px] text-center" />
                  </div>
                </div>
                <div className="p-2 border rounded-lg bg-amber-50/20 space-y-1.5">
                  <p className="text-[9px] font-black text-amber-700 uppercase text-center">म्हेस दूध (Buf)</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    <Input type="number" placeholder="Qty" value={formData.bufQty} onChange={e => setFormData({...formData, bufQty: e.target.value})} className="h-8 text-[10px] text-center" />
                    <Input type="number" placeholder="Fat" value={formData.bufFat} onChange={e => setFormData({...formData, bufFat: e.target.value})} className="h-8 text-[10px] text-center" />
                    <Input type="number" placeholder="SNF" value={formData.bufSnf} onChange={e => setFormData({...formData, bufSnf: e.target.value})} className="h-8 text-[10px] text-center" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-primary border-b pb-1">२) तांत्रिक व इन्व्हेंटरी</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">काटा ब्रँड</Label><Input value={formData.scaleBrand} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} className="h-9 text-xs rounded-md bg-muted/20 border-none" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">मशीन ब्रँड</Label><Input value={formData.fatMachineBrand} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-9 text-xs rounded-md bg-muted/20 border-none" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">बर्फ लाद्या</Label><Input type="number" value={formData.iceBlocks} onChange={e => setFormData({...formData, iceBlocks: e.target.value})} className="h-9 text-xs rounded-md bg-muted/20 border-none" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">खाद्य ब्रँड</Label><Input value={formData.cattleFeedBrand} onChange={e => setFormData({...formData, cattleFeedBrand: e.target.value})} className="h-9 text-xs rounded-md bg-muted/20 border-none" /></div>
                  <div className="space-y-1"><Label className="text-[9px] uppercase font-black">एकूण कॅन</Label><Input type="number" value={formData.milkCansCount} onChange={e => setFormData({...formData, milkCansCount: e.target.value})} className="h-9 text-xs rounded-md bg-muted/20 border-none" /></div>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-2">
                  <div className="flex items-center space-x-2 bg-muted/10 p-2 rounded-lg">
                    <Checkbox id="comp-s" checked={formData.computerAvailable} onCheckedChange={(v) => setFormData({...formData, computerAvailable: !!v})} />
                    <Label htmlFor="comp-s" className="text-[10px] font-black uppercase cursor-pointer">कॉम्प्युटर आहे का?</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-muted/10 p-2 rounded-lg">
                    <Checkbox id="ups-s" checked={formData.upsInverterAvailable} onCheckedChange={(v) => setFormData({...formData, upsInverterAvailable: !!v})} />
                    <Label htmlFor="ups-s" className="text-[10px] font-black uppercase cursor-pointer">UPS / इनव्हर्टर आहे का?</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-muted/10 p-2 rounded-lg">
                    <Checkbox id="solar-s" checked={formData.solarAvailable} onCheckedChange={(v) => setFormData({...formData, solarAvailable: !!v})} />
                    <Label htmlFor="solar-s" className="text-[10px] font-black uppercase cursor-pointer">सोलर उपलब्ध आहे का?</Label>
                  </div>
                </div>

                <div className="col-span-2 space-y-1 mt-2"><Label className="text-[9px] uppercase font-black">गाव स्पर्धा</Label><Input value={formData.competition} onChange={e => setFormData({...formData, competition: e.target.value})} className="h-9 text-xs rounded-md bg-muted/20 border-none" /></div>
                <div className="col-span-2 space-y-1"><Label className="text-[9px] uppercase font-black">अतिरिक्त टिप</Label><Input value={formData.additionalInfo} onChange={e => setFormData({...formData, additionalInfo: e.target.value})} className="h-9 text-xs rounded-md bg-muted/20 border-none" /></div>

                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between"><Label className="text-[9px] font-black uppercase">साहित्य यादी</Label><Button variant="outline" size="sm" onClick={handleAddEquipmentRow} className="h-6 text-[8px] font-black rounded px-2">जोडा</Button></div>
                  <div className="space-y-1.5">
                    {formData.equipment.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-1 items-center bg-muted/10 p-1.5 rounded-md">
                        <Input value={item.name} onChange={e => updateEquipmentItem(item.id, {name: e.target.value})} className="col-span-7 h-7 text-[10px] px-2 bg-white border-none" placeholder="उदा. कॅन" />
                        <Input type="number" value={item.quantity} onChange={e => updateEquipmentItem(item.id, {quantity: Number(e.target.value)})} className="col-span-3 h-7 text-[10px] px-0 text-center bg-white border-none" />
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveEquipmentRow(item.id)} className="col-span-2 h-6 w-6 text-destructive"><X className="h-3 w-3" /></Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-3 border-t bg-muted/5 gap-2 flex flex-row shrink-0 justify-end">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="font-black h-9 text-[11px] px-5 rounded-lg">रद्द</Button>
            <Button onClick={handleSaveSupplier} className="font-black h-9 text-[11px] px-8 rounded-lg">जतन करा (Save)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
