
"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Supplier, Route } from "@/lib/types"
import { Plus, Search, MapPin, Phone, Info, Milk, User, ChevronRight } from "lucide-react"
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
    milkQuality: "A Grade",
    competition: "",
    additionalInfo: "",
    cowQty: "0",
    cowFat: "0",
    cowSnf: "0",
    bufQty: "0",
    bufFat: "0",
    bufSnf: "0"
  })

  useEffect(() => {
    setMounted(true)
    const storedRoutes = JSON.parse(localStorage.getItem('procurepal_routes') || '[]')
    const storedSupps = JSON.parse(localStorage.getItem('procurepal_suppliers') || '[]')
    
    const currentRoute = storedRoutes.find((r: Route) => r.id === routeId)
    setRoute(currentRoute || null)
    
    const routeSuppliers = storedSupps.filter((s: Supplier) => s.routeId === routeId)
    
    if (routeSuppliers.length === 0 && routeId === "1" && storedSupps.length === 0) {
      const dummySupps: Supplier[] = [
        {
          id: "SUP-001",
          name: "Green Valley Farm",
          address: "Village North, Plot 42",
          mobile: "+91 9876543210",
          milkQuality: "A+ Grade",
          routeId: "1",
          competition: "Amul Local Collection Center",
          additionalInfo: "Preferred morning collection.",
          cowMilk: { quantity: 25, fat: 4.2, snf: 8.5 },
          buffaloMilk: { quantity: 20.5, fat: 6.8, snf: 9.0 }
        }
      ]
      setSuppliers(dummySupps)
      localStorage.setItem('procurepal_suppliers', JSON.stringify(dummySupps))
    } else {
      setSuppliers(routeSuppliers)
    }
  }, [routeId])

  const handleAddSupplier = () => {
    if (!formData.name || !formData.id) return

    const newSupplier: Supplier = {
      id: formData.id,
      name: formData.name,
      address: formData.address,
      mobile: formData.mobile,
      milkQuality: formData.milkQuality,
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
      }
    }

    const allSupps = JSON.parse(localStorage.getItem('procurepal_suppliers') || '[]')
    const updatedAllSupps = [...allSupps, newSupplier]
    localStorage.setItem('procurepal_suppliers', JSON.stringify(updatedAllSupps))
    
    setSuppliers(updatedAllSupps.filter(s => s.routeId === routeId))
    setIsAddingSupplier(false)
    setFormData({
      name: "", id: "", address: "", mobile: "", milkQuality: "A Grade", competition: "", additionalInfo: "",
      cowQty: "0", cowFat: "0", cowSnf: "0", bufQty: "0", bufFat: "0", bufSnf: "0"
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
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Supplier</DialogTitle>
                    <DialogDescription>Register a new supplier to this collection route.</DialogDescription>
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
                        <Label>Quality Grade</Label>
                        <Select value={formData.milkQuality} onValueChange={v => setFormData({...formData, milkQuality: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+ Grade">A+ Grade</SelectItem>
                            <SelectItem value="A Grade">A Grade</SelectItem>
                            <SelectItem value="B Grade">B Grade</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Address</Label>
                      <Input placeholder="Village, Plot, Sector" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Label className="text-primary font-bold">Cow Milk Metrics</Label>
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
                        <Label className="text-amber-600 font-bold">Buffalo Milk Metrics</Label>
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

                    <div className="space-y-2">
                      <Label>Village Competition</Label>
                      <Input placeholder="Other Dairies" value={formData.competition} onChange={e => setFormData({...formData, competition: e.target.value})} />
                    </div>

                    <div className="space-y-2">
                      <Label>Additional Notes</Label>
                      <Input placeholder="Preferred collection time, special requirements etc." value={formData.additionalInfo} onChange={e => setFormData({...formData, additionalInfo: e.target.value})} />
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
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Supplier ID: {selectedSupplier.id}</p>
                  </div>
                  <div className="flex gap-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-700 font-bold px-4 py-1.5 text-xs uppercase tracking-wider border-none">
                      {selectedSupplier.milkQuality}
                    </Badge>
                    <Badge variant="secondary" className="bg-primary/10 text-primary font-bold px-4 py-1.5 text-xs uppercase tracking-wider border-none">
                      {((selectedSupplier.cowMilk?.quantity || 0) + (selectedSupplier.buffaloMilk?.quantity || 0)).toFixed(1)} Total Liters
                    </Badge>
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
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      VILLAGE COMPETITION
                    </h4>
                    <div className="p-4 bg-muted/20 rounded-xl border border-muted/50">
                      <p className="text-sm font-medium text-foreground">{selectedSupplier.competition || "No recorded competitors."}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">OTHER INFORMATION</h4>
                  <div className="p-5 border rounded-xl bg-background shadow-inner">
                    <p className="text-sm text-muted-foreground leading-relaxed italic">{selectedSupplier.additionalInfo || "No special instructions provided."}</p>
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
