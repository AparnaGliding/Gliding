
// export type FieldType = 'toggle' | 'radio' | 'color-picker' | 'input' | 'dropdown' | 'textarea';

export interface ColorPickerField {
  type: string;
  value: string;
  from: string;
  to: string;
  css: string;
}

export interface WidgetConfiguration {
  id: number;
  mode: string;
  title: string;
  headerNeeded: boolean;
  headerColor: ColorPickerField;
  backgroundColor: ColorPickerField;
  buttonColor: ColorPickerField;
  textColor: ColorPickerField;
  textAreaColour: ColorPickerField;

  userMessageColour: ColorPickerField;
  botMessageColour: ColorPickerField;
  inputAreaColour: ColorPickerField;
  borderColour: ColorPickerField;

  greetingMessage: string;
  inputPlaceholder: string;

  position: string;
  offsetX: number;
  offsetY: number;

  tone: string;
  formalityLevel: string;

  customInstruction?: string | null;

  createdAt?: string;
  modifiedAt?: string;
  applicationId: number;
}



export interface FormField {
  id: string;
  type: string;
  label?: string;
  value?: any;
  placeholder?: string;
  rows?: number;
  options?: string[];
  colorPicker?: ColorPickerField;

}


export interface CardSection {
  id: string;
  title: string;
  collapsed: boolean;
  fields: FormField[];
}

