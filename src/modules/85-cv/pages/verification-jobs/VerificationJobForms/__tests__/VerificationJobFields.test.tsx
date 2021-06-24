import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import { Formik } from '@wings-software/uicore'
import { noop } from 'lodash-es'
import { TestWrapperProps, TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { DataSources } from '../VerificationJobFields'

const testWrapperProps: TestWrapperProps = {
  path: routes.toCVActivityDashboard({ ...accountPathProps, ...projectPathProps }),
  pathParams: {
    accountId: 'testAcc',
    projectIdentifier: 'projectId',
    orgIdentifier: 'orgId'
  }
}

const callSaveVerification = jest.fn()
const callUpdateVerification = jest.fn()

jest.mock('services/cv', () => ({
  useCreateVerificationJob: jest.fn().mockImplementation(() => ({
    mutate: callSaveVerification
  })),
  useUpdateVerificationJob: jest.fn().mockImplementation(() => ({
    mutate: callUpdateVerification
  }))
}))

jest.mock('services/cv', () => ({
  useGetMonitoringSources: jest.fn().mockReturnValue({
    data: {
      metaData: {},
      data: {
        content: [
          {
            type: 'APP_DYNAMICS',
            monitoringSourceName: 'appD',
            monitoringSourceIdentifier: 'appD'
          },
          {
            type: 'STACKDRIVER',
            monitoringSourceName: 'gco',
            monitoringSourceIdentifier: 'gco'
          },
          {
            type: 'SPLUNK',
            monitoringSourceName: 'splunk',
            monitoringSourceIdentifier: 'splunk'
          }
        ]
      },
      responseMessages: []
    },
    refetch: jest.fn() as any
  })
}))
describe('Monitoring Sources component', () => {
  test('Verify monitoring sources select all feature in create mode', async () => {
    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <Formik
          formName="wrapperComponentTestForm"
          initialValues={{
            failureStrategies: [],
            type: 'Verify',
            name: '',
            identifier: '',
            spec: {
              verificationJobRef: 'string',
              type: 'string',
              spec: undefined
            }
          }}
          onSubmit={noop}
        >
          {formik => <DataSources formik={formik} />}
        </Formik>
      </TestWrapper>
    )
    // get input for multiselect
    const input = screen.getByPlaceholderText('Search...')
    // type empty space to so show dropdown
    fireEvent.change(input, { target: { value: ' ' } })
    // list all items in dropdown
    const moniteringItemDropdown = screen.getAllByRole('listitem')

    moniteringItemDropdown.forEach(moniteringItem => {
      // Choose All
      if (moniteringItem.textContent === 'all') {
        fireEvent.click(moniteringItem)
      }
    })

    // check apart from All other items are disabled
    moniteringItemDropdown.forEach(moniteringItem => {
      if (moniteringItem.textContent !== 'all') {
        expect(moniteringItem.className).toContain('disabled')
      } else {
        expect(moniteringItem.className).not.toContain('disabled')
      }
    })

    // check all values are selected (by checking chips added in Multiselect)
    container.querySelectorAll('.MultiSelect--tag').forEach((tag, i) => {
      expect(tag.textContent).toContain(moniteringItemDropdown[i].textContent)
    })

    // Deselect All
    moniteringItemDropdown.forEach(listItem => {
      if (listItem.textContent === 'all') {
        fireEvent.click(listItem)
      }
    })

    // check apart from All other values are selected (by checking chips added in Multiselect)
    const chips = container.querySelectorAll('.MultiSelect--tag > span')
    chips.forEach(chip => {
      expect(chip.textContent).not.toContain('all')
    })
    // check none of the items are disabled
    screen.getAllByRole('listitem').forEach(moniteringItem => {
      expect(moniteringItem.className).not.toContain('disabled')
    })

    expect(container).toMatchSnapshot()
  })
})

jest.mock('services/cv', () => ({
  useGetMonitoringSources: jest.fn().mockReturnValue({
    data: {
      metaData: {},
      data: {
        content: []
      },
      responseMessages: []
    },
    refetch: jest.fn() as any
  })
}))
describe('Monitoring Sources component with no monitoring source', () => {
  test('Verify monitoring sources select all feature in create mode', async () => {
    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <Formik
          formName="wrapperComponentTestForm"
          initialValues={{
            failureStrategies: [],
            type: 'Verify',
            name: '',
            identifier: '',
            spec: {
              verificationJobRef: 'string',
              type: 'string',
              spec: undefined
            }
          }}
          onSubmit={noop}
        >
          {formik => <DataSources formik={formik} />}
        </Formik>
      </TestWrapper>
    )
    // get input for multiselect
    const input = screen.getByPlaceholderText('Search...')
    // type empty space to so show dropdown
    fireEvent.change(input, { target: { value: ' ' } })
    // list all items in dropdown
    const moniteringItemDropdown = screen.getAllByRole('listitem')
    // check list has only All
    expect(moniteringItemDropdown.length).toEqual(1)
    expect(moniteringItemDropdown[0].textContent).toEqual('all')

    // Choose All
    moniteringItemDropdown.forEach(moniteringItem => {
      if (moniteringItem.textContent === 'all') {
        fireEvent.click(moniteringItem)
      }
    })

    // check all is selected (by checking chips added in Multiselect)
    container.querySelectorAll('.MultiSelect--tag').forEach((tag, i) => {
      expect(tag.textContent).toContain(moniteringItemDropdown[i].textContent)
    })

    // Deselect All
    moniteringItemDropdown.forEach(listItem => {
      if (listItem.textContent === 'all') {
        fireEvent.click(listItem)
      }
    })

    // check no item is selected
    const chips = container.querySelectorAll('.MultiSelect--tag')
    expect(chips.length).toEqual(0)

    expect(container).toMatchSnapshot()
  })
})
