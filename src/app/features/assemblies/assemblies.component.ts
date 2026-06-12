import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Packages } from '../products/packages/packages';

@Component({
  selector: 'app-assemblies',
  standalone: true,
  imports: [RouterModule, Packages],
  templateUrl: './assemblies.component.html',
  styleUrl: './assemblies.component.css',
})
export class AssembliesComponent {}
