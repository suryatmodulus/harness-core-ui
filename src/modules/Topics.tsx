import React, { useState } from 'react'
import { Link, Route, Switch, useRouteMatch } from 'react-router-dom'

export function Topics() {
  const [value, setValue] = useState(0)
  //   const contObjTemp = getAppStoreCont();
  //   const { contObj } = React.useContext(contObjTemp);
  //   const { currentUserInfo,updateAppStore } = React.useContext(contObj);
  //  const currentuserInfoCode=(<><h2>currentUserInfo emailid : {currentUserInfo.email} </h2>
  //   <Button text="change email id (Btn from uicore)" onClick={()=>{
  // updateAppStore(  {currentUserInfo: {
  // email: 'Changed email id'

  // }})
  // }} /></>)

  return (
    <div style={{ border: '1px solid black' }}>
      <h2> Parent topics App running with React {React.version}</h2>
      <button onClick={() => setValue(value + 1)}>Click me {value} times</button>
      <h2>Topics</h2>
      {/* {currentuserInfoCode} */}
      {/* <ul>
        <li>
          <Link to={`${url}/rendering`}>Rendering with React version {React.version}</Link>
        </li>
        <li>
          <Link to={`${url}/components`}>Components {React.version}</Link>
        </li>
        <li>
          <Link to={`${url}/props-v-state`}>Props v. State {React.version}</Link>
        </li>
      </ul>

      <Switch>
        <Route exact path={path}>
          <h3>Please select a topic. {React.version}</h3>
        </Route>
      </Switch> */}
    </div>
  )
}
