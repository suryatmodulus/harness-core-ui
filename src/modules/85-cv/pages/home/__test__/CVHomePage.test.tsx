import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CVHomePage from '../CVHomePage'

jest.mock('@projects-orgs/pages/HomePageTemplate/HomePageTemplate', () => ({
  ...(jest.requireActual('@projects-orgs/pages/HomePageTemplate/HomePageTemplate') as any),
  HomePageTemplate: function MockComponent(props: any) {
    return (
      <div className="homepagetemplage">
        <button className="projectCreate" onClick={() => props.projectCreateSuccessHandler({})}></button>
      </div>
    )
  }
}))

describe('CVHomePage snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <CVHomePage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Ensure project success handler calls history push', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <CVHomePage />
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('[class~="projectCreate"]')!)
    expect(container).toMatchSnapshot()
  })
})
