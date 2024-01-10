import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

const routes: Routes = [
  { path:'', redirectTo: '/home', pathMatch: 'full' },
  { path:'home', component: HomeComponent  },
  { path:'login', component: LoginComponent},
  { path:'create', component: CreateAccountComponent},
  { path: 'resetPassword', component: ResetPasswordComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
