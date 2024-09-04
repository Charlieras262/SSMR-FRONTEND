import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './routers/app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './components/app-component/app.component';
import { MaterialModule } from './modules/material.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxSpinnerModule } from 'ngx-spinner';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { ScrollSpyDirective } from './directives/scroll-spy/scroll-spy.directive';

import { RequestInterceptor } from "./interceptors/request.interceptor";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LoginComponent } from './components/login/login.component';
import { UsersComponent } from './components/manager/users/users.component';
import { ReactiveFormsModule } from '@angular/forms';

import { ProfileComponent } from './components/profile/profile.component';
import { NotFoundPageComponent } from './components/not-found-page/not-found-page.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RecoverPasswordComponent } from './components/recover-password/recover-password.component';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { CookieService } from 'ngx-cookie-service';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { ManagerRegulatoryFrameworkComponent } from './components/manager/manager-regulatory-framework/manager-regulatory-framework.component';
import { ReviewerRegulatoryFrameworkComponent } from './components/reviewer/reviewer-regulatory-framework/reviewer-regulatory-framework.component';
import { BusinessCatalogComponent } from './components/manager/business-catalog/business-catalog.component';
import { AuditDocumentComponent } from './components/reviewer/audit-document/audit-document.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { CompanyReviewComponent } from './components/company/company-review/company-review.component';
import { DocumentSupportingComponent } from './components/company/document-supporting/document-supporting.component';
import { ReportsAuditComponent } from './components/manager/reports-audit/reports-audit.component';
@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    LoginComponent,
    UsersComponent,
    ScrollSpyDirective,
    LoginComponent,
    ProfileComponent,
    ProfileComponent,
    NotFoundPageComponent,
    RecoverPasswordComponent,
    ManagerRegulatoryFrameworkComponent,
    ReviewerRegulatoryFrameworkComponent,
    BusinessCatalogComponent,
    AuditDocumentComponent,
    CompanyReviewComponent,
    DocumentSupportingComponent,
    ReportsAuditComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
    NgxSpinnerModule,
    NgbModule,
    FontAwesomeModule, 
    NgxExtendedPdfViewerModule
  ],
  providers: [
    CookieService,
    { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    { provide: MAT_DATE_LOCALE, useValue: 'es-GT' },
    { provide: LocationStrategy, useClass: PathLocationStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
