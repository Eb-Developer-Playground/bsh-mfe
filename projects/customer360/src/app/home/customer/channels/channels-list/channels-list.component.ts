import {
    Component,
    EventEmitter,
    Input,
    OnChanges, output,
    Output,
    SimpleChanges,
} from '@angular/core';
import { AccChannels } from '../channels.model';
import { ChannelsService } from '@app/core/services/channels/channels.service';
import { Swiperv1Component } from '@shared/components/swiperv1/swiperv1.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ChannelCardComponent } from '../channel-card/channel-card.component';

@Component({
  selector: 'app-channels-list',
  templateUrl: './channels-list.component.html',
  styleUrls: ['./channels-list.component.scss'],
  imports: [Swiperv1Component, ChannelCardComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ChannelsListComponent implements OnChanges {
    equitelData: {
        sessionId: string,
        redirectUrl: string
    } = {
        sessionId: '',
        redirectUrl: ''
    }
    @Output() returnedEquitelData = new EventEmitter();
    // channels: Channel[] | [] = [];
    filteredChannels: AccChannels[] = [];
    activeChannel: string = "";
    activeSubChannel: string = "";
    @Output() selectedAccChannel = new EventEmitter();
    @Input() accountChannels!: AccChannels[] | [];
    refreshChannels = output();
    initialChannels: any = [
        {
            channel: {
                channel: 'Web',
                subChannel: null
            },
        },
        {
            channel: {
                channel: 'Mobile',
                subChannel: 'Android',
            },
        },
        {
            channel: {
                channel: 'Mobile',
                subChannel: 'iOS',
            },
        },
        {
            channel: {
                channel: 'USSD',
                subChannel: null,
            },
        },
        {
            channel: {
                channel: 'Chatbot',
                subChannel: null,
            },
        },
        {
            channel: {
                channel: "Equitel STK",
                subChannel: null,
            },
        },
    ];

    constructor(private cs: ChannelsService) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['accountChannels'].currentValue) {
            if (changes['accountChannels'].currentValue !== changes['accountChannels'].previousValue) {

            this.accountChannels = changes['accountChannels'].currentValue;
            this.accountChannels.forEach((accountChannel:any) => {
                this.initialChannels.forEach((initialChannel:any) => {
                    if (initialChannel.channel.channel === accountChannel?.channel.channel ) {
                        if (initialChannel.channel.channel === 'Mobile') {
                            if (initialChannel.channel.subChannel === accountChannel.channel.subChannel) {
                                initialChannel.accountPermissions = accountChannel.accountPermissions
                                initialChannel.channel = accountChannel.channel
                            }
                        } else {
                            initialChannel.accountPermissions = accountChannel.accountPermissions
                            initialChannel.channel = accountChannel.channel
                        }

                    }
                })
            })

            this.filteredChannels = this.setDisplayChannels(this.initialChannels);
            // console.log(this.filteredChannels, 'our final filteredChannels');
            this.activeChannel = this.filteredChannels[0]?.channel.channel;
            this.selectedAccChannel.emit(this.filteredChannels[0]);
        }
        }
    }

     setDisplayChannels(channels: any[]) {
        const nonMobile = channels.filter((el: any) => el.channel.channel !== "Mobile");
        const mobileChannels = channels?.filter((el: any) => el.channel.channel === "Mobile") ?? [];
        const mobileWOSub = channels?.filter( (el: any) => el.channel.channel === "Mobile" && !el.channel.subChannel) ?? [];
        const mobileWSub = channels?.filter((el: any) => el.channel.channel === "Mobile" && el.channel.subChannel) ?? [];

        // console.log(mobileChannels, 'mobileChannels');
        // console.log( mobileChannels.every((el: any) => typeof el.channel.isChannelActive === 'undefined'), 'second condition');

        if (
            mobileChannels.length === 2 &&
            mobileChannels.every((el: any) => typeof el.channel.isChannelActive === 'undefined')
        )
        {
            return [
                ...nonMobile,
                {
                    channel: {
                        channel: "Mobile",
                        subChannel: "Android"
                    },
                },
                {
                    channel: {
                        channel: "Mobile",
                        subChannel: "iOS"
                    }
                },
            ];
        }
        else if (mobileChannels.length === 2 && mobileWOSub?.length === 1) {
            return [
                ...nonMobile,
                {
                    channel: {
                        channel: "Mobile",
                        subChannel:mobileWSub[0].subChannel === "Android"
                        ? "iOS"
                        : "Android"
                    }
                },
            ];
        } else if (mobileChannels.length > 2 && mobileWOSub) {
            return [...nonMobile, ...mobileWOSub];
        }
        return channels;
    }

    onCardClick(accountChannels: AccChannels) {
        if (accountChannels.channel.channel === 'Equitel STK') {
            this.fetchBSSRedirectUrl();
        }

        this.activeChannel = accountChannels.channel.channel;
        this.activeSubChannel = accountChannels.channel.subChannel;
        localStorage.setItem("selectedAccChannel", JSON.stringify(accountChannels));
        this.selectedAccChannel.emit(accountChannels);
    }

    fetchBSSRedirectUrl(): void {
        this.cs.openBSS().subscribe((res: any) => {
            this.equitelData = {
                sessionId: res.responseObject.sessionId,
                redirectUrl: res.responseObject.redirectUrl
            }
            this.returnedEquitelData.emit(this.equitelData);
        });
    }
}
