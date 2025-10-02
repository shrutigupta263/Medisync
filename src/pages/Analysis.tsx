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
import HealthChatbot from "@/components/HealthChatbot";
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
      const { data: report, error } = await supabase
        .from('health_reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (error) throw error;

      setReport(report);

      // Fetch analysis from report_analysis table
      const { data: analysisRecord, error: analysisError } = await supabase
        .from('report_analysis')
        .select('analysis_json')
        .eq('report_id', reportId)
        .maybeSingle();

      if (analysisError) {
        console.error('Error fetching analysis:', analysisError);
      }

      if (analysisRecord?.analysis_json) {
        const { data: normalized, legacy } = normalizeAnalysis(analysisRecord.analysis_json);
        setAnalysisData(normalized);
        setIsLegacy(legacy);
      } else if (report.analysis_status === 'pending') {
        // Auto-trigger analysis if not started
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

        {/* Health Chatbot - placed directly below header */}
        <HealthChatbot reportId={reportId || undefined} />

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
            {/* Section 1: Health Score Card */}
            <Card className="border-l-4 border-l-primary shadow-lg">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-normal text-muted-foreground">Section 1</div>
                    Overall Health Score
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center gap-6">
                  <div className="text-6xl font-bold text-primary bg-primary/5 p-6 rounded-xl">
                    {analysisData.health_score.score}/10
                  </div>
                  <div className="flex-1">
                    <p className="text-lg leading-relaxed">{analysisData.health_score.reason}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Parameters Table */}
            {analysisData.parameters_table && analysisData.parameters_table.length > 0 && (
            <Card className="border-l-4 border-l-blue-500 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between bg-blue-50/50 dark:bg-blue-950/20">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-normal text-muted-foreground">Section 2</div>
                    Parameters Summary
                  </div>
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

            {/* Section 3: Abnormal Findings */}
            {analysisData.abnormal_findings && analysisData.abnormal_findings.length > 0 && (
              <Card className="border-l-4 border-l-destructive shadow-lg">
                <CardHeader className="bg-destructive/5">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-destructive/10 rounded-lg">
                      <AlertCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <div className="text-sm font-normal text-muted-foreground">Section 3</div>
                      Abnormal Findings
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {analysisData.abnormal_findings.map((finding, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                        <div className="mt-0.5 p-1 bg-destructive/10 rounded-full">
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        </div>
                        <p className="flex-1 text-sm leading-relaxed">{finding}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Section 4: Recommendations */}
            {analysisData.recommendations && analysisData.recommendations.length > 0 && (
            <Card className="border-l-4 border-l-green-500 shadow-lg">
              <CardHeader className="bg-green-50/50 dark:bg-green-950/20">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm font-normal text-muted-foreground">Section 4</div>
                    Recommendations & Suggestions
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {analysisData.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-green-50/50 dark:bg-green-950/20 rounded-lg border border-green-200/50 dark:border-green-800/50">
                      <div className="mt-0.5 p-1 bg-green-100 dark:bg-green-900 rounded-full">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="flex-1 text-sm leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            )}

            {/* Section 5: Diet Plan */}
            {analysisData.diet_plan && (
            <Card className="border-l-4 border-l-amber-500 shadow-lg">
              <CardHeader className="bg-amber-50/50 dark:bg-amber-950/20">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                    <span className="text-2xl">🥗</span>
                  </div>
                  <div>
                    <div className="text-sm font-normal text-muted-foreground">Section 5</div>
                    Basic Diet Plan
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span>🍳</span> Breakfast
                    </h4>
                    <p className="text-sm leading-relaxed">{analysisData.diet_plan.breakfast || "No specific recommendations"}</p>
                  </div>
                  <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span>🍱</span> Lunch
                    </h4>
                    <p className="text-sm leading-relaxed">{analysisData.diet_plan.lunch || "No specific recommendations"}</p>
                  </div>
                  <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span>🍽️</span> Dinner
                    </h4>
                    <p className="text-sm leading-relaxed">{analysisData.diet_plan.dinner || "No specific recommendations"}</p>
                  </div>
                  <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span>🍎</span> Snacks
                    </h4>
                    <p className="text-sm leading-relaxed">{analysisData.diet_plan.snacks || "No specific recommendations"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            )}

            {/* Section 6: Future Predictions */}
            {analysisData.future_predictions && analysisData.future_predictions.length > 0 && (
              <Card className="border-l-4 border-l-orange-500 shadow-lg">
                <CardHeader className="bg-orange-50/50 dark:bg-orange-950/20">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <div className="text-sm font-normal text-muted-foreground">Section 6</div>
                      Future Predictions & Risks
                    </div>
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

            {/* Section 7: Final Summary */}
            {analysisData.final_summary && (
            <Card className="border-l-4 border-l-primary shadow-lg">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-normal text-muted-foreground">Section 7</div>
                    Final Summary
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-lg leading-relaxed">{analysisData.final_summary}</p>
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
