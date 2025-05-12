import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { environment } from './../../../environments/environment';
import { CommonModule } from '@angular/common';
import { getDecodedToken } from './jwt-decoder';
import { DisplaySettingsService } from '../../../service/display-settings.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMsg = '';
  displayService = inject(DisplaySettingsService);
  constructor(
    fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
  ngOnInit(): void {
    const target = document.querySelector('#setting-component') as HTMLElement;
    if (target) {
      target.click(); // 👈 simula click
      this.forceFullscreenIfUnset();
    }
  }

  onSubmit() {
    if (!this.loginForm.valid) return;
    const { username, password } = this.loginForm.value;
    this.http
      .post<{ token: string }>(`${environment.apiUrlAut}/login`, {
        username,
        password,
      })
      .subscribe({
        next: (res) => {
          localStorage.setItem('token', res.token);
          const token = getDecodedToken();
          localStorage.setItem('username', token.username);
          this.router.navigate(['/dashboard']);
        },
        error: () => (this.errorMsg = 'Credenziali non valide'),
      });
  }
  forceFullscreenIfUnset() {
    // controlla se il valore esiste nello storage
    console.log('sei in metodo full screen');
    const raw = localStorage.getItem('display_settings') ?? '';
  }
}
