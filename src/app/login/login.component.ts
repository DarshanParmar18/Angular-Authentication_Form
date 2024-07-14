import { Component } from '@angular/core';
import { AuthResponsePayload, AuthService } from '../auth/auth.service';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HttpClientModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [AuthService],
})
export class LoginComponent {
  title = 'ReactiveForms';
  takenEmails = ['darshanparmar@gmail.com', 'dp@gmail.com'];
  rememberMe = false;
  isLogin = false;
  error: string = null;
  success: string = null;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  Form = this.formBuilder.group({
    email: [
      null,
      [Validators.required, Validators.email, this.dublicateEmails.bind(this)],
    ],
    password: ['', [Validators.required]],
    rememberCheckBox: [''],
  });

  switchModes() {
    this.isLogin = !this.isLogin;
  }

  submit() {
    const email = this.Form.value.email;
    const pass = this.Form.value.password;
    let authObs: Observable<AuthResponsePayload>;
    if (this.isLogin) {
      authObs = this.authService.onSignin(email, pass);
    } else {
      authObs = this.authService.onSignup(email, pass);
    }

    console.log(this.Form);
    authObs.subscribe({
      next: (res) => {
        console.log('firebase response : ', res);
        this.error = null;
        this.success = this.isLogin
          ? 'Successfull Login'
          : 'Sucessfull Sign Up';
        this.router.navigate(['/home']);
        this.Form.reset();
      },
      error: (error) => {
        this.success = null;
        this.error = error;
      },
    });
  }

  dublicateEmails(control: FormControl): { [s: string]: boolean } {
    if (this.takenEmails.indexOf(control.value) !== -1) {
      return { alreadyTakenEmail: true };
    }
    return null;
  }
}
