import { registerLocaleData } from '@angular/common';
import { Injectable } from '@angular/core';

import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';

import { map, switchMap, tap } from 'rxjs/operators';

import { TranslateService } from '@ngx-translate/core';
import { ofAction } from 'ngrx-actions';

import { environment } from '../../../environments/environment';
import { AppState, UserSettings } from '../state';
import {
  AppInitializeAction,
  UserLanguageChangeAction,
  UserNameChangeAction,
  UserSecretChangeAction,
  UserSettingsLoadAction,
  UserSettingsLoadCompleteAction,
  UserSettingsSaveAction,
  UserSettingsSaveCompleteAction,
} from './app.actions';
import { getUserSettings } from './app.reducer';

@Injectable()
export class AppEffects {
  private USER_SETTINGS_STORAGE_NAME = 'userSettings';

  constructor(
    private translate: TranslateService,
    private store: Store<AppState>,
    private actions$: Actions
  ) { }

  @Effect()
  appInitialize$ = this.actions$.pipe(
    ofAction(AppInitializeAction),
    tap(() => {
      this.translate.setDefaultLang('en');
    }),
    map(() => new UserSettingsLoadAction())
  );

  @Effect()
  userSettingsLoad$ = this.actions$.pipe(
    ofAction(UserSettingsLoadAction),
    map(() => {
      let userSettings = <UserSettings>(JSON.parse(localStorage.getItem(this.USER_SETTINGS_STORAGE_NAME)) || {});
      userSettings.availableLanguages = environment.supportedLanguages;

      return new UserSettingsLoadCompleteAction(userSettings);
    })
  );

  @Effect({ dispatch: false })
  userSettingsLoadComplete$ = this.actions$.pipe(
    ofAction(UserSettingsLoadCompleteAction),
    map(action => {
      this.translate.addLangs(action.payload.availableLanguages);
      this.translate.use(action.payload.language);
    })
  );

  @Effect({ dispatch: false })
  userLanguageChange$ = this.actions$.pipe(
    ofAction(UserLanguageChangeAction),
    tap(action => {
      this.translate.use(action.payload);
      import(`@angular/common/locales/${action.payload}.js`).then(locale => {
        registerLocaleData(locale.default);
      });
    })
  );

  @Effect()
  userSettingsUpdate$ = this.actions$.pipe(
    ofAction(UserNameChangeAction, UserSecretChangeAction, UserLanguageChangeAction),
    map(() => new UserSettingsSaveAction())
  );

  @Effect()
  userSettingsSave$ = this.actions$.pipe(
    ofAction(UserSettingsSaveAction),
    switchMap(_ => this.store.select(getUserSettings)),
    tap(userSettings => localStorage.setItem(this.USER_SETTINGS_STORAGE_NAME, JSON.stringify(userSettings))),
    map(() => new UserSettingsSaveCompleteAction())
  );
}