import React from 'react'
import { render } from '@testing-library/react'
import TemplateStageSetupShell from '@templates-library/components/TemplateStageSetupShell/TemplateStageSetupShell'

jest.mock('@templates-library/components/TemplateStageSpecifications/TemplateStageSpecifications', () => ({
  ...(jest.requireActual(
    '@templates-library/components/TemplateStageSpecifications/TemplateStageSpecifications'
  ) as any),
  TemplateStageSpecifications: () => {
    return <div className="template-stage-specifications" />
  }
}))

describe('<TemplateStageSetupShell /> tests', () => {
  test('snapshot test', async () => {
    const { container } = render(<TemplateStageSetupShell />)
    expect(container).toMatchSnapshot()
  })
})
