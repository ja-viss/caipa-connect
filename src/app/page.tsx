import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, FileText } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-muted-foreground">
              +5 since last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Activities Logged
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">
              in the last 24 hours
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reports Generated
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              this week
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Communication</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-primary-foreground">
                  JD
                </div>
                <div>
                  <p className="font-semibold">Jane Doe (Rep)</p>
                  <p className="text-sm text-muted-foreground">Re: Liam's Progress</p>
                  <p className="text-sm mt-1">Thanks for the update, let's schedule a call...</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-primary-foreground">
                  MS
                </div>
                <div>
                  <p className="font-semibold">Mr. Smith</p>
                  <p className="text-sm text-muted-foreground">Question about Olivia</p>
                  <p className="text-sm mt-1">Could you provide more details on her challenges with...</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-bold">JUL</span>
                        <span className="text-xl font-bold">31</span>
                    </div>
                    <div>
                        <p className="font-semibold">Parent-Teacher Conferences</p>
                        <p className="text-sm text-muted-foreground">All day event</p>
                    </div>
                </div>
                 <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-bold">AUG</span>
                        <span className="text-xl font-bold">05</span>
                    </div>
                    <div>
                        <p className="font-semibold">Professional Development Day</p>
                        <p className="text-sm text-muted-foreground">School closed for students</p>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
