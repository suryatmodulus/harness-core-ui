/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { RightDrawer } from '../../RightDrawer/RightDrawer'
import pipelineContextMock from '../../RightDrawer/__tests__/stateMock'
import { DrawerTypes } from '../../PipelineContext/PipelineActions'

jest.mock('@blueprintjs/core', () => ({
  ...(jest.requireActual('@blueprintjs/core') as any),
  // eslint-disable-next-line react/display-name
  Drawer: ({ children, title }: any) => (
    <div className="drawer-mock">
      {title}
      {children}
    </div>
  )
}))

describe('FlowControl tests', () => {
  test('should render fine', async () => {
    pipelineContextMock.stepsFactory.getStepData = () => undefined
    pipelineContextMock.state.pipelineView.drawerData.type = DrawerTypes.FlowControl
    pipelineContextMock.state.pipelineView?.drawerData?.data &&
      (pipelineContextMock.state.pipelineView.drawerData.data.paletteData = {
        isRollback: false,
        isParallelNodeClicked: false
      } as any)

    const { findByText, container } = render(
      <PipelineContext.Provider value={pipelineContextMock}>
        <TestWrapper>
          <RightDrawer />
        </TestWrapper>
      </PipelineContext.Provider>
    )

    expect(container).toMatchSnapshot()
    const flowControlHeader = await findByText('pipeline.barriers.syncBarriers')
    expect(flowControlHeader).toBeInTheDocument()
  })
})
