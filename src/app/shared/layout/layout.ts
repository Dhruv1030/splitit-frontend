import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar';
import { SidebarComponent } from '../sidebar/sidebar';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb';
import { PwaInstallPromptComponent } from '../pwa-install-prompt/pwa-install-prompt';
import { routeFadeSlide } from '../animations/route-animations';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent, BreadcrumbComponent, PwaInstallPromptComponent],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss'],
  animations: [routeFadeSlide],
})
export class LayoutComponent {
  isSidebarActive = false;
  sidebarOpen = false;

  getRouteForAnimation(outlet: RouterOutlet) {
    if (!outlet?.isActivated) return '';
    return outlet.activatedRouteData?.['animation'] ??
      outlet.activatedRoute?.snapshot?.url?.[0]?.path ?? '';
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }
}
