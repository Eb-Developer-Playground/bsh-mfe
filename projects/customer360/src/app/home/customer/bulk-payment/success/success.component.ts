import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { ContextManager } from '../../../../shared/modules/stepper';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
  imports: [
    RouterLink,
    MatButtonModule,
    TranslatePipe,
  ],
})
export class SuccessComponent implements OnInit {
  @Output() enableBackOnSuccess = new EventEmitter<any>(true);
  @Input() transactionDetails!: any;
  checkerProcess;
  accountNumbers = JSON.parse(<string>localStorage.getItem('accounts'));

  constructor(
    public router: Router,
    private ctxManager: ContextManager,
    public translateService: TranslateService
  ) {
    this.checkerProcess =
      this.router.getCurrentNavigation()?.extras.state?.['checkerProcess'];
  }

  ngOnInit(): void {
    this.ctxManager.patchContextData({ 'bulk-payment': null });
  }
}
