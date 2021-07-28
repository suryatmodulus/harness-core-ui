import React from 'react'
import css from './ArgoCDHomePage.module.scss'

const ArgoCDHomePage: React.FC = () => {
  // let iframeRef: any
  // const [isIFrameLoading, setIFrameLoading] = useState(true)

  // const iframeLoaded = () => {
  //   setIFrameLoading(false)
  // }

  // useEffect(() => {
  //   console.log('isIFrameLoading', isIFrameLoading)

  //   if (!isIFrameLoading) {
  //     iframeRef = document.querySelector('iframe[id="argoCD"]')
  //     console.log('iframeRef', iframeRef)

  //     // const navBar = iframeRef.contentWindow.document.getElementsByClassName('.navbar')

  //     // console.log('navBar', navBar)

  //     // iframeRef && iframeRef.head.appendChild(cssLink)
  //   }
  // }, [isIFrameLoading])

  return (
    <iframe
      id="argoCD"
      name="argoCD"
      className={css.argoCd}
      // ref={onIframeRef}
      title="argoCD"
      // onLoad={iframeLoaded}
      src="http://localhost:8090/"
    ></iframe>
  )
}

export default ArgoCDHomePage
