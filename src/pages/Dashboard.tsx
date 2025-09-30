import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import AppShell from "@/components/AppShell";
import {
  Activity,
  Pill,
  Calendar,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
} from "lucide-react";
import mockData from "@/data/mockData.json";

const Dashboard = () => {
  // Calculate today's medicine status
  const today = new Date().toISOString().split("T")[0];
  const todayDoses = mockData.doseHistory.filter((dose) =>
    dose.timestamp.startsWith(today)
  );
  const takenCount = todayDoses.filter((d) => d.status === "taken").length;
  const missedCount = todayDoses.filter((d) => d.status === "missed").length;
  const totalDoses = mockData.medicines.reduce((acc, med) => acc + med.times.length, 0);
  const adherencePercentage = Math.round((takenCount / totalDoses) * 100);

  // Next appointment
  const nextAppointment = mockData.appointments[0];
  const appointmentDate = new Date(nextAppointment.datetime);

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, John</h1>
            <p className="text-muted-foreground mt-1">
              Here's your health overview for today
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Quick Add</span>
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
              <Calendar className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {appointmentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {nextAppointment.doctor}
              </p>
              <p className="text-xs text-muted-foreground">
                {appointmentDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Health Score</CardTitle>
              <Activity className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85/100</div>
              <p className="text-xs text-muted-foreground mt-1">
                Good overall health
              </p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-xs text-success">+5 from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Recent Reports</CardTitle>
              <Activity className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.reports.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Reports uploaded
              </p>
              <p className="text-xs text-muted-foreground">
                Last: {new Date(mockData.reports[0].date).toLocaleDateString()}
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
            <div className="space-y-3">
              {mockData.medicines.map((medicine) => {
                const medDoses = todayDoses.filter((d) => d.medicineId === medicine.id);
                return (
                  <div
                    key={medicine.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-xl">
                        <Pill className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{medicine.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {medicine.strength} • {medicine.times.join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {medDoses.map((dose, idx) => (
                        <Badge
                          key={idx}
                          variant={dose.status === "taken" ? "default" : "destructive"}
                          className="gap-1"
                        >
                          {dose.status === "taken" ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {dose.status}
                        </Badge>
                      ))}
                      {medDoses.length === 0 && (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Upcoming
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
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
              Your medication adherence is excellent this week! Based on your recent blood test,
              your Vitamin D levels are slightly low. Consider discussing supplementation with
              your doctor at your upcoming appointment.
            </p>
            <Button variant="outline" className="mt-4">
              View Full Analysis
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};

export default Dashboard;
