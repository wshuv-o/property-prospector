// src\components\PersonCard.tsx
import { Phone, Mail, MapPin, Users, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PersonRecord } from '@/types/person';

interface PersonCardProps {
  person: PersonRecord;
}

const sourceColors: Record<string, string> = {
  truepeoplesearch: 'bg-info/10 text-info border-info/20',
  fastpeoplesearch: 'bg-success/10 text-success border-success/20',
  searchpeoplefree: 'bg-warning/10 text-warning border-warning/20',
};

export function PersonCard({ person }: PersonCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3 bg-accent/30">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold">{person.name}</CardTitle>
          <Badge variant="outline" className={sourceColors[person.source]}>
            {person.source.replace('peoplesearch', '')}
          </Badge>
        </div>
        {person.matchScore && (
          <Badge variant="secondary" className="w-fit">
            {Math.round(person.matchScore * 100)}% match
          </Badge>
        )}
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Address */}
        <div className="flex items-start gap-3">
          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Address</p>
            <p className="text-sm text-muted-foreground">{person.address}</p>
          </div>
        </div>

        {/* Phone Numbers */}
        {person.phones.length > 0 && (
          <div className="flex items-start gap-3">
            <Phone className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Phone Numbers</p>
              <div className="flex flex-wrap gap-1">
                {person.phones.map((phone, i) => (
                  <Badge key={i} variant="outline" className="font-mono text-xs">
                    {phone}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Emails */}
        {person.emails.length > 0 && (
          <div className="flex items-start gap-3">
            <Mail className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Email Addresses</p>
              <div className="flex flex-wrap gap-1">
                {person.emails.map((email, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {email}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Relatives */}
        {person.relatives.length > 0 && (
          <div className="flex items-start gap-3">
            <Users className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Known Relatives</p>
              <p className="text-sm text-muted-foreground">
                {person.relatives.slice(0, 3).join(', ')}
                {person.relatives.length > 3 && ` +${person.relatives.length - 3} more`}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
