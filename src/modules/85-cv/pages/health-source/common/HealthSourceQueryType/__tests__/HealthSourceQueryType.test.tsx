import React from 'react'
import { act, fireEvent, prettyDOM, render } from '@testing-library/react'
import { Formik, FormikForm } from '@wings-software/uicore'
import { HealthSourceQueryType } from '../HealthSourceQueryType'
import * as Yup from 'yup'
import { QueryTypeValidation } from '../HealthSourceQueryType.constants'
import { QueryType } from '../HealthSourceQueryType.types'

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (key: string) => key
  })
}))

const SampleComponent: React.FC<{
  initialValue?: string
  validationStrnig?: string
  onSubmit: (props: any) => void
}> = ({ initialValue, onSubmit }) => {
  return (
    <Formik
      formName="test"
      initialValues={{ requestMethod: initialValue }}
      onSubmit={onSubmit}
      validationSchema={Yup.object().shape({
        requestMethod: QueryTypeValidation('cv.componentValidations.queryType')
      })}
    >
      <FormikForm>
        <HealthSourceQueryType />
        <button type="submit" data-testid={'submitButtonJest'} />
      </FormikForm>
    </Formik>
  )
}

describe('RuntimeInput Tests for RadioGroup', () => {
  test('should throw validation error', async () => {
    const { getByTestId } = render(<SampleComponent onSubmit={jest.fn()} />)
    await act(async () => {
      fireEvent.click(getByTestId('submitButtonJest'))
    })
  })

  test('should select default value as service based', async () => {
    const onSubmit = (selectedProps: any) => {
      expect(selectedProps.requestMethod).toBe(QueryType.SERVICE_BASED)
    }
    const { getByTestId } = render(<SampleComponent onSubmit={onSubmit} initialValue={QueryType.SERVICE_BASED} />)
    await act(async () => {
      fireEvent.click(getByTestId('submitButtonJest'))
    })
  })
  test('should select default value as host based', async () => {
    const onSubmit = (selectedProps: any) => {
      expect(selectedProps.requestMethod).toBe(QueryType.HOST_BASED)
    }
    const { container, getByTestId } = render(
      <SampleComponent onSubmit={onSubmit} initialValue={QueryType.HOST_BASED} />
    )
    await act(async () => {
      fireEvent.click(getByTestId('submitButtonJest'))
    })
    console.log(prettyDOM(container, 200000000))
  })

  test('should change to service host based', async () => {
    const onSubmit = (selectedProps: any) => {
      expect(selectedProps.requestMethod).toBe(QueryType.HOST_BASED)
    }
    const { getByTestId, getByText } = render(
      <SampleComponent onSubmit={onSubmit} initialValue={QueryType.SERVICE_BASED} />
    )
    await act(async () => {
      fireEvent.click(getByText(QueryType.HOST_BASED))
      fireEvent.click(getByTestId('submitButtonJest'))
    })
  })
})
