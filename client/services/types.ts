export interface PasskeyInfo {
  name: string;
  device: object;
  createdAt: string;
  id: string;
}

export interface CredentialPhoneInitResponse {
  credential_uuid: string;
}

export interface Config {
  page_background_color?: string;
  page_background_image?: string;
  background_color?: string;
  background_image?: string;
  buttons_color?: string;
  login_logo?: string;
  company_name?: string;
}
