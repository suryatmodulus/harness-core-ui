/*
 * Copyright 2020 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { RiskScoreTile } from '../RiskScoreTile'

describe('Unit tests for RiskScore Tile', () => {
  test('Ensure correct value and color is rendered for given input', async () => {
    const { container } = render(<RiskScoreTile riskScore={30} />)
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(container.querySelector('[class*="riskScore"]')?.innerHTML).toEqual('30')
    expect(container.querySelector('[class*="heatmapColor4"]')).not.toBeNull()
  })

  test('Ensure that when -1 is supplied as riskScore the tile is grey', async () => {
    const { container } = render(<RiskScoreTile riskScore={-1} />)
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(container.querySelector('[class*="noRiskScore"]')?.children[0]?.innerHTML).toEqual('')
  })

  test('Ensure when isSmall or isLarge is provided, the component renders with correctly', async () => {
    const { container } = render(<RiskScoreTile riskScore={-1} isLarge={true} />)
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(container.querySelector('[class*="largeTile"]')).not.toBeNull()
    expect(container.querySelector('[class*="noRiskScore"]')?.children[0]?.innerHTML).toEqual('')

    const { container: container2 } = render(<RiskScoreTile riskScore={20} isSmall={true} />)
    await waitFor(() => expect(container2.querySelector('[class*="main"]')).not.toBeNull())
    expect(container2.querySelector('[class*="smallTile"]')).not.toBeNull()
    expect(container2.querySelector('[class*="riskScore"]')?.innerHTML).toEqual('20')
    expect(container2.querySelector('[class*="heatmapColor3"]')).not.toBeNull()
  })
})
