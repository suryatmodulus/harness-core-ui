import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import { TemplateSelector } from '../TemplateSelector'

describe('<TemplateSelector /> tests', () => {
  test('snapshot test', async () => {
    const { container } = render(
      <TestWrapper>
        <TemplateSelector templateType={TemplateType.Service} childTypes={['Http']} onUseTemplate={jest.fn()} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
