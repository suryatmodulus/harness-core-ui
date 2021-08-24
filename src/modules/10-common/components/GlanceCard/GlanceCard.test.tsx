import React from 'react'
import { render } from '@testing-library/react'
import routes from '@common/RouteDefinitions'
import GlanceCard from './GlanceCard'

describe('GlanceCard', () => {
  test('Projects', () => {
    const { container } = render(
      <GlanceCard
        title="Projects"
        iconName="nav-project"
        iconSize={16}
        number={48}
        delta="+1"
        href={routes.toProjects({ accountId: '123' })}
        styling
      />
    )
    expect(container).toMatchSnapshot()
  }),
    test('Services', () => {
      const { container } = render(<GlanceCard title="Services" iconName="services" number={48} delta="+6" />)
      expect(container).toMatchSnapshot()
    })
})
