import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface ReportSummaryCardProps {
  count: number;
  recentCount: number;
}

const ReportSummaryCard = ({ count, recentCount }: ReportSummaryCardProps) => {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">Recent Reports</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-bold text-foreground">{count}</h3>
              {recentCount > 0 && (
                <span className="text-sm text-muted-foreground">
                  +{recentCount} since last month
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportSummaryCard;
