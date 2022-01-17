/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { Segment, Variation } from 'services/cf'
import ServeVariationToTargetGroup, { ServeVariationToTargetGroupProps } from '../ServeVariationToTargetGroup'
import {
  getProfileInitials,
  mockServeVariationToTargetGroupsFieldValues as mockFieldValues,
  mockTargetGroups,
  mockVariations,
  prefixInstructionField
} from './utils.mocks'

const renderComponent = (props: Partial<ServeVariationToTargetGroupProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <ServeVariationToTargetGroup
        fieldValues={mockFieldValues(mockTargetGroups, mockVariations[0])}
        variations={mockVariations}
        targetGroups={mockTargetGroups}
        setField={jest.fn()}
        prefix={prefixInstructionField}
        subSectionSelector={<span />}
        {...props}
      />
    </TestWrapper>
  )

describe('ServeVariationToTargetGroup', () => {
  test('it should not display target groups that are not part of the known targets', async () => {
    const fakeTargetGroup = { name: 'NOT REAL', identifier: 'NOT_REAL' }
    const selectedTargetGroups = [fakeTargetGroup, mockTargetGroups[0]] as Segment[]
    const selectedVariation = mockVariations[0] as Variation

    renderComponent({ fieldValues: mockFieldValues(selectedTargetGroups, selectedVariation) })

    expect(screen.queryByText(getProfileInitials(fakeTargetGroup.name))).not.toBeInTheDocument()
    expect(screen.queryByText(getProfileInitials(selectedTargetGroups[1].name))).toBeInTheDocument()
  })

  test('it should not display the variation if it is not part of the known variations', async () => {
    const fakeVariation = { name: 'NOT REAL', identifier: 'NOT_REAL' } as Variation
    const selectedTargetGroups = [mockTargetGroups[0], mockTargetGroups[2]] as Segment[]

    renderComponent({ fieldValues: mockFieldValues(selectedTargetGroups, fakeVariation) })

    expect(screen.queryByText(fakeVariation.name as string)).not.toBeInTheDocument()
  })
})
