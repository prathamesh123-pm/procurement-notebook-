"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { 
  Warehouse, Plus, Search, MapPin, User, Phone, 
  Trash2, Edit, Scale, Thermometer, Laptop, 
  Battery, Sun, Package, Info, ChevronRight, Hash
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { CollectionCenter, Route } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function CentersPage() {
  const [centers, setCenters] = useState<CollectionCenter[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedCenter, setSelectedCenter] = useState<CollectionCenter | null>(null)
  
  const { toast } = useToast()

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    operatorName: "",
    mobile: "",
    village: "",
    weighingScaleBrand: "",
    fatMachineBrand: "",
    milkCansCount: "0",
    computerAvailable: false,
    upsInverterAvailable: false,
    solarAvailable: false,
    chemicalsStock: "",
    batteryCondition: ""
  })

  useEffect(() => {
    setMounted(true)
    const storedCenters = JSON.parse(localStorage.getItem('procurepal_centers') || '[]')
    const storedRoutes = JSON.parse(localStorage.getItem('procurepal_routes') || '[]')
    setCenters(storedCenters)
    setRoutes(storedRoutes)
  }, [])

  const handleOpenAdd = () => {
    setDialogMode('add')
    setEditingId(null)
    setFormData({
      name: "", code: "", operatorName: "", mobile: "", village: "",
      weighingScaleBrand: "", fatMachineBrand: "", milkCansCount: "0",
      computerAvailable: false, upsInverterAvailable: false, solarAvailable: false,
      chemicalsStock: "", batteryCondition: ""
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (center: CollectionCenter) => {
    setDialogMode('edit')
    setEditingId(center.id)
    setFormData({
      name: center.name,
      code: center.code,
      operatorName: center.operatorName,
      mobile: center.mobile,
      village: center.village,
      weighingScaleBrand: center.material.weighingScaleBrand || "",
      fatMachineBrand: center.material.fatMachineBrand || "",
      milkCansCount: String(center.material.milkCansCount || 0),
      computerAvailable: !!center.material.computerAvailable,
      upsInverterAvailable: !!center.material.upsInverterAvailable,
      solarAvailable: !!center.material.solarAvailable,
      chemicalsStock: center.material.chemicalsStock || "",
      batteryCondition: center.material.batteryCondition || ""
    })
    setIsDialogOpen(true)
  }

  const handleSaveCenter = () => {
    if (!formData.name || !formData.code) {
      toast({ title: "त्रुटी", description: "नाव आणि कोड भरणे आवश्यक आहे.", variant: "destructive" })
      return
    }

    const centerData: CollectionCenter = {
      id: editingId || crypto.randomUUID(),
      name: formData.name,
      code: formData.code,
      operatorName: formData.operatorName,
      mobile: formData.mobile,
      village: formData.village,
      material: {
        weighingScaleBrand: formData.weighingScaleBrand,
        fatMachineBrand: formData.fatMachineBrand,
        milkCansCount: Number(formData.milkCansCount),
        computerAvailable: formData.computerAvailable,
        upsInverterAvailable: formData.upsInverterAvailable,
        solarAvailable: formData.solarAvailable,
        chemicalsStock: formData.chemicalsStock,
        batteryCondition: formData.batteryCondition
      }
    }

    let updatedCenters: CollectionCenter[]
    if (dialogMode === 'add') {
      updatedCenters = [...centers, centerData]
      toast({ title: "यशस्वी", description: "नवीन केंद्र जोडले गेले." })
    } else {
      updatedCenters = centers.map(c => c.id === editingId ? centerData : c)
      toast({ title: "यशस्वी", description: "केंद्राची माहिती अद्ययावत केली." })
    }

    setCenters(updatedCenters)
    localStorage.setItem('procurepal_centers', JSON.stringify(updatedCenters))
    if (selectedCenter?.id === centerData.id) setSelectedCenter(centerData)
    setIsDialogOpen(false)
  }

  const handleDeleteCenter = (id: string) => {
    if (!confirm("तुम्हाला खात्री आहे की हे केंद्र हटवायचा आहे?")) return
    const updated = centers.filter(c => c.id !== id)
    setCenters(updated)
    localStorage.setItem('procurepal_centers', JSON.stringify(updated))
    if (selectedCenter?.id === id) setSelectedCenter(null)
    toast({ title: "हटवले", description: "केंद्राची माहिती काढून टाकली." })
  }

  const filteredCenters = centers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.village.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!mounted) return null

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-0">
        <div>
          <h2 className="text-3xl font-headline font-bold text-foreground flex items-center gap-3">
            <Warehouse className="h-8 w-8 text-primary" /> संकलन केंद्र (Collection Centers)
          </h2>
          <p className="text-muted-foreground font-medium">केंद्राची माहिती आणि उपलब्ध साहित्याची नोंद ठेवा.</p>
        </div>
        <Button onClick={handleOpenAdd} className="font-bold h-11 px-8 gap-2">
          <Plus className="h-5 w-5" /> केंद्र जोडा
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List */}
        <Card className="lg:col-span-4 border-none shadow-sm bg-white overflow-hidden flex flex-col h-[700px]">
          <CardHeader className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="केंद्र किंवा गाव शोधा..." 
                className="pl-10 bg-muted/30 border-none" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="divide-y">
              {filteredCenters.map(center => (
                <div 
                  key={center.id}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors flex justify-between items-center group ${selectedCenter?.id === center.id ? 'bg-primary/5 border-l-4 border-primary' : 'border-l-4 border-transparent'}`}
                  onClick={() => setSelectedCenter(center)}
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-foreground truncate">{center.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[9px] uppercase font-bold py-0 h-4">{center.code}</Badge>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase truncate flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5" /> {center.village}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
              {filteredCenters.length === 0 && (
                <div className="p-8 text-center text-muted-foreground italic text-xs">एकही केंद्र सापडले नाही.</div>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Right Details */}
        <Card className="lg:col-span-8 border-none shadow-sm bg-white min-h-[700px]">
          {selectedCenter ? (
            <CardContent className="p-6 sm:p-10 space-y-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold font-headline text-foreground tracking-tight">{selectedCenter.name}</h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="outline" className="font-bold border-primary text-primary px-3">CODE: {selectedCenter.code}</Badge>
                    <span className="text-sm font-bold text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-primary" /> {selectedCenter.village}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 no-print">
                  <Button variant="outline" size="sm" className="font-bold gap-2" onClick={() => handleOpenEdit(selectedCenter)}>
                    <Edit className="h-4 w-4" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" className="font-bold gap-2" onClick={() => handleDeleteCenter(selectedCenter.id)}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Basic Info */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <User className="h-3.5 w-3.5" /> ऑपरेटर माहिती (Operator Info)
                  </h4>
                  <div className="space-y-4 bg-muted/20 p-5 rounded-xl border">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-full bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <Label className="text-[9px] uppercase font-bold text-muted-foreground">नाव (Operator Name)</Label>
                        <p className="text-sm font-bold">{selectedCenter.operatorName || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-full bg-primary/10">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <Label className="text-[9px] uppercase font-bold text-muted-foreground">संपर्क (Contact)</Label>
                        <p className="text-sm font-bold">{selectedCenter.mobile || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Material Summary */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <Package className="h-3.5 w-3.5" /> साहित्य सारांश (Material Summary)
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-center ${selectedCenter.material.computerAvailable ? 'bg-green-50 border-green-200' : 'bg-muted/30 opacity-60'}`}>
                      <Laptop className={`h-6 w-6 ${selectedCenter.material.computerAvailable ? 'text-green-600' : 'text-muted-foreground'}`} />
                      <span className="text-[10px] font-bold uppercase">Computer</span>
                    </div>
                    <div className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-center ${selectedCenter.material.upsInverterAvailable ? 'bg-green-50 border-green-200' : 'bg-muted/30 opacity-60'}`}>
                      <Battery className={`h-6 w-6 ${selectedCenter.material.upsInverterAvailable ? 'text-green-600' : 'text-muted-foreground'}`} />
                      <span className="text-[10px] font-bold uppercase">Inverter</span>
                    </div>
                    <div className={`p-4 rounded-xl border flex flex-col items-center gap-2 text-center ${selectedCenter.material.solarAvailable ? 'bg-green-50 border-green-200' : 'bg-muted/30 opacity-60'}`}>
                      <Sun className={`h-6 w-6 ${selectedCenter.material.solarAvailable ? 'text-green-600' : 'text-muted-foreground'}`} />
                      <span className="text-[10px] font-bold uppercase">Solar</span>
                    </div>
                    <div className="p-4 rounded-xl border bg-blue-50 border-blue-200 flex flex-col items-center gap-2 text-center">
                      <Package className="h-6 w-6 text-blue-600" />
                      <span className="text-[10px] font-bold uppercase">{selectedCenter.material.milkCansCount || 0} Cans</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Detailed Material Info */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">मटेरिअल तपशील (Detailed Material Info)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2"><Scale className="h-4 w-4" /> वजन काटा (Scale)</span>
                        <Badge>{selectedCenter.material.weighingScaleBrand || "N/A"}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2"><Thermometer className="h-4 w-4" /> फॅट मशीन (Fat Machine)</span>
                        <Badge variant="secondary">{selectedCenter.material.fatMachineBrand || "N/A"}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2"><Info className="h-4 w-4" /> केमिकल स्टॉक (Chemicals)</span>
                        <span className="text-sm font-bold">{selectedCenter.material.chemicalsStock || "N/A"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2"><Battery className="h-4 w-4" /> बॅटरी कंडिशन (Battery)</span>
                        <span className="text-sm font-bold">{selectedCenter.material.batteryCondition || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-12 text-center gap-5">
              <div className="p-8 rounded-full bg-muted/20">
                <Warehouse className="h-20 w-20 text-muted-foreground/20" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-foreground">केंद्र निवडा (Select Center)</h4>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">मटेरिअल आणि केंद्राची माहिती पाहण्यासाठी डावीकडील यादीतून एक केंद्र निवडा.</p>
              </div>
              <Button onClick={handleOpenAdd} variant="outline" className="font-bold border-primary text-primary">
                नवीन केंद्र जोडा
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white">
          <DialogHeader className="p-6 bg-primary/5 border-b">
            <DialogTitle className="text-xl font-bold font-headline">{dialogMode === 'add' ? 'नवीन केंद्र जोडा' : 'केंद्राची माहिती अपडेट करा'}</DialogTitle>
            <DialogDescription className="font-medium">केंद्राचा तपशील आणि मटेरिअल इन्व्हेंटरी भरा.</DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-8">
              {/* Section 1: Basic Info */}
              <div className="space-y-5">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                   <Info className="h-3.5 w-3.5" /> १) केंद्राची प्राथमिक माहिती
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">केंद्राचे नाव (Center Name)</Label>
                    <Input placeholder="उदा. रामपूर संकलन केंद्र" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-10 bg-muted/30 border-none" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">केंद्र कोड (Center Code)</Label>
                    <Input placeholder="उदा. C-101" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="h-10 bg-muted/30 border-none" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">ऑपरेटरचे नाव</Label>
                    <Input placeholder="पूर्ण नाव" value={formData.operatorName} onChange={e => setFormData({...formData, operatorName: e.target.value})} className="h-10 bg-muted/30 border-none" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">मोबाईल नंबर</Label>
                    <Input placeholder="+91" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="h-10 bg-muted/30 border-none" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-bold uppercase">गाव (Village/Address)</Label>
                    <Input placeholder="केंद्राचे ठिकाण" value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} className="h-10 bg-muted/30 border-none" />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Section 2: Materials */}
              <div className="space-y-5">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                   <Package className="h-3.5 w-3.5" /> २) मटेरिअल तपशील (Material List)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase flex items-center gap-2"><Scale className="h-3.5 w-3.5" /> वजन काटा ब्रँड</Label>
                      <Input placeholder="उदा. Essae, Avery" value={formData.weighingScaleBrand} onChange={e => setFormData({...formData, weighingScaleBrand: e.target.value})} className="h-9 bg-muted/20" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase flex items-center gap-2"><Thermometer className="h-3.5 w-3.5" /> फॅट मशीन ब्रँड</Label>
                      <Input placeholder="उदा. Milkotester" value={formData.fatMachineBrand} onChange={e => setFormData({...formData, fatMachineBrand: e.target.value})} className="h-9 bg-muted/20" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase flex items-center gap-2"><Package className="h-3.5 w-3.5" /> कॅन्सची संख्या (Milk Cans)</Label>
                      <Input type="number" value={formData.milkCansCount} onChange={e => setFormData({...formData, milkCansCount: e.target.value})} className="h-9 bg-muted/20" />
                    </div>
                  </div>
                  
                  <div className="space-y-5 pt-2">
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/20">
                      <Checkbox id="comp" checked={formData.computerAvailable} onCheckedChange={(v) => setFormData({...formData, computerAvailable: !!v})} />
                      <Label htmlFor="comp" className="text-xs font-bold cursor-pointer flex items-center gap-2"><Laptop className="h-4 w-4" /> कॉम्प्युटर उपलब्ध आहे?</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/20">
                      <Checkbox id="ups" checked={formData.upsInverterAvailable} onCheckedChange={(v) => setFormData({...formData, upsInverterAvailable: !!v})} />
                      <Label htmlFor="ups" className="text-xs font-bold cursor-pointer flex items-center gap-2"><Battery className="h-4 w-4" /> इन्व्हर्टर/UPS उपलब्ध आहे?</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/20">
                      <Checkbox id="solar" checked={formData.solarAvailable} onCheckedChange={(v) => setFormData({...formData, solarAvailable: !!v})} />
                      <Label htmlFor="solar" className="text-xs font-bold cursor-pointer flex items-center gap-2"><Sun className="h-4 w-4" /> सोलर प्लेट उपलब्ध आहे?</Label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">केमिकल स्टॉक स्थिती</Label>
                    <Input placeholder="उदा. ५ लिटर उपलब्ध" value={formData.chemicalsStock} onChange={e => setFormData({...formData, chemicalsStock: e.target.value})} className="h-9 bg-muted/20" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase">बॅटरी कंडिशन</Label>
                    <Input placeholder="उदा. चांगली, जुनी" value={formData.batteryCondition} onChange={e => setFormData({...formData, batteryCondition: e.target.value})} className="h-9 bg-muted/20" />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 border-t bg-muted/5 gap-3">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="font-bold h-10 px-8">रद्द करा</Button>
            <Button onClick={handleSaveCenter} className="font-bold h-10 px-10 shadow-sm">माहिती जतन करा</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
