/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
