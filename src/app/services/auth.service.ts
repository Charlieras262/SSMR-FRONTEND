import { Injectable } from "@angular/core";
import { GeneralService } from "./general.service";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { User, UserCreated, UserDetail, UserDto, UserProfile, UserResponse } from "../models/UserDto";
import { CookieService } from "ngx-cookie-service";
import { JwtHelperService } from "@auth0/angular-jwt";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { RegulatoryDto } from "../models/RegulatoryDto";

const jwtHelper = new JwtHelperService();

@Injectable({
  providedIn: "root",
})
export class AuthService {

  refreshTokenTimeout: any;

  constructor(
    private generalService: GeneralService,
    private http: HttpClient,
    private coockieService: CookieService,
    private router: Router,
    private spinner: NgxSpinnerService
  ) {
  }

  getUserStored(): User {
    return JSON.parse(localStorage.getItem("user_info") as string);
  }

  isLoggedIn(): boolean {
    const res = (() => {
      try {
        return !jwtHelper.isTokenExpired(
          this.decodeToken()
        ) && !!this.getUserStored();
      } catch (error) {
        return false;
      }
    })();
    if (!res) {
      this.deleteToken();
    }
    return res;
  }

  authUser(body: any) {
    return this.generalService.postData<UserResponse, any>(
      `${environment.api}/external/users/login`,
      body
    ).pipe(map((user: UserResponse) => {
      if (user && user.token) {
        this.encodeToken(user.token);
        user.token = undefined;
        this.setUser(user as User);
        this.startRefreshTokenTimer();
      }
      return user;
    }));
  }

  createUser(usuario: UserDto) {
    return this.generalService.postData<UserCreated, UserDto>(
      `${environment.api}/internal/users/create`,
      usuario
    );
  }

  createRegulatory(usuario: RegulatoryDto) {
    console.log(usuario)
    return this.generalService.postData<null, RegulatoryDto>(
      `${environment.api}/internal/regulatory/framework`,
      usuario
    );
  }

  createCompany(company: any) {
    console.log(company)
    return this.generalService.postData<null, any>(
      `${environment.api}/internal/company`,
      company
    );
  }


  createAudit(audit: any) {
    console.log(audit)
    return this.generalService.postData<null, any>(
      `${environment.api}/internal/audit`,
      audit
    );
  }


  getUserProfile(username?: string) {
    return this.generalService.getData<UserProfile>(
      `${environment.api}/internal/users/find`,
      username ?? this.getUserStored()?.username
    );
  }


  getRegulatoryId(idRegulatory?: number) {
    return this.generalService.getData<UserProfile>(
      `${environment.api}/internal/regulatory/framework/${idRegulatory}`,
    );
  }

  getCompanyId(idCompany?: number) {
    return this.generalService.getData<UserProfile>(
      `${environment.api}/internal/company/${idCompany}`,
    );
  }

  getAuditId(idAudit?: number) {
    return this.generalService.getData<UserProfile>(
      `${environment.api}/internal/audit/${idAudit}`,
    );
  }

  getUsers() {
    return this.generalService.getData<UserDetail[]>(
      `${environment.api}/internal/users/find`
    );
  }

  getUsersCompanies() {
    return this.generalService.getData<UserDetail[]>(
      `${environment.api}/internal/users/find/companies`
    );
  }

  changePassword(oldPass: string, newPass: string) {
    return this.generalService.patchData(
      environment.api, 'internal/users/change/password',
      { oldPass, newPass, username: this.getUserStored()?.username }
    );
  }

  updateUser(body: any, username: string) {
    return this.generalService.patchData(
      `${environment.api}/internal/users/edit`, username,
      body
    );
  }


  updateRegulatory(body: any, id: any) {
    return this.generalService.putData<any, null>(
      `${environment.api}/internal/regulatory/framework`, id,
      body
    );
  }

  updateCompany(body: any, id: any) {
    return this.generalService.putData<any, null>(
      `${environment.api}/internal/company`, id,
      body
    );
  }

  updateAudit(body: any, id: any) {
    return this.generalService.putData<any, null>(
      `${environment.api}/internal/audit/save`, id,
      body
    );
  }


  finishAudit(body: any, id: any) {
    console.log(body)
    console.log(id)
    return this.generalService.putData<any, null>(
      `${environment.api}/internal/audit/finish`, id,
      body
    );
  }

  deleteUser(username: string) {
    return this.generalService.deleteData(`${environment.api}/internal/users/delete`, username);
  }

  async logout(revoke: boolean = false) {
    this.spinner.show();
    try {
      if (revoke) {
        await this.generalService.postData(`${environment.api}/internal/users/token/revoke`).toPromise();
      }

      clearTimeout(this.refreshTokenTimeout);
    } catch (error) {
      console.log(error);
    }
    this.deleteToken();
    localStorage.removeItem('user_info');
    this.router.navigate(["/login"]);
    this.spinner.hide();
  }

  existingLogin() {
    if (!this.getUserStored()) {
      this.logout();
    }
    this.generalService.postData<UserResponse, void>(`${environment.api}/external/verify/existing/login/${this.getUserStored().username}`).toPromise().then(user => {
      if (user && user.token) {
        this.encodeToken(user.token);
        user.token = undefined;
        this.setUser(user as User);
        this.startRefreshTokenTimer();
      }
      return user;
    }).catch(error => {
      this.logout();
    });
  }

  setUser(user: User) {
    localStorage.setItem("user_info", JSON.stringify(user));
  }

  async getUserCredentials() {
    try {
      const userIp = await this.http
        .get<any>("https://api.ipify.org/?format=json")
        .toPromise();
      const userLogin = { login: this.getUserStored()?.username ?? "sdr_external" };
      return { ip: userIp.ip, login: userLogin?.login ?? userLogin };
    } catch (error) {
      return null;
    }
  }

  startRefreshTokenTimer() {
    const expires = new Date(JSON.parse(atob(this.decodeToken()?.split('.')[1])).exp * 1000);
    const timeout = expires.getTime() - Date.now() - (1000 * 30);
    console.log(expires, timeout);
    this.refreshTokenTimeout = setTimeout(() => this.refreshToken(), timeout);
  }

  decodeToken(): string {
    return environment.secret?.split(".")?.map(part => this.coockieService.get(part)?.split('.')?.shift())?.join(".") as string;
  }

  deleteToken() {
    environment.secret?.split(".").forEach(part => this.coockieService.delete(part));
  }

  private encodeToken(token: string) {
    const tokenParts = token.split(".");
    const secretParts = environment.secret?.split(".");
    secretParts?.forEach((part, index) => {
      this.coockieService.set(
        part,
        `${tokenParts[index]}.${environment.secret?.split('.')?.join("")}${tokenParts[index]}`,
        new Date(new Date().getTime() + (1000 * 60 * 25)),
        "/",
        window.location.hostname,
        false,
        "Lax"
      );
    });
  }

  private refreshToken() {
    this.generalService.postData<UserResponse, any>(`${environment.api}/internal/users/token/refresh`).toPromise().then(user => {
      if (user && user.token) {
        this.encodeToken(user.token);
        this.startRefreshTokenTimer();
      }
    }).catch(error => {
      console.error(error);
    });
  }
}
