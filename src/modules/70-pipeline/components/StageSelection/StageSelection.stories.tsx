/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Meta, Story } from '@storybook/react'

import { TestWrapper } from '@common/utils/testUtils'
import { StageSelection, StageSelectionProps } from './StageSelection'

export default {
  title: 'Pipelines / Components / StageSelection',
  component: StageSelection
} as Meta

export const Basic: Story<StageSelectionProps> = args => {
  const [selectedStageId, setSelectedStageId] = React.useState(args.selectedStageId)

  React.useEffect(() => {
    setSelectedStageId(args.selectedStageId)
  }, [args.selectedStageId])

  return (
    <TestWrapper>
      <StageSelection
        {...args}
        selectedStageId={selectedStageId}
        onStageChange={e => setSelectedStageId(e.value as string)}
      />
    </TestWrapper>
  )
}

Basic.args = {
  selectedStageId: 'stage_1',
  selectOptions: [
    {
      label: 'Stage 1',
      value: 'stage_1',
      node: {},
      type: 'Deployment'
    },
    {
      label: 'Stage 2',
      value: 'stage_2',
      node: {},
      type: 'CI'
    },
    {
      label: 'Stage 3',
      value: 'stage_3',
      node: {},
      type: 'Pipeline'
    },
    {
      label: 'Stage 4',
      value: 'stage_4',
      node: {},
      type: 'Approval'
    },
    {
      label: 'Stage 5',
      value: 'stage_5',
      node: {},
      type: 'Custom'
    }
  ]
}
