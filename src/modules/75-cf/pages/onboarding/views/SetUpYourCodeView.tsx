import React from 'react'
import type { ApiKey } from 'services/cf'
import type { PlatformEntry } from '@cf/components/LanguageSelection/LanguageSelection'
import { MarkdownViewer } from '@common/components/MarkdownViewer/MarkdownViewer'

const keyMask = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'

export interface SetUpYourCodeViewProps {
  language: PlatformEntry
  apiKey: ApiKey | undefined
}

export const SetUpYourCodeView: React.FC<SetUpYourCodeViewProps> = props => {
  return (
    <MarkdownViewer
      stringId={props.language.readmeStringId}
      vars={{ ...props.apiKey, apiKey: props.apiKey?.apiKey || keyMask }}
    />
  )
}
