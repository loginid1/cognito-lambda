export interface Credential {
  uuid: string;
  type?: string;
  status: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface CredentialsData {
  credentials: Credential[];
}

export interface CredentialData {
  credential: Credential;
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
