export interface IFeatureRole {
  name: string;
  disabled: boolean;
  visible: boolean;
}

export interface User {
  workingClass: string;
  displayName: string;
  fullName: string;
  username: string;
  reissue: string;
  control: string;
  sub: string;
  clientType: string;
  staffNo: string;
  branchid: string;
  initials: string;
  userId: string;
  mngrUserId: string;
  isFinacleUser: string;
  countryId: string;
  bankId: string;
  version?: string;
  role: string[];
  featureRoles: IFeatureRole[];
  countyCode: string;
  countryCode?: string;
  countyFinacleCode: string;
  source: string;
  requiresBiometric: string;
  token_usage: string;
  jti: string;
  aud: string[];
  nbf: number;
  exp: number;
  iat: number;
  iss: string;
}
