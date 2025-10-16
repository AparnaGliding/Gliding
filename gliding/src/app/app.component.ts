import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'gliding';
}
export default class Util {
  static sanitizePartially = (value: string) => value && value.replace(/<(?!(b|\/b|div|\/div|span|\/span|strong|\/strong|em|\/em|p|\/p|h6|\/h6|ul|\/ul|li|\/li|u|\/u|ol|\/ol))/gi, '&lt;');

}
