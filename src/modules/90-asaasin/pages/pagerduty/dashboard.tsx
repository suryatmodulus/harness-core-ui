import React from 'react'
import { Container, Heading, Layout, Text } from '@wings-software/uicore'
import { usePagerdutySavings } from 'services/asaasin'

const AsaasinPagerdutyDashboard: React.FC = () => {
  const { data: savings, loading: loading } = usePagerdutySavings({
    debounce: 300
  })
  return (
    <>
      <Layout.Vertical
        spacing="large"
        style={{
          justifyContent: 'left',
          alignItems: 'left',
          margin: '20px'
        }}
      >
        <Layout.Horizontal spacing="xxlarge">
          <img
            src="https://img.apksum.com/32/com.pagerduty.android/6.01/icon.png"
            style={{ height: '80px', width: '80px' }}
          ></img>
          <Text font="large" style={{ lineHeight: '24px', marginTop: '20px' }}>
            PagerDuty
          </Text>
        </Layout.Horizontal>

        {/* <Text font="normal" style={{ lineHeight: '24px', marginTop: '20px' }}>
          View and manage your entire Github licenses, users, payments, policies and contracts in one place.
        </Text>
       */}
        {!loading && savings != null && (
          <>
            <Layout.Horizontal spacing="xxlarge">
              <Container padding="small" style={{ borderRadius: '4px', backgroundColor: 'rgba(71, 213, 223,0.05)' }}>
                <Layout.Vertical spacing="small">
                  <Heading level={1} style={{ color: '#05AAB6' }}>
                    $1,200,000
                  </Heading>
                  <Text style={{ color: '#05AAB6' }}>Est. Annual Spend</Text>
                </Layout.Vertical>
              </Container>
              <Container padding="small" style={{ borderRadius: '4px', backgroundColor: '#f8f6fd' }}>
                <Layout.Vertical spacing="small">
                  <Heading level={1} style={{ color: '#9872e7' }}>
                    $300,000
                  </Heading>
                  <Text style={{ color: '#9872e7' }}>Est. Annual Savings</Text>
                </Layout.Vertical>
              </Container>
              <Container padding="small" style={{ borderRadius: '4px', backgroundColor: 'rgba(71, 213, 223,0.05)' }}>
                <Layout.Vertical spacing="small">
                  <Heading level={1} style={{ color: '#05AAB6' }}>
                    384
                  </Heading>
                  <Text style={{ color: '#05AAB6' }}>Total Users</Text>
                </Layout.Vertical>
              </Container>
              <Container padding="small" style={{ borderRadius: '4px', backgroundColor: '#f8f6fd' }}>
                <Layout.Vertical spacing="small">
                  <Heading level={1} style={{ color: '#9872e7' }}>
                    105
                  </Heading>
                  <Text style={{ color: '#9872e7' }}>SaaS Application</Text>
                </Layout.Vertical>
              </Container>
            </Layout.Horizontal>
          </>
        )}
      </Layout.Vertical>
    </>
  )
}

export default AsaasinPagerdutyDashboard
