import React, { FC } from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import SubSectionSelector, { subSectionNameMap, SubSectionSelectorProps } from '../SubSectionSelector'

const SetFlagSwitch: FC = () => <span />
const DefaultRules: FC = () => <span />
const ServePercentageRollout: FC = () => <span />

const renderComponent = (props: Partial<SubSectionSelectorProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <SubSectionSelector
        availableSubSections={[DefaultRules, ServePercentageRollout]}
        currentSubSection={SetFlagSwitch}
        onSubSectionChange={jest.fn()}
        {...props}
      />
    </TestWrapper>
  )

describe('SubSectionSelector', () => {
  test('it should display the current subsection name', async () => {
    renderComponent()

    expect(screen.getByText(subSectionNameMap[SetFlagSwitch.name])).toBeInTheDocument()
  })

  test('it should have a button which opens the sub-section menu', async () => {
    renderComponent()

    const btn = screen.getByRole('button')
    expect(btn).toBeInTheDocument()
    expect(screen.queryByText(subSectionNameMap[DefaultRules.name])).not.toBeInTheDocument()
    expect(screen.queryByText(subSectionNameMap[ServePercentageRollout.name])).not.toBeInTheDocument()

    userEvent.click(btn)

    expect(screen.getByText(subSectionNameMap[DefaultRules.name])).toBeInTheDocument()
    expect(screen.getByText(subSectionNameMap[ServePercentageRollout.name])).toBeInTheDocument()
  })

  test('it should call the onSubSectionChange handler when the sub-section is changed', async () => {
    const onSubSectionChange = jest.fn()
    const newSubSection = ServePercentageRollout

    renderComponent({ onSubSectionChange })

    const btn = screen.getByRole('button')
    userEvent.click(btn)

    userEvent.click(screen.getByText(subSectionNameMap[newSubSection.name]))

    expect(onSubSectionChange).toHaveBeenCalledWith(newSubSection)
  })

  test('it should not display the button when there are no available sub-sections', function () {
    const currentSubSection = DefaultRules
    renderComponent({ currentSubSection, availableSubSections: [] })

    expect(screen.getByText(subSectionNameMap[currentSubSection.name])).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
