import { Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: "app-not-found-page",
  templateUrl: "./not-found-page.component.html",
  styleUrls: ["./not-found-page.component.scss"],
})
export class NotFoundPageComponent implements OnInit {
  faCoffee = faExclamationCircle;

  constructor(private router: Router) {}

  ngOnInit(): void {}

  regresar() {
    this.router.navigate(["/home"]);
  }
}
