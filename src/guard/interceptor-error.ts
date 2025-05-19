import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Gestione personalizzata
        const errMsg =
          error.error?.error || error.message || 'Errore sconosciuto';

        console.error('Errore HTTP:', errMsg);

        // Facoltativo: mostra un messaggio visivo
        alert(`Errore API: ${errMsg}`);

        return throwError(() => error); // rilancia per catch nei componenti se necessario
      })
    );
  }
}
