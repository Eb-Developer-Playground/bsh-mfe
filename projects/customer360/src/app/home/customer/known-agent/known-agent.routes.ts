import { Routes } from '@angular/router';
import { KnownAgentOverviewComponent } from './known-agent-overview/known-agent-overview.component';
import { KnownAgentAmendFunctionsComponent } from './known-agent-amend-functions/known-agent-amend-functions.component';
import { KnownAgentComponent } from './known-agent.component';
import { RemoveAgentComponent } from './remove-agent/remove-agent.component';
import { SuccessComponent } from './success/success.component';

export const KNOWN_AGENT_ROUTES: Routes = [
  { path: '', component: KnownAgentOverviewComponent },
  {
    path: 'view-agent-detail/:id/amend',
    component: KnownAgentAmendFunctionsComponent,
  },
  {
    path: 'view-agent-detail/:id',
    component: KnownAgentAmendFunctionsComponent,
  },
  { path: 'remove-agent', component: RemoveAgentComponent },
  { path: 'remove-agent/:id', component: RemoveAgentComponent },
  {
    path: 'add-agent',
    component: KnownAgentComponent,
  },
  { path: 'successful', component: SuccessComponent },
  { path: 'successful/remove', component: SuccessComponent },
];
