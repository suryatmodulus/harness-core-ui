import React from 'react'
import type { UseGetReturn } from 'restful-react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { Formik, FormikForm } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import * as cdService from 'services/cd-ng'
import MonitoredServiceOverview from '../MonitoredServiceOverview'
import { MonitoredServiceType } from '../MonitoredServiceOverview.constants'

jest.mock('@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment', () => ({
  ...jest.requireActual('@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment'),
  HarnessEnvironmentAsFormField: function Mock(props: any) {
    return (
      <div className={props.environmentProps.className}>
        <button
          className="newEnv"
          onClick={() => props.environmentProps.onNewCreated({ name: 'newEnv', identifier: 'newEnv' })}
        />
        <button
          className="changeEnv"
          onClick={() => props.environmentProps.onNewCreated({ name: 'env2', identifier: 'env2' })}
        />
        <p>{props.environmentProps.item?.label}</p>
      </div>
    )
  },
  HarnessServiceAsFormField: function Mock(props: any) {
    return (
      <div className={props.serviceProps.className}>
        <button
          className="newService"
          onClick={() => props.serviceProps.onNewCreated({ name: 'newService', identifier: 'newService' })}
        />
        <button
          className="changeService"
          onClick={() => props.serviceProps.onNewCreated({ name: 'service2', identifier: 'service2' })}
        />
        <p>{props.serviceProps.item?.label}</p>
      </div>
    )
  }
}))

function WrapperComponent(props: any) {
  return (
    <TestWrapper>
      <Formik onSubmit={values => props.onSubmit(values)} initialValues={props.initialValues} formName="mockForm">
        {formikProps => (
          <FormikForm>
            <MonitoredServiceOverview formikProps={formikProps} isEdit={props.isEdit} />
            <button type="submit" />
          </FormikForm>
        )}
      </Formik>
    </TestWrapper>
  )
}

describe('Unit tests for MonitoredServiceOverview', () => {
  beforeEach(() => {
    jest
      .spyOn(cdService, 'useGetServiceListForProject')
      .mockReturnValue({ data: { data: { content: [{ identifier: 'service1', name: 'service1' }] } } } as UseGetReturn<
        any,
        any,
        any,
        any
      >)
    jest
      .spyOn(cdService, 'useGetEnvironmentListForProject')
      .mockReturnValue({ data: { data: { content: [{ identifier: 'env1', name: 'env1' }] } } } as UseGetReturn<
        any,
        any,
        any,
        any
      >)
  })

  test('Ensure that providing the service and env generates correct name value', async () => {
    const onSubmitMock = jest.fn()
    const { container } = render(<WrapperComponent onSubmit={onSubmitMock} />)

    await waitFor(() => expect(container.querySelector('[class*="monitoredService"]')).not.toBeNull())
    expect(container.querySelectorAll('[class*="dropdown"]').length).toBe(2)

    fireEvent.click(container.querySelector('.changeService')!)
    await waitFor(() => expect(container.querySelector('input[value="service2"]')).not.toBeNull())

    fireEvent.click(container.querySelector('.changeEnv')!)
    await waitFor(() => expect(container.querySelector('input[value="service2_env2"]')).not.toBeNull())
  })

  test('Ensure that edit flow only shows name field', async () => {
    const onSubmitMock = jest.fn()
    const { container } = render(
      <WrapperComponent
        onSubmit={onSubmitMock}
        isEdit={true}
        initialValues={{
          name: 'blah blah',
          type: MonitoredServiceType.INFRASTRUCTURE,
          identifier: 'blah blah',
          serviceRef: 'service1',
          environmentRef: 'env1'
        }}
      />
    )

    await waitFor(() => expect(container.querySelector('[class*="monitoredService"]')).not.toBeNull())
    expect(container.querySelectorAll('[class*="dropdown"]').length).toBe(0)
    expect(container.querySelector('input[value="blah blah"]')).not.toBeNull()

    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() =>
      expect(onSubmitMock).toHaveBeenCalledWith({
        environmentRef: 'env1',
        identifier: 'blah blah',
        name: 'blah blah',
        serviceRef: 'service1',
        type: MonitoredServiceType.INFRASTRUCTURE
      })
    )
  })

  test('Ensure that clicking on new env/service createes new entity', async () => {
    const onSubmitMock = jest.fn()
    const { container, getByText } = render(
      <WrapperComponent
        onSubmit={onSubmitMock}
        initialValues={{ type: MonitoredServiceType.APPLICATION, serviceRef: 'service1' }}
      />
    )

    await waitFor(() => expect(container.querySelector('[class*="monitoredService"]')).not.toBeNull())

    // create new environment
    fireEvent.click(container.querySelector('.newEnv')!)
    await waitFor(() => getByText('newEnv'))

    // create new service
    fireEvent.click(container.querySelector('.newService')!)
    await waitFor(() => getByText('newService'))
  })
})
