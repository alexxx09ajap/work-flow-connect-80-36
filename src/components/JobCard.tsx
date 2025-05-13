import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, Briefcase, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { JobType } from '@/types';

// Extendemos JobType para asegurarnos de que userName es obligatorio para JobProps
export interface JobProps {
  job: JobType & {
    userName: string;
  };
}

export const JobCard = ({ job }: JobProps) => {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={job.userPhoto} />
            <AvatarFallback className="bg-wfc-purple-medium text-white">
              {job.userName?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <Link to={`/users/${job.userId}`} className="text-sm font-medium dark:text-white hover:underline">{job.userName}</Link>
            <p className="text-muted-foreground text-xs">{job.category}</p>
          </div>
        </div>
        <Badge variant="secondary" className="dark:bg-gray-700 dark:text-white">
          {job.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <Link to={`/jobs/${job.id}`} className="block">
          <h3 className="text-lg font-semibold dark:text-white hover:underline">{job.title}</h3>
        </Link>
        <p className="text-sm text-muted-foreground mt-2">
          {job.description.substring(0, 100)}...
        </p>
        <div className="mt-4 flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm dark:text-gray-400">Budget: ${job.budget}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center space-x-4 text-muted-foreground">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-xs">
              {new Date(job.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center">
            <Briefcase className="h-4 w-4 mr-1" />
            <span className="text-xs">{job.skills?.join(', ') || 'No skills specified'}</span>
          </div>
        </div>
        <Link to={`/jobs/${job.id}`}>
          <Button size="sm">
            Ver detalles
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
