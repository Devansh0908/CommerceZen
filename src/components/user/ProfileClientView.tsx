
"use client";

import * as React from 'react'; // Added this line
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { UserCircle, Mail, Edit3, Settings, Palette, Shield, LogIn, KeyRound, Bell, LogOut } from 'lucide-react'; // Added LogOut
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Switch } from "@/components/ui/switch"; // For mock preference

export default function ProfileClientView() {
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);


  if (isAuthLoading || !mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <UserCircle className="h-16 w-16 text-muted-foreground animate-pulse mb-4" />
        <p className="text-xl font-body text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <LogIn className="h-16 w-16 text-destructive mb-6" />
        <h2 className="text-3xl font-headline font-semibold text-primary mb-3">Access Denied</h2>
        <p className="text-lg text-muted-foreground font-body mb-8 max-w-md">
          You need to be logged in to view your profile.
        </p>
        <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-body">
          <Link href="/">Go to Login/Signup</Link>
        </Button>
      </div>
    );
  }

  if (!user) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <p className="text-lg text-muted-foreground font-body mb-8 max-w-md">
          User data not found. Please try logging in again.
        </p>
         <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-body">
          <Link href="/">Go to Login/Signup</Link>
        </Button>
      </div>
    );
  }

  const currentDisplayTheme = resolvedTheme === 'system' ? 'System Default' : (resolvedTheme === 'dark' ? 'Dark' : 'Light');

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold text-primary">Your Profile</h1>
        <p className="mt-2 text-lg text-muted-foreground font-body">Manage your account settings and preferences.</p>
      </div>

      <Card className="shadow-xl animate-subtle-fade-in">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={`https://ui-avatars.com/api/?name=${user.name.replace(' ','+')}&background=random&size=128`} alt={user.name} />
              <AvatarFallback>
                <UserCircle className="h-full w-full text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-headline text-primary">{user.name}</CardTitle>
              <CardDescription className="font-body text-md flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" /> {user.email}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
            <Button variant="outline" className="w-full sm:w-auto font-body">
                <Edit3 className="mr-2 h-4 w-4" /> Edit Profile (mock)
            </Button>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg animate-subtle-fade-in" style={{animationDelay: '0.1s'}}>
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center text-primary"><Settings className="mr-2 h-5 w-5 text-accent" />Account Settings</CardTitle>
            <CardDescription className="font-body">Manage your login and security details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="profile-email" className="font-body text-sm">Email Address</Label>
              <Input id="profile-email" type="email" value={user.email} readOnly disabled className="font-body bg-muted/50"/>
            </div>
             <div className="space-y-1">
              <Label htmlFor="profile-name" className="font-body text-sm">Full Name</Label>
              <Input id="profile-name" type="text" value={user.name} readOnly disabled className="font-body bg-muted/50"/>
            </div>
            <div>
                <Button variant="secondary" className="w-full font-body">
                    <KeyRound className="mr-2 h-4 w-4" /> Change Password (mock)
                </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg animate-subtle-fade-in" style={{animationDelay: '0.2s'}}>
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center text-primary"><Palette className="mr-2 h-5 w-5 text-accent" />Preferences</CardTitle>
            <CardDescription className="font-body">Customize your app experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-body">Dark Mode</Label>
                <p className="text-sm text-muted-foreground font-body">
                  Current theme: {currentDisplayTheme}
                </p>
              </div>
               <Button variant="outline" size="sm" onClick={() => theme === 'dark' ? useTheme().setTheme('light') : useTheme().setTheme('dark')} className="font-body">
                 Toggle Theme
               </Button>
            </div>
             <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications-switch" className="text-base font-body">Email Notifications</Label>
                 <p className="text-sm text-muted-foreground font-body">
                  Receive updates about new products and offers.
                </p>
              </div>
              <Switch id="notifications-switch" disabled aria-label="Toggle email notifications (mock)" />
            </div>
          </CardContent>
        </Card>
      </div>
       <Card className="shadow-lg animate-subtle-fade-in" style={{animationDelay: '0.3s'}}>
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center text-primary"><Shield className="mr-2 h-5 w-5 text-accent" />Security & Privacy</CardTitle>
            <CardDescription className="font-body">Review your security settings and privacy options.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="link" className="p-0 h-auto font-body text-primary hover:text-accent">Manage Data (mock)</Button>
            <Button variant="link" className="p-0 h-auto font-body text-primary hover:text-accent">Two-Factor Authentication (mock)</Button>
          </CardContent>
           <CardFooter>
             <Button variant="destructive" className="w-full sm:w-auto font-body">
                <LogOut className="mr-2 h-4 w-4" /> Delete Account (mock)
            </Button>
          </CardFooter>
        </Card>
    </div>
  );
}
