import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ClassroomManagementPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Classroom Management</h1>
        <p className="text-muted-foreground">Manage classrooms and student assignments.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Classrooms</CardTitle>
          <CardDescription>
            This is a placeholder for the classroom management interface.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Features for creating groups and assigning students will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
