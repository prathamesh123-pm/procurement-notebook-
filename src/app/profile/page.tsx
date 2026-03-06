"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { UserCircle, Save, IdCard } from "lucide-react"

export default function ProfilePage() {
  const [name, setName] = useState("")
  const [employeeId, setEmployeeId] = useState("")
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    const savedName = localStorage.getItem('procurenote_user_name') || ""
    const savedId = localStorage.getItem('procurenote_user_id') || ""
    setName(savedName)
    setEmployeeId(savedId)
  }, [])

  const handleSave = () => {
    localStorage.setItem('procurenote_user_name', name)
    localStorage.setItem('procurenote_user_id', employeeId)
    toast({
      title: "प्रोफाईल जतन केली",
      description: "तुमची माहिती यशस्वीरित्या सेव्ह झाली आहे."
    })
  }

  if (!mounted) return null

  return (
    <div className="space-y-8 max-w-2xl mx-auto w-full pb-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-headline font-bold text-foreground tracking-tight flex items-center gap-3">
          <UserCircle className="h-8 w-8 text-primary" /> 
          तुमची प्रोफाईल (Your Profile)
        </h2>
        <p className="text-muted-foreground font-medium">येथे तुमची मूलभूत माहिती जतन करा जेणेकरून अहवाल भरताना ती आपोआप येईल.</p>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-primary/5 border-b">
          <CardTitle className="text-lg font-bold">वैयक्तिक माहिती (Personal Details)</CardTitle>
          <CardDescription>अहवालावर दिसणारे तुमचे नाव आणि आयडी.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="userName" className="font-bold flex items-center gap-2">
              <UserCircle className="h-4 w-4 text-primary" /> पूर्ण नाव (Full Name)
            </Label>
            <Input 
              id="userName" 
              placeholder="तुमचे पूर्ण नाव लिहा" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="h-11 bg-muted/30"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="userId" className="font-bold flex items-center gap-2">
              <IdCard className="h-4 w-4 text-primary" /> कर्मचारी आयडी (Employee ID)
            </Label>
            <Input 
              id="userId" 
              placeholder="तुमचा आयडी नंबर लिहा" 
              value={employeeId} 
              onChange={(e) => setEmployeeId(e.target.value)} 
              className="h-11 bg-muted/30"
            />
          </div>

          <Button onClick={handleSave} className="w-full gap-2 font-bold h-11 shadow-sm mt-4">
            <Save className="h-4 w-4" /> माहिती जतन करा (Save Profile)
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
