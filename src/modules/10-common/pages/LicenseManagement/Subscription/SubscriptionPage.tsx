import React, { useState } from 'react'
import { Layout, Container, Icon, Text } from '@wings-software/uicore'
import type { IconName } from '@blueprintjs/icons'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { Page } from '@common/components'
import css from './SubscriptionPage.module.scss'

enum MODULE {
  CD,
  CV,
  CI,
  CE,
  CF
}

const Modules = ({
  selectedModule,
  setSelectedModule
}: {
  selectedModule: MODULE | undefined
  setSelectedModule: (module: MODULE) => void
}): React.ReactElement => {
  const { getString } = useStrings()
  const { CDNG_ENABLED, CVNG_ENABLED, CING_ENABLED, CENG_ENABLED, CFNG_ENABLED } = useFeatureFlags()
  const MODULES = [
    {
      moduleName: MODULE.CD,
      enabled: CDNG_ENABLED,
      title: getString('common.purpose.cd.delivery'),
      icon: 'cd-main'
    },
    {
      moduleName: MODULE.CV,
      enabled: CVNG_ENABLED,
      title: getString('common.purpose.cv.verification'),
      icon: 'cv-main'
    },
    {
      moduleName: MODULE.CI,
      enabled: CING_ENABLED,
      title: getString('common.purpose.ci.integration'),
      icon: 'ci-main'
    },
    {
      moduleName: MODULE.CE,
      enabled: CENG_ENABLED,
      title: getString('common.purpose.ce.efficiency'),
      icon: 'ce-main'
    },
    {
      moduleName: MODULE.CF,
      enabled: CFNG_ENABLED,
      title: getString('common.purpose.cf.features'),
      icon: 'cf-main'
    }
  ]

  return (
    <Layout.Horizontal spacing="xxlarge" margin={{ top: 'xxlarge', left: 'xlarge' }}>
      {MODULES.map(module => {
        if (module.enabled) {
          return (
            <Container
              padding={{ top: 'small', left: 'medium', right: 'xxxlarge', bottom: 'small' }}
              border={{ radius: 5 }}
              className={cx(css.module, module.moduleName === selectedModule ? css.selected : undefined)}
              onClick={() => setSelectedModule(module.moduleName)}
            >
              <Layout.Horizontal>
                <Icon name={module.icon as IconName} size={25} margin={{ right: 'small' }} />
                <Layout.Vertical>
                  <Text font={{ size: 'xsmall', weight: 'bold' }}>{getString('common.purpose.continuous')}</Text>
                  <Text font={{ weight: 'bold' }}>{module.title}</Text>
                </Layout.Vertical>
              </Layout.Horizontal>
            </Container>
          )
        }
      })}
    </Layout.Horizontal>
  )
}
export const SubscriptionPage: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<MODULE>()
  return (
    <Page.Body>
      <Modules selectedModule={selectedModule} setSelectedModule={setSelectedModule} />
    </Page.Body>
  )
}
