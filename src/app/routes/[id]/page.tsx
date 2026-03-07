"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Supplier, Route } from "@/lib/types"
import { 
  Plus, Search, MapPin, Phone, Info, Milk, User, 
  Scale, Thermometer, Truck, Package, ShieldCheck, 
  Calendar as CalendarIcon, Trash2, Edit, Laptop, Battery, Sun, ChevronRight
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
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
    cowQty: "0",
    cowFat: "0",
    cowSnf: "0",
    bufQty: "0",
    bufFat: "0",
    bufSnf: "0",
    iceBlocks: "0",
    scaleBrand: "",
    fatMachineBrand: "",
    collectionType: "Route",
    cattleFeedBrand: "",
    fssaiNumber: "",
    fssaiExpiry: "",
    milkCansCount: "0",
    computerAvailable: false,
    upsInverterAvailable: false,
    solarAvailable: false
  })

  useEffect(() => {
    setMounted(true)
    const storedRoutes = JSON.parse(localStorage.getItem('procurepal_routes') || '[]')
    const storedSupps = JSON.parse(localStorage.getItem('procurepal_suppliers') || '[]')
    
    const currentRoute = storedRoutes.find((r: Route) => r.id === routeId)
    setRoute(currentRoute || null)
    
    const routeSuppliers = storedSupps.filter((s: Supplier) => s.routeId === routeId)
    setSuppliers(routeSuppliers)
  }, [routeId])

  const openAddDialog = () => {
    setDialogMode('add')
    setEditingId(null)
    setFormData({
      name: "", id: "", address: "", mobile: "", competition: "", additionalInfo: "",
      cowQty: "0", cowFat: "0", cowSnf: "0", bufQty: "0", bufFat: "0", bufSnf: "0",
      iceBlocks: "0", scaleBrand: "", fatMachineBrand: "", collectionType: "Route", cattleFeedBrand: "",
      fssaiNumber: "", fssaiExpiry: "", milkCansCount: "0",
      computerAvailable: false, upsInverterAvailable: false, solarAvailable: false
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
      scaleBrand: supplier.scaleBrand || "",
      fatMachineBrand: supplier.fatMachineBrand || "",
      collectionType: supplier.collectionType || "Route",
      cattleFeedBrand: supplier.cattleFeedBrand || "",
      fssaiNumber: supplier.fssaiNumber || "",
      fssaiExpiry: supplier.fssaiExpiry || "",
      milkCansCount: String(supplier.milkCansCount || 0),
      computerAvailable: !!supplier.computerAvailable,
      upsInverterAvailable: !!supplier.upsInverterAvailable,
      solarAvailable: !!supplier.solarAvailable
    })
    setIsDialogOpen(true)
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
      cowMilk: {
        quantity: Number(formData.cowQty),
        fat: Number(formData.cowFat),
        snf: Number(formData.cowSnf)
      },
      buffaloMilk: {
        quantity: Number(formData.bufQty),
        fat: Number(formData.bufFat),
        snf: Number(formData.bufSnf)
      },
      iceBlocks: Number(formData.iceBlocks),
      scaleBrand: formData.scaleBrand,
      fatMachineBrand: formData.fatMachineBrand,
      collectionType: formData.collectionType,
      cattleFeedBrand: formData.cattleFeedBrand,
      fssaiNumber: formData.fssaiNumber,
      fssaiExpiry: formData.fssaiExpiry,
      milkCansCount: Number(formData.milkCansCount),
      computerAvailable: formData.computerAvailable,
      upsInverterAvailable: formData.upsInverterAvailable,
      solarAvailable: formData.solarAvailable
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
    const routeSuppliers = updatedAllSupps.filter((s: Supplier) => s.routeId === routeId)
    setSuppliers(routeSuppliers)
    if (editingId === selectedSupplier?.id || formData.id === selectedSupplier?.id) {
      setSelectedSupplier(supplierData)
    }
    setIsDialogOpen(false)
  }

  const handleDeleteSupplier = (id: string) => {
    if (!confirm("तुम्हाला खात्री आहे की हा पुरवठादार हटवायचा आहे?")) return

    const allSupps = JSON.parse(localStorage.getItem('procurepal_suppliers') || '[]')
    const updatedAllSupps = allSupps.filter((s: Supplier) => s.id !== id)
    localStorage.setItem('procurepal_suppliers', JSON.stringify(updatedAllSupps))
    
    setSuppliers(updatedAllSupps.filter((s: Supplier) => s.routeId === routeId))
    if (selectedSupplier?.id === id) setSelectedSupplier(null)
    toast({ title: "हटवले", description: "पुरवठादाराची माहिती काढून टाकली गेली." })
  }

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => 
      (s.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
      (s.id?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    )
  }, [suppliers, searchQuery])

  if (!mounted) return null

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-10">
      <div className="flex flex-col gap-1 px-4 sm:px-0">
        <h2 className="text-3xl font-headline font-bold text-foreground tracking-tight">Route Details</h2>
        <p className="text-muted-foreground font-medium">Managing Path ID: {routeId}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Supplier List */}
        <Card className="lg:col-span-4 border-none shadow-sm bg-white overflow-hidden flex flex-col h-[750px]">
          <CardHeader className="p-4 pb-2 border-b bg-muted/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">Suppliers</CardTitle>
              <Button size="sm" variant="outline" className="h-8 gap-1 font-bold border-primary text-primary" onClick={openAddDialog}>
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                placeholder="Filter suppliers..." 
                className="pl-8 h-8 text-xs bg-muted/30 border-none" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="divide-y">
              {filteredSuppliers.map(s => (
                <div 
                  key={s.id}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors flex justify-between items-center ${selectedSupplier?.id === s.id ? 'bg-primary/5 border-l-4 border-primary' : 'border-l-4 border-transparent'}`}
                  onClick={() => setSelectedSupplier(s)}
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-foreground truncate">{s.name}</h4>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-bold">Code: {s.id}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50" />
                </div>
              ))}
              {filteredSuppliers.length === 0 && (
                <div className="p-8 text-center text-muted-foreground italic text-xs">एकही पुरवठादार सापडला नाही.</div>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Right Panel: Detailed View */}
        <Card className="lg:col-span-8 border-none shadow-sm bg-white min-h-[750px]">
          {selectedSupplier ? (
            <ScrollArea className="h-[750px]">
              <CardContent className="p-6 sm:p-10 space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold font-headline text-foreground tracking-tight">{selectedSupplier.name}</h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">ID: {selectedSupplier.id}</p>
                      <Badge variant="secondary" className="bg-primary/10 text-primary font-bold px-3 py-0.5 text-[10px] uppercase tracking-wider border-none">
                        TYPE: {selectedSupplier.collectionType || 'Route'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 no-print">
                    <Button variant="outline" size="sm" className="font-bold gap-2" onClick={() => openEditDialog(selectedSupplier)}>
                      <Edit className="h-4 w-4" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" className="font-bold gap-2" onClick={() => handleDeleteSupplier(selectedSupplier.id)}>
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Contacts */}
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                      <User className="h-3.5 w-3.5" /> संपर्क माहिती (Contact Details)
                    </h4>
                    <div className="space-y-4 bg-muted/20 p-5 rounded-xl border">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-full bg-primary/10">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <Label className="text-[9px] uppercase font-bold text-muted-foreground">मोबाईल</Label>
                          <p className="text-sm font-bold">{selectedSupplier.mobile || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-full bg-primary/10">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <Label className="text-[9px] uppercase font-bold text-muted-foreground">पत्ता</Label>
                          <p className="text-sm font-bold">{selectedSupplier.address || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FSSAI & Compliance */}
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5" /> परवाना आणि नियम (FSSAI)
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="p-4 rounded-xl border flex items-center justify-between bg-green-50/50">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="h-5 w-5 text-green-600" />
                          <div>
                            <Label className="text-[9px] uppercase font-bold text-muted-foreground">FSSAI License</Label>
                            <p className="text-sm font-bold">{selectedSupplier.fssaiNumber || "नोटीस दिलेली नाही"}</p>
                          </div>
                        </div>
                        {selectedSupplier.fssaiExpiry && (
                          <Badge variant="outline" className="text-[9px] border-green-200 text-green-700">Expires: {selectedSupplier.fssaiExpiry}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Milk Metrics Section */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <Milk className="h-3.5 w-3.5" /> उत्पादन आकडेवारी (Milk Metrics)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-primary/5 p-2 px-4 border-b font-bold text-[10px] uppercase flex items-center gap-2">
                        <Milk className="h-3 w-3 text-primary" /> Cow Milk (गाय दूध)
                      </div>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="py-2 text-xs font-bold text-muted-foreground">Quantity</TableCell>
                            <TableCell className="py-2 text-sm font-bold">{selectedSupplier.cowMilk?.quantity || 0} L</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="py-2 text-xs font-bold text-muted-foreground">FAT / SNF</TableCell>
                            <TableCell className="py-2 text-sm font-bold">{selectedSupplier.cowMilk?.fat || 0}% / {selectedSupplier.cowMilk?.snf || 0}%</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                    <div className="border rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-amber-50 p-2 px-4 border-b font-bold text-[10px] uppercase flex items-center gap-2 text-amber-700">
                        <Milk className="h-3 w-3" /> Buffalo Milk (म्हेस दूध)
                      </div>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="py-2 text-xs font-bold text-muted-foreground">Quantity</TableCell>
                            <TableCell className="py-2 text-sm font-bold text-amber-900">{selectedSupplier.buffaloMilk?.quantity || 0} L</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="py-2 text-xs font-bold text-muted-foreground">FAT / SNF</TableCell>
                            <TableCell className="py-2 text-sm font-bold text-amber-900">{selectedSupplier.buffaloMilk?.fat || 0}% / {selectedSupplier.buffaloMilk?.snf || 0}%</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>

                {/* Material & Equipment Summary */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <Package className="h-3.5 w-3.5" /> पुरवलेले साहित्य (Materials / Point Inventory)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-center ${selectedSupplier.computerAvailable ? 'bg-green-50 border-green-200' : 'bg-muted/30 opacity-60'}`}>
                      <Laptop className={`h-6 w-6 ${selectedSupplier.computerAvailable ? 'text-green-600' : 'text-muted-foreground'}`} />
                      <span className="text-[10px] font-bold uppercase">Computer</span>
                    </div>
                    <div className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-center ${selectedSupplier.upsInverterAvailable ? 'bg-green-50 border-green-200' : 'bg-muted/30 opacity-60'}`}>
                      <Battery className={`h-6 w-6 ${selectedSupplier.upsInverterAvailable ? 'text-green-600' : 'text-muted-foreground'}`} />
                      <span className="text-[10px] font-bold uppercase">UPS</span>
                    </div>
                    <div className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-center ${selectedSupplier.solarAvailable ? 'bg-green-50 border-green-200' : 'bg-muted/30 opacity-60'}`}>
                      <Sun className={`h-6 w-6 ${selectedSupplier.solarAvailable ? 'text-green-600' : 'text-muted-foreground'}`} />
                      <span className="text-[10px] font-bold uppercase">Solar</span>
                    </div>
                    <div className="p-4 rounded-xl border bg-blue-50 border-blue-200 flex flex-col items-center gap-2 text-center">
                      <Package className="h-6 w-6 text-blue-600" />
                      <span className="text-[10px] font-bold uppercase">{selectedSupplier.milkCansCount || 0} Cans</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border rounded-xl space-y-3 bg-muted/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2"><Scale className="h-4 w-4" /> वजन काटा (Scale)</span>
                        <Badge variant="outline" className="border-primary text-primary">{selectedSupplier.scaleBrand || "N/A"}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2"><Thermometer className="h-4 w-4" /> फॅट मशीन (Fat Machine)</span>
                        <Badge variant="outline" className="border-primary text-primary">{selectedSupplier.fatMachineBrand || "N/A"}</Badge>
                      </div>
                    </div>
                    <div className="p-4 border rounded-xl space-y-3 bg-muted/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2"><Truck className="h-4 w-4" /> पशुखाद्य (Feed)</span>
                        <span className="text-sm font-bold">{selectedSupplier.cattleFeedBrand || "N/A"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2"><Package className="h-4 w-4" /> बर्फाच्या लाद्या (Ice)</span>
                        <Badge variant="secondary" className="font-bold">{selectedSupplier.iceBlocks || 0}</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">इतर विशेष माहिती</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 border rounded-xl bg-primary/5">
                      <Label className="text-[9px] uppercase font-bold text-primary block mb-1">गाव स्पर्धा (Competition)</Label>
                      <p className="text-sm italic">{selectedSupplier.competition || "माहिती उपलब्ध नाही."}</p>
                    </div>
                    <div className="p-4 border rounded-xl bg-muted/5">
                      <Label className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">अतिरिक्त टिप्पणी (Additional Notes)</Label>
                      <p className="text-sm">{selectedSupplier.additionalInfo || "कोणतीही विशेष टीप नाही."}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center p-12 text-center flex-col gap-5 h-[750px]">
              <div className="p-10 rounded-full bg-muted/30">
                <User className="h-20 w-20 text-muted-foreground/20" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-xl text-foreground tracking-tight">पुरवठादार निवडा (Select Supplier)</h4>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">सविस्तर माहिती, दूध आकडेवारी आणि साहित्याची नोंद पाहण्यासाठी डावीकडील यादीतून एक नाव निवडा.</p>
              </div>
              <Button onClick={openAddDialog} variant="outline" className="font-bold border-primary text-primary mt-4">
                नवीन पुरवठादार जोडा
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white">
          <DialogHeader className="p-6 bg-primary/5 border-b">
            <DialogTitle className="text-xl font-bold font-headline">{dialogMode === 'add' ? 'नवीन पुरवठादार जोडा' : 'पुरवठादार माहिती अपडेट करा'}</DialogTitle>
            <DialogDescription className="font-medium">पुरवठादाराचा तपशील, दूध आकडेवारी आणि साहित्याची माहिती भरा.</DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-10">
              {/* Section 1: Basic Info */}
              <div className="space-y-5">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                   <Info className="h-4 w-4" /> १) प्राथमिक माहिती (Basic Info)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">पुरवठादाराचे नाव (Supplier Name)</Label>
                    <Input placeholder="पूर्ण नाव" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-10 bg-muted/30 border-none" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">कोड नंबर (Supplier Code/ID)</Label>
                    <Input placeholder="उदा. 443/44" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="h-10 bg-muted/30 border-none" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">मोबाईल नंबर</Label>
                    <Input placeholder="+91" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-10 bg-muted/30 border-none" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">संकलन प्रकार (Collection Type)</Label>
                    <Select value={formData.collectionType} onValueChange={v => setFormData({...formData, collectionType: v})}>
                      <SelectTrigger className="h-10 bg-muted/30 border-none"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Route">रूट (Route)</SelectItem>
                        <SelectItem value="Center">सेंटर (Center)</SelectItem>
                        <SelectItem value="Both">दोन्ही (Both)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-bold uppercase">पत्ता (Address)</Label>
                    <Input placeholder="गाव, तालुका, जिल्हा" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-10 bg-muted/30 border-none" />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Section 2: FSSAI & Compliance */}
              <div className="space-y-5">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                   <ShieldCheck className="h-4 w-4" /> २) परवाना माहिती (FSSAI Compliance)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">FSSAI नंबर</Label>
                    <Input placeholder="14-अंकी नंबर" value={formData.fssaiNumber} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} className="h-10 bg-muted/30 border-none" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">मुदत संपण्याची तारीख (Expiry)</Label>
                    <Input type="date" value={formData.fssaiExpiry} onChange={e => setFormData({...formData, fssaiExpiry: e.target.value})} className="h-10 bg-muted/30 border-none" />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Section 3: Milk Metrics */}
              <div className="space-y-5">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                   <Milk className="h-4 w-4" /> ३) दूध आकडेवारी (Milk Metrics)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4 p-4 border rounded-xl bg-blue-50/30">
                    <Label className="text-xs font-bold uppercase text-primary">गाय दूध (Cow Milk)</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-bold">Qty (L)</Label>
                        <Input type="number" step="0.1" value={formData.cowQty} onChange={e => setFormData({...formData, cowQty: e.target.value})} className="bg-white h-9" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-bold">Fat (%)</Label>
                        <Input type="number" step="0.1" value={formData.cowFat} onChange={e => setFormData({...formData, cowFat: e.target.value})} className="bg-white h-9" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-bold">SNF (%)</Label>
                        <Input type="number" step="0.1" value={formData.cowSnf} onChange={e => setFormData({...formData, cowSnf: e.target.value})} className="bg-white h-9" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 p-4 border rounded-xl bg-amber-50/30">
                    <Label className="text-xs font-bold uppercase text-amber-700">म्हैस दूध (Buffalo Milk)</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-bold">Qty (L)</Label>
                        <Input type="number" step="0.1" value={formData.bufQty} onChange={e => setFormData({...formData, bufQty: e.target.value})} className="bg-white h-9" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-bold">Fat (%)</Label>
                        <Input type="number" step="0.1" value={formData.bufFat} onChange={e => setFormData({...formData, bufFat: e.target.value})} className="bg-white h-9" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-bold">SNF (%)</Label>
                        <Input type="number" step="0.1" value={formData.bufSnf} onChange={e => setFormData({...formData, bufSnf: e.target.value})} className="bg-white h-9" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Section 4: Equipment & Materials */}
              <div className="space-y-5">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                   <Package className="h-4 w-4" /> ४) साहित्य आणि मटेरिअल (Inventory)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase flex items-center gap-2"><Scale className="h-4 w-4" /> वजन काटा ब्रँड</Label>
                      <Input placeholder="उदा. Essae, Avery" value={formData.scaleBrand} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} className="h-10 bg-muted/20" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase flex items-center gap-2"><Thermometer className="h-4 w-4" /> फॅट मशीन ब्रँड</Label>
                      <Input placeholder="उदा. Milkotester" value={formData.fatMachineBrand} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-10 bg-muted/20" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase flex items-center gap-2"><Package className="h-4 w-4" /> कॅन्सची संख्या (Milk Cans)</Label>
                      <Input type="number" value={formData.milkCansCount} onChange={e => setFormData({...formData, milkCansCount: e.target.value})} className="h-10 bg-muted/20" />
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-1">
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/10 border">
                      <Checkbox id="comp" checked={formData.computerAvailable} onCheckedChange={(v) => setFormData({...formData, computerAvailable: !!v})} />
                      <Label htmlFor="comp" className="text-xs font-bold cursor-pointer flex items-center gap-2"><Laptop className="h-4 w-4" /> कॉम्प्युटर उपलब्ध आहे?</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/10 border">
                      <Checkbox id="ups" checked={formData.upsInverterAvailable} onCheckedChange={(v) => setFormData({...formData, upsInverterAvailable: !!v})} />
                      <Label htmlFor="ups" className="text-xs font-bold cursor-pointer flex items-center gap-2"><Battery className="h-4 w-4" /> इन्व्हर्टर/UPS उपलब्ध आहे?</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/10 border">
                      <Checkbox id="solar" checked={formData.solarAvailable} onCheckedChange={(v) => setFormData({...formData, solarAvailable: !!v})} />
                      <Label htmlFor="solar" className="text-xs font-bold cursor-pointer flex items-center gap-2"><Sun className="h-4 w-4" /> सोलर प्लेट उपलब्ध आहे?</Label>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Section 5: Logistics & Competition */}
              <div className="space-y-5">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                   <Truck className="h-4 w-4" /> ५) लॉजिस्टिक आणि इतर (Logistics)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase flex items-center gap-2">बर्फाचे प्रमाण (Ice Blocks)</Label>
                      <Input type="number" value={formData.iceBlocks} onChange={e => setFormData({...formData, iceBlocks: e.target.value})} className="h-10 bg-muted/20" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase flex items-center gap-2">पशुखाद्य ब्रँड (Cattle Feed)</Label>
                      <Input placeholder="ब्रँडचे नाव" value={formData.cattleFeedBrand} onChange={e => setFormData({...formData, cattleFeedBrand: e.target.value})} className="h-10 bg-muted/20" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase">गाव स्पर्धा (Competition)</Label>
                      <Input placeholder="इतर संकलन केंद्र" value={formData.competition} onChange={e => setFormData({...formData, competition: e.target.value})} className="h-10 bg-muted/20" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase">अतिरिक्त टिप्पणी (Additional Notes)</Label>
                      <Input placeholder="काही विशेष माहिती..." value={formData.additionalInfo} onChange={e => setFormData({...formData, additionalInfo: e.target.value})} className="h-10 bg-muted/20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 border-t bg-muted/5 gap-3">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="font-bold h-11 px-8">रद्द करा</Button>
            <Button onClick={handleSaveSupplier} className="font-bold h-11 px-12 shadow-md">माहिती जतन करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
