import { useState } from "react";
import AppShell from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Plus,
  Pill,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

const Reminders = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSnoozeDialog, setShowSnoozeDialog] = useState(false);
  const [reminderType, setReminderType] = useState<"medicine" | "appointment">("medicine");
  const [reminders, setReminders] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  const handleSnooze = (duration: string) => {
    toast.info(`Reminder snoozed for ${duration}`);
    setShowSnoozeDialog(false);
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reminders & Appointments</h1>
            <p className="text-muted-foreground mt-1">
              Manage your medication reminders and appointments
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Reminder
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="medicine">Medicine</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {/* Medicine Reminders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-primary" />
                  Medicine Reminders
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reminders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Pill className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No medicine reminders set</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Reminders list */}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-secondary" />
                  Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No appointments scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Appointments list */}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medicine" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Medicine Reminders</CardTitle>
                <CardDescription>
                  Manage reminders for your medications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reminders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Pill className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No reminders set</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Create your first reminder for medications
                    </p>
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Reminder
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Reminders list */}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appointments</CardTitle>
                <CardDescription>
                  View and manage your upcoming appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No appointments scheduled</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Add your first appointment
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Appointments list */}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Reminder Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Reminder</DialogTitle>
              <DialogDescription>
                Set up a new reminder for medicine or appointment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select
                  value={reminderType}
                  onValueChange={(value: "medicine" | "appointment") =>
                    setReminderType(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medicine">Medicine</SelectItem>
                    <SelectItem value="appointment">Appointment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input id="time" type="time" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repeat">Repeat *</Label>
                <Select>
                  <SelectTrigger id="repeat">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast.success("Reminder created");
                  setShowCreateDialog(false);
                }}
              >
                Create Reminder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Snooze Dialog */}
        <Dialog open={showSnoozeDialog} onOpenChange={setShowSnoozeDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Snooze Reminder</DialogTitle>
              <DialogDescription>
                How long would you like to snooze this reminder?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSnooze("10 minutes")}
              >
                10 minutes
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSnooze("30 minutes")}
              >
                30 minutes
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSnooze("1 hour")}
              >
                1 hour
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
};

export default Reminders;
