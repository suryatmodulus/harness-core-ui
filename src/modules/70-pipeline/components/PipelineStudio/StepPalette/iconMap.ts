import type { IconName } from '@wings-software/uicore'

type iconMapOptions = {
  [key: string]: IconName
}

export const iconMap: iconMapOptions = {
  Apply: 'main-code-yaml',
  Scale: 'swap-vertical',
  'Stage Deployment': 'pipeline-deploy',
  'K8s Rolling Rollback': 'rolling',
  'Swap Selectors': 'command-swap',
  Delete: 'main-trash',
  Deployment: 'main-canary',
  'Terraform Apply': 'service-terraform',
  'Terraform Provision': 'service-terraform',
  'Terraform Delete': 'service-terraform',
  'Create Stack': 'service-cloudformation',
  'Delete Stack': 'service-cloudformation',
  'Shell Script Provisioner': 'command-shell-script',
  Jira: 'service-jira',
  ServiceNow: 'service-servicenow',
  Email: 'command-email',
  Barriers: 'barrier-open',
  'New Relic Deployment Maker': 'service-newrelic',
  'Templatized Secret Manager': 'main-template-library',
  Run: 'run-step',
  'Restore Cache': 'restore-cache-step',
  'Save Cache': 'save-cache-step',
  'Git Clone': 'git-clone-step',
  // TODO: temp icons
  // >> start
  JIRA: 'service-jira',
  'Approval Step': 'command-approval',
  HTTP: 'command-http',
  Plugin: 'git-clone-step',
  ResourceConstraint: 'traffic-lights'
  // << end
}

// This is temporary, need to get types as above for icons
export const iconMapByName: iconMapOptions = {
  Kubernetes: 'service-kubernetes',
  'Infrastructure Provisioners': 'yaml-builder-env',
  'Issue Tracking': 'error',
  Notification: 'notifications',
  'Flow Control': 'flow-branch',
  Utilities: 'utility'
}
