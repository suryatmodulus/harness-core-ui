import React from 'react'
import { String } from 'framework/strings'

export const FeatureDescriptor: { [key: string]: React.ReactElement } = {
  MULTIPLE_ORGANIZATIONS: <String stringID="projectsOrgs.multipleOrganizations" />,
  MULTIPLE_PROJECTS: <String stringID="projectsOrgs.multipleProjects" />,
  SECRET_MANAGERS: <String stringID="secretManagers" />,
  TEMPLATE_SERVICE: <String stringID="templatesLibrary.addNewTemplate" />,
  SAML_SUPPORT: <String stringID="authSettings.samlSupport" />,
  OAUTH_SUPPORT: <String stringID="authSettings.oauthSupport" />,
  TWO_FACTOR_AUTH_SUPPORT: <String stringID="authSettings.twoFactorAuthSupport" />,
  CUSTOM_ROLES: <String stringID="rbac.customRoles" />,
  CUSTOM_RESOURCE_GROUPS: <String stringID="rbac.customResourceGroups" />,
  DEPLOYMENTS_PER_MONTH: <String stringID="deploymentsText" />,
  INTEGRATED_APPROVALS_WITH_JIRA: <String stringID="pipeline.featureRestriction.integratedApprovalsJira" />
}

// Overrides FeatureDescriptor and provides only custom with no additions
export const CustomFeatureDescriptor: { [key: string]: React.ReactElement } = {
  TEST_INTELLIGENCE: <String stringID="pipeline.testsReports.tiCallToAction.requiresEnterprisePlan" />,
  BUILDS: <String stringID="pipeline.featureRestriction.maxBuildsPerMonth100PercentLimit" />
}
