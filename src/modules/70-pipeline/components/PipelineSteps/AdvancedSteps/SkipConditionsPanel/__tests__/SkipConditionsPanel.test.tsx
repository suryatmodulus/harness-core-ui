import React from 'react'
import { render } from '@testing-library/react'
import { Formik } from 'formik'
import { TestWrapper } from '@common/utils/testUtils'
import SkipConditionsPanel from '../SkipConditionsPanel'

describe('Skip Conditions Panel tests', () => {
  test('Step level conditions render', () => {
    const { queryByText } = render(
      <TestWrapper>
        <Formik initialValues={{}} onSubmit={() => void 0}>
          {() => {
            return <SkipConditionsPanel isReadonly={false} />
          }}
        </Formik>
      </TestWrapper>
    )

    expect(queryByText('skipConditionLabel')).toBeTruthy()
  })
})
