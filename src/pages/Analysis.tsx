import { useState } from "react";
import AppShell from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Brain, Send, Upload, FileText } from "lucide-react";
import { toast } from "sonner";

const Analysis = () => {
  const [selectedReport, setSelectedReport] = useState("all");
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "ai"; content: string }>>([]);
  const [reports, setReports] = useState<any[]>([]);

  const handleAsk = () => {
    if (!question.trim()) return;

    setChatHistory((prev) => [...prev, { role: "user", content: question }]);
    setQuestion("");
    setIsLoading(true);

    // Mock AI response
    setTimeout(() => {
      const response =
        "Please upload a health report first to receive AI-powered analysis and insights.";
      setChatHistory((prev) => [...prev, { role: "ai", content: response }]);
      setIsLoading(false);
      toast.success("AI analysis complete");
    }, 2000);
  };

  const handleUpload = () => {
    toast.info("Report upload functionality will be implemented");
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Analysis</h1>
          <p className="text-muted-foreground mt-1">
            Get insights from your health reports powered by AI
          </p>
        </div>

        {reports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reports to analyze</h3>
              <p className="text-muted-foreground text-center mb-4">
                Upload your first health report to get AI-powered insights
              </p>
              <Button onClick={handleUpload}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Report
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Report Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Report</CardTitle>
                <CardDescription>Choose which reports to analyze</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedReport} onValueChange={setSelectedReport}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reports</SelectItem>
                    {reports.map((report) => (
                      <SelectItem key={report.id} value={report.id}>
                        {report.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* AI Summary - Only shown when report is uploaded and analyzed */}
            {selectedReport !== "all" && (
              <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    AI Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    AI-generated analysis will appear here after the report is processed.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Chat Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Ask AI
            </CardTitle>
            <CardDescription>Ask questions about your health reports</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Chat History */}
            <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
              {chatHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="text-sm">Start a conversation by asking a question below</p>
                </div>
              ) : (
                chatHistory.map((message, idx) => (
                  <div
                    key={idx}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-4 rounded-2xl bg-muted">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Ask about your health reports..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAsk()}
              />
              <Button onClick={handleAsk} disabled={!question.trim() || isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};

export default Analysis;
