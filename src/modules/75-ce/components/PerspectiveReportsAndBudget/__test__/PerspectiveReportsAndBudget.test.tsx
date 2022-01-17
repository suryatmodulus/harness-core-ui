/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { Container } from '@wings-software/uicore'
import { Provider } from 'urql'
import { fromValue } from 'wonka'
import type { DocumentNode } from 'graphql'
import { setFieldValue, InputTypes, clickSubmit } from '@common/utils/JestFormHelper'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { FetchPerspectiveListDocument } from 'services/ce/services'
import PerspectiveReportsAndBudgets from '../PerspectiveReportsAndBudgets'
import PerspectiveScheduledReportsResponse from './PerspectiveScheduledReportsResponse.json'
import PerspectiveBudgetsResponse from './PerspectiveBudgetsResponse.json'
import PerspectiveResponse from './PerspectiveResponse.json'
import useBudgetModal from '../PerspectiveCreateBudget'
import useCreateReportModal from '../PerspectiveCreateReport'
import PerspectiveList from './PerspectiveList.json'

jest.mock('services/ce', () => ({
  useGetReportSetting: jest.fn().mockImplementation(() => {
    return { data: PerspectiveScheduledReportsResponse, refetch: jest.fn(), error: null, loading: false }
  }),
  useDeleteReportSetting: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS',
        data: {}
      }
    }
  })),
  useDeleteBudget: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS',
        data: {}
      }
    }
  })),
  useListBudgetsForPerspective: jest.fn().mockImplementation(() => ({
    data: PerspectiveBudgetsResponse,
    refetch: jest.fn(),
    error: null,
    loading: false
  })),
  useCreateReportSetting: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS',
        data: {}
      }
    }
  })),
  useUpdateReportSetting: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS',
        data: {}
      }
    }
  })),
  useGetPerspective: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS',
        data: PerspectiveResponse
      }
    }
  })),
  useUpdateBudget: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS',
        data: {}
      }
    }
  })),
  useCreateBudget: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS',
        data: {}
      }
    }
  })),
  useCreatePerspective: jest.fn().mockImplementation(() => ({
    mutate: async () => {
      return {
        status: 'SUCCESS',
        data: {}
      }
    }
  })),
  useGetLastPeriodCost: jest.fn().mockImplementation(() => ({
    data: { resource: 100 },
    refetch: jest.fn(),
    error: null,
    loading: false
  })),
  useGetForecastCostForPeriod: jest.fn().mockImplementation(() => ({
    data: { resource: 100 },
    refetch: jest.fn(),
    error: null,
    loading: false
  })),
  useGetLastMonthCost: jest.fn().mockImplementation(() => ({
    data: { resource: 100 },
    refetch: jest.fn(),
    error: null,
    loading: false
  })),
  useGetForecastCost: jest.fn().mockImplementation(() => ({
    data: { resource: 100 },
    refetch: jest.fn(),
    error: null,
    loading: false
  }))
}))

const params = {
  accountId: 'TEST_ACC',
  perspetiveId: 'perspectiveId',
  perspectiveName: 'sample perspective'
}

describe('test cases for Perspective Reports and Budget page', () => {
  test('should be able to render the reports and budget component', async () => {
    const handlePrevButtonClick = jest.fn().mockImplementationOnce(() => ({}))
    const { container } = render(
      <TestWrapper pathParams={params}>
        <PerspectiveReportsAndBudgets onPrevButtonClick={handlePrevButtonClick} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

const CreateReportWrapper = () => {
  const { openModal } = useCreateReportModal({ onSuccess: jest.fn() })
  return (
    <Container>
      <button onClick={() => openModal()} className="openModal" />
    </Container>
  )
}

describe('test cases for Perspective Create Report', () => {
  test('should be able to open create report modal', async () => {
    const { container, getByText } = render(
      <TestWrapper pathParams={params}>
        <CreateReportWrapper />
      </TestWrapper>
    )

    const openButton = container.querySelector('.openModal')
    expect(openButton).toBeDefined()

    fireEvent.click(openButton!)

    const modal = findDialogContainer()
    expect(modal).toBeDefined()

    await waitFor(() => {
      expect(getByText('ce.perspectives.reports.cronLabel')).toBeDefined()
      expect(getByText('ce.perspectives.reports.recipientLabel')).toBeDefined()
    })

    expect(modal).toMatchSnapshot()
  })
})

const CreateBudgetWrapper = () => {
  const { openModal } = useBudgetModal({ onSuccess: jest.fn() })
  return (
    <Container>
      <button onClick={() => openModal()} className="openModal" />
    </Container>
  )
}

describe('test cases for Perspective Create Budgets', () => {
  test('should be able to open create budget modal', async () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchPerspectiveListDocument) {
          return fromValue(PerspectiveList)
        }
      }
    }

    const { container, getByText } = render(
      <Provider value={responseState as any}>
        <TestWrapper pathParams={params}>
          <CreateBudgetWrapper />
        </TestWrapper>
      </Provider>
    )

    const openButton = container.querySelector('.openModal')
    expect(openButton).toBeDefined()

    fireEvent.click(openButton!)

    const modal = findDialogContainer()
    expect(modal).toBeDefined()

    await waitFor(() => Promise.resolve())

    expect(getByText('ce.perspectives.budgets.defineTarget.selectPerspective')).toBeDefined()
    expect(getByText('ce.perspectives.budgets.defineTarget.createNewPerspective')).toBeDefined()

    await setFieldValue({
      container: modal!,
      type: InputTypes.SELECT,
      fieldId: 'perspective',
      value: 'e6V1JG61QWubhV89vAmUIg'
    })

    await act(async () => {
      clickSubmit(modal!)
    })

    expect(getByText('ce.perspectives.budgets.setBudgetAmount.budgetPeriod')).toBeDefined()
    expect(getByText('ce.perspectives.budgets.setBudgetAmount.specifyAmount')).toBeDefined()

    await act(async () => {
      clickSubmit(modal!)
    })

    expect(getByText('ce.perspectives.budgets.configureAlerts.subTitle')).toBeDefined()
    expect(getByText('ce.perspectives.budgets.configureAlerts.budgetAmount')).toBeDefined()
    expect(findDialogContainer()).toMatchSnapshot()
  })
})
