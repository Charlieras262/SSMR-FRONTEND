import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../services/auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isApiUrl = req.url.startsWith(environment.api);
    const isInternal = req.url.includes('internal');
    if (isApiUrl && isInternal) {
      const modifiedHeaders = req.headers.append('Authorization', `${environment.secret}${this.authService.decodeToken()}`);
      const authReq = req.clone({ headers: modifiedHeaders });
      return next.handle(authReq);
    } else {
      return next.handle(req);
    }
  }
}
