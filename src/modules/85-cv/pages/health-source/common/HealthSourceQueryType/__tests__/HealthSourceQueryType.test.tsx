import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { Formik, FormikForm } from '@wings-software/uicore'
import * as Yup from 'yup'
import { TestWrapper } from '@common/utils/testUtils'
import { HealthSourceQueryType } from '../HealthSourceQueryType'
import { queryTypeValidation } from '../HealthSourceQueryType.constants'
import { QueryType } from '../HealthSourceQueryType.types'

const mockGetString = jest.fn().mockImplementation(() => 'cv.componentValidations.queryType')
const SampleComponent: React.FC<{
  initialValue?: string
  validationStrnig?: string
  onSubmit: (props: any) => void
}> = ({ initialValue, onSubmit }) => {
  return (
    <TestWrapper>
      <Formik
        formName="test"
        initialValues={{ queryType: initialValue }}
        onSubmit={onSubmit}
        validationSchema={Yup.object().shape({
          queryType: queryTypeValidation(mockGetString)
        })}
      >
        <FormikForm>
          <HealthSourceQueryType />
          <button type="submit" data-testid={'submitButtonJest'} />
        </FormikForm>
      </Formik>
    </TestWrapper>
  )
}

describe('RuntimeInput Tests for RadioGroup', () => {
  test('should throw validation error', async () => {
    const { getByTestId, getByText } = render(<SampleComponent onSubmit={jest.fn()} />)
    await act(async () => {
      fireEvent.click(getByTestId('submitButtonJest'))
    })
    expect(getByText('cv.componentValidations.queryType')).toBeDefined()
  })

  test('should select default value as service based', async () => {
    const onSubmit = (selectedProps: any) => {
      expect(selectedProps.queryType).toBe(QueryType.SERVICE_BASED)
    }
    const { getByTestId } = render(<SampleComponent onSubmit={onSubmit} initialValue={QueryType.SERVICE_BASED} />)
    await act(async () => {
      fireEvent.click(getByTestId('submitButtonJest'))
    })
  })
  test('should select default value as host based', async () => {
    const onSubmit = (selectedProps: any) => {
      expect(selectedProps.queryType).toBe(QueryType.HOST_BASED)
    }
    const { getByTestId } = render(<SampleComponent onSubmit={onSubmit} initialValue={QueryType.HOST_BASED} />)
    await act(async () => {
      fireEvent.click(getByTestId('submitButtonJest'))
    })
  })

  test('should change to host based', async () => {
    const onSubmit = (selectedProps: any) => {
      expect(selectedProps.queryType).toBe(QueryType.HOST_BASED)
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
