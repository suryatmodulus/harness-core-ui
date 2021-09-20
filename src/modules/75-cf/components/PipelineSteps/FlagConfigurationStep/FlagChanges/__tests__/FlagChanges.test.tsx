import React from 'react'
import { act, getByRole, getByTestId, render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { subSectionNameMap } from '@cf/components/PipelineSteps/FlagConfigurationStep/FlagChanges/SubSectionSelector'
import DefaultRules from '@cf/components/PipelineSteps/FlagConfigurationStep/FlagChanges/subSections/DefaultRules'
import FlagChanges, { allSubSections } from '../FlagChanges'

const renderComponent = (): RenderResult =>
  render(
    <TestWrapper>
      <FlagChanges />
    </TestWrapper>
  )

const getConfigureMoreButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'cf.pipeline.flagConfiguration.configureMore' })

describe('FlagChanges', () => {
  test('it should display the Flag Changes heading', async () => {
    renderComponent()

    expect(screen.getByRole('heading', { name: 'cf.pipeline.flagConfiguration.flagChanges' })).toBeInTheDocument()
  })

  test('it should display the first sub-section when initially rendered', async () => {
    const { container } = renderComponent()

    expect(container.querySelectorAll('.subSection')).toHaveLength(1)
  })

  test('it should add another sub-section when the Configure More button is pressed', async () => {
    const { container } = renderComponent()

    expect(container.querySelectorAll('.subSection')).toHaveLength(1)

    const configureMoreButton = getConfigureMoreButton()
    expect(configureMoreButton).toBeInTheDocument()

    userEvent.click(configureMoreButton)
    await waitFor(() => {
      expect(container.querySelectorAll('.subSection')).toHaveLength(2)
    })
  })

  test('it should hide the Configure More button when all sub-sections are displayed', async () => {
    const expectedSubSections = allSubSections.length
    const { container } = renderComponent()

    const configureMoreButton = getConfigureMoreButton()

    await act(async () => {
      for (let clicks = 0; clicks < expectedSubSections - 1; clicks++) {
        await userEvent.click(configureMoreButton)
      }
    })

    expect(container.querySelectorAll('.subSection')).toHaveLength(expectedSubSections)
    expect(configureMoreButton).not.toBeInTheDocument()
  })

  test('it should display a remove sub-section button for each sub-section only when there is more than one sub-section', async () => {
    renderComponent()
    expect(screen.queryAllByTestId('flagChanges-removeSubSection')).toHaveLength(0)

    userEvent.click(getConfigureMoreButton())
    await waitFor(() => {
      expect(screen.getAllByTestId('flagChanges-removeSubSection')).toHaveLength(2)
    })
  })

  test('it should remove the sub-section which contains the remove sub-section button that is clicked', async () => {
    renderComponent()

    userEvent.click(getConfigureMoreButton())

    const setFlagSwitchSubSection = screen.getByTestId('flagChanges-setFlagSwitch')

    userEvent.click(getByTestId(setFlagSwitchSubSection, 'flagChanges-removeSubSection'))
    expect(screen.queryByTestId('flagChanges-setFlagSwitch')).not.toBeInTheDocument()
  })

  test('it should replace the sub-section when the sub-section selector is changed', async () => {
    renderComponent()

    const setFlagSwitchSubSection = screen.getByTestId('flagChanges-setFlagSwitch')
    expect(setFlagSwitchSubSection).toBeInTheDocument()

    userEvent.click(getByRole(setFlagSwitchSubSection, 'button'))
    userEvent.click(screen.getByText(subSectionNameMap[DefaultRules.name]))

    expect(setFlagSwitchSubSection).not.toBeInTheDocument()
    expect(screen.getByTestId('flagChanges-defaultRules')).toBeInTheDocument()
  })
})
