import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-announcement',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './announcement.html',
  styleUrl: './announcement.css'
})
export class Announcement {}