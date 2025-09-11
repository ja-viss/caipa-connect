import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function UserManagementPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground">Administer user roles and permissions.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            This is a placeholder for the user management interface.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>User administration features will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
