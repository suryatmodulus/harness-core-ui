import type { ChangeEventDTO } from 'services/cv'
import { VerificationStatus } from '../ChangeEventCard.constant'
import type { CustomChangeEventDTO } from '../ChangeEventCard.types'
import {
  createChangeDetailsData,
  createChangeInfoData,
  createChangeTitleData,
  verificationResultToColor
} from '../ChangeEventCard.utils'
import { EXECUTION_STATUS } from '../components/ChangeDetails/ChangeDetails.constant'
import { statusToColorMapping } from '../components/ChangeDetails/ChangeDetails.utils'
import { payload } from './ChangeEventCard.mock'

describe('Validate Utils', () => {
  test('should createChangeDetailsData', () => {
    expect(createChangeDetailsData(payload.resource as ChangeEventDTO)).toEqual({
      category: 'Alert',
      details: {
        environment: {
          name: 'prod'
        },
        service: {
          name: 'service1'
        },
        source: { name: 'PagerDuty', url: 'https://acme.pagerduty.com/incidents/PGR0VU2' }
      },
      status: 'triggered',
      type: 'PagerDuty'
    })
  })

  test('should createChangeDetailsData', () => {
    expect(createChangeInfoData(payload.resource.metadata)).toEqual({
      summary: {
        assignee: { name: null, url: null },
        policy: { name: 'Default', url: 'https://acme.pagerduty.com/escalation_policies/PUS0KTE' },
        priority: 'P2',
        urgency: 'high'
      },
      triggerAt: '2nd Oct 06:45 PM'
    })
  })

  test('should createChangeDetailsData', () => {
    expect(createChangeTitleData(payload.resource as CustomChangeEventDTO)).toEqual({
      executionId: 'rZc13AsoT1CZigLguBXZaw',
      name: 'A little bump in the road',
      type: 'PagerDuty'
    })
  })

  test('should verificationResultToColor', () => {
    expect(verificationResultToColor(VerificationStatus.VERIFICATION_PASSED, (str: string) => str)).toEqual({
      backgroundColor: 'green350',
      color: 'green700',
      statusMessage: 'passed'
    })
    expect(verificationResultToColor(VerificationStatus.VERIFICATION_FAILED, (str: string) => str)).toEqual({
      backgroundColor: 'red200',
      color: 'red500',
      statusMessage: 'failed'
    })
    expect(verificationResultToColor(VerificationStatus.IN_PROGRESS, (str: string) => str)).toEqual({
      backgroundColor: 'primary6',
      color: 'primary2',
      statusMessage: 'inProgress'
    })
    expect(verificationResultToColor(VerificationStatus.ERROR, (str: string) => str)).toEqual({
      backgroundColor: 'red200',
      color: 'red500',
      statusMessage: 'error'
    })
    expect(verificationResultToColor(VerificationStatus.ABORTED, (str: string) => str)).toEqual({
      backgroundColor: 'grey350',
      color: 'grey700',
      statusMessage: ''
    })
    expect(verificationResultToColor(VerificationStatus.NOT_STARTED, (str: string) => str)).toEqual({
      backgroundColor: 'grey350',
      color: 'grey700',
      statusMessage: ''
    })
    expect(verificationResultToColor(VerificationStatus.IGNORED, (str: string) => str)).toEqual({
      backgroundColor: 'grey350',
      color: 'grey700',
      statusMessage: ''
    })
  })

  test('should validate statusToColorMapping', () => {
    expect(statusToColorMapping(EXECUTION_STATUS.ABORTED)).toEqual({
      backgroundColor: 'red100',
      color: 'red500'
    })
    expect(statusToColorMapping(EXECUTION_STATUS.SUCCEEDED)).toEqual({
      backgroundColor: 'blue100',
      color: 'blue500'
    })
    expect(statusToColorMapping(EXECUTION_STATUS.RUNNING)).toEqual({
      backgroundColor: 'blue100',
      color: 'blue500'
    })
    expect(statusToColorMapping(EXECUTION_STATUS.PAUSING)).toEqual({
      backgroundColor: 'orange100',
      color: 'orange500'
    })
  })
})
