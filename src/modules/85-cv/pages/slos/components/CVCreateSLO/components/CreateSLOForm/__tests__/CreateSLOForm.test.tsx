import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { Formik } from 'formik'
import { FormikForm } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { initialFormData } from '@cv/pages/slos/__tests__/CVSLOsListingPage.mock'
import CreateSLOForm from '../CreateSLOForm'
import { mockedUserJourneysData } from '../components/SLOName/__tests__/SLOName.mock'

function WrapperComponent(props: { initialValues: any }): JSX.Element {
  const { initialValues } = props
  return (
    <TestWrapper>
      <Formik enableReinitialize={true} initialValues={initialValues} onSubmit={jest.fn()}>
        {formikProps => {
          return (
            <FormikForm>
              <CreateSLOForm formikProps={formikProps}></CreateSLOForm>
            </FormikForm>
          )
        }}
      </Formik>
    </TestWrapper>
  )
}

jest.mock('services/cv', () => ({
  useGetAllJourneys: jest.fn().mockImplementation(() => ({
    data: mockedUserJourneysData,
    loading: false,
    error: null,
    refetch: jest.fn()
  })),
  useSaveUserJourney: jest.fn().mockImplementation(() => ({
    data: {},
    loading: false,
    error: null,
    refetch: jest.fn()
  })),
  useGetAllMonitoredServicesWithTimeSeriesHealthSources: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('Test CreateSLOForm component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should render CreateSLOForm component', async () => {
    const { getByText } = render(<WrapperComponent initialValues={initialFormData} />)

    // Verify if all the tabs are present
    expect(getByText('name')).toBeInTheDocument()
    expect(getByText('cv.slos.sli')).toBeInTheDocument()
    expect(getByText('cv.slos.sloTargetAndBudgetPolicy')).toBeInTheDocument()
  })

  test('Validate SLO Form when and required fields are not filled in Name tab', async () => {
    const { getByText } = render(<WrapperComponent initialValues={initialFormData} />)

    const continueButton = getByText('continue')

    // When continue is clicked without filling required fields.
    act(() => {
      fireEvent.click(continueButton)
    })

    // Should stay on the current Tab of Name and should not navigate to SLI tab.
    await waitFor(() => {
      expect(getByText('ID')).toBeInTheDocument()
    })
  })

  test('Validate SLO Form when , required fields are filled in Name Tab but not in SLI tab', async () => {
    const { getByText } = render(
      <WrapperComponent initialValues={{ ...initialFormData, name: 'slo-name', userJourneyRef: 'user-journey' }} />
    )

    const continueButton = getByText('continue')

    // When continue is clicked after adding all requiered fields
    act(() => {
      fireEvent.click(continueButton)
    })

    // Should go to the next tab of SLI when continue is clicked
    await waitFor(() => {
      expect(getByText('cv.slos.selectMonitoredServiceForSlo')).toBeInTheDocument()
    })

    // When continue is clicked without filling required fields in SLI tab
    act(() => {
      fireEvent.click(continueButton)
    })

    // Should stay on the current Tab of SLI and should not navigate to Error Budget Tab.
    await waitFor(() => {
      expect(getByText('cv.slos.selectMonitoredServiceForSlo')).toBeInTheDocument()
    })
  })

  test('Validate SLO Form when , required fields are filled in Name Tab and SLI tab', async () => {
    const { getByText } = render(
      <WrapperComponent
        initialValues={{
          ...initialFormData,
          name: 'slo-name',
          userJourneyRef: 'user-journey',
          monitoredServiceRef: 'monitored-service',
          healthSourceRef: 'health-source'
        }}
      />
    )

    const continueButton = getByText('continue')

    // When continue is clicked after adding all requiered fields
    act(() => {
      fireEvent.click(continueButton)
    })

    // Should go to the next tab of SLI when continue is clicked
    await waitFor(() => {
      expect(getByText('cv.slos.selectMonitoredServiceForSlo')).toBeInTheDocument()
    })

    // When continue is clicked without filling required fields in SLI tab
    act(() => {
      fireEvent.click(continueButton)
    })

    // Should go to the next tab of Error Budget when continue is clicked
    await waitFor(() => {
      expect(getByText('cv.slos.sli')).toBeInTheDocument()
    })
  })
})
