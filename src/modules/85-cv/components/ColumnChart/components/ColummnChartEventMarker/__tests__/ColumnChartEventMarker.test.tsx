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
