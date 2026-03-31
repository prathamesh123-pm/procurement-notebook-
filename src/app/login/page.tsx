
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Milk, LogIn, UserPlus, ShieldCheck, Mail, Lock, Loader2 } from "lucide-react"
import { useAuth, useUser, initiateEmailSignIn, initiateEmailSignUp } from "@/firebase"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { user, isUserLoading } = useUser()
  const auth = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/dashboard')
    }
  }, [user, isUserLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({ title: "त्रुटी", description: "ईमेल आणि पासवर्ड भरा.", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      if (isLogin) {
        initiateEmailSignIn(auth, email, password)
      } else {
        initiateEmailSignUp(auth, email, password)
      }
      // The actual redirect is handled by the useEffect above when user state changes
    } catch (error: any) {
      toast({ title: "त्रुटी", description: error.message, variant: "destructive" })
      setLoading(false)
    }
  }

  if (isUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">तपासणी होत आहे...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 animate-in fade-in duration-700">
      <Card className="w-full max-w-[400px] border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
        <CardHeader className="bg-primary text-white p-8 text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner">
            <Milk className="h-10 w-10 text-white" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-black uppercase tracking-tight">संकलन नोंदवही</CardTitle>
            <CardDescription className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em]">Management Dashboard</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">ईमेल (Email)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com" 
                  className="h-12 pl-10 rounded-xl bg-slate-50 border-none font-bold text-sm shadow-inner focus-visible:ring-primary"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">पासवर्ड (Password)</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="h-12 pl-10 rounded-xl bg-slate-50 border-none font-bold text-sm shadow-inner focus-visible:ring-primary"
                />
              </div>
            </div>
            
            <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 mt-4">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (isLogin ? <LogIn className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />)}
              {isLogin ? 'प्रवेश करा (LOGIN)' : 'नोंदणी करा (REGISTER)'}
            </Button>
          </form>

          <div className="relative flex items-center gap-2 py-2">
            <div className="h-[1px] flex-1 bg-slate-100" />
            <span className="text-[8px] font-black text-slate-300 uppercase">किंवा</span>
            <div className="h-[1px] flex-1 bg-slate-100" />
          </div>

          <Button 
            variant="ghost" 
            onClick={() => setIsLogin(!isLogin)} 
            className="w-full text-[10px] font-black text-primary hover:bg-primary/5 uppercase tracking-widest h-10 rounded-xl"
          >
            {isLogin ? 'नवीन खाते तयार करा' : 'माझे आधीच खाते आहे'}
          </Button>

          <div className="text-center">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-tight flex items-center justify-center gap-1">
              <ShieldCheck className="h-2.5 w-2.5" /> सुरक्षित संकलन व्यवस्थापन प्रणाली
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
