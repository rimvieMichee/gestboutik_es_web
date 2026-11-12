import { Component, Input } from '@angular/core';

// Petit set d'icônes inline (pas de dépendance externe) pour la nav et les
// entêtes de page. Traits fins façon "outline", cohérents avec le reste de
// l'interface.
@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      @switch (name) {
        @case ('store') {
          <path d="M4 9V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v4" />
          <path d="M3 9h18l-1 3.2a2 2 0 0 1-2 1.4H6a2 2 0 0 1-2-1.4L3 9Z" />
          <path d="M5 13.5V19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5.5" />
          <path d="M9 20v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4" />
        }
        @case ('grid') {
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
        }
        @case ('users') {
          <circle cx="9" cy="8" r="3.25" />
          <path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
          <path d="M15.5 5.5c1.4.3 2.5 1.6 2.5 3.1 0 1.4-.9 2.6-2.2 3" />
          <path d="M16 14.6c2.4.5 4 2.3 4 4.9" />
        }
        @case ('box') {
          <path d="M3.5 8.2 12 4l8.5 4.2L12 12.5 3.5 8.2Z" />
          <path d="M3.5 8.2v7.6L12 20l8.5-4.2V8.2" />
          <path d="M12 12.5V20" />
        }
        @case ('receipt') {
          <path d="M6 3.5h12v17l-2.2-1.4-2 1.4-1.8-1.4-1.8 1.4-2-1.4L6 20.5v-17Z" />
          <path d="M9 8h6M9 11.5h6M9 15h4" />
        }
        @case ('logout') {
          <path d="M9 20H5.5a1.5 1.5 0 0 1-1.5-1.5v-13A1.5 1.5 0 0 1 5.5 4H9" />
          <path d="M15.5 16 20 12l-4.5-4" />
          <path d="M20 12H9" />
        }
        @case ('menu') {
          <path d="M4 6.5h16M4 12h16M4 17.5h16" />
        }
        @case ('close') {
          <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />
        }
        @case ('activity') {
          <path d="M3 12h4l2.5-7 5 14 2.5-7H21" />
        }
        @case ('plus') {
          <path d="M12 5v14M5 12h14" />
        }
        @case ('key') {
          <circle cx="8" cy="15" r="3.5" />
          <path d="M10.5 12.5 19 4M16 7l2.5 2.5M13.5 9.5 16 12" />
        }
        @case ('pencil') {
          <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17l-1 3Z" />
          <path d="M14.5 7.5l3 3" />
        }
        @case ('power') {
          <path d="M12 3v8" />
          <path d="M6.3 7.2a8 8 0 1 0 11.4 0" />
        }
        @case ('check') {
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        }
        @case ('alert') {
          <path d="M12 4 2.8 19.5h18.4L12 4Z" />
          <path d="M12 10v4.5M12 17.2v.1" />
        }
        @case ('chevron-right') {
          <path d="M9 5l7 7-7 7" />
        }
        @case ('phone') {
          <path d="M5 4h4l1.6 4.2-2.2 1.4a11 11 0 0 0 5 5l1.4-2.2L19 14v4a1.5 1.5 0 0 1-1.6 1.5A14.5 14.5 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4Z" />
        }
        @case ('wallet') {
          <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3" />
          <path d="M4 7.5v9A2.5 2.5 0 0 0 6.5 19H19a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1H6.5A2.5 2.5 0 0 1 4 7.5Z" />
          <circle cx="16" cy="13.5" r="1.1" />
        }
        @case ('clock') {
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" />
        }
        @case ('copy') {
          <rect x="8.5" y="8.5" width="11" height="11" rx="2" />
          <path d="M15.5 8.5V6A1.5 1.5 0 0 0 14 4.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" />
        }
        @case ('shuffle') {
          <path d="M4 7h3.5c3.5 0 5 10 9 10H20M4 17h3.5c1.4 0 2.5-1.2 3.4-2.8M14 8.8c.8-1 1.7-1.8 2.7-1.8H20" />
          <path d="M17.5 4.5 20 7l-2.5 2.5M17.5 14.5 20 17l-2.5 2.5" />
        }
        @case ('eye') {
          <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" />
          <circle cx="12" cy="12" r="2.75" />
        }
        @case ('eye-off') {
          <path d="M9.9 5.7A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2.9 3.7" />
          <path d="M6.3 7.3A16 16 0 0 0 2.5 12s3.5 6.5 9.5 6.5c1.5 0 2.9-.4 4.1-1" />
          <path d="M9.9 9.9a2.75 2.75 0 0 0 3.9 3.9" />
          <path d="M3.5 3.5l17 17" />
        }
      }
    </svg>
  `,
})
export class IconComponent {
  @Input() name = '';
  @Input() size = 18;
}
