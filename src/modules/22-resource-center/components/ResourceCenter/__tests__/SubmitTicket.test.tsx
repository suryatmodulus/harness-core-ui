import { render } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import { SubmitTicket } from '@resource-center/components/TicketSubmission/SubmitTicket'
describe('Submit Ticket', () => {
  const dummy = jest.fn().mockImplementation()
  test('Should render submit ticket properly', () => {
    const { container } = render(
      <TestWrapper>
        <SubmitTicket backButton={dummy} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
