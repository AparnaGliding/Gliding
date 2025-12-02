export interface WidgetResponseModel {
  id: number;
  mode: string;
  title: string;
  headerColor: string;
  backgroundColor: string;
  buttonColor: string;
  textColor: string;
  greetingMessage: string;
  inputPlaceholder: string;
  position: string;
  offsetX: number;
  offsetY: number;
  applicationId: string;
}
export interface ApplicationListingModel {
  id: number;
  name: string;
  url: string;
  domain: string;
  crawlType: string;
}
