import React from 'react'
import { render, waitFor, queryByText, fireEvent, queryByAttribute } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import * as cdngServices from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'
import * as usePermission from '@rbac/hooks/usePermission'
import ConnectorsPage from '../ConnectorsPage'

import { connectorsData, catalogueData, statisticsMockData, filters } from './mockData'

const fetchConnectors = () => Promise.resolve(connectorsData)

jest
  .spyOn(cdngServices, 'useGetConnectorStatistics')
  .mockImplementation(() => ({ mutate: () => statisticsMockData } as any))
jest.spyOn(cdngServices, 'useGetConnectorCatalogue').mockImplementation(() => ({ mutate: () => catalogueData } as any))
jest.spyOn(cdngServices, 'useGetConnectorListV2').mockImplementation(() => ({ mutate: fetchConnectors } as any))
jest.spyOn(cdngServices, 'useGetFilterList').mockImplementation(() => ({ data: filters, loading: false } as any))
jest.spyOn(cdngServices, 'usePostFilter').mockImplementation(() => ({ mutate: jest.fn() } as any))
jest.spyOn(cdngServices, 'useUpdateFilter').mockImplementation(() => ({ mutate: jest.fn() } as any))
jest.spyOn(cdngServices, 'useDeleteFilter').mockImplementation(() => ({ mutate: jest.fn() } as any))
jest.spyOn(cdngServices, 'useGetTestConnectionResult').mockImplementation(() => Promise.resolve() as any)
jest.spyOn(cdngServices, 'useDeleteConnector').mockImplementation(() => Promise.resolve() as any)

describe('Connectors Page Test', () => {
  const props = {
    mockData: {
      data: connectorsData as any,
      loading: false
    },
    catalogueMockData: {
      data: catalogueData as any,
      loading: false
    },
    statisticsMockData: {
      data: statisticsMockData as any,
      loading: false
    }
  }
  const setup = () =>
    render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <ConnectorsPage {...props} />
      </TestWrapper>
    )

  test('Initial render should match snapshot', async () => {
    const { container, getByText } = setup()
    const newConnectorBtn = getByText('newConnector')
    fireEvent.click(newConnectorBtn)
    await waitFor(() => queryByText(container, 'connectorsLabel'))
    expect(container).toMatchSnapshot()
  })

  test('Render and check connector rows', async () => {
    const { findByText: findByConnectorText } = setup()
    connectorsData?.data?.content?.forEach(connector => {
      expect(findByConnectorText(connector?.connector?.name)).toBeTruthy()
    })
  })

  /* Connector filters test */
  test('Select and apply a filter', async () => {
    const renderProps = {
      ...Object.assign(props, {
        filtersMockData: {
          data: filters as any,
          loading: false
        }
      })
    }
    const { container, getByPlaceholderText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <ConnectorsPage {...renderProps} />
      </TestWrapper>
    )
    await act(async () => {
      const filterSelector = container.querySelector('.bp3-input-action [data-icon="caret-down"]')
      fireEvent.click(filterSelector!)
      await waitFor(() => queryByAttribute('class', document.body, 'bp3-popover-content'))
      const menuItems = document.querySelectorAll('[class*="menuItem"]')
      expect(menuItems?.length).toBe(filters.data.content.length)
      fireEvent.click(menuItems[0])
      expect((getByPlaceholderText('filters.selectFilter') as HTMLInputElement).value).toBe(
        filters.data.content[0].name
      )
      expect(parseInt((container.querySelector('[class*="fieldCount"]') as HTMLElement).innerHTML)).toBe(1)
    })
    // expect(container).toMatchSnapshot()
  })

  test('Render and check filter panel', async () => {
    const renderProps = {
      ...Object.assign(props, {
        filtersMockData: {
          data: filters as any,
          loading: false
        }
      })
    }
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <ConnectorsPage {...renderProps} />
      </TestWrapper>
    )
    await act(async () => {
      const filterBtn = container.querySelector('#ngfilterbtn')!
      fireEvent.click(filterBtn)
      await waitFor(() => {
        const portal = document.getElementsByClassName('bp3-portal')[0]
        expect(portal).toBeTruthy()
        expect(portal).toMatchSnapshot('New Filter')
      })
    })
  })

  test('Render and check create connector panel', async () => {
    const { container } = setup()
    const newConnectorBtn = container?.querySelector('#newConnectorBtn')
    fireEvent.click(newConnectorBtn!)
    await act(async () => {
      const portal = document.getElementsByClassName('bp3-portal')[0]
      expect(portal).toBeTruthy()
      expect(portal).toMatchSnapshot('Connectors')
    })
  })

  test('Filter connector by name', async () => {
    const { container } = setup()
    const input = container.querySelector('[class*="ExpandingSearchInput"]')
    expect(input).toBeTruthy()
    waitFor(() =>
      fireEvent.change(input!, {
        target: { value: 'SomeConnector' }
      })
    )
    expect(container).toMatchSnapshot()
  })

  test('should verify that new connector button and create via yaml button are not disabled if connector edit permission is provided', async () => {
    jest.spyOn(usePermission, 'usePermission').mockImplementation(() => [true])
    const { container } = setup()
    const newConnectorButton = container.querySelector('[data-test="newConnectorButton"]')
    const createViaYamlButton = container.querySelector('[data-test="createViaYamlButton"]')
    expect(newConnectorButton?.getAttribute('disabled')).toBe(null)
    expect(createViaYamlButton?.getAttribute('disabled')).toBe(null)
  })

  test('should verify that new connector button and create via yaml button are disabled if connector edit permission is not provided', async () => {
    jest.spyOn(usePermission, 'usePermission').mockImplementation(() => [false])
    const { container } = setup()
    const newConnectorButton = container.querySelector('[data-test="newConnectorButton"]')
    const createViaYamlButton = container.querySelector('[data-test="createViaYamlButton"]')
    expect(newConnectorButton?.getAttribute('disabled')).toBe('')
    expect(createViaYamlButton?.getAttribute('disabled')).toBe('')
  })

  test('should confirm that searching calls the api', async () => {
    const getConnectorsListV2 = jest.fn()
    jest.spyOn(cdngServices, 'useGetConnectorListV2').mockImplementation(() => ({ mutate: getConnectorsListV2 } as any))
    const { container } = setup()
    const searchContainer = container.querySelector('[data-name="connectorSeachContainer"]')
    const searchIcon = searchContainer?.querySelector('span[icon="search"]')
    const searchInput = searchContainer?.querySelector('input[placeholder="search"]')
    expect(searchIcon).toBeTruthy()
    expect(searchInput).toBeTruthy()
    expect(searchInput?.nodeValue).toBe(null)
    expect(getConnectorsListV2).toBeCalledTimes(1)
    fireEvent.click(searchIcon!)
    fireEvent.change(searchInput!, { target: { value: 'abcd' } })
    await waitFor(() => expect(getConnectorsListV2).toBeCalledTimes(2))
  })
})
