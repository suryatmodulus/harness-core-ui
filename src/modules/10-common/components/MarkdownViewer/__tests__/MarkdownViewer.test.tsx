import React from 'react'
import { render } from '@testing-library/react'
import type { StringKeys } from 'framework/strings'
import { MarkdownViewer } from '../MarkdownViewer'

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: () => `
    # Install

    \`\`\`
    go get github.com/wings-software/ff-client-sdk-go
    \`\`\`

    # Usage

    First we need to import lib with harness alias \`import harness "github.com/wings-software/ff-client-sdk-go/pkg/api"\`

    Next we create client instance for interaction with api \`client := harness.NewClient({{ apiKey }})\`

    Target definition can be user, device, app etc.

    \`\`\`
    target := dto.NewTargetBuilder("key").
    Firstname("John").
    Lastname("doe").
    Email("johndoe@acme.com").
    Country("USA").
    Custom("height", 160).
    Build()
    \`\`\`

    Evaluating Feature Flag \`showFeature, err := client.BoolVariation(featureFlagKey, target, false)\`
  `
  })
}))

describe('MarkdownViewer', () => {
  test('MarkdownViewer should be rendered properly', () => {
    const { container } = render(
      <MarkdownViewer stringId={'foobar' as StringKeys} vars={{ apiKey: '1234-1234-1234' }} />
    )
    expect(container).toMatchSnapshot()
  })
})
