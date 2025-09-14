import { getResources } from '@/lib/actions/students';
import type { Resource } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResourceDialog } from '@/components/resources/resource-dialog';

export default async function ResourcesPage() {
  const resources = await getResources();
  const categories = [...new Set(resources.map((r) => r.category))];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Biblioteca de Recursos Educativos</h1>
        <p className="text-muted-foreground">Encuentra guías, actividades y materiales de apoyo.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por título..." className="pl-8" />
        </div>
        <Select>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {resources.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {resources.map((resource) => (
            <ResourceDialog key={resource.id} resource={resource}>
              <Card className="flex flex-col cursor-pointer hover:border-primary transition-colors h-full">
                <CardHeader>
                  <div className="relative h-40 w-full mb-4">
                    <Image
                      src={resource.thumbnail.imageUrl}
                      alt={resource.title}
                      fill
                      data-ai-hint={resource.thumbnail.imageHint}
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                  <CardTitle>{resource.title}</CardTitle>
                  <Badge variant="secondary" className="w-fit">{resource.category}</Badge>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                </CardContent>
              </Card>
            </ResourceDialog>
          ))}
        </div>
      ) : (
         <Card className="flex flex-col items-center justify-center py-20">
          <CardContent>
            <p className="text-muted-foreground">No se encontraron recursos.</p>
            <p className="text-sm text-muted-foreground">Pronto se añadirán nuevos materiales.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
