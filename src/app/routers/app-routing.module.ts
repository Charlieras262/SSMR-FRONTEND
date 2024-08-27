import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LandingPageComponent } from "../components/landing-page/landing-page.component";
import { LoginComponent } from "../components/login/login.component";
import { UsersComponent } from "../components/manager/users/users.component";
import { ProfileComponent } from "../components/profile/profile.component";
import { LoginGuard } from "../guards/login/login.guard";
import { NoLoginGuard } from "../guards/no-login/no-login.guard";
import { NotFoundPageComponent } from '../components/not-found-page/not-found-page.component';
import { RecoverPasswordComponent } from '../components/recover-password/recover-password.component';
import { ManagerRegulatoryFrameworkComponent } from "../components/manager/manager-regulatory-framework/manager-regulatory-framework.component";
import { ReviewerRegulatoryFrameworkComponent } from "../components/reviewer/reviewer-regulatory-framework/reviewer-regulatory-framework.component";

const routes: Routes = [
  { path: "", redirectTo: "/home", pathMatch: "full" },
  { path: "home", component: LandingPageComponent },
  { path: "login", component: LoginComponent, canActivate: [NoLoginGuard] },
  { path: "security/recover/password", component: RecoverPasswordComponent, canActivate: [NoLoginGuard] },
  { path: "admin/users", component: UsersComponent, canActivate: [LoginGuard] },
  { path: "admin/regulatory/framework", component: ManagerRegulatoryFrameworkComponent, canActivate: [LoginGuard] },
  { path: "auditor/regulatory/framework", component: ReviewerRegulatoryFrameworkComponent, canActivate: [LoginGuard] },
  { path: "profile", component: ProfileComponent, canActivate: [LoginGuard] },
  { path: "**", component: NotFoundPageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'disabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
