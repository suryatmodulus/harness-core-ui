import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { BuildStage } from '../BuildStage'

jest.mock('../EditStageView/EditStageView', () => ({ EditStageView: () => <div /> }))
jest.mock('../../BuildStageSetupShell/BuildStageSetupShell', () => () => <div />)
jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))

describe('BuildStage', () => {
  test('matches snapshot', () => {
    const { container } = render(
      <TestWrapper>
        <BuildStage
          name="test"
          type="ADVANCED"
          icon="ci-main"
          isDisabled={false}
          isApproval={false}
          title="test"
          description=""
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('matches snapshot when minimal="true"', () => {
    const { container } = render(
      <TestWrapper>
        <BuildStage
          name="test"
          type="ADVANCED"
          icon="ci-main"
          isDisabled={false}
          isApproval={false}
          title="test"
          description=""
          minimal
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
