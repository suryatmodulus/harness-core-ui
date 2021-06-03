import React from 'react'
import { render } from '@testing-library/react'

import { LinkifyText } from './LinkifyText'

describe('<LinkifyText /> tests', () => {
  test('works with "https://google.com"', () => {
    const { container } = render(<LinkifyText content="https://google.com" />)
    expect(container).toMatchInlineSnapshot(`
      <div>
        <a
          class=""
          href="https://google.com"
          rel="noreferrer"
          target="_blank"
        >
          https://google.com
        </a>
      </div>
    `)
  })

  test('works with "some statement.https://www.google.com is the url"', () => {
    const { container } = render(<LinkifyText content="some statement.https://www.google.com is the url" />)
    expect(container).toMatchInlineSnapshot(`
      <div>
        <span
          class="StyledProps--font StyledProps--main StyledProps--inline"
        >
          some statement.
        </span>
        <a
          class=""
          href="https://www.google.com"
          rel="noreferrer"
          target="_blank"
        >
          https://www.google.com
        </a>
        <span
          class="StyledProps--font StyledProps--main StyledProps--inline"
        >
           is the url
        </span>
      </div>
    `)
  })

  test('works with "some statement.https://www.google.com is the url"', () => {
    const { container } = render(<LinkifyText content="some statement. https://www.google.com is the url" />)
    expect(container).toMatchInlineSnapshot(`
      <div>
        <span
          class="StyledProps--font StyledProps--main StyledProps--inline"
        >
          some statement. 
        </span>
        <a
          class=""
          href="https://www.google.com"
          rel="noreferrer"
          target="_blank"
        >
          https://www.google.com
        </a>
        <span
          class="StyledProps--font StyledProps--main StyledProps--inline"
        >
           is the url
        </span>
      </div>
    `)
  })
})
