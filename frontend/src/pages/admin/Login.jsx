import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Loader2 } from "lucide-react";
import Logo from "../../components/Logo";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useToast } from "../../hooks/use-toast";
import api from "../../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email: email.trim(), password });
      localStorage.setItem("hireme_token", data.access_token);
      localStorage.setItem("hireme_admin", JSON.stringify(data.user));
      toast({ title: "Welcome back!", description: "Logged in as Super Admin." });
      navigate("/admin/dashboard");
    } catch (err) {
      toast({
        title: "Login failed",
        description: err?.response?.data?.detail || "Invalid email or password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[#2c0eee] relative overflow-hidden">
        <div className="absolute -top-20 -right-16 h-72 w-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-10 h-80 w-80 bg-[#f61d25]/20 rounded-full blur-3xl" />
        <Logo light />
        <div className="relative">
          <h2 className="font-head text-4xl font-bold text-white leading-tight">Super Admin Control Center</h2>
          <p className="mt-4 text-white/80 max-w-md">Manage masters, companies, candidates and jobs across the HireMe platform from one powerful dashboard.</p>
        </div>
        <p className="relative text-white/60 text-sm">© 2026 HireMe Jobs. All rights reserved.</p>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-[#f6f7fb]">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center"><Logo /></div>
          <div className="inline-flex items-center gap-2 text-sm font-medium text-[#2c0eee] bg-[#2c0eee]/10 px-3 py-1.5 rounded-full">
            <ShieldCheck className="h-4 w-4" /> Secure Admin Login
          </div>
          <h1 className="mt-5 font-head text-3xl font-bold text-[#111]">Sign in to your account</h1>
          <p className="mt-2 text-gray-500">Enter your credentials to access the admin panel.</p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <Label htmlFor="email" className="text-gray-700">Email address</Label>
              <div className="mt-1.5 relative">
                <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hireme.in" className="pl-10 h-12" />
              </div>
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <div className="mt-1.5 relative">
                <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input id="password" type={show ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" className="pl-10 pr-10 h-12" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 bg-[#2c0eee] hover:bg-[#2408c9] text-white font-semibold text-base">
              {loading ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Signing in…</> : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-sm text-gray-500 bg-white border border-gray-100 rounded-xl p-4">
            <p className="font-medium text-gray-700">Demo credentials</p>
            <p className="mt-1">Email: <span className="text-[#2c0eee] font-medium">admin@hireme.in</span></p>
            <p>Password: <span className="text-[#2c0eee] font-medium">admin123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
