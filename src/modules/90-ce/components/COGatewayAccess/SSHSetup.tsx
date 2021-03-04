import React from 'react'
import { Layout, Button, Text, Select, SelectOption } from '@wings-software/uicore'
import { isEmpty as _isEmpty } from 'lodash-es'

enum OS {
  Mac = 'Mac',
  Windows = 'Windows',
  Linux = 'Linux'
}

const dropdownOptions: SelectOption[] = [
  { label: OS.Mac, value: 'https://lightwing-downloads-temp.s3.ap-south-1.amazonaws.com/proxymanager.zip' },
  { label: OS.Windows, value: 'https://lightwing-downloads-temp.s3.ap-south-1.amazonaws.com/proxymanager.zip' },
  { label: OS.Linux, value: 'https://lightwing-downloads-temp.s3.ap-south-1.amazonaws.com/proxymanager.zip' }
]

const SSHSetup: React.FC = () => {
  const [assetLink, setAssetLink] = React.useState<SelectOption | null>(null)

  React.useEffect(() => {
    const defaultOs = navigator.appVersion.includes(OS.Mac.valueOf())
      ? OS.Mac
      : navigator.appVersion.includes(OS.Windows.valueOf())
      ? OS.Windows
      : navigator.appVersion.includes(OS.Linux.valueOf())
      ? OS.Linux
      : null

    if (defaultOs) {
      setAssetLink(dropdownOptions.find(item => item.label === defaultOs) as SelectOption)
    }
  })

  const downloadAsset = () => {
    const linkEl: HTMLAnchorElement = document.createElement('a')
    linkEl.href = assetLink?.value as string
    linkEl.click()
  }

  const handleOsSelectChange = (option: SelectOption) => {
    setAssetLink(option)
  }

  return (
    <Layout.Vertical spacing="medium" padding="medium" style={{ backgroundColor: 'var(--grey-200)' }}>
      <Text style={{ lineHeight: '20px', fontSize: 'var(--font-size-normal)' }}>
        This is just placeholder text. You can customize the domain name for your Autostopping Rule. Domain name should
        be entered without prefixing the scheme. A Rule can have multiple URLs. You can enter comma separated values
        into Custom domain field to support multiple URLs.
      </Text>
      <Layout.Horizontal>
        <Select
          // size={SelectSize}
          items={dropdownOptions}
          onChange={handleOsSelectChange}
          value={assetLink}
        />
        <Button
          style={{
            borderRadius: '8px',
            padding: '12px',
            border: '1px solid var(--blue-700)',
            color: 'var(--blue-700)',
            width: '130px',
            marginLeft: 'var(--spacing-large)'
          }}
          text="Download CLI"
          onClick={downloadAsset}
          className={'download-cli-btn'}
          disabled={_isEmpty(assetLink)}
        />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default SSHSetup
