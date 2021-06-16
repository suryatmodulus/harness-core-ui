import { Button, Layout, Text } from '@wings-software/uicore'
import React, { useState } from 'react'
import cx from 'classnames'
import type { StringsMap } from 'stringTypes'
import type { StringKeys } from 'framework/strings'

import android from './icons/android.svg'
import dotnet from './icons/dotnet.svg'
import golang from './icons/golang.svg'
import ios from './icons/ios.svg'
import java from './icons/java.svg'
import javascript from './icons/javascript.svg'
import nodejs from './icons/nodejs.svg'
import css from './LanguageSelection.module.scss'

export enum PlatformEntryType {
  CLIENT = 'client',
  SERVER = 'server'
}

export enum CodeSetupStringType {
  HEADER = 'HEADER',
  CODE = 'CODE',
  TEXT = 'TEXT'
}

export interface CodeSetupDocEntry {
  stringId: keyof StringsMap
  stringType: CodeSetupStringType
}

export interface PlatformEntry {
  name: string
  icon: string
  type: PlatformEntryType
  readmeStringId: StringKeys
  disabled?: boolean
}

export const SupportPlatforms = [
  {
    name: 'NodeJS',
    icon: nodejs,
    type: PlatformEntryType.SERVER,
    readmeStringId: 'cf.onboarding.readme.javascript',
    disabled: true
  },
  {
    name: 'Java',
    icon: java,
    type: PlatformEntryType.SERVER,
    readmeStringId: 'cf.onboarding.readme.java'
  },
  {
    name: 'Golang',
    icon: golang,
    type: PlatformEntryType.SERVER,
    readmeStringId: 'cf.onboarding.readme.golang'
  },
  {
    name: '.NET',
    icon: dotnet,
    type: PlatformEntryType.SERVER,
    readmeStringId: 'cf.onboarding.readme.dotnet',
    disabled: true
  },
  {
    name: 'JavaScript',
    icon: javascript,
    type: PlatformEntryType.CLIENT,
    readmeStringId: 'cf.onboarding.readme.javascript'
  },
  {
    name: 'Android',
    icon: android,
    type: PlatformEntryType.CLIENT,
    readmeStringId: 'cf.onboarding.readme.android'
  },
  {
    name: 'iOS',
    icon: ios,
    type: PlatformEntryType.CLIENT,
    readmeStringId: 'cf.onboarding.readme.ios'
  }
].sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1)) as Array<PlatformEntry>

export interface LanguageSelectionProps {
  selected: PlatformEntry | undefined
  onSelect: (entry: PlatformEntry) => void
}

export const LanguageSelection: React.FC<LanguageSelectionProps> = ({ selected, onSelect }) => {
  const [selectedEntry, setSelectedEntry] = useState<PlatformEntry | undefined>(selected)

  return (
    <ul className={css.list}>
      {SupportPlatforms.filter(entry => !entry.disabled).map(entry => {
        const { name, icon } = entry
        return (
          <li key={name} className={css.item}>
            <Layout.Vertical spacing="small">
              <Button
                noStyling
                className={cx(css.button, selectedEntry?.name === name && css.selected)}
                onClick={() => {
                  setSelectedEntry(entry)
                  onSelect(entry)
                }}
              >
                <img src={icon} alt={name} width={35} height={35} />
              </Button>
              <Text inline style={{ fontWeight: 500, color: '#555770', fontSize: '12px', textAlign: 'center' }}>
                {name}
              </Text>
            </Layout.Vertical>
          </li>
        )
      })}
    </ul>
  )
}
