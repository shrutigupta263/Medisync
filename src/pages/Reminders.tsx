import { useState } from "react";
import AppShell from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  Clock,
  Trash2,
  Edit,
  MapPin,
  Download,
} from "lucide-react";
import mockData from "@/data/mockData.json";
import { toast } from "sonner";

const Reminders = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSnoozeDialog, setShowSnoozeDialog] = useState(false);
  const [reminderType, setReminderType] = useState<"medicine" | "appointment">("medicine");

  const handleSnooze = (duration: string) => {
    toast.info(`Reminder snoozed for ${duration}`);
    setShowSnoozeDialog(false);
  };

  const handleAddToCalendar = (appointmentId: string) => {
    const appointment = mockData.appointments.find((a) => a.id === appointmentId);
    if (appointment) {
      toast.success(`Added ${appointment.doctor} to calendar`);
    }
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
              <CardContent className="space-y-3">
                {mockData.reminders
                  .filter((r) => r.type === "medicine")
                  .map((reminder) => {
                    const medicine = mockData.medicines.find(
                      (m) => m.id === reminder.medicineId
                    );
                    if (!medicine) return null;

                    return (
                      <div
                        key={reminder.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <Pill className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{medicine.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {reminder.recurring} at {reminder.time}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Switch checked={reminder.enabled} />
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-error hover:bg-error/10 hover:text-error"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
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
              <CardContent className="space-y-3">
                {mockData.appointments.map((appointment) => {
                  const appointmentDate = new Date(appointment.datetime);
                  const isUpcoming = appointmentDate > new Date();

                  return (
                    <div
                      key={appointment.id}
                      className="p-4 rounded-lg border hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-4">
                          <div className="bg-secondary/10 p-2 rounded-lg">
                            <Calendar className="h-5 w-5 text-secondary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{appointment.doctor}</h4>
                            <p className="text-sm text-muted-foreground">
                              {appointment.specialty}
                            </p>
                          </div>
                        </div>
                        {isUpcoming && (
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" />
                            Upcoming
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-2 ml-11">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {appointmentDate.toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {appointmentDate.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{appointment.location}</span>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddToCalendar(appointment.id)}
                          >
                            <Download className="mr-2 h-3 w-3" />
                            Add to Calendar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowSnoozeDialog(true)}
                          >
                            <Bell className="mr-2 h-3 w-3" />
                            Set Reminder
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
              <CardContent className="space-y-3">
                {mockData.reminders
                  .filter((r) => r.type === "medicine")
                  .map((reminder) => {
                    const medicine = mockData.medicines.find(
                      (m) => m.id === reminder.medicineId
                    );
                    if (!medicine) return null;

                    return (
                      <div
                        key={reminder.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <Pill className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{medicine.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {reminder.recurring} at {reminder.time}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Switch checked={reminder.enabled} />
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
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
              <CardContent className="space-y-3">
                {mockData.appointments.map((appointment) => {
                  const appointmentDate = new Date(appointment.datetime);
                  return (
                    <div
                      key={appointment.id}
                      className="p-4 rounded-lg border space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="bg-secondary/10 p-2 rounded-lg">
                            <Calendar className="h-5 w-5 text-secondary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{appointment.doctor}</h4>
                            <p className="text-sm text-muted-foreground">
                              {appointment.specialty}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 ml-11">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {appointmentDate.toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {appointmentDate.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{appointment.location}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
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

              {reminderType === "medicine" ? (
                <div className="space-y-2">
                  <Label htmlFor="medicine">Medicine *</Label>
                  <Select>
                    <SelectTrigger id="medicine">
                      <SelectValue placeholder="Select medicine" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockData.medicines.map((med) => (
                        <SelectItem key={med.id} value={med.id}>
                          {med.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="appointment">Appointment *</Label>
                  <Select>
                    <SelectTrigger id="appointment">
                      <SelectValue placeholder="Select appointment" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockData.appointments.map((apt) => (
                        <SelectItem key={apt.id} value={apt.id}>
                          {apt.doctor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
              <DialogDescription>Choose how long to snooze this reminder</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleSnooze("10 minutes")}
              >
                <Clock className="mr-2 h-4 w-4" />
                10 minutes
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleSnooze("30 minutes")}
              >
                <Clock className="mr-2 h-4 w-4" />
                30 minutes
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleSnooze("1 hour")}
              >
                <Clock className="mr-2 h-4 w-4" />
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
