import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Card} from 'primeng/card';
import {CardSection, WidgetConfiguration} from '../../appearance-cofig.model';
import {RadioButton} from 'primeng/radiobutton';
import {NgTemplateOutlet} from '@angular/common';
import {ToggleSwitch} from 'primeng/toggleswitch';
import {FormsModule} from '@angular/forms';
import {ColorPicker} from 'primeng/colorpicker';
import {InputText} from 'primeng/inputtext';
import {FileUpload} from 'primeng/fileupload';
import {Button} from 'primeng/button';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-configuration-card',
  imports: [
    Card,
    RadioButton,
    ToggleSwitch,
    FormsModule,
    NgTemplateOutlet,
    ColorPicker,
    InputText,
    FileUpload,
    Button
  ],
  templateUrl: './configuration-card.component.html',
  styleUrl: './configuration-card.component.scss'
})
export class ConfigurationCardComponent {

  @Input() widgetConfig: WidgetConfiguration;
  @Input() section: CardSection;
  @Output() saveChanges = new EventEmitter<WidgetConfiguration>();
  @Output() discardChanges = new EventEmitter<void>();
  
  temp: string;
  uploadedFiles: { [key: string]: File } = {};

  constructor(private http: HttpClient) {}

  onDiscardChanges() {
    this.discardChanges.emit();
  }

  onFileUpload(event: any, fieldId: string) {
    console.log('onFileUpload called for fieldId:', fieldId);
    console.log('Event:', event);
    
    const file = event.files[0];
    if (file) {
      console.log('File selected:', file.name, 'Size:', file.size);
      // Store the file for later upload
      this.uploadedFiles[fieldId] = file;
      this.widgetConfig[fieldId + 'File'] = file;
      console.log('File stored in uploadedFiles and widgetConfig');
    } else {
      console.log('No file found in event');
    }
  }

  removeFile(fieldId: string) {
    delete this.uploadedFiles[fieldId];
    delete this.widgetConfig[fieldId + 'File'];
  }

  onSaveChanges() {
    console.log('onSaveChanges called');
    console.log('uploadedFiles:', this.uploadedFiles);
    
    // Upload any new files before saving
    this.uploadBrandFiles().then(() => {
      console.log('Files uploaded successfully, emitting save event');
      this.saveChanges.emit(this.widgetConfig);
    }).catch(error => {
      console.error('Error uploading files:', error);
      // Still emit save event even if upload fails for now
      this.saveChanges.emit(this.widgetConfig);
    });
  }

  private async uploadBrandFiles(): Promise<void> {
    console.log('uploadBrandFiles called, checking files to upload...');
    const uploadPromises: Promise<any>[] = [];
    
    for (const [fieldId, file] of Object.entries(this.uploadedFiles)) {
      console.log(`Preparing to upload file for field: ${fieldId}`, file);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const fileUploadModel = {
        widgetId: this.widgetConfig.id.toString()
      };
      
      console.log('FileUploadModel:', fileUploadModel);
      formData.append('fileUploadModel', JSON.stringify(fileUploadModel));
      
      console.log('Making POST request to /upload/brand');
      const uploadPromise = this.http.post('/upload/brand', formData).toPromise();
      uploadPromises.push(uploadPromise);
    }
    
    if (uploadPromises.length === 0) {
      console.log('No files to upload, skipping API call');
      return;
    }
    
    try {
      console.log(`Uploading ${uploadPromises.length} file(s)...`);
      await Promise.all(uploadPromises);
      console.log('All files uploaded successfully');
      // Clear uploaded files after successful upload
      this.uploadedFiles = {};
    } catch (error) {
      console.error('Error uploading brand files:', error);
      throw error;
    }
  }
}
