import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app'; // <--- Cambiado de AppComponent a App y la ruta a ./app/app

bootstrapApplication(App, appConfig) // <--- Aquí también usamos App
  .catch((err) => console.error(err));