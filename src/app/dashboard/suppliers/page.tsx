
"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Supplier, Route } from "@/lib/types"
import { Plus, Search, Filter, Phone, MapPin, MoreVertical, Trash2, Edit3, Milk } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function SuppliersPage() {
  const searchParams = useSearchParams()
  const initialRouteFilter = searchParams.get('route') || 'all'

  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [routeFilter, setRouteFilter] = useState(initialRouteFilter)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  // Form state
  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: "", address: "", mobile: "", milkQuantity: 0, milkQuality: "", routeId: ""
  })

  useEffect(() => {
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
    const newSupp: Supplier = {
      ...formData as Supplier,
      id: crypto.randomUUID(),
    }
    const updatedSuppliers = [...suppliers, newSupp]
    saveSuppliers(updatedSuppliers)
    
    // Update route supplier IDs if route is selected
    if (newSupp.routeId) {
      const updatedRoutes = routes.map(r => 
        r.id === newSupp.routeId ? { ...r, supplierIds: [...r.supplierIds, newSupp.id] } : r
      )
      setRoutes(updatedRoutes)
      localStorage.setItem('procurepal_routes', JSON.stringify(updatedRoutes))
    }

    setIsAdding(false)
    setFormData({ name: "", address: "", mobile: "", milkQuantity: 0, milkQuality: "", routeId: "" })
  }

  const handleUpdateSupplier = () => {
    if (!selectedSupplier) return
    const updated = suppliers.map(s => s.id === selectedSupplier.id ? { ...s, ...formData } : s)
    saveSuppliers(updated)
    setIsEditing(false)
    setSelectedSupplier(null)
  }

  const deleteSupplier = (id: string) => {
    saveSuppliers(suppliers.filter(s => s.id !== id))
    // Also remove from route associations
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground">Supplier Management</h2>
          <p className="text-muted-foreground mt-1">Detailed profiles and route assignments for all dairy suppliers.</p>
        </div>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Supplier Profile</DialogTitle>
              <DialogDescription>Enter primary contact and milk production details.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Supplier Name</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Mobile Number</Label>
                <Input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address</Label>
                <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Daily Milk Qty (Liters)</Label>
                <Input type="number" value={formData.milkQuantity} onChange={e => setFormData({...formData, milkQuantity: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Milk Quality Grade</Label>
                <Select value={formData.milkQuality} onValueChange={val => setFormData({...formData, milkQuality: val})}>
                  <SelectTrigger><SelectValue placeholder="Select Grade" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+ Premium</SelectItem>
                    <SelectItem value="A">A Standard</SelectItem>
                    <SelectItem value="B">B Average</SelectItem>
                    <SelectItem value="C">C Needs Monitoring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Assign to Route</Label>
                <Select value={formData.routeId} onValueChange={val => setFormData({...formData, routeId: val})}>
                  <SelectTrigger><SelectValue placeholder="Select Route" /></SelectTrigger>
                  <SelectContent>
                    {routes.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddSupplier}>Add Profile</Button>
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
              <TableHead>Quantity (L)</TableHead>
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
                  <TableCell className="font-medium">{supp.milkQuantity}</TableCell>
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
                  No suppliers found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Supplier Details: {selectedSupplier?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
               <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                  <MapPin className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <Label className="text-[10px] text-muted-foreground uppercase">Address</Label>
                    <p className="text-sm font-medium">{selectedSupplier?.address}</p>
                  </div>
               </div>
               <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                  <Phone className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <Label className="text-[10px] text-muted-foreground uppercase">Mobile Number</Label>
                    <p className="text-sm font-medium">{selectedSupplier?.mobile}</p>
                  </div>
               </div>
               <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                  <Milk className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <Label className="text-[10px] text-muted-foreground uppercase">Milk Production</Label>
                    <p className="text-sm font-medium">{selectedSupplier?.milkQuantity} Liters/Day ({selectedSupplier?.milkQuality} Grade)</p>
                  </div>
               </div>
            </div>
            
            <div className="space-y-4 border-l pl-6">
               <h4 className="text-sm font-bold font-headline uppercase text-muted-foreground">Update Profile</h4>
               <div className="space-y-2">
                  <Label className="text-xs">Daily Milk Qty</Label>
                  <Input type="number" value={formData.milkQuantity} onChange={e => setFormData({...formData, milkQuantity: Number(e.target.value)})} />
               </div>
               <div className="space-y-2">
                  <Label className="text-xs">Quality Grade</Label>
                  <Select value={formData.milkQuality} onValueChange={val => setFormData({...formData, milkQuality: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+ Premium</SelectItem>
                      <SelectItem value="A">A Standard</SelectItem>
                      <SelectItem value="B">B Average</SelectItem>
                      <SelectItem value="C">C Needs Monitoring</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <Label className="text-xs">Change Route</Label>
                  <Select value={formData.routeId} onValueChange={val => setFormData({...formData, routeId: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {routes.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
               </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Close</Button>
            <Button onClick={handleUpdateSupplier}>Update Information</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
