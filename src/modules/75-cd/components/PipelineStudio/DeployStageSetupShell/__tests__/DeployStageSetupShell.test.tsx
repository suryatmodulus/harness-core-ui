import React from 'react'
import { render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import DeployStageSetupShell from '../DeployStageSetupShell'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({
  validateJSONWithSchema: jest.fn(() => Promise.resolve(new Map()))
}))
window.HTMLElement.prototype.scrollTo = jest.fn()

describe('DeployStageSetupShell tests', () => {
  test('opens services tab by default', async () => {
    const { container, findByTestId } = render(
      <TestWrapper>
        <DeployStageSetupShell />
      </TestWrapper>
    )

    const serviceTab = await findByTestId('service')

    expect(container).toMatchSnapshot()
    expect(serviceTab.getAttribute('aria-selected')).toBe('true')
  })
})
