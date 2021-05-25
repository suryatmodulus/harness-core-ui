import { getApprovalRejectionCriteriaForSubmit } from '../helper'
import { ApprovalRejectionCriteria, ApprovalRejectionCriteriaType } from '../types'

describe('Approval Rejection criteria for submit tests', () => {
  test('if criteria is set properly', () => {
    const inputCriteria: ApprovalRejectionCriteria = {
      type: ApprovalRejectionCriteriaType.KeyValues,
      spec: {
        matchAnyCondition: true,
        conditions: [{ key: 'Status', operator: 'eq', value: { label: 'Done', value: 'Done' } }]
      }
    }

    const outputCriteria = getApprovalRejectionCriteriaForSubmit(inputCriteria)
    const value = outputCriteria.spec.conditions?.[0].value
    expect(value).toBe('Done')
  })

  test('if empty keys are filtered', () => {
    const inputCriteria: ApprovalRejectionCriteria = {
      type: ApprovalRejectionCriteriaType.KeyValues,
      spec: {
        matchAnyCondition: true,
        conditions: [
          { key: 'Status', operator: 'eq', value: { label: 'Done', value: 'Done' } },
          { key: '', operator: 'eq', value: { label: 'Done', value: 'Done' } }
        ]
      }
    }

    const outputCriteria = getApprovalRejectionCriteriaForSubmit(inputCriteria)
    expect(outputCriteria.spec.conditions?.length).toBe(1)
  })

  test('if empty values are filtered', () => {
    const inputCriteria: ApprovalRejectionCriteria = {
      type: ApprovalRejectionCriteriaType.KeyValues,
      spec: {
        matchAnyCondition: true,
        conditions: [{ key: 'Status', operator: 'eq', value: '' }]
      }
    }

    const outputCriteria = getApprovalRejectionCriteriaForSubmit(inputCriteria)
    expect(outputCriteria.spec.conditions?.length).toBe(0)
  })

  test('if multiselect works', () => {
    const inputCriteria: ApprovalRejectionCriteria = {
      type: ApprovalRejectionCriteriaType.KeyValues,
      spec: {
        matchAnyCondition: true,
        conditions: [
          {
            key: 'Status',
            operator: 'eq',
            value: [
              { label: 'Done', value: 'Done' },
              { label: 'S2', value: 'S2' }
            ]
          }
        ]
      }
    }

    const outputCriteria = getApprovalRejectionCriteriaForSubmit(inputCriteria)
    const value = outputCriteria.spec.conditions?.[0].value
    expect(value).toBe('Done,S2')
  })
})
