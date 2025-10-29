export interface UserModel {
  id: number;
  email: string;
  firstName: string;
  lastName:string;
  fullName: string;
  type: string;
  status: string;
}


export interface IntegrationConnectionRequest{
  clientId: string;
  clientSecret: string;
  integrationType: string;
  oauthUri: string;
  isAuthorized: boolean;
  id: number;
}
