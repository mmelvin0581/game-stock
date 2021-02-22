//@ts-nocheck
import { Component } from '@angular/core';
import { getAllGames } from '../fake-api';
import { formatRating } from '@game-stock/store/util-formatters';

@Component({
  selector: 'game-stock-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Game Stock';
  games = getAllGames();
  formatRating = formatRating;
}
