import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {inject, Injectable} from "@angular/core";
import {MessageBoxType, ToastService} from "../modules/toast";
import {Observable} from "rxjs";
import {switchMap} from "rxjs/operators";
import {NetworkSpeedInterface} from "../components/network-speed/interfaces/network-speed.interface";
import {NetworkSpeedService} from "../components/network-speed/service/network-speed.service";

@Injectable({
    providedIn: "root"
})
export class NetworkSpeedInterceptor implements HttpInterceptor {
    private networkSpeedService = inject(NetworkSpeedService);
    private toastService = inject(ToastService);

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        //const isApiUrl = request.url.startsWith(environment.secugenApi);
        if (
            //  !isApiUrl &&
            !request.url.includes("assets/icons") &&
            !request.url.includes("./assets/") &&
            !request.url.includes("www.randomlists.com/data/names") &&
            !request.url.includes("logout")
        ) {
            return this.networkSpeedService.getSpeed().pipe(
                switchMap((networkSpeed: NetworkSpeedInterface) => {
                    if (["2g", "3g"].includes(networkSpeed['effectiveType'])) {
                        if (this.networkSpeedService.checkIfLastMessageIsExpired()) {
                            this.networkSpeedService.setDateOfLastMessage(new Date());
                            const messageBoxType =
                                networkSpeed['effectiveType'] === "2g"
                                    ? MessageBoxType.DANGER
                                    : MessageBoxType.WARNING;
                            this.toastService.show(
                                "NETWORK-SPEED.TITLE",
                                `NETWORK-SPEED.${networkSpeed['effectiveType'].toLocaleUpperCase()}`,
                                messageBoxType,
                                10000
                            );
                        }
                    }
                    return next.handle(request);
                })
            );
        }
        return next.handle(request);
    }
}
