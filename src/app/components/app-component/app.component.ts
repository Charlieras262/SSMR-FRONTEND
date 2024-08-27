import { Component, OnInit } from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";
import { faFacebook, faInstagram, faTiktok } from "@fortawesome/free-brands-svg-icons";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { NgbModal, NgbModalConfig } from "@ng-bootstrap/ng-bootstrap";
import { User } from "src/app/models/UserDto";
import { AuthService } from "src/app/services/auth.service";
import { Catalog } from "src/app/utils/catalog";
import Swal from "sweetalert2";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {

  faTiktok = faTiktok;
  faInstagram = faInstagram;
  faFacebook = faFacebook;
  faUsers = faUsers

  constructor(
    private router: Router,
    private authService: AuthService,
    private modalService: NgbModal,
    config: NgbModalConfig
  ) {
    localStorage.setItem("section", "home");
    config.size = "lg";
  }

  ngOnInit() {
    document.body.addEventListener("scroll", event => this.onScroll(event));
    if (this.authService.isLoggedIn() && this.authService.getUserStored()) {
      this.authService.getUserProfile().subscribe((res) => {
        res.email = undefined;
        res.lastName = undefined;
        res.name = undefined;
        res.state = undefined;
        this.authService.setUser(res as User);
      });
      this.authService.startRefreshTokenTimer();
    }

    if (!this.authService.isLoggedIn() && this.authService.getUserStored()) {
      this.authService.existingLogin();
    }

    window.addEventListener("storage", (e) => {
      if (e.key != "user_info" || !e.oldValue) return;
      try {
        const oldUser = JSON.parse(e.oldValue as string);
        const newUser = JSON.parse(e.newValue as string);
        if (oldUser.username != newUser.username) {
          this.invalidLogin();
        }
      } catch (error) {
        this.invalidLogin();
      }
    });
  }

  invalidLogin() {
    Swal.fire({
      title: "Accion no permitida",
      text: "No se permite la edicion de datos almacenados del usuario.",
      icon: "error",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#2b317f"
    });
    this.authService.logout();
  }

  onScroll(event: any) {
    var navbar = document.querySelector('#nav-bar')
    if (event.target.scrollTop > 0) {
      navbar?.classList.add('stickyadd')
    } else {
      navbar?.classList.remove('stickyadd')
    }
  }

  changeOption(opt: string) {
    localStorage.setItem("section", opt)
    if (!this.navigateTo(`${opt}-anchor`)) {
      this.router.navigate(['home'], { queryParams: { section: opt } });
    }
  }

  navTo(route: string, opt: string) {
    localStorage.setItem("section", opt)
    this.forcedNavigate([route]);
  }

  navigateTo(nodeName: string) {
    const node = document.getElementById(nodeName);

    if (!node) {
      return false;
    }
    node.scrollIntoView({ behavior: "smooth", block: "start" });
    return true;
  }

  onSectionChange(section: string) {
    localStorage.setItem("section", section)
  }

  getUsername() {
    return this.authService.getUserStored()?.username
  }

  isLogged(): boolean {
    return this.authService.isLoggedIn();
  }

  isAdmin() {
    return this.authService.getUserStored()?.roles?.find(role => [Catalog.UserRoles.ROOT, Catalog.UserRoles.ADMIN].includes(role.idRole)) != null;
  }

  isAuditor() {
    return this.authService.getUserStored()?.roles?.find(role => role.idRole == Catalog.UserRoles.AUDITOR) != null;
  }

  logout() {
    this.router.navigate(['/login']);
    this.authService.logout();
  }

  getSection() {
    return localStorage.getItem("section");
  }

  forcedNavigate(commands: any[], extras?: NavigationExtras): Promise<boolean> {
    return this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => this.router.navigate(commands, extras));
  }

  openTeamDialog(content: any) {
    this.modalService.open(content, { centered: true });
  }
}
