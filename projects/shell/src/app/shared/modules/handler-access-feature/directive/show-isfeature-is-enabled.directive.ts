import { Directive, ViewContainerRef, TemplateRef, Input } from '@angular/core';
import { FeatureAccessService } from '../services/handler-access-feature/feature-access.service';

@Directive({
  selector: '[showIsfeatureIsEnabled]',
})
export class ShowIsfeatureIsEnabledDirective {
  constructor(
    private featureAccessService: FeatureAccessService,
    private viewContainerRef: ViewContainerRef,
    private templateRef: TemplateRef<any>
  ) {}

  @Input() set showIsfeatureIsEnabled(name: string) {
    const show = this.featureAccessService.isEnabled(name);
    if (!show) {
      this.viewContainerRef.clear();
    } else {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    }
  }
}
