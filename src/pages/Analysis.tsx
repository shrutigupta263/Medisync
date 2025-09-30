import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import AppShell from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Brain, Download, ArrowLeft, AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AnalysisRow {
  parameter: string;
  value: string;
  unit: string;
  report_range?: string;
  normal_range: string;
  status: "Normal" | "High" | "Low";
  deviation?: string;
  note: string;
  ocr_snippet?: string;
}

interface PredictionRow {
  condition: string;
  confidence: "Low" | "Medium" | "High";
  linked_values: string[];
  reason_one_line: string;
  proof_citation: string;
}

const Analysis = () => {
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get("reportId");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisRow[]>([]);
  const [predictionData, setPredictionData] = useState<PredictionRow[]>([]);

  useEffect(() => {
    if (reportId) {
      fetchReport();
    } else {
      setIsLoading(false);
    }
  }, [reportId]);

  const fetchReport = async () => {
    try {
      const { data, error } = await supabase
        .from('health_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (error) throw error;

      setReport(data);
      
      if (data.analysis_data && data.prediction_data) {
        setAnalysisData(data.analysis_data as unknown as AnalysisRow[]);
        setPredictionData(data.prediction_data as unknown as PredictionRow[]);
      } else if (data.analysis_status === 'pending') {
        // Auto-trigger analysis
        triggerAnalysis();
      }
    } catch (error: any) {
      console.error('Error fetching report:', error);
      toast.error('Failed to load report');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-report', {
        body: { reportId }
      });

      if (error) throw error;

      if (data.success) {
        setAnalysisData(data.analysis_data || []);
        setPredictionData(data.prediction_data || []);
        toast.success('Analysis completed successfully');
        fetchReport(); // Refresh to get updated status
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error(error.message || 'Failed to analyze report');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportToCSV = (type: 'analysis' | 'prediction') => {
    const data = type === 'analysis' ? analysisData : predictionData;
    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => JSON.stringify((row as any)[h])).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report?.title}_${type}.csv`;
    a.click();
    toast.success(`${type} table exported`);
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-6 animate-fade-in">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AppShell>
    );
  }

  if (!reportId || !report) {
    return (
      <AppShell>
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Analysis</h1>
            <p className="text-muted-foreground mt-1">
              Select a report to view AI-powered analysis
            </p>
          </div>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Brain className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No report selected</h3>
              <p className="text-muted-foreground text-center mb-4">
                Go to Reports page and click "AI Analysis" on any report
              </p>
              <Link to="/reports">
                <Button>Go to Reports</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link to="/reports">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Reports
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{report.title}</h1>
            <p className="text-muted-foreground mt-1">
              AI-Powered Lab Report Analysis
            </p>
          </div>
          {report.analysis_status === 'pending' && !isAnalyzing && (
            <Button onClick={triggerAnalysis}>
              <Brain className="mr-2 h-4 w-4" />
              Analyze Report
            </Button>
          )}
        </div>

        {isAnalyzing && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Analyzing report with AI...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {analysisData.length > 0 && (
          <>
            {/* Analysis Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Lab Parameters Analysis
                </CardTitle>
                <Button onClick={() => exportToCSV('analysis')} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Parameter</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Normal Range</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Note</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analysisData.map((row, idx) => (
                        <TableRow 
                          key={idx}
                          className={row.status !== "Normal" ? "bg-destructive/5" : ""}
                        >
                          <TableCell className="font-medium">{row.parameter}</TableCell>
                          <TableCell>
                            {row.value} {row.unit}
                            {row.deviation && (
                              <span className="text-xs text-muted-foreground ml-1">
                                ({row.deviation})
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {row.normal_range}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={row.status === "Normal" ? "default" : "destructive"}
                              className="flex items-center gap-1 w-fit"
                            >
                              {row.status === "Normal" ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : (
                                <AlertCircle className="h-3 w-3" />
                              )}
                              {row.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{row.note}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Predictions Table */}
            {predictionData.length > 0 && (
              <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    Health Predictions & Risk Assessment
                  </CardTitle>
                  <Button onClick={() => exportToCSV('prediction')} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Condition / Risk</TableHead>
                          <TableHead>Confidence</TableHead>
                          <TableHead>Linked Values</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Evidence</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {predictionData.map((row, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{row.condition}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  row.confidence === "High" ? "destructive" :
                                  row.confidence === "Medium" ? "default" : "secondary"
                                }
                              >
                                {row.confidence}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {row.linked_values.join(', ')}
                            </TableCell>
                            <TableCell className="text-sm">{row.reason_one_line}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {row.proof_citation}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
};

export default Analysis;
