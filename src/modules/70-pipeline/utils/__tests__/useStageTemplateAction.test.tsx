/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useStageTemplateActions } from '@pipeline/utils/useStageTemplateActions'
import pipelineContextMock from '@pipeline/components/PipelineStudio/RightDrawer/__tests__/stateMock'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useTemplateSelector } from '@pipeline/utils/useTemplateSelector'

jest.mock('@pipeline/utils/useTemplateSelector', () => ({
  useTemplateSelector: jest.fn().mockReturnValue({
    openTemplateSelector: jest.fn(),
    closeTemplateSelector: jest.fn()
  })
}))

const Wrapped = (): React.ReactElement => {
  const { onUseTemplate, onRemoveTemplate, onOpenTemplateSelector } = useStageTemplateActions()
  return (
    <>
      <button onClick={() => onUseTemplate({ identifier: 'identifier', versionLabel: 'versionLabel' })}>
        Use Template
      </button>
      <button onClick={onRemoveTemplate}>Remove Template</button>
      <button onClick={onOpenTemplateSelector}>Open Template Selector</button>
    </>
  )
}

describe('useStageTemplateAction Test', () => {
  test('should work as expected', async () => {
    const { getByText } = render(
      <PipelineContext.Provider value={pipelineContextMock}>
        <TestWrapper>
          <Wrapped />
        </TestWrapper>
      </PipelineContext.Provider>
    )

    const useTemplateBtn = getByText('Use Template')
    await act(async () => {
      fireEvent.click(useTemplateBtn)
    })
    expect(useTemplateSelector().closeTemplateSelector).toBeCalled()
    expect(pipelineContextMock.updateStage).toBeCalled()

    const removeTemplateBtn = getByText('Remove Template')
    await act(async () => {
      fireEvent.click(removeTemplateBtn)
    })
    expect(pipelineContextMock.updateStage).toBeCalled()

    const openTemplateSelectorBtn = getByText('Open Template Selector')
    await act(async () => {
      fireEvent.click(openTemplateSelectorBtn)
    })
    expect(useTemplateSelector().openTemplateSelector).toBeCalled()
  })
})
