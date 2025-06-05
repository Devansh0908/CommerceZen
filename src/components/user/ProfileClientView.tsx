
"use client";

import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { UserCircle, Mail, Edit3, Settings, Palette, Shield, LogIn, KeyRound, Bell, LogOut, Paintbrush, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Switch } from "@/components/ui/switch";
import { useColorTheme, type ThemeName } from '@/contexts/ColorThemeContext'; 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; 
import { useToast } from '@/hooks/use-toast';


const editNameSchema = z.object({
  newName: z.string().min(2, { message: "Name must be at least 2 characters." }),
});
type EditNameFormValues = z.infer<typeof editNameSchema>;

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string().min(6, { message: "New password must be at least 6 characters." }),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ["confirmNewPassword"],
});
type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;


export default function ProfileClientView() {
  const { user, isLoggedIn, isLoading: isAuthLoading, updateUserName, changePassword, logout: authLogout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme(); // from next-themes
  const { colorTheme, setColorTheme, currentModeThemes } = useColorTheme(); // from our ColorThemeContext
  const { toast } = useToast();
  
  const [mounted, setMounted] = React.useState(false);
  const [showEditNameDialog, setShowEditNameDialog] = React.useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = React.useState(false);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = React.useState(false); 

  React.useEffect(() => {
    setMounted(true);
    if (user?.email) {
      const storedNotificationPref = localStorage.getItem(`commercezen_notifications_${user.email}`);
      if (storedNotificationPref) {
        setEmailNotificationsEnabled(JSON.parse(storedNotificationPref));
      }
    }
  }, [user?.email]);

  const nameForm = useForm<EditNameFormValues>({
    resolver: zodResolver(editNameSchema),
    defaultValues: { newName: "" },
  });

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
  });

  React.useEffect(() => {
    if (user && mounted) {
      nameForm.reset({ newName: user.name || "" });
    }
  }, [user, nameForm, mounted]);

  const handleEditNameSubmit = async (values: EditNameFormValues) => {
    const success = await updateUserName(values.newName);
    if (success) {
      setShowEditNameDialog(false);
    }
  };

  const handleChangePasswordSubmit = async (values: ChangePasswordFormValues) => {
    const success = await changePassword(values.currentPassword, values.newPassword);
    if (success) {
      passwordForm.reset();
      setShowChangePasswordDialog(false);
    }
  };

  const handleNotificationToggle = (checked: boolean) => {
    setEmailNotificationsEnabled(checked);
    if(user?.email) { 
      localStorage.setItem(`commercezen_notifications_${user.email}`, JSON.stringify(checked));
    }
    toast({
      title: "Notification Settings Updated",
      description: `Email notifications ${checked ? 'enabled' : 'disabled'}. (Mock)`,
    });
  };
  
  const handleManageData = () => {
    toast({
        title: "Manage Data (Mock)",
        description: "Data export and account activity log options would be available here in a real application.",
    });
  };
  
  const handleSetup2FA = () => {
    toast({
      title: "Two-Factor Authentication (Mock)",
      description: "This is where you would configure Two-Factor Authentication for enhanced account security.",
    });
  };

  const handleDeleteAccount = () => {
     toast({
        title: "Delete Account (Mock)",
        description: "Account deletion is a critical feature and would require further confirmation. This is a mock action.",
        variant: "destructive",
    });
  };


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
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-10 animate-subtle-fade-in">
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold text-primary">Your Profile</h1>
        <p className="mt-2 text-lg text-muted-foreground font-body">Manage your account settings and preferences.</p>
      </div>

      <Card className="shadow-xl animate-subtle-fade-in">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={`https://ui-avatars.com/api/?name=${user.name ? user.name.replace(' ','+') : 'User'}&background=random&size=128`} alt={user.name || 'User Avatar'} />
              <AvatarFallback>
                <UserCircle className="h-full w-full text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-headline text-primary">{user.name || 'User Name'}</CardTitle>
              <CardDescription className="font-body text-md flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" /> {user.email}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
            <Dialog open={showEditNameDialog} onOpenChange={setShowEditNameDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto font-body">
                    <Edit3 className="mr-2 h-4 w-4" /> Edit Name
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-headline">Edit Your Name</DialogTitle>
                  <DialogDescription className="font-body">
                    Update your display name.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={nameForm.handleSubmit(handleEditNameSubmit)} className="space-y-4 pt-2">
                  <div>
                    <Label htmlFor="newName" className="font-body">New Name</Label>
                    <Input id="newName" {...nameForm.register("newName")} className="font-body mt-1" disabled={nameForm.formState.isSubmitting} />
                    {nameForm.formState.errors.newName && (
                      <p className="text-sm text-destructive mt-1">{nameForm.formState.errors.newName.message}</p>
                    )}
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                       <Button type="button" variant="outline" disabled={nameForm.formState.isSubmitting} className="font-body">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90 font-headline" disabled={nameForm.formState.isSubmitting}>
                      {nameForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Name
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
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
              <Label htmlFor="profile-name-display" className="font-body text-sm">Current Full Name</Label>
              <Input id="profile-name-display" type="text" value={user.name || ''} readOnly disabled className="font-body bg-muted/50"/>
            </div>
            <div>
                <Dialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" className="w-full font-body">
                        <KeyRound className="mr-2 h-4 w-4" /> Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-headline">Change Password</DialogTitle>
                      <DialogDescription className="font-body">
                        Enter your current and new password.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={passwordForm.handleSubmit(handleChangePasswordSubmit)} className="space-y-4 pt-2">
                      <div>
                        <Label htmlFor="currentPassword" className="font-body">Current Password</Label>
                        <Input id="currentPassword" type="password" {...passwordForm.register("currentPassword")} className="font-body mt-1" disabled={passwordForm.formState.isSubmitting}/>
                        {passwordForm.formState.errors.currentPassword && (
                          <p className="text-sm text-destructive mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="newPassword" className="font-body">New Password</Label>
                        <Input id="newPassword" type="password" {...passwordForm.register("newPassword")} className="font-body mt-1" disabled={passwordForm.formState.isSubmitting}/>
                        {passwordForm.formState.errors.newPassword && (
                          <p className="text-sm text-destructive mt-1">{passwordForm.formState.errors.newPassword.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="confirmNewPassword" className="font-body">Confirm New Password</Label>
                        <Input id="confirmNewPassword" type="password" {...passwordForm.register("confirmNewPassword")} className="font-body mt-1" disabled={passwordForm.formState.isSubmitting}/>
                        {passwordForm.formState.errors.confirmNewPassword && (
                          <p className="text-sm text-destructive mt-1">{passwordForm.formState.errors.confirmNewPassword.message}</p>
                        )}
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="outline" disabled={passwordForm.formState.isSubmitting} className="font-body">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90 font-headline" disabled={passwordForm.formState.isSubmitting}>
                          {passwordForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Update Password
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg animate-subtle-fade-in" style={{animationDelay: '0.2s'}}>
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center text-primary"><Palette className="mr-2 h-5 w-5 text-accent" />Appearance & Notifications</CardTitle>
            <CardDescription className="font-body">Customize your app experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-body">Mode</Label>
                <p className="text-sm text-muted-foreground font-body">
                  Current mode: {currentDisplayTheme}
                </p>
              </div>
               <Button variant="outline" size="sm" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="font-body">
                 Toggle Mode
               </Button>
            </div>
            <Separator />
             <div className="space-y-2">
                <Label htmlFor="color-theme-select" className="text-base font-body flex items-center"><Paintbrush className="mr-2 h-4 w-4 text-muted-foreground"/>Color Theme</Label>
                <Select
                  value={colorTheme} // Current active color theme
                  onValueChange={(value) => setColorTheme(value as ThemeName)}
                  disabled={!mounted || currentModeThemes.length === 0}
                >
                  <SelectTrigger id="color-theme-select" className="w-full font-body">
                    <SelectValue placeholder="Select a color theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentModeThemes.map((themeOption) => (
                      <SelectItem key={themeOption.name} value={themeOption.name} className="font-body">
                        {themeOption.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {currentModeThemes.length === 0 && mounted && (
                  <p className="text-xs text-muted-foreground font-body">Loading themes for current mode...</p>
                )}
            </div>
             <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications-switch" className="text-base font-body flex items-center"><Bell className="mr-2 h-4 w-4 text-muted-foreground" />Email Notifications</Label>
                 <p className="text-sm text-muted-foreground font-body">
                  Receive updates about new products and offers.
                </p>
              </div>
              <Switch 
                id="notifications-switch" 
                checked={emailNotificationsEnabled}
                onCheckedChange={handleNotificationToggle}
                aria-label="Toggle email notifications" 
              />
            </div>
          </CardContent>
        </Card>
      </div>
       <Card className="shadow-lg animate-subtle-fade-in" style={{animationDelay: '0.3s'}}>
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center text-primary"><Shield className="mr-2 h-5 w-5 text-accent" />Security & Privacy</CardTitle>
            <CardDescription className="font-body">Review your security settings and privacy options.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Button variant="outline" onClick={handleSetup2FA} className="w-full sm:w-auto font-body">
                <Shield className="mr-2 h-4 w-4" /> Set Up Two-Factor Authentication (mock)
              </Button>
              <p className="text-xs text-muted-foreground font-body mt-1">Add an extra layer of security to your account.</p>
            </div>
             <Separator />
            <div>
              <Button variant="outline" onClick={handleManageData} className="w-full sm:w-auto font-body">
                Manage Your Data (mock)
              </Button>
              <p className="text-xs text-muted-foreground font-body mt-1">Download your data or review activity logs.</p>
            </div>
          </CardContent>
           <CardFooter className="border-t pt-4 mt-4">
             <Button variant="destructive" onClick={handleDeleteAccount} className="w-full sm:w-auto font-body">
                <LogOut className="mr-2 h-4 w-4" /> Delete Account (mock)
            </Button>
          </CardFooter>
        </Card>
    </div>
  );
}

