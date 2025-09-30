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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
interface ParameterRow {
  parameter: string;
  value: string;
  unit: string;
  report_range?: string;
  normal_range: string;
  status: "Normal" | "High" | "Low";
  deviation?: string;
  note: string;
}

interface PredictionRow {
  condition: string;
  confidence: "Low" | "Medium" | "High";
  linked_values: string[];
  reason: string;
  proof: string;
}

interface AnalysisData {
  health_score: {
    score: number;
    reason: string;
  };
  parameters_table: ParameterRow[];
  abnormal_findings: string[];
  recommendations: string[];
  diet_plan: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string;
  };
  future_predictions: PredictionRow[];
  final_summary: string;
}

const Analysis = () => {
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get("reportId");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLegacy, setIsLegacy] = useState(false);

  // Normalize old analysis formats to the new UI schema
  const normalizeAnalysis = (raw: any): { data: AnalysisData | null; legacy: boolean } => {
    if (!raw) return { data: null, legacy: false };
    if (raw.health_score && raw.parameters_table) {
      return { data: raw as AnalysisData, legacy: false };
    }
    const analysisTable = Array.isArray(raw) ? raw : raw.analysis_table || [];
    const parameters: ParameterRow[] = analysisTable.map((r: any) => ({
      parameter: r.parameter,
      value: String(r.value ?? ""),
      unit: r.unit ?? "",
      report_range: r.report_range ?? "",
      normal_range: r.normal_range ?? "",
      status: r.status ?? "Normal",
      deviation: r.deviation ?? "",
      note: r.note ?? "",
    }));
    const total = parameters.length;
    const abnormal = parameters.filter(p => p.status !== "Normal").length;
    const score = total ? Math.max(4, 10 - abnormal) : 7;
    const reason = total
      ? (abnormal === 0 ? "All parameters within normal limits." : `${abnormal}/${total} parameters outside normal range.`)
      : "Limited data available. Consider re-running analysis.";
    const predictionsRaw = Array.isArray(raw?.prediction_table) ? raw.prediction_table : [];
    const preds: PredictionRow[] = predictionsRaw.map((p: any) => ({
      condition: p.condition,
      confidence: p.confidence,
      linked_values: p.linked_values || [],
      reason: p.reason_one_line || p.reason || "",
      proof: p.proof_citation || p.proof || "",
    }));
    const abnormal_findings = parameters
      .filter(p => p.status !== "Normal")
      .map(p => `${p.parameter}: ${p.note || p.status}`);
    const data: AnalysisData = {
      health_score: { score, reason },
      parameters_table: parameters,
      abnormal_findings,
      recommendations: [],
      diet_plan: { breakfast: "", lunch: "", dinner: "", snacks: "" },
      future_predictions: preds,
      final_summary: raw?.final_summary || "",
    };
    return { data, legacy: true };
  };

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
      
      if (data.analysis_data) {
        const { data: normalized, legacy } = normalizeAnalysis(data.analysis_data);
        setAnalysisData(normalized);
        setIsLegacy(legacy);
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
        setAnalysisData(data.analysis as AnalysisData);
        setIsLegacy(false);
        toast.success('Analysis completed successfully');
        fetchReport(); // Refresh to get updated status
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error(error.message || 'Failed to analyze report');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportToCSV = () => {
    if (!analysisData) return;
    
    const data = analysisData.parameters_table;
    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => JSON.stringify((row as any)[h])).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report?.title}_analysis.csv`;
    a.click();
    toast.success('Analysis exported');
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
          {report.analysis_status === 'pending' && !isAnalyzing ? (
            <Button onClick={triggerAnalysis}>
              <Brain className="mr-2 h-4 w-4" />
              Analyze Report
            </Button>
          ) : (
            isLegacy && !isAnalyzing && (
              <Button onClick={triggerAnalysis} variant="outline">
                <Brain className="mr-2 h-4 w-4" />
                Re-run AI Analysis
              </Button>
            )
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

        {!isAnalyzing && (!analysisData || !(analysisData.parameters_table && analysisData.parameters_table.length > 0)) && (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground mb-4">No AI analysis found for this report.</p>
              <Button onClick={triggerAnalysis}>
                <Brain className="mr-2 h-4 w-4" />
                Run AI Analysis
              </Button>
            </CardContent>
          </Card>
        )}

        {analysisData && analysisData.health_score && (
          <>
            {/* Health Score Card */}
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Overall Health Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-bold text-primary">
                    {analysisData.health_score.score}/10
                  </div>
                  <p className="text-muted-foreground">{analysisData.health_score.reason}</p>
                </div>
              </CardContent>
            </Card>

            {/* Parameters Table */}
            {analysisData.parameters_table && analysisData.parameters_table.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Lab Parameters
                </CardTitle>
                <Button onClick={exportToCSV} variant="outline" size="sm">
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
                      {analysisData.parameters_table.map((row, idx) => (
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
            )}

            {/* Abnormal Findings */}
            {analysisData.abnormal_findings && analysisData.abnormal_findings.length > 0 && (
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    Abnormal Findings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysisData.abnormal_findings.map((finding, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-destructive mt-1">•</span>
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {analysisData.recommendations && analysisData.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Recommendations & Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysisData.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            )}

            {/* Diet Plan */}
            {analysisData.diet_plan && (
            <Card className="border-green-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🥗</span>
                  Suggested Diet Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-1">Breakfast</h4>
                    <p className="text-sm text-muted-foreground">{analysisData.diet_plan.breakfast}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Lunch</h4>
                    <p className="text-sm text-muted-foreground">{analysisData.diet_plan.lunch}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Dinner</h4>
                    <p className="text-sm text-muted-foreground">{analysisData.diet_plan.dinner}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Snacks</h4>
                    <p className="text-sm text-muted-foreground">{analysisData.diet_plan.snacks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            )}

            {/* Future Predictions */}
            {analysisData.future_predictions && analysisData.future_predictions.length > 0 && (
              <Card className="border-orange-500/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    Future Health Predictions & Risks
                  </CardTitle>
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
                        {analysisData.future_predictions.map((row, idx) => (
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
                            <TableCell className="text-sm">{row.reason}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {row.proof}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Final Summary */}
            {analysisData.final_summary && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{analysisData.final_summary}</p>
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
