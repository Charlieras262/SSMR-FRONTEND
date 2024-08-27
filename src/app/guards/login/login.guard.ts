import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "src/app/services/auth.service";
import { AlertUtils } from "src/app/utils/alert-utils";
import { Catalog } from "src/app/utils/catalog";

@Injectable({
  providedIn: "root",
})
export class LoginGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (!this.auth.isLoggedIn()) {
      this.auth.logout();
      this.router.navigate(["/login"]);
      AlertUtils.showToast(
        "info",
        `Por favor, iniciar sesión para acceder al modulo.`
      );
      return false;
    }
    return this.validarRutasPorRol(route);
  }

  validarRutasPorRol(route: ActivatedRouteSnapshot): boolean {
    const user = this.auth.getUserStored();
    const path = route.url.join("/");
    console.log([Catalog.UserRoles.ROOT, Catalog.UserRoles.ADMIN]);
    
    if (path.startsWith('profile')) return true;
    if (path.startsWith("admin") && user?.roles?.find(item => [Catalog.UserRoles.ROOT, Catalog.UserRoles.ADMIN].includes(item.idRole))) {
      return true;
    }
    if (path.startsWith("auditor") && user?.roles?.find(role => role.idRole == Catalog.UserRoles.AUDITOR)) {
      return true;
    }

    this.router.navigate(["/home"]);
    AlertUtils.showToast(
      "warning",
      `No cuentas con permisos para acceder al modulo solicitado.`
    );
    return false;
  }
}
