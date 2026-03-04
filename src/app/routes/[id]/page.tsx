
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

export default function RouteDetailsPage() {
  const params = useParams()
  const routeId = params.id as string

  const [route, setRoute] = useState<Route | null>(null)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storedRoutes = JSON.parse(localStorage.getItem('procurepal_routes') || '[]')
    const storedSupps = JSON.parse(localStorage.getItem('procurepal_suppliers') || '[]')
    
    const currentRoute = storedRoutes.find((r: Route) => r.id === routeId)
    setRoute(currentRoute || null)
    
    const routeSuppliers = storedSupps.filter((s: Supplier) => s.routeId === routeId)
    
    // Default demo data for the first route
    if (routeSuppliers.length === 0 && (routeId === "1" || routeId === route?.id)) {
      const dummySupps: Supplier[] = [
        {
          id: "SUP-001",
          name: "Green Valley Farm",
          address: "Village North, Plot 42",
          mobile: "+91 9876543210",
          milkQuality: "A+ Grade",
          routeId: routeId,
          competition: "Amul Local Collection Center",
          additionalInfo: "Preferred morning collection.",
          cowMilk: { quantity: 25, fat: 4.2, snf: 8.5 },
          buffaloMilk: { quantity: 20.5, fat: 6.8, snf: 9.0 }
        },
        {
          id: "SUP-002",
          name: "Sunlight Dairy",
          address: "River Bend, Sector 4",
          mobile: "+91 9988776655",
          milkQuality: "A Grade",
          routeId: routeId,
          competition: "Local Cooperative",
          additionalInfo: "Requires extra cans on Mondays.",
          cowMilk: { quantity: 15, fat: 3.8, snf: 8.2 },
          buffaloMilk: { quantity: 12, fat: 6.5, snf: 8.8 }
        }
      ]
      setSuppliers(dummySupps)
    } else {
      setSuppliers(routeSuppliers)
    }
  }, [routeId, route?.id])

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
        <h2 className="text-3xl font-headline font-bold text-foreground">Route Details</h2>
        <p className="text-muted-foreground">Managing Path ID: {routeId}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left List Panel */}
        <Card className="lg:col-span-4 border-none shadow-sm flex flex-col overflow-hidden bg-white">
          <CardHeader className="flex-none p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">Suppliers</CardTitle>
              <Button size="sm" variant="outline" className="h-8 gap-1 font-bold">
                <Plus className="h-4 w-4" /> Add
              </Button>
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
                {filteredSuppliers.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm italic">
                    No suppliers matched your search.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right Detail Panel */}
        <Card className="lg:col-span-8 border-none shadow-sm flex flex-col overflow-hidden bg-white">
          {selectedSupplier ? (
            <ScrollArea className="flex-1">
              <CardContent className="p-8 space-y-10">
                {/* Header Info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-bold font-headline text-foreground">{selectedSupplier.name}</h3>
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
                  {/* Contacts */}
                  <div className="space-y-5">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                      CONTACT DETAILS
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-[10px] text-muted-foreground flex items-center gap-2 font-bold mb-1">
                          <Phone className="h-3 w-3 text-primary" /> MOBILE NUMBER
                        </Label>
                        <p className="text-sm font-semibold text-foreground">{selectedSupplier.mobile}</p>
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground flex items-center gap-2 font-bold mb-1">
                          <MapPin className="h-3 w-3 text-primary" /> ADDRESS
                        </Label>
                        <p className="text-sm font-semibold text-foreground">{selectedSupplier.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Competition */}
                  <div className="space-y-5">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      VILLAGE COMPETITION
                    </h4>
                    <div className="p-4 bg-muted/30 rounded-lg border border-muted/50">
                      <p className="text-sm font-medium text-foreground">{selectedSupplier.competition || "No recorded competitors in this area."}</p>
                    </div>
                  </div>
                </div>

                {/* Other Info */}
                <div className="space-y-5">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">OTHER INFORMATION</h4>
                  <div className="p-5 border rounded-xl bg-background shadow-inner">
                    <p className="text-sm text-muted-foreground leading-relaxed italic">{selectedSupplier.additionalInfo || "No special instructions or notes provided."}</p>
                  </div>
                </div>

                {/* Metrics */}
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
                <h4 className="font-bold text-xl text-foreground">No Supplier Selected</h4>
                <p className="text-sm text-muted-foreground max-w-xs">Select a supplier from the list on the left to view metrics and contact details.</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
