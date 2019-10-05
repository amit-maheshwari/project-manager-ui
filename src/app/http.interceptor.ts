import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {Injectable} from '@angular/core';
import {tap, catchError} from 'rxjs/operators';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
     if (!req.headers.has('Content-Type')) {
                    req = req.clone({ headers: req.headers.set('Content-Type', 'application/json') });
                }
        req = req.clone({ headers: req.headers.set('Accept', 'application/json') });
        return next.handle(req).pipe(tap((event: HttpEvent<any>) => {

          /*  if (event instanceof HttpResponse) {
                if(event.status == 201){
                  this.sessionService.successMessage ="Add Success!!";
                  this.sessionService.showSuccessMessage = true;
                }
            }*/
            return event;
        }));
    }
}
