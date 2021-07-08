export enum CCE_VIEWS {
  CLUSTER = 'CLUSTER',
  AWS = 'AWS',
  GCP = 'GCP',
  AZURE = 'AZURE'
}

export const FIELD_TO_ICON_MAPPING: Record<string, string> = {
  [CCE_VIEWS.CLUSTER]: 'blue-black-cluster',
  [CCE_VIEWS.AWS]: 'service-aws',
  [CCE_VIEWS.GCP]: 'gcp',
  [CCE_VIEWS.AZURE]: 'service-azure'
}

export enum Operator {
  IN = 'IN',
  NOT_IN = 'NOT_IN',
  ONE_OF = 'ONE_OF',
  CONTAINS = 'CONTAINS',
  DOES_NOT_CONTAIN = 'DOES_NOT_CONTAIN',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',
  NULL = 'NULL',
  NOT_NULL = 'NOT_NULL'
}
