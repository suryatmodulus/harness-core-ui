import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import Delegates4Ways from '../Delegates4Ways'

const onSelect = jest.fn()

const data = {
  text: 'Runs Harness Delegate as a Docker container on any Linux or Mac',
  value: 'service-kubernetes',
  icon: 'service-dockerhub',
  name: 'Docker',
  type: 'DOCKER'
}

describe('Render Delegates4Ways', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <Delegates4Ways onSelect={onSelect} selectedCard={data} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
