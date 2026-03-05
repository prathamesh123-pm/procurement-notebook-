"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Route } from "@/lib/types"
import { Plus, MapPin, Truck, Users, IndianRupee, Trash2, ArrowRight, Edit, IceCream } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentRouteId, setCurrentRouteId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({ 
    name: "", 
    distanceKm: "", 
    vehicle: "", 
    costPerKm: "",
    iceBlocks: "0",
    initialSuppliers: "0" 
  })

  useEffect(() => {
    setMounted(true)
    const stored = JSON.parse(localStorage.getItem('procurepal_routes') || '[]')
    if (stored.length === 0) {
      const initialRoutes: Route[] = [
        {
          id: "1",
          name: "North-West Village Path",
          vehicle: "Eicher 10.90",
          distanceKm: 45,
          costPerKm: 0.85,
          iceBlocks: 10,
          supplierIds: Array(24).fill(null).map(() => Math.random().toString(36).substring(7))
        },
        {
          id: "2",
          name: "Eastern Valley Loop",
          vehicle: "Tata Ace",
          distanceKm: 32,
          costPerKm: 0.75,
          iceBlocks: 5,
          supplierIds: Array(18).fill(null).map(() => Math.random().toString(36).substring(7))
        }
      ]
      setRoutes(initialRoutes)
      localStorage.setItem('procurepal_routes', JSON.stringify(initialRoutes))
    } else {
      setRoutes(stored)
    }
  }, [])

  const saveRoutes = (updated: Route[]) => {
    setRoutes(updated)
    localStorage.setItem('procurepal_routes', JSON.stringify(updated))
  }

  const handleOpenAdd = () => {
    setIsEditing(false)
    setCurrentRouteId(null)
    setFormData({ name: "", distanceKm: "", vehicle: "", costPerKm: "", iceBlocks: "0", initialSuppliers: "0" })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (route: Route) => {
    setIsEditing(true)
    setCurrentRouteId(route.id)
    setFormData({
      name: route.name,
      distanceKm: String(route.distanceKm),
      vehicle: route.vehicle,
      costPerKm: String(route.costPerKm),
      iceBlocks: String(route.iceBlocks || 0),
      initialSuppliers: String(route.supplierIds.length)
    })
    setIsDialogOpen(true)
  }

  const handleSaveRoute = () => {
    if (!formData.name || !formData.distanceKm || !formData.vehicle) {
      toast({ title: "त्रुटी", description: "कृपया आवश्यक माहिती भरा.", variant: "destructive" })
      return
    }

    if (isEditing && currentRouteId) {
      const updatedRoutes = routes.map(r => 
        r.id === currentRouteId 
          ? { 
              ...r, 
              name: formData.name, 
              distanceKm: Number(formData.distanceKm), 
              vehicle: formData.vehicle, 
              costPerKm: Number(formData.costPerKm) || 0,
              iceBlocks: Number(formData.iceBlocks) || 0
            } 
          : r
      )
      saveRoutes(updatedRoutes)
      toast({ title: "यशस्वी", description: "रूटची माहिती अद्ययावत केली." })
    } else {
      const newRoute: Route = {
        id: Math.random().toString(36).substring(2, 9),
        name: formData.name,
        distanceKm: Number(formData.distanceKm),
        vehicle: formData.vehicle,
        costPerKm: Number(formData.costPerKm) || 0,
        iceBlocks: Number(formData.iceBlocks) || 0,
        supplierIds: Array(Number(formData.initialSuppliers)).fill(null).map(() => Math.random().toString(36).substring(7))
      }
      saveRoutes([...routes, newRoute])
      toast({ title: "यशस्वी", description: "नवीन रूट जोडला गेला." })
    }

    setIsDialogOpen(false)
  }

  const deleteRoute = (id: string) => {
    if (confirm("तुम्हाला खात्री आहे की हा रूट हटवायचा आहे?")) {
      const updated = routes.filter(r => r.id !== id)
      saveRoutes(updated)
      toast({ title: "हटवले", description: "रूट काढून टाकला आहे." })
    }
  }

  if (!mounted) return null

  return (
    <div className="space-y-8 max-w-6xl mx-auto w-full pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground tracking-tight">Milk Collection Routes</h2>
          <p className="text-muted-foreground mt-1 text-sm font-medium">The logistics, costing, and supplier associations.</p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 shadow-sm font-bold h-11 px-6">
          <Plus className="h-4 w-4" /> Add Route
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {routes.length > 0 ? (
          routes.map((route) => (
            <Card key={route.id} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleOpenEdit(route)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteRoute(route.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="mt-4 font-headline text-xl font-bold">{route.name}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1 font-medium">
                  <Truck className="h-3 w-3" /> {route.vehicle}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-4 text-sm flex-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">{(route.supplierIds?.length || 0)} Active Suppliers</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">{(route.distanceKm || 0)} km</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <IndianRupee className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">Rate: ₹{(route.costPerKm || 0).toFixed(2)} / km</span>
                </div>
                {route.iceBlocks !== undefined && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <IceCream className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">{route.iceBlocks} Ice Blocks Required</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2 border-t p-0">
                 <Button variant="ghost" size="sm" className="w-full justify-between text-primary font-bold group rounded-none h-12 px-6" asChild>
                    <Link href={`/routes/${route.id}`}>
                      Manage Suppliers <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                 </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-muted-foreground/20">
             <MapPin className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
             <h3 className="text-xl font-bold text-muted-foreground">No routes defined</h3>
             <p className="text-sm text-muted-foreground/60">Start by adding your first collection route.</p>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-headline">{isEditing ? 'Edit Procurement Route' : 'Create Procurement Route'}</DialogTitle>
            <DialogDescription className="text-xs font-medium">{isEditing ? 'रूटची माहिती बदला.' : 'नवीन कलेक्शन रूट तयार करा.'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="routeName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Route Name</Label>
              <Input 
                id="routeName" 
                placeholder="e.g. Main Highway Loop" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-muted/30 border-none h-11"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="distance" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Distance (km)</Label>
                <Input 
                  id="distance" 
                  type="number" 
                  placeholder="40" 
                  value={formData.distanceKm}
                  onChange={(e) => setFormData({...formData, distanceKm: e.target.value})}
                  className="bg-muted/30 border-none h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cost per KM (₹)</Label>
                <Input 
                  id="cost" 
                  type="number" 
                  step="0.01"
                  placeholder="0.85" 
                  value={formData.costPerKm}
                  onChange={(e) => setFormData({...formData, costPerKm: e.target.value})}
                  className="bg-muted/30 border-none h-11"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assigned Vehicle</Label>
                <Input 
                  id="vehicle" 
                  placeholder="e.g. Tata Ace" 
                  value={formData.vehicle}
                  onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                  className="bg-muted/30 border-none h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="iceBlocks" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Number of Ice Blocks</Label>
                <Input 
                  id="iceBlocks" 
                  type="number"
                  placeholder="0" 
                  value={formData.iceBlocks}
                  onChange={(e) => setFormData({...formData, iceBlocks: e.target.value})}
                  className="bg-muted/30 border-none h-11"
                />
              </div>
            </div>
            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="initialSuppliers" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Initial Suppliers (Optional)</Label>
                <Input 
                  id="initialSuppliers" 
                  type="number"
                  placeholder="0" 
                  value={formData.initialSuppliers}
                  onChange={(e) => setFormData({...formData, initialSuppliers: e.target.value})}
                  className="bg-muted/30 border-none h-11"
                />
              </div>
            )}
          </div>
          <DialogFooter className="gap-3 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="h-11 font-bold">Cancel</Button>
            <Button onClick={handleSaveRoute} className="h-11 font-bold px-8">{isEditing ? 'Update Route' : 'Save Route'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
