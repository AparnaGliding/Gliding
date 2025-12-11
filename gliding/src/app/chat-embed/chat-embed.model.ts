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
  userResponseBackground: string;
  botResponseBackground: string;
  userMessageColour?: string;
  botMessageColour?: string;
  backgroundColour?: string;
  textAreaColour?: string;
  fullView?: boolean;
  borderColour?: string;
  width: string;
  height: string;
  marginLeft: string;
  marginRight: string;
  sameView: boolean;
  headerNeeded: boolean;
  logoFile: string;
  companyName: string;
}
export interface ApplicationListingModel {
  id: number;
  name: string;
  url: string;
  domain: string;
  crawlType: string;
}
