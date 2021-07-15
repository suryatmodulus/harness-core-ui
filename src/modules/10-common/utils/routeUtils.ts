import type {
  AccountPathProps,
  OrgPathProps,
  ProjectPathProps,
  PipelinePathProps,
  TriggerPathProps,
  ExecutionPathProps,
  ConnectorPathProps,
  SecretsPathProps,
  PipelineType,
  FeatureFlagPathProps,
  SegmentPathProps,
  CVDataSourceTypePathProps,
  BuildPathProps,
  EnvironmentPathProps,
  DelegatePathProps,
  DelegateConfigProps,
  InputSetPathProps,
  VerificationPathProps,
  TargetPathProps,
  ModulePathParams,
  RolePathProps,
  ResourceGroupPathProps,
  UserGroupPathProps,
  UserPathProps,
  ServiceAccountPathProps,
  ServicePathProps
} from '@common/interfaces/RouteInterfaces'

export const accountPathProps: AccountPathProps = {
  accountId: ':accountId'
}

export const orgPathProps: OrgPathProps = {
  ...accountPathProps,
  orgIdentifier: ':orgIdentifier'
}

export const projectPathProps: ProjectPathProps = {
  ...orgPathProps,
  projectIdentifier: ':projectIdentifier'
}

export const pipelinePathProps: PipelinePathProps = {
  ...projectPathProps,
  pipelineIdentifier: ':pipelineIdentifier'
}

export const inputSetFormPathProps: InputSetPathProps = {
  ...pipelinePathProps,
  inputSetIdentifier: ':inputSetIdentifier'
}

export const triggerPathProps: TriggerPathProps = {
  ...pipelinePathProps,
  triggerIdentifier: ':triggerIdentifier'
}

export const executionPathProps: ExecutionPathProps = {
  ...pipelinePathProps,
  executionIdentifier: ':executionIdentifier'
}

export const connectorPathProps: ConnectorPathProps = {
  connectorId: ':connectorId'
}
export const verificationPathProps: VerificationPathProps = {
  verificationId: ':verificationId'
}

export const secretPathProps: SecretsPathProps = {
  secretId: ':secretId'
}

export const rolePathProps: RolePathProps = {
  roleIdentifier: ':roleIdentifier'
}

export const userGroupPathProps: UserGroupPathProps = {
  userGroupIdentifier: ':userGroupIdentifier'
}

export const userPathProps: UserPathProps = {
  userIdentifier: ':userIdentifier'
}

export const serviceAccountProps: ServiceAccountPathProps = {
  serviceAccountIdentifier: ':serviceAccountIdentifier'
}

export const resourceGroupPathProps: ResourceGroupPathProps = {
  resourceGroupIdentifier: ':resourceGroupIdentifier'
}

export const delegatePathProps: DelegatePathProps = {
  delegateId: ':delegateId'
}

export const delegateConfigProps: DelegateConfigProps = {
  delegateConfigId: ':delegateConfigId'
}

export const modulePathProps: ModulePathParams = {
  module: ':module'
}

export const pipelineModuleParams: Record<keyof PipelineType<unknown>, 'ci' | 'cd' | 'cf' | ':module'> = {
  module: ':module'
}

export const featureFlagPathProps: FeatureFlagPathProps = {
  featureFlagIdentifier: ':featureFlagIdentifier'
}

export const cvDataSourceTypePathProps: CVDataSourceTypePathProps = {
  dataSourceType: ':dataSourceType'
}

export const buildPathProps: BuildPathProps = {
  ...projectPathProps,
  buildIdentifier: ':buildIdentifier'
}

export const environmentPathProps: EnvironmentPathProps = {
  environmentIdentifier: ':environmentIdentifier'
}

export const segmentPathProps: SegmentPathProps = {
  segmentIdentifier: ':segmentIdentifier'
}

export const targetPathProps: TargetPathProps = {
  targetIdentifier: ':targetIdentifier'
}

export const servicePathProps: ServicePathProps = {
  serviceId: ':serviceId'
}

export function withAccountId<T>(fn: (args: T) => string) {
  return (params: T & { accountId: string }): string => {
    const path = fn(params)

    return `/account/${params.accountId}/${path.replace(/^\//, '')}`
  }
}

export function withOrgIdentifier<T>(fn: (args: T) => string) {
  return (params: T & { orgIdentifier: string }): string => {
    const path = fn(params)

    return `/orgs/${params.orgIdentifier}/${path.replace(/^\//, '')}`
  }
}

export function withProjectIdentifier<T>(fn: (args: T) => string) {
  return (params: T & { projectIdentifier: string }): string => {
    const path = fn(params)

    return `/projects/${params.projectIdentifier}/${path.replace(/^\//, '')}`
  }
}

export const getScopeBasedRoute = ({
  scope: { orgIdentifier, projectIdentifier, module },
  path
}: {
  scope: Partial<ProjectPathProps & ModulePathParams>
  path: string
}): string => {
  if (module && orgIdentifier && projectIdentifier) {
    return `/${module}/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/${path}`
  } else if (orgIdentifier && projectIdentifier) {
    return `/home/orgs/${orgIdentifier}/projects/${projectIdentifier}/setup/${path}`
  } else if (orgIdentifier) {
    return `/home/organizations/${orgIdentifier}/setup/${path}`
  }
  return `/home/setup/${path}`
}
export const returnUrlParams = (url: string): string => `?returnUrl=${url}`
export const validateReturnUrl = (url: string): boolean => {
  if (url && typeof url === 'string') {
    if (url.startsWith('/')) {
      return true
    } else {
      try {
        const validUrl = new URL(url)
        return window.location.hostname === validUrl.hostname
      } catch (_e) {
        return false
      }
    }
  }
  return false
}

export const returnLaunchUrl = (url: string): string => `${window.location.pathname.replace(/\/ng\//, '/')}${url}`
