//@ts-nocheck
import { Component } from "@angular/core";
import { getAllGames } from "../fake-api";

@Component({
  selector: "game-stock-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "Game Stock";
  games = getAllGames();
}
