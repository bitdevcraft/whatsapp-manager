import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function InvitationExpired() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl">Invitation Expired</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              This invitation link is no longer valid or has expired. Team
              invitations are only valid for 72 hours.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button className="w-full bg-transparent" variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Need help?{" "}
              <a className="text-primary hover:underline" href="#">
                Contact Support
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
