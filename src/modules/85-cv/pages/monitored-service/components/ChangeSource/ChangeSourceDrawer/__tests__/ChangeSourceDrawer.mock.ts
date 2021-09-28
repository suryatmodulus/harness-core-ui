export const changeSourceDrawerData = {
  name: 'Harness CD',
  identifier: 'harness_cd',
  type: 'HarnessCD' as any,
  desc: 'Deployments from Harness CD',
  enabled: true,
  category: 'Deployment' as any,
  spec: {}
}

export const pagerDutyChangeSourceDrawerDataWithoutService = {
  name: 'PagerDuty 101',
  identifier: 'pagerduty',
  type: 'PagerDuty' as any,
  desc: 'Alert from PagerDuty',
  enabled: true,
  category: 'Alert' as any,
  spec: {
    connectorRef: 'PagerDutyConnector'
  }
}

export const pagerDutyChangeSourceDrawerData = {
  name: 'PagerDuty 101',
  identifier: 'pagerduty',
  type: 'PagerDuty' as any,
  desc: 'Alert from PagerDuty',
  enabled: true,
  category: 'Alert' as any,
  spec: {
    connectorRef: 'PagerDutyConnector',
    pagerDutyServiceId: 'pagerDutyServiceId101'
  }
}

export const changeSourceTableData = [
  {
    name: 'Harness CD',
    identifier: 'harness_cd',
    type: 'HarnessCD' as any,
    desc: 'Deployments from Harness CD',
    enabled: true,
    category: 'Deployment' as any,
    spec: {}
  }
]

export const onSuccessHarnessCD = [
  {
    category: 'Deployment',
    desc: 'Deployments from Harness CD',
    enabled: true,
    identifier: 'harness_cd',
    name: 'Updated Change Source',
    spec: {},
    type: 'HarnessCD'
  }
]

export const onSuccessPagerDuty = [
  {
    category: 'Alert',
    desc: 'Alert from PagerDuty',
    enabled: true,
    identifier: 'pagerduty',
    name: 'PagerDuty 101',
    spec: {
      connectorRef: 'PagerDutyConnector',
      pagerDutyServiceId: 'pagerDutyServiceId101'
    },
    type: 'PagerDuty'
  }
]

export const allFieldsEmpty = {
  category: 'Select change source provider',
  name: 'Select change source name',
  spec: {
    connectorRef: 'Connector Selection is required'
  },
  type: 'Select change source type'
}

export const emptyPagerDutyConnectorAndService = {
  spec: {
    connectorRef: 'Connector Selection is required',
    pagerDutyServiceId: ''
  }
}
