import {ApiService} from "@app/shared/services";
import {MatDialog} from "@angular/material/dialog";
import {ChangeDetectorRef, Injectable} from "@angular/core";
import {mergeMap, takeUntil} from "rxjs/operators";
import {BehaviorSubject, from} from "rxjs";
import {DocumentPreviewComponent} from "@app/shared/modules/upload-docs";

@Injectable({
    providedIn: 'root',
})
export class DocumentsReviewService {
    documents$ = new BehaviorSubject<DocumentPreviewComponent[]>([]);

    constructor(
        private api: ApiService,
        private dialog: MatDialog,
    ) {}

    previewDocument(obj: any) {
        if (!obj.id) {
            this.openPreviewDialog({ data: obj.data, filename: obj.filename });
            return;
        }

        return (
            this.api
                // @ts-ignore
                .postBlob<any>('/v2/documents/download', {
                    id: obj.id.toString(),
                    service: obj?.service ? obj.service : 'NewGen',
                })
                .pipe(
                    mergeMap((stream: any) => {
                        return from(
                            new Promise((resolve, _) => {
                                const isPDF =
                                    obj?.filename?.split('.')[1]?.toLowerCase() === 'pdf';
                                const contentType = isPDF ? 'application/pdf' : 'octet/stream';
                                const reader = new FileReader();
                                reader.onloadend = () => resolve(reader.result);
                                reader.readAsDataURL(new Blob([stream], { type: contentType }));
                            })
                        );
                    })
                )
                // .pipe(takeUntil(this.destroy$))
                .subscribe((b64: any) => {
                    this.openPreviewDialog({
                        data: b64,
                        filename: obj.filename,
                    });
                })
        );
    }

    openPreviewDialog(document?: any) {
        const dialogRef = this.dialog.open(DocumentPreviewComponent, {
            data: {
                url: document?.data,
                filename: document?.filename || 'Document',
            },
        });
        dialogRef
            .afterClosed()
            // .pipe(takeUntil(this.destroy$))
            .subscribe(r => {});
    }

    getDocuments(ticketID: string, service: string): void {
        const data = {
            ticketNumber: ticketID,
            service: service || 'Blob',
            Cif: '',
        };
        this.api
            .post<any>('/v2/documents/search', data)
            .subscribe((res: { responseObject: any; successful: boolean }) => {
                if (res.successful) {
                    this.documents$.next(res.responseObject);
                }
            });
    }
}
