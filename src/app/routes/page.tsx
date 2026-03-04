
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Route } from "@/lib/types"
import { Plus, MapPin, Truck, Users, IndianRupee, Trash2, ArrowRight, Edit } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import Link from "next/link"

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [isAddingRoute, setIsAddingRoute] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const [formData, setFormData] = useState({ 
    name: "", 
    distanceKm: "", 
    vehicle: "", 
    costPerKm: "",
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
          supplierIds: Array(24).fill(null).map(() => crypto.randomUUID())
        },
        {
          id: "2",
          name: "Eastern Valley Loop",
          vehicle: "Tata Ace",
          distanceKm: 32,
          costPerKm: 0.75,
          supplierIds: Array(18).fill(null).map(() => crypto.randomUUID())
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

  const handleAddRoute = () => {
    if (!formData.name || !formData.distanceKm || !formData.vehicle) return
    const newRoute: Route = {
      id: crypto.randomUUID(),
      name: formData.name,
      distanceKm: Number(formData.distanceKm),
      vehicle: formData.vehicle,
      costPerKm: Number(formData.costPerKm) || 0,
      supplierIds: Array(Number(formData.initialSuppliers)).fill(null).map(() => crypto.randomUUID())
    }
    saveRoutes([...routes, newRoute])
    setFormData({ name: "", distanceKm: "", vehicle: "", costPerKm: "", initialSuppliers: "0" })
    setIsAddingRoute(false)
  }

  const deleteRoute = (id: string) => {
    saveRoutes(routes.filter(r => r.id !== id))
  }

  if (!mounted) return null

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground">Milk Collection Routes</h2>
          <p className="text-muted-foreground mt-1">The logistics, costing, and supplier associations.</p>
        </div>
        <Dialog open={isAddingRoute} onOpenChange={setIsAddingRoute}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-sm font-bold">
              <Plus className="h-4 w-4" /> Add Route
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Procurement Route</DialogTitle>
              <DialogDescription>Add a new collection route to the network.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="routeName">Route Name</Label>
                <Input 
                  id="routeName" 
                  placeholder="e.g. Main Highway Loop" 
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
                    placeholder="40" 
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
                  placeholder="e.g. Tata Ace" 
                  value={formData.vehicle}
                  onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="initialSuppliers">Initial Suppliers</Label>
                <Input 
                  id="initialSuppliers" 
                  type="number"
                  placeholder="0" 
                  value={formData.initialSuppliers}
                  onChange={(e) => setFormData({...formData, initialSuppliers: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingRoute(false)}>Cancel</Button>
              <Button onClick={handleAddRoute} className="font-bold">Save Route</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {routes.map((route) => (
          <Card key={route.id} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteRoute(route.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="mt-4 font-headline text-xl font-bold">{route.name}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <Truck className="h-3 w-3" /> {route.vehicle}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">{route.supplierIds.length} Active Suppliers</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">{route.distanceKm} km</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <IndianRupee className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">Rate: ₹{route.costPerKm.toFixed(2)} / km</span>
              </div>
            </CardContent>
            <CardFooter className="pt-2 border-t">
               <Button variant="ghost" size="sm" className="w-full justify-between text-primary font-bold group" asChild>
                  <Link href={`/routes/${route.id}`}>
                    Manage Suppliers <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
               </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
