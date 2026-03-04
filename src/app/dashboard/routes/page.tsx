
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Route } from "@/lib/types"
import { Plus, MapPin, Truck, Users, Trash2, Edit2, IndianRupee } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [isAddingRoute, setIsAddingRoute] = useState(false)
  const [formData, setFormData] = useState({ name: "", distanceKm: "", vehicle: "", costPerKm: "" })

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('procurepal_routes') || '[]')
    setRoutes(stored)
  }, [])

  const saveRoutes = (updated: Route[]) => {
    setRoutes(updated)
    localStorage.setItem('procurepal_routes', JSON.stringify(updated))
  }

  const handleAddRoute = () => {
    if (!formData.name || !formData.distanceKm || !formData.vehicle) return
    const newRoute: Route = {
      id: crypto.randomUUID(),
      name: formData.name,
      distanceKm: Number(formData.distanceKm),
      vehicle: formData.vehicle,
      costPerKm: Number(formData.costPerKm) || 0,
      supplierIds: []
    }
    saveRoutes([...routes, newRoute])
    setFormData({ name: "", distanceKm: "", vehicle: "", costPerKm: "" })
    setIsAddingRoute(false)
  }

  const deleteRoute = (id: string) => {
    saveRoutes(routes.filter(r => r.id !== id))
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground">Milk Collection Routes</h2>
          <p className="text-muted-foreground mt-1">Configure and manage your milk collection network.</p>
        </div>
        <Dialog open={isAddingRoute} onOpenChange={setIsAddingRoute}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" /> New Route
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Procurement Route</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="routeName">Route Name</Label>
                <Input 
                  id="routeName" 
                  placeholder="e.g. North-West Village Path" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="distance">Distance (km)</Label>
                  <Input 
                    id="distance" 
                    type="number" 
                    placeholder="45" 
                    value={formData.distanceKm}
                    onChange={(e) => setFormData({...formData, distanceKm: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost per KM (₹)</Label>
                  <Input 
                    id="cost" 
                    type="number" 
                    step="0.01"
                    placeholder="0.85" 
                    value={formData.costPerKm}
                    onChange={(e) => setFormData({...formData, costPerKm: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle">Assigned Vehicle</Label>
                <Input 
                  id="vehicle" 
                  placeholder="e.g. Eicher 10.90" 
                  value={formData.vehicle}
                  onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingRoute(false)}>Cancel</Button>
              <Button onClick={handleAddRoute}>Save Route</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {routes.length > 0 ? (
          routes.map((route) => (
            <Card key={route.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteRoute(route.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="mt-4 font-headline text-xl">{route.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <IndianRupee className="h-3 w-3" /> {route.costPerKm} per KM
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="h-4 w-4" />
                  <span>{route.vehicle}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{route.supplierIds.length} Active Suppliers</span>
                </div>
                <div className="mt-4 bg-muted/30 p-2 rounded-md text-center">
                  <span className="text-2xl font-bold text-foreground">{route.distanceKm}</span>
                  <span className="text-xs text-muted-foreground ml-1 font-medium">KM TOTAL</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2 border-t flex gap-2">
                 <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={`/dashboard/suppliers?route=${route.id}`}>Manage Suppliers</a>
                 </Button>
                 <Button variant="ghost" size="sm" className="text-primary">Edit</Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
             <MapPin className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
             <h3 className="text-xl font-medium">No routes defined</h3>
             <p className="text-muted-foreground">Start by adding your first collection route.</p>
          </div>
        )}
      </div>
    </div>
  )
}
