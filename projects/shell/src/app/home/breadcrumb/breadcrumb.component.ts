import {NgFor} from '@angular/common';
import {ChangeDetectorRef, Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterLink} from '@angular/router';
import {filter, startWith, Subject, takeUntil} from 'rxjs';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterLink, NgFor, TranslatePipe],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
  host: {
    class: 'breadcrumb-navigation',
  },
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  static readonly BREADCRUMB = 'breadcrumb';
  static readonly TITLE = 'title';
  breadcrumbs: any[] = [];
  titleKey: string = '';
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();
  private currentUrl: string = '';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        startWith(undefined),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.breadcrumbs = [];
        this.titleKey = '';
        this.currentUrl = this.router.url;
        this.loadBreadCrumbs();
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBreadCrumbs(): void {
    this.createBreadcrumbs(this.activatedRoute.root);
  }

  private createBreadcrumbs(route: ActivatedRoute, path: string = ''): void {
    const children: ActivatedRoute[] = route.children;
    if (children.length === 0) return;

    const urlSegments = this.currentUrl.split('/').filter(Boolean);
    const depth = path.split('/').filter(Boolean).length;

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');

      if (!routeURL) {
        // Empty-path routes (Home, ServicePortal) are intermediate nodes in
        // the ActivatedRoute tree. Recurse into them without pushing a breadcrumb,
        // but still capture their title data for the page header.
        if (!this.titleKey) {
          this.titleKey = child.snapshot.data[BreadcrumbComponent.TITLE]
            || child.snapshot.data[BreadcrumbComponent.BREADCRUMB]
            || '';
        }
        this.createBreadcrumbs(child, path);
        continue;
      }

      // Only follow the child whose URL segment matches the current path at this depth,
      // preventing sibling routes (customer360, onboarding, etc.) from appearing
      // as breadcrumbs when navigating to a different route at the same level.
      if (routeURL !== urlSegments[depth]) continue;

      const childPath = `${path}/${routeURL}`;
      const label = child.snapshot.data[BreadcrumbComponent.BREADCRUMB];
      if (label && !this.breadcrumbs.find(i => i.label === label)) {
        this.breadcrumbs.push({ label, path: childPath });
      }
      if (!this.titleKey) {
        this.titleKey = child.snapshot.data[BreadcrumbComponent.TITLE] || label || '';
      }
      this.createBreadcrumbs(child, childPath);
    }
  }
}
