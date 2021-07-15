import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper, queryByNameAttribute } from '@common/utils/testUtils'
import { ExtendTrialForm, FeedBackForm } from '../ExtendTrialOrFeedbackForm'

const props = {
  moduleDescription: 'Continuous Delivery',
  expiryDateStr: 'June 30 2021',
  onCloseModal: jest.fn(),
  onSubmit: jest.fn(),
  loading: false
}
describe('ExtendTrialOrFeedbackForm', () => {
  describe('Validation', () => {
    test('experience is required for ExtendTrialForm', async () => {
      const { container, getByText } = render(
        <TestWrapper>
          <ExtendTrialForm {...props} />
        </TestWrapper>
      )
      fireEvent.input(queryByNameAttribute('suggestion', container)!, {
        target: { value: 'random' },
        bubbles: true
      })
      fireEvent.click(getByText('submit'))
      await waitFor(() => expect(() => getByText('validation.thisIsARequiredField')))
      expect(container).toMatchSnapshot()
    })

    test('experience is required for FeedBackForm', async () => {
      const { container, getByText } = render(
        <TestWrapper>
          <FeedBackForm {...props} />
        </TestWrapper>
      )
      fireEvent.input(queryByNameAttribute('suggestion', container)!, {
        target: { value: 'random' },
        bubbles: true
      })
      fireEvent.click(getByText('submit'))
      await waitFor(() => expect(() => getByText('validation.thisIsARequiredField')))
      expect(container).toMatchSnapshot()
    })
  })
})
