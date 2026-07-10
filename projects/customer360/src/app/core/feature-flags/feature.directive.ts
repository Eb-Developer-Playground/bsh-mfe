import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';

import { FeatureFlagService } from './feature-flag.service';
import { CountryCode, Feature } from './feature-flags.model';

/**
 * Directive to conditionally display elements based on feature flags.
 */
@Directive({ selector: '[appIsFeatureEnabled]' })
export class IsFeatureEnabledDirective {
  private tpl = inject(TemplateRef<unknown>);
  private vcr = inject(ViewContainerRef);
  private flags = inject(FeatureFlagService);
  private shown = false;

  @Input({ required: true })
  set appIsFeatureEnabled(value: { country: CountryCode; feature: Feature }) {
    const allowed = this.flags.isEnabled(value.country, value.feature);
    if (allowed && !this.shown) { this.vcr.createEmbeddedView(this.tpl); this.shown = true; }
    if (!allowed && this.shown) { this.vcr.clear(); this.shown = false; }
  }
}
