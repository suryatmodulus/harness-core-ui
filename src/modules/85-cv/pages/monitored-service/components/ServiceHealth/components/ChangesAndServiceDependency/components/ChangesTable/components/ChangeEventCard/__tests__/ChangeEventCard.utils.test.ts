import type { ChangeEventDTO } from 'services/cv'
import type { CustomChangeEventDTO } from '../ChangeEventCard.types'
import { createChangeDetailsData, createChangeInfoData, createChangeTitleData } from '../ChangeEventCard.utils'
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
})
