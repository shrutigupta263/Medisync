import { useState } from "react";
import AppShell from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Brain, Send, Sparkles, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import mockData from "@/data/mockData.json";
import { toast } from "sonner";

const Analysis = () => {
  const [selectedReport, setSelectedReport] = useState("all");
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "ai"; content: string }>>([]);

  const handleAsk = () => {
    if (!question.trim()) return;

    setChatHistory((prev) => [...prev, { role: "user", content: question }]);
    setQuestion("");
    setIsLoading(true);

    // Mock AI response
    setTimeout(() => {
      const response =
        "Based on your recent blood test from September 2025, your vitamin D levels are slightly low at 18 ng/mL. This is below the optimal range of 30-50 ng/mL. I recommend discussing vitamin D supplementation with your doctor at your upcoming appointment. Your other markers including hemoglobin, blood sugar, and cholesterol are all within healthy ranges, which is excellent.";
      setChatHistory((prev) => [...prev, { role: "ai", content: response }]);
      setIsLoading(false);
      toast.success("AI analysis complete");
    }, 2000);
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
                {mockData.reports.map((report) => (
                  <SelectItem key={report.id} value={report.id}>
                    {report.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* AI Summary */}
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Notable Findings
              </h4>
              <ul className="space-y-2">
                <li className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Vitamin D deficiency detected (18 ng/mL)</span>
                </li>
                <li className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>All other blood markers within normal ranges</span>
                </li>
                <li className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Excellent medication adherence (92% this month)</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent" />
                Recommended Actions
              </h4>
              <ul className="space-y-2">
                <li className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span>Discuss vitamin D supplementation with your doctor</span>
                </li>
                <li className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span>Continue current medication regimen</span>
                </li>
                <li className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span>Schedule follow-up blood test in 3 months</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Confidence: High (85%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

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

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Health Timeline</CardTitle>
            <CardDescription>Key events from your reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.reports.map((report, idx) => (
                <div key={report.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                    {idx < mockData.reports.length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{report.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {report.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {new Date(report.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">{report.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};

export default Analysis;
