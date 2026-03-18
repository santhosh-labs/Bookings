import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowRight, Loader2, Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const bgUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  organizationName: z.string().optional(),
});

export default function AuthPage({ isLogin = true }: { isLogin?: boolean }) {
  const navigate = useNavigate();
  const { login, register, user } = useAuth();
  
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const form = useForm({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      organizationName: ""
    }
  });

  if (user) {
    return null;
  }

  const onSubmit = async (data: any) => {
    try {
      if (isLogin) {
        await login.mutateAsync(data);
      } else {
        await register.mutateAsync(data);
      }
      navigate("/");
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  const isLoading = login.isPending || register.isPending;

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left side Form */}
      <div className="w-full lg:w-[480px] xl:w-[560px] flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24">
        <div className="w-full max-w-sm mx-auto">
          <div className="flex items-center gap-2 font-display font-bold text-2xl text-primary mb-12">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-lg">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            Appointify
          </div>
          
          <h1 className="text-3xl font-display font-bold tracking-tight mb-2">
            {isLogin ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-muted-foreground mb-8 text-sm">
            {isLogin 
              ? "Enter your details to access your dashboard." 
              : "Start managing your appointments beautifully today."}
          </p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input {...form.register("name")} required placeholder="John Doe" className="h-12 rounded-xl" />
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Email</Label>
              <Input {...form.register("email")} type="email" required placeholder="name@example.com" className="h-12 rounded-xl" />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label>Organization Name</Label>
                <Input {...form.register("organizationName")} placeholder="Acme Corp" className="h-12 rounded-xl" />
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Password</Label>
                {isLogin && <a href="#" className="text-xs text-primary font-medium hover:underline">Forgot?</a>}
              </div>
              <Input {...form.register("password")} type="password" required className="h-12 rounded-xl" />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 mt-2">
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isLogin ? "Sign In" : "Sign Up"}
              {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Link to={isLogin ? "/register" : "/login"} className="text-primary font-semibold hover:underline">
              {isLogin ? "Sign up" : "Log in"}
            </Link>
          </div>
        </div>
      </div>

      {/* Right side Image Cover */}
      <div className="hidden lg:block flex-1 relative bg-muted">
        <div className="absolute inset-0 bg-primary/20 mix-blend-multiply z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10" />
        <img 
          src={bgUrl} 
          alt="Abstract background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-12 left-12 right-12 z-20">
          <Card className="bg-background border-border p-8 rounded-xl shadow-2xl">
            <h3 className="font-display text-2xl font-bold mb-2">"Appointify changed how we work."</h3>
            <p className="text-muted-foreground">Our clients love the seamless booking experience, and our team saves 10+ hours a week on scheduling ping-pong.</p>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-sm">Sarah Jenkins</p>
                <p className="text-xs text-muted-foreground">Founder, StyleStudio</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
