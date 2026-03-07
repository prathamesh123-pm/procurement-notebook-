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
  // Profile State
  const [name, setName] = useState("")
  const [employeeId, setEmployeeId] = useState("")
  
  // Permission Photo State
  const [photo, setPhoto] = useState<string | null>(null)
  const [isFullView, setIsFullView] = useState(false)
  const [mounted, setMounted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    // Load Profile Data
    const savedName = localStorage.getItem('procurenote_user_name') || ""
    const savedId = localStorage.getItem('procurenote_user_id') || ""
    setName(savedName)
    setEmployeeId(savedId)

    // Load Permission Photo
    const storedPhoto = localStorage.getItem('procurenote_permission_photo')
    if (storedPhoto) {
      setPhoto(storedPhoto)
    }
  }, [])

  const handleSaveProfile = () => {
    localStorage.setItem('procurenote_user_name', name)
    localStorage.setItem('procurenote_user_id', employeeId)
    toast({
      title: "प्रोफाईल जतन केली",
      description: "तुमची माहिती यशस्वीरित्या सेव्ह झाली आहे."
    })
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB Limit
        toast({
          title: "मोठी फाईल",
          description: "कृपया ५ एमबी पेक्षा कमी आकाराचा फोटो निवडा.",
          variant: "destructive"
        })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setPhoto(base64String)
        localStorage.setItem('procurenote_permission_photo', base64String)
        toast({
          title: "फोटो जतन केला",
          description: "तुमचे परवानगी पत्र यशस्वीरित्या अपलोड झाले आहे."
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDeletePhoto = () => {
    if (confirm("तुम्हाला हा फोटो हटवायचा आहे का?")) {
      setPhoto(null)
      localStorage.removeItem('procurenote_permission_photo')
      toast({
        title: "फोटो हटवला",
        description: "परवानगी पत्राचा फोटो काढून टाकला आहे."
      })
    }
  }

  if (!mounted) return null

  return (
    <div className="space-y-8 max-w-4xl mx-auto w-full pb-20">
      <div className="flex flex-col gap-1 px-2 sm:px-0">
        <h2 className="text-3xl font-headline font-bold text-foreground tracking-tight flex items-center gap-3">
          <UserCircle className="h-8 w-8 text-primary" /> 
          प्रोफाईल आणि ओळख (Profile & Identity)
        </h2>
        <p className="text-muted-foreground font-bold text-sm">येथे तुमची वैयक्तिक माहिती आणि कामाचे परवानगी पत्र जतन करा. (Manage your info & auth letter here.)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Personal Info */}
        <div className="space-y-8">
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b py-4">
              <CardTitle className="text-lg font-black flex items-center gap-2 uppercase tracking-tight text-primary">
                <IdCard className="h-5 w-5" /> वैयक्तिक माहिती (Personal Info)
              </CardTitle>
              <CardDescription className="text-xs font-bold">अहवालावर दिसणारे तुमचे नाव आणि आयडी.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="userName" className="font-black text-[10px] uppercase text-muted-foreground tracking-widest">
                  पूर्ण नाव (Full Name)
                </Label>
                <Input 
                  id="userName" 
                  placeholder="तुमचे पूर्ण नाव लिहा (Write full name)" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="h-11 bg-muted/30 border-none rounded-xl font-bold"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="userId" className="font-black text-[10px] uppercase text-muted-foreground tracking-widest">
                  कर्मचारी आयडी (Employee ID)
                </Label>
                <Input 
                  id="userId" 
                  placeholder="तुमचा आयडी नंबर लिहा (Write ID number)" 
                  value={employeeId} 
                  onChange={(e) => setEmployeeId(e.target.value)} 
                  className="h-11 bg-muted/30 border-none rounded-xl font-bold"
                />
              </div>

              <Button onClick={handleSaveProfile} className="w-full gap-2 font-black h-11 shadow-lg rounded-xl mt-4">
                <Save className="h-4 w-4" /> माहिती जतन करा (Save Profile)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Permission Letter */}
        <div className="space-y-8">
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden h-full">
            <CardHeader className="bg-primary/5 border-b py-4">
              <CardTitle className="text-lg font-black flex items-center gap-2 uppercase tracking-tight text-primary">
                <ShieldCheck className="h-5 w-5" /> परवानगी पत्र (Auth Letter)
              </CardTitle>
              <CardDescription className="text-xs font-bold">
                तुमचे अधिकृत परवानगी पत्र अपलोड करा. (Upload authorization letter.)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px]">
              {photo ? (
                <div className="relative w-full group">
                  <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border-2 border-primary/20 shadow-xl bg-muted">
                    <Image 
                      src={photo} 
                      alt="Permission Letter" 
                      fill 
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="h-9 w-9 rounded-full shadow-md"
                      onClick={() => setIsFullView(true)}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="destructive" 
                      className="h-9 w-9 rounded-full shadow-md"
                      onClick={handleDeletePhoto}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-6 flex justify-center">
                    <Button variant="outline" size="sm" onClick={() => setIsFullView(true)} className="gap-2 font-black rounded-xl border-2 px-6">
                      <Maximize2 className="h-3.5 w-3.5" /> पूर्ण स्क्रीनवर पहा
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 text-center py-10">
                  <div className="p-8 rounded-full bg-primary/5 border-2 border-dashed border-primary/20">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-black text-sm text-foreground">कोणताही फोटो अपलोड नाही</h3>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">परवानगी पत्राचा स्पष्ट फोटो निवडा. (Upload clear photo)</p>
                  </div>
                  <Button onClick={() => fileInputRef.current?.click()} size="sm" className="gap-2 font-black rounded-xl px-8 h-10 shadow-md">
                    <Upload className="h-4 w-4" /> फोटो निवडा (Upload)
                  </Button>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handlePhotoUpload} 
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full Screen View Modal */}
      {isFullView && photo && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 text-white hover:bg-white/10 h-12 w-12 rounded-full"
            onClick={() => setIsFullView(false)}
          >
            <X className="h-8 w-8" />
          </Button>
          <div className="relative w-full h-full max-w-4xl max-h-[90vh]">
            <Image 
              src={photo} 
              alt="Permission Full View" 
              fill 
              className="object-contain"
              unoptimized
            />
          </div>
          <p className="mt-4 text-white/60 font-black text-xs uppercase tracking-widest">परवानगी पत्र - {name || 'Representative'}</p>
        </div>
      )}
    </div>
  )
}
