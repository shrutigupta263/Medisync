import { useState, useMemo } from "react";
import AppShell from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Upload } from "lucide-react";
import ReportUploadDialog from "@/components/ReportUploadDialog";
import ReportSummaryCard from "@/components/ReportSummaryCard";
import ReportsList from "@/components/ReportsList";
import { useReports } from "@/hooks/useReports";

const Reports = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const { 
    reports, 
    isLoading, 
    uploadReport, 
    isUploading, 
    deleteReport,
    downloadReport 
  } = useReports();

  // Calculate recent reports (last 30 days)
  const recentCount = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return reports.filter(
      (report) => new Date(report.upload_date) > thirtyDaysAgo
    ).length;
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch = report.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === "all" || 
        (report.file_type?.includes(typeFilter.toLowerCase()) ?? false);
      
      return matchesSearch && matchesType;
    });
  }, [reports, searchQuery, typeFilter]);

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports & History</h1>
            <p className="text-muted-foreground mt-1">
              Upload and manage your health reports with AI-powered insights
            </p>
          </div>
          <Button 
            className="gap-2 bg-primary hover:bg-primary-dark" 
            onClick={() => setUploadDialogOpen(true)}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4" />
            Upload Report
          </Button>
        </div>

        {/* Summary Card */}
        {!isLoading && reports.length > 0 && (
          <ReportSummaryCard count={reports.length} recentCount={recentCount} />
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports by title..."
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
                  <SelectItem value="pdf">PDF Documents</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading reports...</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredReports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {reports.length === 0 ? "No reports yet" : "No matching reports"}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {reports.length === 0
                  ? "Upload your first health report to get AI-powered insights"
                  : "Try adjusting your search or filters"}
              </p>
              {reports.length === 0 && (
                <Button onClick={() => setUploadDialogOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Your First Report
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <ReportsList
            reports={filteredReports}
            onView={downloadReport}
            onDelete={(report) => deleteReport({ id: report.id, file_url: report.file_url })}
          />
        )}

        {/* Upload Dialog */}
        <ReportUploadDialog 
          open={uploadDialogOpen} 
          onOpenChange={setUploadDialogOpen}
          onUpload={uploadReport}
          isUploading={isUploading}
        />
      </div>
    </AppShell>
  );
};

export default Reports;
