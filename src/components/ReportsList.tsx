import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Brain, Trash2, Calendar, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
import { useState } from "react";

interface Report {
  id: string;
  title: string;
  upload_date: string;
  file_type: string | null;
  file_url: string | null;
  file_size: number | null;
  analysis_status?: string;
}

interface ReportsListProps {
  reports: Report[];
  onView: (fileUrl: string, title: string) => void;
  onDelete: (report: Report) => void;
}

const ReportsList = ({ reports, onView, onDelete }: ReportsListProps) => {
  const navigate = useNavigate();
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const handleAnalysis = async (reportId: string, analysisStatus?: string) => {
    if (analysisStatus === 'completed') {
      navigate(`/analysis?reportId=${reportId}`);
    } else {
      setAnalyzingId(reportId);
      try {
        const { data, error } = await supabase.functions.invoke('analyze-report', {
          body: { reportId }
        });

        if (error) throw error;

        if (data.success) {
          toast.success('Analysis completed');
          navigate(`/analysis?reportId=${reportId}`);
        } else {
          throw new Error(data.error || 'Analysis failed');
        }
      } catch (error: any) {
        console.error('Analysis error:', error);
        toast.error(error.message || 'Failed to analyze report');
      } finally {
        setAnalyzingId(null);
      }
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const getFileTypeLabel = (mimeType: string | null) => {
    if (!mimeType) return "Unknown";
    if (mimeType.includes("pdf")) return "PDF";
    if (mimeType.includes("image")) return "Image";
    return "Document";
  };

  return (
    <>
      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id} className="card-hover">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{report.title}</CardTitle>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(report.upload_date)}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {getFileTypeLabel(report.file_type)}
                    </Badge>
                    <span className="text-xs">{formatFileSize(report.file_size)}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 min-w-[120px]"
                  onClick={() => report.file_url && onView(report.file_url, report.title)}
                  disabled={!report.file_url}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Report
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 min-w-[120px] border-primary/50 text-primary hover:bg-primary/10"
                  onClick={() => handleAnalysis(report.id, report.analysis_status)}
                  disabled={analyzingId === report.id}
                >
                  {analyzingId === report.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Brain className="mr-2 h-4 w-4" />
                  )}
                  {report.analysis_status === 'completed' ? 'View Analysis' : 'AI Analysis'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-error hover:bg-error/10 hover:text-error hover:border-error"
                  onClick={() => setReportToDelete(report)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog 
        open={!!reportToDelete} 
        onOpenChange={() => setReportToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{reportToDelete?.title}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (reportToDelete) {
                  onDelete(reportToDelete);
                  setReportToDelete(null);
                }
              }}
              className="bg-error hover:bg-error/90 text-error-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ReportsList;
