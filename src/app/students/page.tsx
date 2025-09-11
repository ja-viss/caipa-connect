import Link from "next/link";
import Image from "next/image";
import { students } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

export default function StudentsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold text-foreground">Students</h1>
            <p className="text-muted-foreground">Manage and view student profiles.</p>
        </div>
        <Button>Add Student</Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Avatar</span>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Representative</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={student.avatar.imageUrl} alt={student.name} data-ai-hint={student.avatar.imageHint} />
                      <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link href={`/students/${student.id}`} className="hover:underline">
                      {student.name}
                    </Link>
                     <div className="text-sm text-muted-foreground md:hidden">
                        {student.email}
                      </div>
                  </TableCell>
                  <TableCell>{student.representative.name}</TableCell>
                  <TableCell>
                     <Button asChild variant="ghost" size="icon">
                        <Link href={`/students/${student.id}`}>
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">View Profile</span>
                        </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
