import { Employee } from './employee.model';

export interface Announcement {

  tripName: string;

  publishDate: string;

  selectionRule: string;

  attendees: Employee[];

}