import { Component, Input, OnInit, output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AccountManagementService } from "@app/core/services";
import { ChannelCommentDialogComponent } from "../channel-comment-dialog/channel-comment-dialog.component";
import {
    ChannelList,
    CustomerProfileData } from "../channels.model";
import { Router } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { TranslatePipe } from "@ngx-translate/core";
import { DatePipe } from "@angular/common";

@Component({
    selector: "app-channel-card",
    templateUrl: "./channel-card.component.html",
    styleUrls: ["./channel-card.component.scss"],
    imports: [MatIconModule, MatMenuModule, TranslatePipe, DatePipe],
})
export class ChannelCardComponent implements OnInit {
    // @Input() channel!: Channel;
    @Input() channels!: ChannelList;
    @Input() isActive!: boolean;
    displayChannels!: ChannelList;
    cifInquiryObj: any;
    customerDetails: any = JSON.parse(
        <string>localStorage.getItem("customerDetails")
    );
    customerStatus:string =  JSON.parse(
        <string>localStorage.getItem("customerProfileStatus")
    );
    refreshChannels = output();
    constructor(
        private accountManagementService: AccountManagementService,
        private dialog: MatDialog,
        public router: Router,
    ) {}

    ngOnInit(): void {
        this.cifInquiryObj = this.accountManagementService.getCustomerCifData();
    }

    get preferredPhoneNumber(): any {
        const phoneNumbers =
            this.cifInquiryObj.contactDetails?.phoneNumbers || [];
        const preferredPhoneNumberObj = phoneNumbers.find(
            (phoneNumber: any) => !!phoneNumber.preferred
        );
        const preferredPhoneNumber =
            preferredPhoneNumberObj?.countryCode +
            preferredPhoneNumberObj?.cityCode +
            preferredPhoneNumberObj?.number;
        return preferredPhoneNumber;
    }

    onRegisterChannel(channelName: string) {
        const data = {
            action: "Register Channel",
            customerCategory: "Level1",
            comment: "",
            productType: channelName,
            customerId: this.customerDetails.cif,
            phoneNumber: this.preferredPhoneNumber,
        };

        const dialogRef = this.dialog.open(ChannelCommentDialogComponent, {
            width: "520px",
            data: data,
        });
        dialogRef.afterClosed().subscribe({
            next: () => {
                this.refreshChannels.emit();
            }
        })
    }

    onUpdateProfile(channel: ChannelList, action: string) {
        const data: CustomerProfileData = {
            action: action,
            actionName: action,
            comment: "",
            customerId: this.customerDetails.cif,
            channel: channel.channel,
            phoneNumber: this.preferredPhoneNumber,
            subChannel: channel.subChannel,
        };

        const dialogRef = this.dialog.open(ChannelCommentDialogComponent, {
            width: "520px",
            data: data,
        });
        dialogRef.afterClosed().subscribe({
            next: () => {
                this.refreshChannels.emit();
            }
        })
    }

    onRestrictAccount(channel: ChannelList, action: string) {
        // console.log(channel, "account to restrict");
        this.router.navigate(["/services/customer-360/channels/restrict-account"]);

            // this.router.navigate(["/services/customer-360/omnichannel-profile/restrict-account"], {
            //     queryParams: {
            //         channel: channel.channel,
            //         subChannel: channel.subChannel,
            //         },
            //     });

    }
}
