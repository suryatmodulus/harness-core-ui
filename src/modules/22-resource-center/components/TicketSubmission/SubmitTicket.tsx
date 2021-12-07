import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import type { PaddingProps } from '@wings-software/uicore/dist/styled-props/padding/PaddingProps'
import {
  Button,
  ButtonVariation,
  Color,
  DropDown,
  FontVariation,
  Intent,
  Layout,
  Text,
  TextInput
} from '@wings-software/uicore'
import { Radio, TextArea } from '@blueprintjs/core'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useScreenshot } from 'use-react-screenshot'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import css from '@resource-center/components/ResourceCenter/ResourceCenter.module.scss'
import newcss from './SubmitTicket.module.scss'

interface SubmitTicketProps {
  backButton: { (event: React.MouseEvent): Promise<void> | void }
}

export const SubmitTicket = (props: SubmitTicketProps): JSX.Element => {
  const categoryTypes = ['Problem', 'Question', 'Feature request', 'Other'].map(item => {
    return {
      label: item,
      value: item
    }
  })
  enum Priority {
    LOW,
    NORMAL,
    HIGH,
    URGENT
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState(categoryTypes[0].value)
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState(Priority.LOW)
  const [image, takeScreenshot] = useScreenshot({ type: 'image/png' })
  const [imageTaken, setImageTaken] = useState(false)
  const { currentUserInfo } = useAppStore()
  const { getString } = useStrings()

  useEffect(() => {
    setUrl(window.location.href)
    setEmail(currentUserInfo.email as string)
  }, [])

  useEffect(() => {
    if (imageTaken) {
      const bodyFound = document.getElementById('react-root')
      takeScreenshot(bodyFound)
    }
  }, [imageTaken])

  useEffect(() => {
    setImageTaken(false)
  }, [image])
  // secureStorage

  const commonPadding = { left: 'xlarge', right: 'xlarge', bottom: 'xsmall' } as PaddingProps
  const fontProps = {
    font: { variation: FontVariation.SMALL_SEMI },
    color: Color.WHITE,
    padding: { bottom: 'xxsmall' }
  }
  const optionDescProps = { font: { variation: FontVariation.TINY }, color: Color.WHITE, padding: { bottom: 'large' } }

  return imageTaken ? (
    <div />
  ) : (
    <Layout.Vertical width={440} className={css.resourceCenter}>
      <Layout.Horizontal padding={'large'} flex={{ alignItems: 'center' }}>
        <Button icon="chevron-left" variation={ButtonVariation.ICON} onClick={props.backButton} />
        <Text color={Color.WHITE}>{getString('resourceCenter.submitTitle')}</Text>
      </Layout.Horizontal>
      <Layout.Vertical padding={{ ...commonPadding, bottom: 'medium' }}>
        <Text {...fontProps}>{getString('resourceCenter.submitFeedbackText')}</Text>
        <DropDown
          value={category}
          onChange={selected => setCategory(selected.label)}
          items={categoryTypes}
          width={125}
        />
      </Layout.Vertical>
      <Layout.Vertical padding={commonPadding} width={275}>
        <Text {...fontProps}>{getString('resourceCenter.submitEmail')}</Text>
        <TextInput
          defaultValue={email}
          placeholder={getString('resourceCenter.submitEmailPlaceholder')}
          onChange={(ch: React.ChangeEvent<HTMLInputElement>) => setEmail(ch.target.value.trim())}
          width={195}
          wrapperClassName={'input_margin'}
        />
      </Layout.Vertical>
      <Layout.Vertical padding={commonPadding}>
        <Text {...fontProps}>{getString('resourceCenter.submitSubject')}</Text>
        <TextInput
          defaultValue={subject}
          onChange={(ch: React.ChangeEvent<HTMLInputElement>) => setSubject(ch.target.value.trim())}
        />
      </Layout.Vertical>
      <Layout.Vertical padding={commonPadding}>
        <div style={{ display: 'flex', alignItems: 'space-between' }}>
          <Text {...fontProps}>{getString('resourceCenter.submitMessage')}</Text>
          <div style={{ width: '100%' }} />
          <Text {...fontProps}>{getString('resourceCenter.submitOptional')}</Text>
        </div>
        <TextArea
          growVertically={true}
          large={true}
          intent={Intent.PRIMARY}
          onChange={ch => {
            setMessage(ch.target.value.trim())
          }}
          defaultValue={''}
          value={message}
          className={newcss.textheight}
        />
      </Layout.Vertical>
      <Layout.Vertical padding={commonPadding}>
        <Text {...fontProps} padding={{ bottom: 'medium' }}>
          {getString('resourceCenter.submitPriority.title')}
        </Text>
        <div className={newcss.radiobuttongrid}>
          <Radio
            labelElement={<Text {...fontProps}>{getString('resourceCenter.submitPriority.low')}</Text>}
            checked={Priority.LOW === priority}
            onChange={() => setPriority(Priority.LOW)}
            className={cx(newcss.radiolocation, newcss.low)}
          />
          <Text {...optionDescProps} className={cx(newcss.radiodescription, newcss.low)}>
            {getString('resourceCenter.submitPriority.lowDesc')}
          </Text>

          <Radio
            labelElement={<Text {...fontProps}>{getString('resourceCenter.submitPriority.normal')}</Text>}
            checked={Priority.NORMAL === priority}
            onChange={() => setPriority(Priority.NORMAL)}
            className={cx(newcss.radiolocation, newcss.normal)}
          />
          <Text {...optionDescProps} className={cx(newcss.radiodescription, newcss.normal)}>
            {getString('resourceCenter.submitPriority.normalDesc')}
          </Text>

          <Radio
            labelElement={<Text {...fontProps}>{getString('resourceCenter.submitPriority.high')}</Text>}
            checked={Priority.HIGH === priority}
            onChange={() => setPriority(Priority.HIGH)}
            className={cx(newcss.radiolocation, newcss.high)}
          />
          <Text {...optionDescProps} className={cx(newcss.radiodescription, newcss.high)}>
            {getString('resourceCenter.submitPriority.highDesc')}
          </Text>
          <Radio
            labelElement={<Text {...fontProps}>{getString('resourceCenter.submitPriority.urgent')}</Text>}
            checked={Priority.URGENT === priority}
            onChange={() => setPriority(Priority.URGENT)}
            className={cx(newcss.radiolocation, newcss.urgent)}
          />
          <Text {...optionDescProps} className={cx(newcss.radiodescription, newcss.urgent)}>
            {getString('resourceCenter.submitPriority.urgentDesc')}
          </Text>
        </div>

        {!image ? (
          <Button
            variation={ButtonVariation.SECONDARY}
            text={getString('resourceCenter.submitScreenshot')}
            width={165}
            height={32}
            icon={'upload-box'}
            font={{ variation: FontVariation.BODY1 }}
            background={Color.PRIMARY_10}
            border={{ color: Color.PRIMARY_3 }}
            className={newcss.buttonfix}
            onClick={() => {
              if (image == null) {
                setImageTaken(true)
              }
            }}
          />
        ) : (
          <a href={image}>
            <Text font={{ variation: FontVariation.BODY1 }} color={Color.PRIMARY_3}>
              {getString('resourceCenter.submitSeeScreenshot')}
            </Text>
          </a>
        )}
      </Layout.Vertical>

      <Layout.Vertical padding={'xlarge'}>
        <Button
          font={{ variation: FontVariation.BODY }}
          text={getString('resourceCenter.submitTicket')}
          width={126}
          intent={'primary'}
          variation={ButtonVariation.PRIMARY}
          className={newcss.buttonfix}
        />
      </Layout.Vertical>
    </Layout.Vertical>
  )
}
