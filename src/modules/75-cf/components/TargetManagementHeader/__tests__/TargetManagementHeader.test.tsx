import React from 'react'
import { render, screen } from '@testing-library/react'
import TargetManagementHeader from '@cf/components/TargetManagementHeader/TargetManagementHeader'
import { TestWrapper } from '@common/utils/testUtils'

const envSelectId = 'TEST_ENV_SELECT'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const renderComponent = (hasEnvironments = true) =>
  render(
    <TargetManagementHeader
      environmentSelect={<span data-testid={envSelectId}>Select</span>}
      hasEnvironments={hasEnvironments}
    />,
    { wrapper: TestWrapper }
  )

describe('TargetManagementHeader', () => {
  test('it should render the title, section toggle and environment switcher', async () => {
    renderComponent()

    expect(screen.getByText('cf.shared.targetManagement')).toBeInTheDocument()
    expect(screen.getByTestId('CFSectionToggle')).toBeInTheDocument()
    expect(screen.getByTestId(envSelectId)).toBeInTheDocument()
  })

  test('it should render the spacer when hasEnvironments is false', async () => {
    renderComponent(true)
    expect(screen.queryByTestId('CFTargetManagementHeaderSpacer')).not.toBeInTheDocument()

    renderComponent(false)
    expect(screen.queryByTestId('CFTargetManagementHeaderSpacer')).toBeInTheDocument()
  })
})
