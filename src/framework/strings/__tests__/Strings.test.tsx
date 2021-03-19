/* eslint-disable string-exists-in-yaml */
import React from 'react'
import { render } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'

import { String, useStrings } from '../String'
import { StringsContext, StringsMap } from '../StringsContext'

const value: StringsMap = {
  a: { b: 'Test Value 1' },
  harness: 'Harness',
  test: '{{ $.a.b }}'
}
describe('String tests', () => {
  test('renders strings with simple id', () => {
    const { container } = render(
      <StringsContext.Provider value={value}>
        <String stringID="harness" />
      </StringsContext.Provider>
    )

    expect(container).toMatchInlineSnapshot(`
      <div>
        <span>
          Harness
        </span>
      </div>
    `)
  })

  test('renders error when key not found', () => {
    const { container } = render(
      <StringsContext.Provider value={value}>
        <String stringID="harnes" />
      </StringsContext.Provider>
    )

    expect(container).toMatchInlineSnapshot(`
      <div>
        <span>
          No valid template with id "harnes" found in any namespace
        </span>
      </div>
    `)
  })

  test('renders strings with nested value', () => {
    const { container } = render(
      <StringsContext.Provider value={value}>
        <String stringID="a.b" />
      </StringsContext.Provider>
    )

    expect(container).toMatchInlineSnapshot(`
      <div>
        <span>
          Test Value 1
        </span>
      </div>
    `)
  })

  test('renders strings with self reference values', () => {
    const { container } = render(
      <StringsContext.Provider value={value}>
        <String stringID="test" />
      </StringsContext.Provider>
    )

    expect(container).toMatchInlineSnapshot(`
      <div>
        <span>
          Test Value 1
        </span>
      </div>
    `)
  })
})

describe('useString tests', () => {
  describe('getString', () => {
    test('works with simple id', () => {
      const wrapper = ({ children }: React.PropsWithChildren<{}>): React.ReactElement => (
        <StringsContext.Provider value={value}>{children}</StringsContext.Provider>
      )
      const { result } = renderHook(() => useStrings(), { wrapper })

      expect(result.current.getString('harness')).toBe(value.harness)
    })

    test('works with nested values', () => {
      const wrapper = ({ children }: React.PropsWithChildren<{}>): React.ReactElement => (
        <StringsContext.Provider value={value}>{children}</StringsContext.Provider>
      )
      const { result } = renderHook(() => useStrings(), { wrapper })

      expect(result.current.getString('a.b')).toBe(value.a.b)
    })

    test('works with self reference values', () => {
      const wrapper = ({ children }: React.PropsWithChildren<{}>): React.ReactElement => (
        <StringsContext.Provider value={value}>{children}</StringsContext.Provider>
      )
      const { result } = renderHook(() => useStrings(), { wrapper })

      expect(result.current.getString('test')).toBe(value.a.b)
    })

    test('throws when key not found', () => {
      const wrapper = ({ children }: React.PropsWithChildren<{}>): React.ReactElement => (
        <StringsContext.Provider value={value}>{children}</StringsContext.Provider>
      )
      const { result } = renderHook(() => useStrings(), { wrapper })

      expect(() => result.current.getString('harnes')).toThrowError(
        'No valid template with id "harnes" found in any namespace'
      )
    })
  })
})
