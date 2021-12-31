import React from 'react'
import '@pipeline/components/CommonPipelineStages/ApprovalStage'
import '@pipeline/components/CommonPipelineStages/CustomStage'
import '@pipeline/components/CommonPipelineStages/PipelineStage'

import RbacFactory from '@rbac/factories/RbacFactory'
import ExecFactory from '@pipeline/factories/ExecutionFactory'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { String } from 'framework/strings'
import LandingDashboardFactory from '@common/factories/LandingDashboardFactory'
import LandingDashboardDeploymentsWidget from '@pipeline/components/LandingDashboardDeploymentsWidget/LandingDashboardDeploymentsWidget'

import PipelineResourceModal from '@pipeline/components/RbacResourceModals/PipelineResourceModal/PipelineResourceModal'
import ServiceResourceModal from '@pipeline/components/RbacResourceModals/ServiceResourceModal/ServiceResourceModal'
import EnvironmentResourceModal from '@pipeline/components/RbacResourceModals/EnvironmentResourceModal/EnvironmentResourceModal'
import { HarnessApprovalView } from '@pipeline/components/execution/StepDetails/views/HarnessApprovalView/HarnessApprovalView'
import { JiraApprovalView } from '@pipeline/components/execution/StepDetails/views/JiraApprovalView/JiraApprovalView'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { ServiceNowApprovalView } from '@pipeline/components/execution/StepDetails/views/ServiceNowApprovalView/ServiceNowApprovalView'
import type { ResourceDTO, ResourceScopeDTO } from 'services/audit'
import AuditTrailFactory from '@audit-trail/factories/AuditTrailFactory'
import routes from '@common/RouteDefinitions'
import type { Module } from '@common/interfaces/RouteInterfaces'
import PipelineResourceRenderer from './components/RbacResourceModals/PipelineResourceRenderer/PipelineResourceRenderer'
import { ModuleName } from '../../framework/types/ModuleName'
/**
 * Register RBAC resources
 */
RbacFactory.registerResourceTypeHandler(ResourceType.PIPELINE, {
  icon: 'pipeline-deployment',
  label: 'pipelines',
  permissionLabels: {
    [PermissionIdentifier.VIEW_PIPELINE]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_PIPELINE]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_PIPELINE]: <String stringID="rbac.permissionLabels.delete" />,
    [PermissionIdentifier.EXECUTE_PIPELINE]: <String stringID="rbac.permissionLabels.execute" />
  },
  // eslint-disable-next-line react/display-name
  addResourceModalBody: props => <PipelineResourceModal {...props} />,
  // eslint-disable-next-line react/display-name
  staticResourceRenderer: props => <PipelineResourceRenderer {...props} />
})

RbacFactory.registerResourceTypeHandler(ResourceType.SERVICE, {
  icon: 'service-deployment',
  label: 'services',
  permissionLabels: {
    [PermissionIdentifier.VIEW_SERVICE]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_SERVICE]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_SERVICE]: <String stringID="rbac.permissionLabels.delete" />,
    [PermissionIdentifier.RUNTIMEACCESS_SERVICE]: <String stringID="rbac.permissionLabels.access" />
  },
  // eslint-disable-next-line react/display-name
  addResourceModalBody: props => <ServiceResourceModal {...props} />
})

RbacFactory.registerResourceTypeHandler(ResourceType.ENVIRONMENT, {
  icon: 'environment',
  label: 'environments',
  permissionLabels: {
    [PermissionIdentifier.VIEW_ENVIRONMENT]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.EDIT_ENVIRONMENT]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_ENVIRONMENT]: <String stringID="rbac.permissionLabels.delete" />,
    [PermissionIdentifier.RUNTIMEACCESS_ENVIRONMENT]: <String stringID="rbac.permissionLabels.access" />
  },
  // eslint-disable-next-line react/display-name
  addResourceModalBody: props => <EnvironmentResourceModal {...props} />
})

/**
 * Register execution step detail views
 */
ExecFactory.registerStepDetails(StepType.HarnessApproval, {
  component: HarnessApprovalView
})

ExecFactory.registerStepDetails(StepType.JiraApproval, {
  component: JiraApprovalView
})

ExecFactory.registerStepDetails(StepType.ServiceNowApproval, {
  component: ServiceNowApprovalView
})

/**
 * Register for Landing Page
 * */
LandingDashboardFactory.registerModuleDashboardHandler(ModuleName.CD, {
  label: 'deploymentsText',
  icon: 'cd-main',
  iconProps: { size: 20 },
  // eslint-disable-next-line react/display-name
  moduleDashboardRenderer: () => <LandingDashboardDeploymentsWidget />
})

/**
 * Register for Audit Trail
 * */
AuditTrailFactory.registerResourceHandler(ResourceType.PIPELINE, {
  moduleIcon: {
    name: 'cd-main',
    size: 30
  },
  resourceUrl: (_: ResourceDTO, resourceScope: ResourceScopeDTO, module?: Module) => {
    const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope
    if (module && accountIdentifier && orgIdentifier && projectIdentifier) {
      return routes.toPipelines({
        module,
        orgIdentifier,
        projectIdentifier,
        accountId: accountIdentifier
      })
    }
    return undefined
  }
})

AuditTrailFactory.registerResourceHandler(ResourceType.SERVICE, {
  moduleIcon: {
    name: 'cd-main',
    size: 30
  },
  resourceUrl: (_: ResourceDTO, resourceScope: ResourceScopeDTO, module?: Module) => {
    const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope
    if (module && accountIdentifier && orgIdentifier && projectIdentifier) {
      return routes.toServices({
        module,
        orgIdentifier,
        projectIdentifier,
        accountId: accountIdentifier
      })
    }
    return undefined
  }
})

AuditTrailFactory.registerResourceHandler(ResourceType.ENVIRONMENT, {
  moduleIcon: {
    name: 'cd-main',
    size: 30
  },
  resourceUrl: (_: ResourceDTO, __: ResourceScopeDTO) => {
    return undefined
  }
})
