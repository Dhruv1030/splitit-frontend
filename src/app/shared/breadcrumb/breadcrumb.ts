import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, ActivatedRoute, RouterModule } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';

export interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './breadcrumb.html',
  styleUrls: ['./breadcrumb.scss'],
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: Breadcrumb[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.buildBreadcrumbs(this.activatedRoute.root))
      )
      .subscribe((breadcrumbs) => {
        this.breadcrumbs = breadcrumbs;
      });

    // Initial load
    this.breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);
  }

  private buildBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: Breadcrumb[] = []
  ): Breadcrumb[] {
    // Add home breadcrumb
    if (breadcrumbs.length === 0) {
      breadcrumbs.push({ label: 'Dashboard', url: '/dashboard' });
    }

    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url
        .map((segment) => segment.path)
        .join('/');
      
      if (routeURL !== '') {
        url += `/${routeURL}`;
        
        // Get the breadcrumb label from route data or generate from path
        const label = this.getBreadcrumbLabel(child, routeURL);
        
        // Avoid duplicates
        if (!breadcrumbs.find(b => b.url === url)) {
          breadcrumbs.push({ label, url });
        }
      }

      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }

  private getBreadcrumbLabel(route: ActivatedRoute, path: string): string {
    // Check if route has data with breadcrumb label
    if (route.snapshot.data['breadcrumb']) {
      return route.snapshot.data['breadcrumb'];
    }

    // Check if it's a numeric ID (detail page)
    if (!isNaN(Number(path))) {
      return `#${path}`;
    }

    // Map common routes to readable labels
    const labelMap: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'groups': 'Groups',
      'expenses': 'Expenses',
      'settlements': 'Settlements',
      'profile': 'Profile',
      'login': 'Login',
      'register': 'Register',
    };

    return labelMap[path] || this.formatLabel(path);
  }

  private formatLabel(path: string): string {
    // Convert kebab-case or snake_case to Title Case
    return path
      .replace(/[-_]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
