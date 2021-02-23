import { Component } from '@angular/core';
import { formatRating } from '@game-stock/store/util-formatters';
import { HttpClient } from '@angular/common/http';
import { Game } from '@game-stock/util-interface';

@Component({
  selector: 'game-stock-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(private http: HttpClient) {}

  title = 'Game Stock';
  formatRating = formatRating;
  games = this.http.get<Game[]>('/api/games');
}
