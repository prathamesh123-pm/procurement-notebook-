
"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Supplier, Route } from "@/lib/types"
import { Plus, Search, MapPin, Phone, Info, Milk, User, ChevronRight, Scale, Thermometer, Truck, Package, ShieldCheck, Calendar as CalendarIcon } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RouteDetailsPage() {
  const params = useParams()
  const routeId = params.id as string

  const [route, setRoute] = useState<Route | null>(null)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const [isAddingSupplier, setIsAddingSupplier] = useState(false)

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
    iceQuantity: "0",
    scaleBrand: "",
    fatMachineBrand: "",
    collectionType: "Route",
    cattleFeedBrand: "",
    fssaiNumber: "",
    fssaiExpiry: ""
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

  const handleAddSupplier = () => {
    if (!formData.name || !formData.id) return

    const newSupplier: Supplier = {
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
      iceQuantity: Number(formData.iceQuantity),
      scaleBrand: formData.scaleBrand,
      fatMachineBrand: formData.fatMachineBrand,
      collectionType: formData.collectionType,
      cattleFeedBrand: formData.cattleFeedBrand,
      fssaiNumber: formData.fssaiNumber,
      fssaiExpiry: formData.fssaiExpiry
    }

    const allSupps = JSON.parse(localStorage.getItem('procurepal_suppliers') || '[]')
    const updatedAllSupps = [...allSupps, newSupplier]
    localStorage.setItem('procurepal_suppliers', JSON.stringify(updatedAllSupps))
    
    setSuppliers(updatedAllSupps.filter(s => s.routeId === routeId))
    setIsAddingSupplier(false)
    setFormData({
      name: "", id: "", address: "", mobile: "", competition: "", additionalInfo: "",
      cowQty: "0", cowFat: "0", cowSnf: "0", bufQty: "0", bufFat: "0", bufSnf: "0",
      iceQuantity: "0", scaleBrand: "", fatMachineBrand: "", collectionType: "Route", cattleFeedBrand: "",
      fssaiNumber: "", fssaiExpiry: ""
    })
  }

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [suppliers, searchQuery])

  if (!mounted) return null

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-headline font-bold text-foreground tracking-tight">Route Details</h2>
        <p className="text-muted-foreground font-medium">Managing Path ID: {routeId}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        <Card className="lg:col-span-4 border-none shadow-sm flex flex-col overflow-hidden bg-white">
          <CardHeader className="flex-none p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">Suppliers</CardTitle>
              
              <Dialog open={isAddingSupplier} onOpenChange={setIsAddingSupplier}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8 gap-1 font-bold">
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Supplier</DialogTitle>
                    <DialogDescription>Register a new supplier with FSSAI, equipment, and collection details.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Supplier Name</Label>
                        <Input placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Supplier ID (Code)</Label>
                        <Input placeholder="e.g. SUP-005" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Mobile Number</Label>
                        <Input placeholder="+91" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Collection Type</Label>
                        <Select value={formData.collectionType} onValueChange={v => setFormData({...formData, collectionType: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Route">Route</SelectItem>
                            <SelectItem value="Center">Center</SelectItem>
                            <SelectItem value="Both">Both</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>FSSAI License Number</Label>
                        <Input placeholder="14-digit number" value={formData.fssaiNumber} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>FSSAI Expiry Date</Label>
                        <Input type="date" value={formData.fssaiExpiry} onChange={e => setFormData({...formData, fssaiExpiry: e.target.value})} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Address</Label>
                      <Input placeholder="Village, Plot, Sector" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Label className="text-primary font-bold flex items-center gap-2">
                          <Milk className="h-4 w-4" /> Cow Milk Metrics
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[10px]">QTY</Label>
                            <Input type="number" step="0.1" value={formData.cowQty} onChange={e => setFormData({...formData, cowQty: e.target.value})} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">FAT</Label>
                            <Input type="number" step="0.1" value={formData.cowFat} onChange={e => setFormData({...formData, cowFat: e.target.value})} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">SNF</Label>
                            <Input type="number" step="0.1" value={formData.cowSnf} onChange={e => setFormData({...formData, cowSnf: e.target.value})} />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-amber-600 font-bold flex items-center gap-2">
                          <Milk className="h-4 w-4" /> Buffalo Milk Metrics
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[10px]">QTY</Label>
                            <Input type="number" step="0.1" value={formData.bufQty} onChange={e => setFormData({...formData, bufQty: e.target.value})} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">FAT</Label>
                            <Input type="number" step="0.1" value={formData.bufFat} onChange={e => setFormData({...formData, bufFat: e.target.value})} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px]">SNF</Label>
                            <Input type="number" step="0.1" value={formData.bufSnf} onChange={e => setFormData({...formData, bufSnf: e.target.value})} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Scale className="h-4 w-4" /> Weighing Scale Brand
                        </Label>
                        <Input placeholder="e.g. Avery, Essae" value={formData.scaleBrand} onChange={e => setFormData({...formData, scaleBrand: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4" /> Fat Machine Brand
                        </Label>
                        <Input placeholder="e.g. Milkotester" value={formData.fatMachineBrand} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Package className="h-4 w-4" /> Ice Quantity Given
                        </Label>
                        <Input type="number" placeholder="in kg" value={formData.iceQuantity} onChange={e => setFormData({...formData, iceQuantity: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Truck className="h-4 w-4" /> Cattle Feed Brand
                        </Label>
                        <Input placeholder="Brand used by supplier" value={formData.cattleFeedBrand} onChange={e => setFormData({...formData, cattleFeedBrand: e.target.value})} />
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Village Competition</Label>
                        <Input placeholder="Other Dairies" value={formData.competition} onChange={e => setFormData({...formData, competition: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Additional Notes</Label>
                        <Input placeholder="Special requirements etc." value={formData.additionalInfo} onChange={e => setFormData({...formData, additionalInfo: e.target.value})} />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddingSupplier(false)}>Cancel</Button>
                    <Button onClick={handleAddSupplier}>Save Supplier</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                placeholder="Filter suppliers..." 
                className="pl-8 h-8 text-xs bg-muted/30" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full">
              <div className="divide-y">
                {filteredSuppliers.map(s => (
                  <div 
                    key={s.id}
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${selectedSupplier?.id === s.id ? 'bg-primary/5 border-l-4 border-primary' : 'border-l-4 border-transparent'}`}
                    onClick={() => setSelectedSupplier(s)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{s.name}</h4>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-bold">SUP ID: {s.id}</p>
                      </div>
                      <ChevronRight className={`h-4 w-4 transition-colors ${selectedSupplier?.id === s.id ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-1 flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 shrink-0" /> {s.address}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-8 border-none shadow-sm flex flex-col overflow-hidden bg-white">
          {selectedSupplier ? (
            <ScrollArea className="flex-1">
              <CardContent className="p-8 space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-bold font-headline text-foreground tracking-tight">{selectedSupplier.name}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Supplier ID: {selectedSupplier.id}</p>
                      <Badge variant="outline" className="text-[10px] uppercase">{selectedSupplier.collectionType || 'Route'}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary font-bold px-4 py-1.5 text-xs uppercase tracking-wider border-none">
                      {((selectedSupplier.cowMilk?.quantity || 0) + (selectedSupplier.buffaloMilk?.quantity || 0)).toFixed(1)} Total Liters
                    </Badge>
                    {selectedSupplier.fssaiNumber && (
                      <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-md border border-green-100">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        FSSAI: {selectedSupplier.fssaiNumber}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-5">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                      CONTACT DETAILS
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-50">
                          <Phone className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Mobile Number</p>
                          <p className="text-sm font-semibold text-foreground">{selectedSupplier.mobile}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-50">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Address</p>
                          <p className="text-sm font-semibold text-foreground">{selectedSupplier.address}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                      FSSAI COMPLIANCE
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="p-3 bg-muted/20 rounded-lg border flex items-center justify-between">
                        <div>
                          <Label className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">License No.</Label>
                          <p className="text-sm font-bold">{selectedSupplier.fssaiNumber || "Not Registered"}</p>
                        </div>
                        <ShieldCheck className="h-5 w-5 text-green-600 opacity-50" />
                      </div>
                      <div className="p-3 bg-muted/20 rounded-lg border flex items-center justify-between">
                        <div>
                          <Label className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">Expiry Date</Label>
                          <p className="text-sm font-bold">{selectedSupplier.fssaiExpiry || "N/A"}</p>
                        </div>
                        <CalendarIcon className="h-5 w-5 text-amber-600 opacity-50" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-5">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      EQUIPMENT & OPERATIONS
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted/20 rounded-lg border">
                        <Label className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">Scale Brand</Label>
                        <p className="text-sm font-bold flex items-center gap-2">
                          <Scale className="h-3.5 w-3.5 text-muted-foreground" /> {selectedSupplier.scaleBrand || "N/A"}
                        </p>
                      </div>
                      <div className="p-3 bg-muted/20 rounded-lg border">
                        <Label className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">Fat Machine</Label>
                        <p className="text-sm font-bold flex items-center gap-2">
                          <Thermometer className="h-3.5 w-3.5 text-muted-foreground" /> {selectedSupplier.fatMachineBrand || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      ADDITIONAL ASSETS
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                        <Label className="text-[9px] uppercase font-bold text-primary block mb-1">Ice Quantity</Label>
                        <p className="text-sm font-bold flex items-center gap-2">
                          <Package className="h-3.5 w-3.5 text-primary" /> {selectedSupplier.iceQuantity || 0} kg
                        </p>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <Label className="text-[9px] uppercase font-bold text-amber-700 block mb-1">Cattle Feed</Label>
                        <p className="text-sm font-bold flex items-center gap-2">
                          <Truck className="h-3.5 w-3.5 text-amber-700" /> {selectedSupplier.cattleFeedBrand || "Not Set"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-5">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      VILLAGE COMPETITION
                    </h4>
                    <div className="p-4 bg-muted/20 rounded-xl border border-muted/50">
                      <p className="text-sm font-medium text-foreground">{selectedSupplier.competition || "No recorded competitors."}</p>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">OTHER INFORMATION</h4>
                    <div className="p-5 border rounded-xl bg-background shadow-inner">
                      <p className="text-sm text-muted-foreground leading-relaxed italic">{selectedSupplier.additionalInfo || "No special instructions provided."}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                      <Milk className="h-3.5 w-3.5 text-primary" /> COW MILK METRICS
                    </h4>
                    <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/40 hover:bg-muted/40 border-none">
                            <TableHead className="h-10 py-0 font-bold text-[10px] uppercase tracking-wider">QTY</TableHead>
                            <TableHead className="h-10 py-0 font-bold text-[10px] uppercase tracking-wider">FAT</TableHead>
                            <TableHead className="h-10 py-0 font-bold text-[10px] uppercase tracking-wider">SNF</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="hover:bg-transparent border-none">
                            <TableCell className="py-4 font-bold text-lg">{selectedSupplier.cowMilk?.quantity || 0}L</TableCell>
                            <TableCell className="py-4 font-bold text-lg">{selectedSupplier.cowMilk?.fat || 0}%</TableCell>
                            <TableCell className="py-4 font-bold text-lg">{selectedSupplier.cowMilk?.snf || 0}%</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                      <Milk className="h-3.5 w-3.5 text-amber-600" /> BUFFALO MILK METRICS
                    </h4>
                    <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/40 hover:bg-muted/40 border-none">
                            <TableHead className="h-10 py-0 font-bold text-[10px] uppercase tracking-wider">QTY</TableHead>
                            <TableHead className="h-10 py-0 font-bold text-[10px] uppercase tracking-wider">FAT</TableHead>
                            <TableHead className="h-10 py-0 font-bold text-[10px] uppercase tracking-wider">SNF</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="hover:bg-transparent border-none">
                            <TableCell className="py-4 font-bold text-lg text-amber-900">{selectedSupplier.buffaloMilk?.quantity || 0}L</TableCell>
                            <TableCell className="py-4 font-bold text-lg text-amber-900">{selectedSupplier.buffaloMilk?.fat || 0}%</TableCell>
                            <TableCell className="py-4 font-bold text-lg text-amber-900">{selectedSupplier.buffaloMilk?.snf || 0}%</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </ScrollArea>
          ) : (
            <div className="flex-1 flex items-center justify-center p-12 text-center flex-col gap-5">
              <div className="p-6 rounded-full bg-muted/30">
                <User className="h-16 w-16 text-muted-foreground/20" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-xl text-foreground tracking-tight">No Supplier Selected</h4>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">Select a supplier from the list on the left to view metrics and contact details.</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
