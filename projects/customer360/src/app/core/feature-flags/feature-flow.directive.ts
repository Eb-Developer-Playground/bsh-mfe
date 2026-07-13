import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';

import { FeatureFlagService } from './feature-flag.service';
import { CountryCode, Feature, FeatureFlowName } from './feature-flags.model';

@Directive({ selector: '[appIsFeatureFlow]' })
export class IsFeatureFlowDirective {
  private tpl = inject(TemplateRef<unknown>);
  private vcr = inject(ViewContainerRef);
  private flags = inject(FeatureFlagService);
  private shown = false;

  @Input({ required: true })
  set appIsFeatureFlow(value: { country: CountryCode; feature: Feature; flow: FeatureFlowName }) {
    const allowed = this.flags.isActionFlowNameEnabled(value.country, value.feature, value.flow as any);
    if (allowed && !this.shown) { this.vcr.createEmbeddedView(this.tpl); this.shown = true; }
    if (!allowed && this.shown) { this.vcr.clear(); this.shown = false; }
  }
}
