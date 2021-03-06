import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

import { ChatSendMessageAction, ChatSendMessagePayload } from '@dto/chat/chat-actions';
import { LeaveGameAction } from '@dto/game/game-actions';

import { SocketService } from '../../core/services/socket.service';
import { UserSettingsService } from '../../core/services/user-settings.service';
import { ChatService } from '../../shared/chat/chat.service';
import { GameTestService } from './game-test.service';

@Component({
  selector: 'bg-game-test',
  templateUrl: './game-test.component.html',
  styleUrls: ['./game-test.component.scss'],
  providers: [ChatService]
})
export class GameTestComponent implements OnInit, OnDestroy {
  gameId: string;

  private tearDown$ = new Subject();

  constructor(
    private route: ActivatedRoute,
    private socketService: SocketService,
    private gameTestService: GameTestService,
    private chatService: ChatService,
    private userSettingsService: UserSettingsService
  ) {}

  ngOnInit() {
    this.route.params
      .pipe(
        takeUntil(this.tearDown$),
        tap(params => (this.gameId = params['gameId'])),
        switchMap(() => this.gameTestService.joinGame(this.gameId))
      )
      .subscribe();

    this.userSettingsService.userSettings$
      .pipe(takeUntil(this.tearDown$))
      .subscribe(settings => (this.chatService.myName = settings.name));

    this.socketService
      .listen(ChatSendMessageAction)
      .pipe(takeUntil(this.tearDown$))
      .subscribe(action =>
        this.chatService.sendMessage(action.payload.from, action.payload.text)
      );

    this.chatService.myMessages$
      .pipe(takeUntil(this.tearDown$))
      .subscribe(text => {
        const payload = <ChatSendMessagePayload>{
          gameId: this.gameId,
          from: this.chatService.myName,
          text: text
        };
        const sendMessageAction = new ChatSendMessageAction(payload);

        this.socketService.emit(sendMessageAction);
      });
  }

  ngOnDestroy() {
    if (this.gameId) {
      this.socketService.emit(new LeaveGameAction(this.gameId));
    }

    this.tearDown$.next();
    this.tearDown$.complete();
  }
}
