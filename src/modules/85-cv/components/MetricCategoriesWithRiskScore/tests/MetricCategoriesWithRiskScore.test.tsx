import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { CategoryRisk } from 'services/cv'
import { MetricCategoriesWithRiskScore, CategoriesWithRiskScoreProps } from '../MetricCategoriesWithRiskScore'

describe('Unit tests for MetricCategoriesWithRiskScore', () => {
  test('Ensure handles no data and data cases', async () => {
    // undefined as catgories
    const { container, rerender } = render(
      <TestWrapper>
        <MetricCategoriesWithRiskScore
          categoriesWithRiskScores={undefined as unknown as CategoriesWithRiskScoreProps['categoriesWithRiskScores']}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(container.querySelector('[class*="infoContainer"]')).toBeNull()

    // no data
    rerender(
      <TestWrapper>
        <MetricCategoriesWithRiskScore categoriesWithRiskScores={[]} />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(container.querySelector('[class*="infoContainer"]')).toBeNull()

    // with data
    rerender(
      <TestWrapper>
        <MetricCategoriesWithRiskScore
          categoriesWithRiskScores={[
            { category: 'infrastructureText' as CategoryRisk['category'], risk: 45 },
            { category: 'errors' as CategoryRisk['category'], risk: 20 },
            { category: 'performance' as CategoryRisk['category'], risk: 34 }
          ]}
        />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    const infoContainers = container.querySelectorAll('[class*="infoContainer"]')
    expect(infoContainers.length).toBe(3)
    expect(infoContainers[0].children[0].innerHTML).toEqual('cv.abbreviatedCategories.performance')
    expect(infoContainers[1].children[0].innerHTML).toEqual('cv.abbreviatedCategories.errors')
    expect(infoContainers[2].children[0].innerHTML).toEqual('cv.abbreviatedCategories.infrastructure')
  })
})
