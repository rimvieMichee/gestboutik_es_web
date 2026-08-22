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
      }
    </svg>
  `,
})
export class IconComponent {
  @Input() name = '';
  @Input() size = 18;
}
