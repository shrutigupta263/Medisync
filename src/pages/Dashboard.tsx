import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import AppShell from "@/components/AppShell";
import {
  Pill,
  Bell,
  FileText,
} from "lucide-react";
import { useState } from "react";
import ReportUploadDialog from "@/components/ReportUploadDialog";
import { useReports } from "@/hooks/useReports";
import { useReminders } from "@/hooks/useReminders";
import { useMedicines } from "@/hooks/useMedicines";
import { useAuth } from "@/contexts/AuthContext";
import ReminderCalendar from "@/components/ReminderCalendar";
import { format } from "date-fns";

const Dashboard = () => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const { user } = useAuth();
  const { reports, uploadReport, isUploading } = useReports();
  const { reminders, isLoading: remindersLoading } = useReminders();
  const { medicines, isLoading: medicinesLoading } = useMedicines();

  // Calculate stats
  const reportsCount = reports.length;
  const activeRemindersCount = reminders.filter(r => !r.is_completed).length;
  const activeMedicinesCount = medicines.length;

  // Get user's display name
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";

  // Calculate medicine adherence (placeholder logic)
  const takenCount = 0;
  const totalDoses = activeMedicinesCount * 3; // Assume 3 doses per day
  const adherencePercentage = totalDoses > 0 ? (takenCount / totalDoses) * 100 : 0;

  // Get next reminder
  const upcomingReminders = reminders
    .filter(r => !r.is_completed && new Date(r.reminder_time) > new Date())
    .sort((a, b) => new Date(a.reminder_time).getTime() - new Date(b.reminder_time).getTime());
  const nextReminder = upcomingReminders[0];

  // Get last report
  const lastReport = reports[0];

  return (
    <AppShell>
      <ReportUploadDialog 
        open={uploadDialogOpen} 
        onOpenChange={setUploadDialogOpen}
        onUpload={uploadReport}
        isUploading={isUploading}
      />
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {userName}</h1>
          <p className="text-muted-foreground mt-1">
            Here's your health overview for today
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Medicine Status</CardTitle>
              <Pill className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeMedicinesCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active medicines
              </p>
              <Progress value={adherencePercentage} className="mt-3" />
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Reminders</CardTitle>
              <Bell className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeRemindersCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Reminders set
              </p>
              <p className="text-xs text-muted-foreground">
                {nextReminder 
                  ? `Next: ${format(new Date(nextReminder.reminder_time), "MMM d, h:mm a")}`
                  : "Next: No upcoming reminders"}
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Recent Reports</CardTitle>
              <FileText className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportsCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Reports uploaded
              </p>
              <p className="text-xs text-muted-foreground">
                {lastReport 
                  ? `Last: ${format(new Date(lastReport.upload_date), "MMM d, yyyy")}`
                  : "Last: No reports yet"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Medicine Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Medicine Schedule</CardTitle>
            <CardDescription>Track your medication for {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent>
            {medicinesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : activeMedicinesCount > 0 ? (
              <div className="space-y-3">
                {medicines.slice(0, 3).map((medicine) => (
                  <div key={medicine.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Pill className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{medicine.medicine_name}</p>
                      <p className="text-xs text-muted-foreground">{medicine.dosage} - {medicine.frequency}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Pill className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No medicines added yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Add your first medicine to start tracking
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reminders Calendar */}
        <ReminderCalendar />
      </div>
    </AppShell>
  );
};

export default Dashboard;
