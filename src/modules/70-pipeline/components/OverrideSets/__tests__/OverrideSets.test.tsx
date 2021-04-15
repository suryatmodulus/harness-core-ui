import React from 'react'
import { render, findByText, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import OverrideSets, { OverrideSetsType } from '../OverrideSets'
let selectedTab = OverrideSetsType.Artifacts
jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => ({ children }: { children: JSX.Element }) => (
  <div>{children}</div>
))

describe('OverrideSet tests', () => {
  test(`renders without crashing`, () => {
    const { container } = render(
      <TestWrapper>
        <OverrideSets selectedTab={selectedTab} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test(`renders creation modal without crashing`, async () => {
    const { container } = render(
      <TestWrapper>
        <OverrideSets selectedTab={selectedTab} />
      </TestWrapper>
    )
    const creationButton = await findByText(container, 'overrideSets.createOverrideSetPlus')
    fireEvent.click(creationButton)
    const creationModalInputTitle = await findByText(document.body, 'Override Set Name')
    expect(creationModalInputTitle).toBeDefined()
  })
  test(`created artifact override set without crashing`, async () => {
    const { container } = render(
      <TestWrapper>
        <OverrideSets selectedTab={selectedTab} />
      </TestWrapper>
    )
    //create artifact override
    const creationButton = await findByText(container, 'overrideSets.createOverrideSetPlus')
    fireEvent.click(creationButton)
    const creationModalInputTitle = await findByText(document.body, 'Override Set Name')
    expect(creationModalInputTitle).toBeDefined()
    const overrideSetNameInput = document.querySelector('input[class*="bp3-input"]')
    expect(overrideSetNameInput).toBeDefined()
    await act(async () => {
      fireEvent.change(overrideSetNameInput!, {
        target: { value: 'Dummy Set Name' }
      })
      fireEvent.click(await findByText(document.body, 'Submit'))
    })
  })

  test(`created manfests override set without crashing`, async () => {
    selectedTab = OverrideSetsType.Manifests
    const { container } = render(
      <TestWrapper>
        <OverrideSets selectedTab={selectedTab} />
      </TestWrapper>
    )
    //create artifact override
    const creationButton = await findByText(container, 'overrideSets.createOverrideSetPlus')
    fireEvent.click(creationButton)
    const creationModalInputTitle = await findByText(document.body, 'Override Set Name')
    expect(creationModalInputTitle).toBeDefined()
    const overrideSetNameInput = document.querySelector('input[class*="bp3-input"]')
    expect(overrideSetNameInput).toBeDefined()
    await act(async () => {
      fireEvent.change(overrideSetNameInput!, {
        target: { value: 'Dummy Set Name' }
      })
      fireEvent.click(await findByText(document.body, 'Submit'))
    })
  })

  test(`created manfests override set without crashing`, async () => {
    selectedTab = OverrideSetsType.Variables
    const { container } = render(
      <TestWrapper>
        <OverrideSets selectedTab={selectedTab} />
      </TestWrapper>
    )
    //create artifact override
    const creationButton = await findByText(container, 'overrideSets.createOverrideSetPlus')
    fireEvent.click(creationButton)
    const creationModalInputTitle = await findByText(document.body, 'Override Set Name')
    expect(creationModalInputTitle).toBeDefined()
    const overrideSetNameInput = document.querySelector('input[class*="bp3-input"]')
    expect(overrideSetNameInput).toBeDefined()
    await act(async () => {
      fireEvent.change(overrideSetNameInput!, {
        target: { value: 'Dummy Set Name' }
      })
      fireEvent.click(await findByText(document.body, 'Submit'))
    })
  })
})
