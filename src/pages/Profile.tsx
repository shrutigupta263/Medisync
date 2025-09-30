import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { User, Mail, Phone, Bell, Moon, Sun, LogOut, Shield, Info } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    phone: "",
    timezone: "Asia/Kolkata",
    notificationPreferences: {
      push: true,
      email: true,
      sms: false,
    },
    doNotDisturb: {
      enabled: true,
      start: "22:00",
      end: "07:00",
    },
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState("normal");

  const handleSave = () => {
    toast.success("Profile updated successfully");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/signin");
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile & Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={formData.timezone} onValueChange={(value) => setFormData({ ...formData, timezone: value })}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                  <SelectItem value="America/New_York">America/New York (EST)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="pt-4">
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>Choose how you want to be notified</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications for reminders
                </p>
              </div>
              <Switch
                checked={formData.notificationPreferences.push}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    notificationPreferences: {
                      ...formData.notificationPreferences,
                      push: checked,
                    },
                  })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for important updates
                </p>
              </div>
              <Switch
                checked={formData.notificationPreferences.email}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    notificationPreferences: {
                      ...formData.notificationPreferences,
                      email: checked,
                    },
                  })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive text messages for critical reminders
                </p>
              </div>
              <Switch
                checked={formData.notificationPreferences.sms}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    notificationPreferences: {
                      ...formData.notificationPreferences,
                      sms: checked,
                    },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Do Not Disturb */}
        <Card>
          <CardHeader>
            <CardTitle>Do Not Disturb</CardTitle>
            <CardDescription>Set quiet hours for notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Do Not Disturb</Label>
                <p className="text-sm text-muted-foreground">
                  Silence notifications during specified hours
                </p>
              </div>
              <Switch
                checked={formData.doNotDisturb.enabled}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    doNotDisturb: {
                      ...formData.doNotDisturb,
                      enabled: checked,
                    },
                  })
                }
              />
            </div>
            {formData.doNotDisturb.enabled && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Start Time</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={formData.doNotDisturb.start}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          doNotDisturb: {
                            ...formData.doNotDisturb,
                            start: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-time">End Time</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={formData.doNotDisturb.end}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          doNotDisturb: {
                            ...formData.doNotDisturb,
                            end: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Appearance & Accessibility */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance & Accessibility</CardTitle>
            <CardDescription>Customize your app experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark theme
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-muted-foreground" />
                <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
                <Moon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="font-size">Font Size</Label>
              <Select value={fontSize} onValueChange={setFontSize}>
                <SelectTrigger id="font-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* About & Help */}
        <Card>
          <CardHeader>
            <CardTitle>About & Help</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="#about">
                <Info className="mr-2 h-4 w-4" />
                About MediSync
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="#terms">
                <Shield className="mr-2 h-4 w-4" />
                Terms of Service
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="#help">
                <Info className="mr-2 h-4 w-4" />
                Help & FAQ
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Card className="border-error/50">
          <CardContent className="pt-6">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full text-error hover:bg-error/10 hover:text-error hover:border-error">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You'll need to sign in again to access your health dashboard.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout}
                    className="bg-error hover:bg-error/90 text-error-foreground"
                  >
                    Yes, sign out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};

export default Profile;
