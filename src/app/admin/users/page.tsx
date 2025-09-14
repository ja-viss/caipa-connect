import { getUsers } from "@/lib/actions/users";
import type { User } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EditUserDialog } from "@/components/user/edit-user-dialog";
import { DeleteUserAlert } from "@/components/user/delete-user-alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function getRoleBadgeVariant(role: User['role']) {
    switch (role) {
        case 'admin':
            return 'default';
        case 'teacher':
            return 'secondary';
        case 'representative':
            return 'outline';
        default:
            return 'secondary';
    }
}

function translateRole(role: User['role']) {
    switch (role) {
        case 'admin':
            return 'Administrador';
        case 'teacher':
            return 'Docente';
        case 'representative':
            return 'Representante';
        default:
            return 'Desconocido';
    }
}

export default async function UserManagementPage() {
  const users: User[] = await getUsers();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">Administrar roles y permisos de usuario.</p>
      </div>
      
      {/* Desktop View: Table */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Correo Electrónico</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>{translateRole(user.role)}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menú de acciones</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <EditUserDialog user={user} />
                        <DeleteUserAlert userId={user.id} userRole={user.role} userEmail={user.email} />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile View: Cards */}
      <div className="grid gap-4 md:hidden">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <Avatar>
                    <AvatarFallback>{user.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-base">{user.fullName}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Abrir menú de acciones</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <EditUserDialog user={user} />
                  <DeleteUserAlert userId={user.id} userRole={user.role} userEmail={user.email} />
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <Badge variant={getRoleBadgeVariant(user.role)}>{translateRole(user.role)}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
}
