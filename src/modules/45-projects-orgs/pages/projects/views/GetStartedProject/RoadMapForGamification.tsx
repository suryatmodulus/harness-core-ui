import React from 'react'

import { ProgressBar, Step } from 'react-step-progress-bar'
import 'react-step-progress-bar/styles.css'

import neutralCard from './images/neutralCard.png'

const RoadMapForGamification: React.FC<{ initialProgress: number }> = ({ initialProgress }) => {
  const [progress] = React.useState(initialProgress)
  return (
    <div className="App">
      <h3 style={{ textAlign: 'center' }}>Your journey with Harness</h3>
      <br />
      <br />
      <br />
      <br />
      <br />
      <div style={{ paddingLeft: 150 + 'px', paddingRight: '150px', paddingBottom: '50px' }}>
        <ProgressBar percent={progress} width={1000} filledBackground="linear-gradient(to right, #fefb72, #f0bb31)">
          <Step transition="scale">
            {({ accomplished, transitionState }: any) => (
              <div style={{ textAlign: 'center' }}>
                {progress === 0 && (
                  <img
                    alt="img"
                    style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                    width="60"
                    src={neutralCard}
                  />
                )}
                {progress !== 0 && <p> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</p>}
                <div
                  style={{
                    width: '200px',
                    padding: '10px',
                    background: transitionState === 'entered' ? '#ffdb4d' : '#FFF8DC',
                    margin: '0'
                  }}
                >
                  <p style={{ color: transitionState === 'entered' ? 'black' : 'gray' }}>
                    {' '}
                    <br />
                    Created Project!
                  </p>
                </div>
              </div>
            )}
          </Step>
          <Step transition="scale">
            {({ accomplished, transitionState }: any) => (
              <div style={{ textAlign: 'center' }}>
                {progress === 25 && (
                  <img
                    alt="img"
                    style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                    width="60"
                    src={neutralCard}
                  />
                )}
                {progress !== 25 && <p> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</p>}
                <div
                  style={{
                    width: '200px',
                    padding: '10px',
                    background: transitionState === 'entered' ? '#ffdb4d' : '#FFF8DC',
                    margin: '0'
                  }}
                >
                  <p style={{ color: transitionState === 'entered' ? 'black' : 'gray' }}>
                    {' '}
                    <br />
                    Setup Manifest Complete!
                  </p>
                </div>
              </div>
            )}
          </Step>
          <Step transition="scale">
            {({ accomplished, transitionState }: any) => (
              <div style={{ textAlign: 'center' }}>
                {progress === 50 && (
                  <img
                    alt="img"
                    style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                    width="60"
                    src={neutralCard}
                  />
                )}
                {progress !== 50 && <p> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</p>}
                <div
                  style={{
                    width: '200px',
                    padding: '10px',
                    background: transitionState === 'entered' ? '#ffdb4d' : '#FFF8DC',
                    margin: '0'
                  }}
                >
                  <p style={{ color: transitionState === 'entered' ? 'black' : 'gray' }}>
                    {' '}
                    <br />
                    Setup Artifact Complete!
                  </p>
                </div>
              </div>
            )}
          </Step>
          <Step transition="scale">
            {({ accomplished, transitionState }: any) => (
              <div style={{ textAlign: 'center' }}>
                {progress === 75 && (
                  <img
                    alt="img"
                    style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                    width="60"
                    src={neutralCard}
                  />
                )}
                {progress !== 75 && <p> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</p>}
                <div
                  style={{
                    width: '200px',
                    padding: '10px',
                    background: transitionState === 'entered' ? '#ffdb4d' : '#FFF8DC',
                    margin: '0'
                  }}
                >
                  <p style={{ color: transitionState === 'entered' ? 'black' : 'gray' }}>
                    {' '}
                    <br />
                    Setup Infra Complete!
                  </p>
                </div>
              </div>
            )}
          </Step>
          <Step transition="scale">
            {({ accomplished, transitionState }: any) => (
              <div style={{ textAlign: 'center' }}>
                {progress === 100 && transitionState === 'entered' && (
                  <img
                    alt="img"
                    style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                    width="60"
                    src={neutralCard}
                  />
                )}

                {progress !== 100 && (
                  <div>
                    <br /> <br /> &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                  </div>
                )}
                <div
                  style={{
                    width: '200px',
                    padding: '10px',
                    background: transitionState === 'entered' ? '#ffdb4d' : '#FFF8DC',
                    margin: '0'
                  }}
                >
                  <p style={{ color: transitionState === 'entered' ? 'black' : 'gray' }}>
                    &nbsp; Deployed Pipeline Successfully!
                  </p>
                </div>
              </div>
            )}
          </Step>
        </ProgressBar>
        &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; <br />
        <br />
        <br />
      </div>
    </div>
  )
}

export default RoadMapForGamification
