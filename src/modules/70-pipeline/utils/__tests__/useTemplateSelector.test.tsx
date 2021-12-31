import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import pipelineContextMock from '@pipeline/components/PipelineStudio/RightDrawer/__tests__/stateMock'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useTemplateSelector } from '@pipeline/utils/useTemplateSelector'

const Wrapped = (): React.ReactElement => {
  const { openTemplateSelector, closeTemplateSelector } = useTemplateSelector()
  return (
    <>
      <button onClick={() => openTemplateSelector({})}>Open Template Selector</button>
      <button onClick={closeTemplateSelector}>Close Template Selector</button>
    </>
  )
}

describe('useTemplateSelector Test', () => {
  test('should work as expected', async () => {
    const { getByText } = render(
      <PipelineContext.Provider value={pipelineContextMock}>
        <TestWrapper>
          <Wrapped />
        </TestWrapper>
      </PipelineContext.Provider>
    )

    const openTemplateSelectorBtn = getByText('Open Template Selector')
    await act(async () => {
      fireEvent.click(openTemplateSelectorBtn)
    })
    expect(pipelineContextMock.updateTemplateView).toBeCalled()

    const copyTemplateBtn = getByText('Close Template Selector')
    await act(async () => {
      fireEvent.click(copyTemplateBtn!)
    })
    expect(pipelineContextMock.updateTemplateView).toBeCalled()
  })
})
