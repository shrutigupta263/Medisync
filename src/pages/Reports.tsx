import { useState } from "react";
import AppShell from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Search, Download, Trash2, Eye, Upload, Brain } from "lucide-react";
import { toast } from "sonner";

const Reports = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [reports, setReports] = useState<any[]>([]);

  const handleUpload = () => {
    toast.info("Report upload functionality will be implemented");
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || report.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleDelete = () => {
    toast.success("Report deleted successfully");
    setReportToDelete(null);
  };

  const handleDownload = (reportTitle: string) => {
    toast.success(`Downloading ${reportTitle}...`);
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports & History</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your health reports
            </p>
          </div>
          <Button className="gap-2" onClick={handleUpload}>
            <Upload className="h-4 w-4" />
            Upload Report
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Blood Test">Blood Test</SelectItem>
                  <SelectItem value="Imaging">Imaging</SelectItem>
                  <SelectItem value="Prescription">Prescription</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reports found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchQuery || typeFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Upload your first report to get started"}
              </p>
              <Button onClick={handleUpload}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Report
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredReports.map((report) => (
              <Card key={report.id} className="card-hover">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription>
                        {new Date(report.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{report.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {report.summary}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {report.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedReport(report)}
                    >
                      <Eye className="mr-2 h-3 w-3" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(report.title)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-error hover:bg-error/10 hover:text-error hover:border-error"
                      onClick={() => setReportToDelete(report.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Report Details Dialog */}
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedReport?.title}</DialogTitle>
              <DialogDescription>
                {selectedReport &&
                  new Date(selectedReport.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
              </DialogDescription>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Summary</h4>
                  <p className="text-sm text-muted-foreground">{selectedReport.summary}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Findings</h4>
                  <ul className="space-y-2">
                    {selectedReport.findings?.map((finding: string, idx: number) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-4 border-t">
                  <Button className="w-full" variant="outline">
                    <Brain className="mr-2 h-4 w-4" />
                    Ask AI about this report
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!reportToDelete} onOpenChange={() => setReportToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the report from your
                account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-error hover:bg-error/90 text-error-foreground"
              >
                Yes, delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppShell>
  );
};

export default Reports;
