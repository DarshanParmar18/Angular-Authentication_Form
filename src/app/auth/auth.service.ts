import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subject, catchError, tap, throwError } from 'rxjs';
import { User } from '../model/User.model';

export interface AuthResponsePayload {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}
  user = new Subject<User>();

  onSignup(email: string, pass: string) {
    return this.http
      .post<AuthResponsePayload>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBA6dKcXYzHXbW8PLg1tSE42UDfEXeq2p8',
        {
          email: email,
          password: pass,
          returnSecureToken: true,
        }
      )
      .pipe(
        catchError(this.errorHandled),
        tap((res) => {
          this.authHandling(
            res.email,
            res.localId,
            res.idToken,
            +res.expiresIn
          );
        })
      );
  }

  onSignin(email: string, pass: string) {
    return this.http
      .post<AuthResponsePayload>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBA6dKcXYzHXbW8PLg1tSE42UDfEXeq2p8',
        {
          email: email,
          password: pass,
          returnSecureToken: true,
        }
      )
      .pipe(
        catchError(this.errorHandled),
        tap((res) => {
          this.authHandling(
            res.email,
            res.localId,
            res.idToken,
            +res.expiresIn
          );
        })
      );
  }

  authHandling(
    email: string,
    userId: string,
    token: string,
    expiresIn: number
  ) {
    const expirationDate = new Date(new Date().getTime() + expiresIn);
    const user = new User(email, userId, token, expirationDate);
    this.user.next(user);
  }

  errorHandled(errorRes: HttpErrorResponse) {
    console.log(errorRes);
    let errorMessage = 'Unknown error occured!';
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(() => errorMessage);
    }
    switch (errorRes.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'This email already exist!';
        break;
      case 'TOO_MANY_ATTEMPTS_TRY_LATER':
        errorMessage =
          'We have blocked all requests from this device due to unusual activity. Try again later!';
        break;
      case 'EMAIL_NOT_FOUND':
        errorMessage = 'Email Not Found!';
        break;
      case 'INVALID_EMAIL':
        errorMessage = 'Please enter a valid email';
        break;
      case 'INVALID_PASSWORD':
        errorMessage = 'The password is invalid!';
        break;
      case 'INVALID_LOGIN_CREDENTIALS':
        errorMessage = 'Email or password is incorrect!';
        break;
      case 'USER_DISABLED':
        errorMessage =
          ' The user account has been disabled by an administrator!';
        break;
    }
    return throwError(() => errorMessage);
  }
}
