import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@workspace/ui/components/card";
import { CheckCircle, ArrowRight, Users, Folder } from "lucide-react";
import Link from "next/link";

export default function InvitationSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl">Welcome to the Team!</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              You've successfully joined the team. You now have access to all
              team projects and resources based on your assigned role.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Team Member
              </span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              Your role and permissions have been activated
            </p>
          </div>
          <div className="space-y-3">
            <Link href={"/"}>
              <Button className="w-full" variant="default">
                <ArrowRight className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Need help getting started?{" "}
              <a href="#" className="text-primary hover:underline">
                View Documentation
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
