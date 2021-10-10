import type { ChangeEventDTO } from 'services/cv'
import type { CustomChangeEventDTO } from '../ChangeCard.types'
import { createChangeDetailsData, createChangeInfoData, createChangeTitleData } from '../ChangeCard.utils'
import { payload } from './ChangeCard.mock'

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
        source: 'PagerDuty'
      },
      status: 'triggered',
      type: 'PagerDuty'
    })
  })

  test('should createChangeDetailsData', () => {
    expect(createChangeInfoData(payload.resource.metadata)).toEqual({
      summary: { assignee: 'PGR0VU2', policy: 'Default', priority: 'P2', urgency: 'high' },
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
