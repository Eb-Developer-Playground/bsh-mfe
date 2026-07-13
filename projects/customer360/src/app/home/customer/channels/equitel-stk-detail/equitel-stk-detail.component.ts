import {
    Component,
    Input,
    OnInit,
    OnDestroy,
} from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { MatButtonModule } from "@angular/material/button";
import { TranslatePipe } from "@ngx-translate/core";

@Component({
    selector: "app-equitel-stk-detail",
    templateUrl: "./equitel-stk-detail.component.html",
    styleUrls: ["./equitel-stk-detail.component.scss"],
    imports: [MatButtonModule, TranslatePipe],
})
export class EquitelSTKDetailComponent implements OnInit, OnDestroy {
    @Input() equitelData!: any;
    destroy$: Subject<any> = new Subject<any>();

    constructor(
        public router: Router,
    ) {}

    ngOnInit(): void {}

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    redirectToBSSProfile(): void {
        window.open(this.equitelData.redirectUrl, '_blank');
    }
 
}
