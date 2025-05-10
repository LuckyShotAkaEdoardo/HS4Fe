import { Component } from '@angular/core';
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

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMsg = '';

  constructor(
    fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.registerForm = fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (!this.registerForm.valid) return;
    const { username, password } = this.registerForm.value;
    this.http
      .post<{ message: string }>(`${environment.apiUrlAut}/register`, {
        username,
        password,
      })
      .subscribe({
        next: () => this.router.navigate(['/login']),
        error: () => (this.errorMsg = 'Registrazione fallita'),
      });
  }
}
