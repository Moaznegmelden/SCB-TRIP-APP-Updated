import { Departure } from './departure.model';

export interface Trip {

  id: number;

  title: string;

  destination: string;

  duration: string;

  registrationOpens: string;

  registrationCloses: string;

  familyDegree: string;

  numberOfCompanions: number;

  createdBy: string;

  submittedAt: string;

  status: string;

  rejectionReason?: string;

  departures: Departure[];

}