import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

@Injectable()
export class GameTestService {
  private apiBaseUrl = 'api/games/test';

  constructor(private httpClient: HttpClient) { }

  startNewGame(): Observable<string> {
    return this.httpClient.post(`${this.apiBaseUrl}`, null, { responseType: 'text' });
  }

  joinGame(gameId: string): Observable<void> {
    return this.httpClient.post<void>(`${this.apiBaseUrl}/${gameId}/users`, null);
  }
}
