import { Component, OnDestroy, OnInit } from "@angular/core";
import { takeUntil, Subject } from "rxjs";
import { AccountService } from "@app/core/services";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatCardModule } from "@angular/material/card";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatChipsModule } from "@angular/material/chips";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { ReactiveFormsModule } from "@angular/forms";
import { NgIf } from "@angular/common";
import { TranslatePipe } from "@ngx-translate/core";
import { daysAgoYMD, todayYMD, toYMD } from "@shared/utils/date.utils";

@Component({
    selector: "app-scheduled-payments",
    templateUrl: "./scheduled-payments.component.html",
    styleUrls: ["./scheduled-payments.component.scss"],
    imports: [
        NgIf,
        MatToolbarModule,
        MatCardModule,
        MatDividerModule,
        MatIconModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatChipsModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatTableModule,
        MatPaginatorModule,
        ReactiveFormsModule,
        TranslatePipe,
    ],
})
export class ScheduledPaymentsComponent implements OnInit, OnDestroy {
    destroy$: Subject<any> = new Subject<any>();
    account: any;
    activeType: string = "list";
    scheduleTypes = [
        {
            text: "All",
            link: "list",
        },
        {
            text: "Active",
            link: "listing",
        },
        {
            text: "Cancelled",
            link: "cancelled",
        },
        {
            text: "Expired",
            link: "past",
        },
    ];
    filterForm!: UntypedFormGroup;
    maxDate!: Date;
    selctedChipItem: any[] = [];
    selectable = true;
    removable = true;
    isFiltered: boolean = false;
    toggleFilter: boolean = false;
    dataSource: any = [];
    pageSize = 10;
    pageSizeOptions: number[] = [5, 10, 20, 30, 50, 100, 300];
    displayedColumns: string[] = [
        "sourceAccount",
        "channel",
        "destinationAccount",
        "amount",
        "amountCurrency",
        "nextPayment",
        "status",
    ];
    totalItemsCount!: number;

    constructor(
        private accountService: AccountService,
        private fb: UntypedFormBuilder
    ) {
        this.maxDate = new Date();
        this.filterForm?.valueChanges.subscribe((error: any)=> console.log('error', this.filterForm.errors));
    }
    ngOnInit(): void {
        this.account = JSON.parse(
            <string>localStorage.getItem("scheduledPaymentsAccount")
        );
        this.filterForm = this.fb.group({
            startDate: daysAgoYMD(7),
            endDate: todayYMD(),
        });
    }

    dosome(type: any) {
        this.activeType = type;
        // this.accountService
        //     .getCustomerScheduledPayments(
        //         type,
        //         "2022-09-18",
        //         "2023-09-18",
        //         "desc",
        //         1,
        //         10,
        //         this.account.cif
        //     )
        //     .pipe(takeUntil(this.destroy$))
        //     .subscribe((res: any) => {
        //         console.log("res", res);
        //          set data source and totalItemsCount here
        //     });
    }
    keyDown(value: any) {
        const allowedRegex = /[0-9\/]/g;

        if (!allowedRegex.test(value.key)) {
            value.preventDefault();
        }
    }
    remove(chip: any): void {
        const index = this.selctedChipItem.indexOf(chip);
        if (index >= 0) {
            this.selctedChipItem.splice(index, 1);
            Object.keys(this.filterForm.value).forEach((element) => {
                if (chip.key == element) {
                    this.filterForm.patchValue({ [element]: "" });
                }
            });

            const updateObj = Object.keys(this.filterForm.value).reduce(
                (acc: any, prop) => {
                    if (this.filterForm.value[prop] !== "") {
                        acc[prop] = this.filterForm.value[prop];
                    }
                    return acc;
                },
                {}
            );

            if (updateObj.endDate && (updateObj.startDate == undefined || null))
                return;
            else if (
                (updateObj.endDate == undefined || null) &&
                updateObj.startDate
            )
                return;
            else if (updateObj.endDate && updateObj.startDate) this.onSubmit();
            else if (
                (updateObj.endDate == undefined || null) &&
                (updateObj.startDate == undefined || null)
            ) {
                Object.keys(this.filterForm.controls).forEach((key) => {
                    this.filterForm.get(key)?.setErrors(null);
                });
                this.onSubmit();
            } else if (
                (updateObj.endDate == undefined ||
                    updateObj.startDate == undefined) &&
                Object.keys(updateObj).length > 0
            )
                this.onSubmit();
        }
    }
    onSubmit() {
        // this.paginator.pageIndex = 0;
        // this.isFiltered = true;

    }
    clearAllFilters() {
        this.filterForm.patchValue({
            startDate: daysAgoYMD(7),
            endDate: todayYMD(),
        });

        Object.keys(this.filterForm.controls).forEach((key) => {
            this.filterForm.get(key)?.setErrors(null);
        });

        if (this.isFiltered) this.onSubmit();
    }
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
}
