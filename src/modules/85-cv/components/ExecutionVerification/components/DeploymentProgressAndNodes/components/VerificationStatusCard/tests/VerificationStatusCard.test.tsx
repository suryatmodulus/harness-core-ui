import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import VerificationStatusCard from '@cv/components/ExecutionVerification/components/DeploymentProgressAndNodes/components/VerificationStatusCard/VerificationStatusCard'

describe('VerificationStatusCard', () => {
  test('matches snapshot when status = IN_PROGRESS', () => {
    const { container } = render(
      <TestWrapper>
        <VerificationStatusCard status="IN_PROGRESS" />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('matches snapshot when status = ERROR', () => {
    const { container } = render(
      <TestWrapper>
        <VerificationStatusCard status="ERROR" />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('matches snapshot when status = VERIFICATION_FAILED', () => {
    const { container } = render(
      <TestWrapper>
        <VerificationStatusCard status="VERIFICATION_FAILED" />{' '}
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('matches snapshot when status = VERIFICATION_PASSED', () => {
    const { container } = render(
      <TestWrapper>
        <VerificationStatusCard status="VERIFICATION_PASSED" />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
