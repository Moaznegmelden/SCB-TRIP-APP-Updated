import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent {

  @Input() userName = 'Employee Portal';

  @Input() userRole = 'View Mode';

  @Input() initials = 'EP';

}