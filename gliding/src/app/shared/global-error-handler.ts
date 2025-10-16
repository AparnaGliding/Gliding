
import {ErrorHandler, Injectable} from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  handleError(error: any): void {
    const errorMessage = error?.message || error?.toString() || '';
    const chunkFailedMessage = /Loading chunk [\d]+ failed/;
    const moduleImportErrors =  ['expected a javascript module script', 'failed to fetch dynamically imported module'];

    console.error(error);

    if (chunkFailedMessage.test(errorMessage) || moduleImportErrors.some(err => errorMessage.toLowerCase().includes(err))) {
      window.location.reload();
    }
  }
}
