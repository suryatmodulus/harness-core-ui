import React from 'react'
import ReactDOM from 'react-dom'

// Note: this is a semi-private API, but it's ok to use it

export default function createLegacyRoot(container: any) {
  return {
    render(Component: any, props: any) {
      ReactDOM.render(<Component {...props} />, container)
    },
    unmount() {
      ReactDOM.unmountComponentAtNode(container)
    }
  }
}
