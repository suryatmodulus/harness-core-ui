import { createCardOptions, validateChangeSource } from '../ChangeSourceDrawer.utils'
import { allFieldsEmpty, emptyPagerDutyConnectorAndService } from './ChangeSourceDrawer.mock'

function mockGetString(name: string): string {
  switch (name) {
    case 'cv.onboarding.changeSourceTypes.HarnessCDNextGen.name':
      return 'Harness CD NextGen'
    case 'kubernetesText':
      return 'Kubernetes'
    case 'common.pagerDuty':
      return 'PagerDuty'
    case 'cv.changeSource.duplicateIdentifier':
      return 'identifier already exist'
    case 'cv.changeSource.selectChangeSourceName':
      return 'Select change source name'
    case 'cv.changeSource.selectChangeSourceProvider':
      return 'Select change source provider'
    case 'cv.changeSource.selectChangeSourceType':
      return 'Select change source type'
    case 'cv.onboarding.selectProductScreen.validationText.connectorRef':
      return 'Connector Selection is required'
    default:
      return ''
  }
}
describe('Validate ChnagSource Utils', () => {
  test('Validate CreateCardOptions', () => {
    expect(createCardOptions('Deployment', mockGetString)).toEqual([
      { category: 'Deployment', icon: 'cd-main', label: 'Harness CD NextGen', value: 'HarnessCD' }
    ])
    expect(createCardOptions('Infrastructure', mockGetString)).toEqual([
      { category: 'Infrastructure', icon: 'app-kubernetes', label: 'Kubernetes', value: 'K8sCluster' }
    ])
    expect(createCardOptions('Alert', mockGetString)).toEqual([
      { category: 'Alert', icon: 'service-pagerduty', label: 'PagerDuty', value: 'PagerDuty' }
    ])
  })

  test('ValidateChangeSource', () => {
    // None of the fields are populated
    expect(validateChangeSource({ spec: {} }, [], false, mockGetString)).toEqual(allFieldsEmpty)
    // Validate HarnessCD having no empty fields
    expect(
      validateChangeSource(
        { name: 'HarnessCD', type: 'HarnessCD', category: 'Deployment', spec: {} },
        [],
        false,
        mockGetString
      )
    ).toEqual({})
    // Validate PagerDuty having empty Connector and PagerDuty Service
    expect(
      validateChangeSource(
        { name: 'pagerduty', type: 'PagerDuty', category: 'Alert', spec: {} },
        [],
        false,
        mockGetString
      )
    ).toEqual(emptyPagerDutyConnectorAndService)
  })
})
