
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

type JobProps = {
  id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  skills: string[];
  userId: string;
  userName: string;
  timestamp: number;
};

export const JobCard = ({ job }: { job: JobProps }) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{job.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline">{job.category}</Badge>
          {job.skills.slice(0, 2).map(skill => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {job.skills.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{job.skills.length - 2}
            </Badge>
          )}
        </div>
        <div className="text-sm font-medium">
          Presupuesto: ${job.budget}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Publicado por: {job.userName}
        </div>
        <div className="text-xs text-muted-foreground">
          {new Date(job.timestamp).toLocaleDateString()}
        </div>
      </CardContent>
      <CardFooter>
        <Link to={`/jobs/${job.id}`} className="w-full">
          <Button variant="outline" className="w-full">Ver detalles</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
