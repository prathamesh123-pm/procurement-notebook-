"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { 
  UserCircle, 
  Save, 
  IdCard, 
  ShieldCheck, 
  Upload, 
  Trash2, 
  Maximize2, 
  X, 
  Image as ImageIcon 
} from "lucide-react"
import Image from "next/image"

export default function ProfilePage() {
  const [name, setName] = useState("")
  const [employeeId, setEmployeeId] = useState("")
  const [photo, setPhoto] = useState<string | null>(null)
  const [isFullView, setIsFullView] = useState(false)
  const [mounted, setMounted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    const savedName = localStorage.getItem('procurenote_user_name') || ""
    const savedId = localStorage.getItem('procurenote_user_id') || ""
    setName(savedName)
    setEmployeeId(savedId)
    const storedPhoto = localStorage.getItem('procurenote_permission_photo')
    if (storedPhoto) setPhoto(storedPhoto)
  }, [])

  const handleSaveProfile = () => {
    localStorage.setItem('procurenote_user_name', name)
    localStorage.setItem('procurenote_user_id', employeeId)
    toast({ title: "प्रोफाईल जतन केली", description: "यशस्वीरित्या सेव्ह झाली." })
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "मोठी फाईल", description: "५ एमबी पेक्षा कमी फोटो निवडा.", variant: "destructive" })
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setPhoto(base64String)
        localStorage.setItem('procurenote_permission_photo', base64String)
        toast({ title: "फोटो जतन केला", description: "यशस्वीरित्या अपलोड झाला." })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDeletePhoto = () => {
    if (confirm("हटवायचे आहे का?")) {
      setPhoto(null)
      localStorage.removeItem('procurenote_permission_photo')
      toast({ title: "फोटो हटवला", description: "काढून टाकला आहे." })
    }
  }

  if (!mounted) return null

  return (
    <div className="space-y-4 max-w-4xl mx-auto w-full pb-10">
      <div className="flex flex-col gap-0.5 px-2">
        <h2 className="text-xl font-headline font-black text-foreground tracking-tight flex items-center gap-2">
          <UserCircle className="h-6 w-6 text-primary" /> 
          प्रोफाईल (Profile)
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-2">
        <Card className="border shadow-none bg-white rounded-xl overflow-hidden">
          <CardHeader className="bg-primary/5 border-b py-2.5">
            <CardTitle className="text-xs font-black flex items-center gap-2 uppercase tracking-tight text-primary">
              <IdCard className="h-4 w-4" /> वैयक्तिक माहिती
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1">
              <Label className="font-black text-[9px] uppercase text-muted-foreground tracking-widest">पूर्ण नाव</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9 bg-muted/30 border-none rounded-lg font-bold text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="font-black text-[9px] uppercase text-muted-foreground tracking-widest">आयडी</Label>
              <Input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="h-9 bg-muted/30 border-none rounded-lg font-bold text-sm" />
            </div>
            <Button onClick={handleSaveProfile} className="w-full gap-2 font-black h-9 shadow-md rounded-lg text-xs">
              <Save className="h-3.5 w-3.5" /> जतन करा
            </Button>
          </CardContent>
        </Card>

        <Card className="border shadow-none bg-white rounded-xl overflow-hidden">
          <CardHeader className="bg-primary/5 border-b py-2.5">
            <CardTitle className="text-xs font-black flex items-center gap-2 uppercase tracking-tight text-primary">
              <ShieldCheck className="h-4 w-4" /> परवानगी पत्र
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex flex-col items-center justify-center min-h-[200px]">
            {photo ? (
              <div className="relative w-full max-w-[150px] group">
                <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden border-2 border-primary/20 shadow-md bg-muted">
                  <Image src={photo} alt="Auth Letter" fill className="object-contain" unoptimized />
                </div>
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" className="h-7 w-7 rounded-full shadow-sm" onClick={() => setIsFullView(true)}><Maximize2 className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="destructive" className="h-7 w-7 rounded-full shadow-sm" onClick={handleDeletePhoto}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsFullView(true)} className="w-full mt-3 h-8 text-[10px] font-black rounded-lg">पहा</Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="p-4 rounded-full bg-primary/5 border border-dashed border-primary/20"><ImageIcon className="h-8 w-8 text-muted-foreground/40" /></div>
                <Button onClick={() => fileInputRef.current?.click()} size="sm" className="gap-2 font-black rounded-lg px-6 h-8 text-[10px]">निवडा</Button>
              </div>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
          </CardContent>
        </Card>
      </div>

      {isFullView && photo && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4">
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white h-10 w-10 rounded-full" onClick={() => setIsFullView(false)}><X className="h-6 w-6" /></Button>
          <div className="relative w-full h-full max-w-4xl max-h-[90vh]">
            <Image src={photo} alt="Permission Full View" fill className="object-contain" unoptimized />
          </div>
        </div>
      )}
    </div>
  )
}