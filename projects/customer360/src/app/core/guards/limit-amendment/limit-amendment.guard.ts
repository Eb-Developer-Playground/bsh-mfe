import { inject, Injectable } from "@angular/core";
import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot,
    UrlTree,
} from "@angular/router";
import { Observable } from "rxjs";
import { MessageBoxType, ToastService } from "@app/shared/modules/toast";
import { SessionService } from "@app/shared/services";

@Injectable({
    providedIn: "root",
})
export class LimitAmendmentGuard {
    private sessionService = inject(SessionService);
    private toastService = inject(ToastService);
    private router = inject(Router);

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ):
        | Observable<boolean | UrlTree>
        | Promise<boolean | UrlTree>
        | boolean
        | UrlTree {
        return new Promise<boolean | UrlTree>((resolve) => {
            if (!this.sessionService.hasRole("CustomerLimit.Maker")) {
                // Disallow the route
                resolve(false);
                this.toastService.show(
                    "",
                    "COMMON.NO-ACCESS-TO-MODULE",
                    MessageBoxType.DANGER,
                    5000, undefined, undefined, true
                );
            } else {
                // Allow route
                resolve(true);
            }
        });
    }
}
