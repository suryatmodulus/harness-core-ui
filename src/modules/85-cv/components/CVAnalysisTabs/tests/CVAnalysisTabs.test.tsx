import React from 'react'
import type { UseGetReturn } from 'restful-react'
import { Container } from '@wings-software/uicore'
import { Classes } from '@blueprintjs/core'
import { renderHook } from '@testing-library/react-hooks'
import { waitFor, render, fireEvent } from '@testing-library/react'
import * as cvService from 'services/cv'
import { useStrings } from 'framework/strings'
import { TestWrapper } from '@common/utils/testUtils'
import { CVAnalysisTabs } from '../CVAnalysisTabs'

const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
  <TestWrapper>{children}</TestWrapper>
)
const { result } = renderHook(() => useStrings(), { wrapper })

const metricAnalysisView = <Container className="metricAnalysisView" />
const logAnalysisView = <Container className="logAnalysisView" />

describe('Unit tests for CVAnalysisTabs', () => {
  test('Ensure that loading state is rendred correctly', async () => {
    const useGetDataSourceTypesSpy = jest.spyOn(cvService, 'useGetDataSourcetypes')
    useGetDataSourceTypesSpy.mockReturnValue({
      loading: true
    } as UseGetReturn<any, any, any, any>)

    const { container, getByText } = render(
      <TestWrapper>
        <CVAnalysisTabs
          metricAnalysisView={metricAnalysisView}
          logAnalysisView={logAnalysisView}
          onMonitoringSourceSelect={jest.fn()}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(container.querySelectorAll(`.${Classes.SKELETON}`).length).toBe(3)
    getByText('all cv.navLinks.adminSideNavLinks.monitoringSources')
    expect(container.querySelector('.metricAnalysisView')).not.toBeNull()
  })

  test('Ensure error message is displayed on error', async () => {
    const useGetDataSourceTypesSpy = jest.spyOn(cvService, 'useGetDataSourcetypes')
    useGetDataSourceTypesSpy.mockReturnValue({
      error: { message: 'mockError' }
    } as UseGetReturn<any, any, any, any>)

    const { container } = render(
      <TestWrapper>
        <CVAnalysisTabs
          metricAnalysisView={metricAnalysisView}
          logAnalysisView={logAnalysisView}
          onMonitoringSourceSelect={jest.fn()}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    expect(document.body.querySelector(`.${Classes.TOAST_MESSAGE}`)).not.toBeNull()
  })

  test('Ensure tabs are rendered correctly', async () => {
    const useGetDataSourceTypesSpy = jest.spyOn(cvService, 'useGetDataSourcetypes')
    useGetDataSourceTypesSpy.mockReturnValue({
      data: {
        resource: [
          {
            dataSourceType: 'APP_DYNAMICS',
            verificationType: 'TIME_SERIES'
          },
          {
            dataSourceType: 'SPLUNK',
            verificationType: 'LOG'
          },
          {
            dataSourceType: 'STACKDRIVER',
            verificationType: 'TIME_SERIES'
          },
          {
            dataSourceType: 'STACKDRIVER',
            verificationType: 'LOG'
          },
          {
            dataSourceType: 'NEW_RELIC',
            verificationType: 'TIME_SERIES'
          }
        ]
      }
    } as UseGetReturn<any, any, any, any>)

    const { container, getByText } = render(
      <TestWrapper>
        <CVAnalysisTabs
          metricAnalysisView={metricAnalysisView}
          logAnalysisView={logAnalysisView}
          onMonitoringSourceSelect={jest.fn()}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())

    // default tab
    const defaultTab = getByText(
      `${result.current.getString('all')} ${result.current.getString(
        'cv.navLinks.adminSideNavLinks.monitoringSources'
      )}`
    )
    expect(defaultTab.getAttribute('aria-expanded')).toEqual('true')
    getByText(result.current.getString('cv.analysisScreens.analysisTab.metrics'))
    getByText(result.current.getString('cv.analysisScreens.analysisTab.logs'))

    // click on stack driver
    const stackDriver = getByText('Google Cloud Operations')
    fireEvent.click(stackDriver)
    await waitFor(() => expect(stackDriver.getAttribute('aria-expanded')).toEqual('true'))
    getByText(result.current.getString('cv.analysisScreens.analysisTab.metrics'))

    // click on splunk
    const splunk = getByText('Splunk')
    fireEvent.click(splunk)
    await waitFor(() => expect(splunk.getAttribute('aria-expanded')).toEqual('true'))
    expect(container.querySelector('.logAnalysisView')).not.toBeNull()

    // click on appd
    const appdynamics = getByText('AppDynamics')
    fireEvent.click(appdynamics)
    await waitFor(() => expect(appdynamics.getAttribute('aria-expanded')).toEqual('true'))
    expect(container.querySelector('.metricAnalysisView')).not.toBeNull()

    // click on new relic
    const newrelic = getByText('New Relic')
    fireEvent.click(newrelic)
    await waitFor(() => expect(newrelic.getAttribute('aria-expanded')).toEqual('true'))
    expect(container.querySelector('.metricAnalysisView')).not.toBeNull()
  })
})
