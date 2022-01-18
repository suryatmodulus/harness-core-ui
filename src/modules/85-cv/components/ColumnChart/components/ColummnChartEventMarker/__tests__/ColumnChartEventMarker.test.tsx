/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import ColumnChartEventMarker from '../ColumnChartEventMarker'

describe('Unit tests for CoolumnChartEvent Marker', () => {
  test('ensure marker renders correctly', async () => {
    const { container } = render(
      <ColumnChartEventMarker columnHeight={105} leftOffset={10} markerColor="var(--primary-4)" />
    )
    await waitFor(() => expect(container).toMatchSnapshot())
  })
})
