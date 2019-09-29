import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HttpErrorResponse} from '@angular/common/http';
import {Observable} from 'rxjs/internal/Observable';
import {Injectable} from '@angular/core';
import {tap} from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements HttpInterceptor {
    constructor() {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(tap((event: HttpEvent<any>) => {
           // alert(JSON.stringify(event));
            if (event instanceof HttpResponse) {
          //g alert(event.status);
                event = event.clone({body: this.modifyBody(event.body)});
            }else if(event instanceof HttpErrorResponse){
            alert('error');
            }
            return event;
        }));

    }
    private modifyBody(body: any) {
        /*
        * write your logic to modify the body
        * */
    }
}
