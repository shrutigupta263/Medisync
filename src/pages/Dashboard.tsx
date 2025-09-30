import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import AppShell from "@/components/AppShell";
import {
  Activity,
  Pill,
  Bell,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Upload,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import ReportUploadDialog from "@/components/ReportUploadDialog";

const Dashboard = () => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  
  const takenCount = 0;
  const totalDoses = 0;
  const adherencePercentage = 0;

  return (
    <AppShell>
      <ReportUploadDialog 
        open={uploadDialogOpen} 
        onOpenChange={setUploadDialogOpen} 
      />
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, John</h1>
            <p className="text-muted-foreground mt-1">
              Here's your health overview for today
            </p>
          </div>
          <Button className="gap-2" onClick={() => setUploadDialogOpen(true)}>
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Upload Report</span>
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Medicine Status</CardTitle>
              <Pill className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{takenCount}/{totalDoses}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Doses taken today
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
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                Reminders set
              </p>
              <p className="text-xs text-muted-foreground">
                Next: No upcoming reminders
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Recent Reports</CardTitle>
              <FileText className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                Reports uploaded
              </p>
              <p className="text-xs text-muted-foreground">
                Last: No reports yet
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
            <div className="flex flex-col items-center justify-center py-12">
              <Pill className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No medicines added yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Add your first medicine to start tracking
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick AI Insight */}
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Quick AI Insight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">
              Upload your first health report to get personalized AI insights about your health.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => setUploadDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};

export default Dashboard;
