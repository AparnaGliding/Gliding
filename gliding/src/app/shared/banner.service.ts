import {Injectable} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import Util from '../app.component';


@Injectable({
  providedIn: 'root'
})

export class BannerService {

  constructor(private toastr: ToastrService) {
  }

  showSuccess(message: string) {
    message = Util.sanitizePartially(message);
    this.toastr.success(message);
  }

  showError(message: string) {
    message = Util.sanitizePartially(message);
    this.toastr.error(message, null, {
      disableTimeOut: true,
      tapToDismiss: false
    });
  }

  showWarning(message: string) {
    message = Util.sanitizePartially(message);
    this.toastr.warning(message, null, {
      disableTimeOut: true,
      tapToDismiss: false
    });
  }


  showInfo(message: string) {
    this.toastr.info(message, null, {
      disableTimeOut: true,
      tapToDismiss: false
    });
  }

  showInfoTimeout(message: string) {
    this.toastr.info(message, null, {
      timeOut: 7000
    });
  } }
