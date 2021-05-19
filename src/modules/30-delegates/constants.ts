export const DelegateTypes = {
  KUBERNETES_CLUSTER: 'K8sCluster',
  DOCKER: 'DOCKER',
  ECS: 'ECS',
  LINUX: 'LINUX'
}

export const POLL_INTERVAL = 2 /* sec */ * 1000 /* ms */
export const TIME_OUT = 5 * 60 * 1000

export enum DelegateStatus {
  ENABLED = 'ENABLED',
  WAITING_FOR_APPROVAL = 'WAITING_FOR_APPROVAL',
  DISABLED = 'DISABLED',
  DELETED = 'DELETED'
}

export enum EnvironmentType {
  PROD = 'PROD',
  NON_PROD = 'NON_PROD'
}

export const fullSizeContentStyle: React.CSSProperties = {
  position: 'fixed',
  top: '135px',
  left: '270px',
  width: 'calc(100% - 270px)',
  height: 'calc(100% - 135px)'
}

export enum TroubleShootingTypes {
  VERIFY_PODS_COMEUP = 'VERIFY_PODS_COMEUP',
  VERIFY_EVENTS = 'VERIFY_EVENTS',
  VERIFY_HARNESS_SASS = 'VERIFY_HARNESS_SASS',
  CONTACT_HARNESS_SUPPORT = 'CONTACT_HARNESS_SUPPORT'
}

export enum DelegateSize {
  LAPTOP = 'LAPTOP',
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE'
}
