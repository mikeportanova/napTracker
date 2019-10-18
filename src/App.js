import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { useCallback } from 'react';
import logo from './logo.svg';
import './App.css';
import { tsThisType } from '@babel/types';
import { isTemplateElement } from '@babel/types';
import { original } from 'immer';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';

import Timeline from 'react-calendar-timeline/lib'
// make sure you include the timeline stylesheet or the timeline will not be styled
import 'react-calendar-timeline/lib/Timeline.css'
import moment from 'moment'

const groups = [{ id: 1, title: 'Sleep/Wake'}, { id: 2, title: 'Eat'}]
const minTime = moment().startOf('day').unix()
const maxTime = moment().endOf('day').unix()
const testVal = moment().add(6, 'hours').valueOf()

// var id = 0

console.log("minTime: ", minTime, "maxTime: ", maxTime, "Test: ", testVal)

//create an app with three key components:
// (1) A button for Nap/Sleep that logs the time the nap began,
// this button turns into "Wake" until clicked again, logging wake-time and toggling back
// (2) An "eat" button that logs the time
// (3) A timeline that shows sleep intervals and eating events
// FUTURE: store this data over multiple days and display analytics.

function SleepButton(props) {
  let label = (props.sleepWake === "Sleep")?"Sleep":"Wake"
  return (
    <Button 
      variant="outline-primary"
      onClick={props.handleClick}
      name={label}>
        {label}
      </Button>
  )
}

function EatButton(props) {
  return (
    <Button
      variant="outline-primary"
      onClick={props.handleClick}
      name="Eat">
        Eat
      </Button>
  )
}

// BUILD the object array, appending End Time to each Sleep segment when Wake is hit.
// would it be better to use some sort of timer element instead of my discrete start/stop?
// make it so if the user hits "eat" while sleeping, give alert instead of working

// function TimelineOld(props) {
//   let result = props.times.reduce(function(accumulator,currentValue) {
//     accumulator[currentValue.key] = currentValue.val
//     return accumulator
//   },{})
//   let timesList = []
//   props.times.map((item,i) => timesList.push(
//     <tr>
//       <th>{Object.keys(item)[0]}</th>
//       <th>{Object.values(item)[0]}</th>
//     </tr>
//   ))
//   console.log("Map: ",timesList)

//   return (
//     <Table striped bordered size="sm">
//       <thead>
//         <tr>
//           <th>Action</th>
//           <th>Time</th>
//         </tr>
//       </thead>
//       <tbody>
//         {timesList}
//       </tbody>
//     </Table>
//   )
// }

function BoardHooks(props) {
  const [times, setTimes] = useState(
    JSON.parse(localStorage.getItem('Times')) || []
  );
  const [status, setStatus] = useState(
    localStorage.getItem("Status") || "Sleep"
  );

  const [timer, setTimer] = useState(
    parseInt(localStorage.getItem("timer")) || 0
  );

  const [id, setID] = useState(
    parseInt(localStorage.getItem("ID")) || 0
  )



  const getID = () => {
    let tempID = id + 1
    setID(tempID)
    return tempID
  };

  const handleClick = e => {
    console.log(times)
    let label = e.target.name
    console.log("Label 420: ", label)
    let time = Date.now()
    // let clickedTime = time.getHours() + ":" + ('0' + time.getMinutes()).slice(-2)
    if (label === "Sleep") {
      setTimer(time)
      setStatus("Wake")
    } else if (label === "Wake") {
      setTimes([...times,{
        id: getID(),
        group: 1,
        start_time: timer,
        end_time: time,
        canMove: false,
        canResize: false
      }]);
      setStatus("Sleep");
    } else {
      setTimes([...times,{
        id: getID(),
        group: 2,
        start_time: time,
        end_time: time + 900,
        canMove: false,
        canResize: false,
      }]);
    }
  }

  useEffect(() => {
    localStorage.setItem('Times', JSON.stringify(times))
  });

  useEffect(() => {
    localStorage.setItem("ID",'' + id)
    console.log(id)
  })

  const handleScroll = (visibleTimeStart, visibleTimeEnd, updateScrollCanvas) => {
    if (visibleTimeStart < minTime && visibleTimeEnd > maxTime) {
      updateScrollCanvas(minTime, maxTime)
    } else if (visibleTimeStart < minTime) {
      updateScrollCanvas(minTime, minTime + (visibleTimeEnd - visibleTimeStart))
    } else if (visibleTimeEnd > maxTime) {
      updateScrollCanvas(maxTime - (visibleTimeEnd - visibleTimeStart), maxTime)
    } else {
      updateScrollCanvas(visibleTimeStart, visibleTimeEnd)
    }
  }
  return (
    <div className="container">
      <div>
        <SleepButton handleClick = {handleClick} sleepWake={status}/>
        <EatButton handleClick = {handleClick}/>
      </div>
        <Timeline 
          groups={groups}
          items={times}
          defaultTimeStart={moment().add(-12, 'hour')}
          defaultTimeEnd={moment().add(12, 'hour')}
          minZoom={60*1000}
          maxZoom={60*60*24*1000}
          // onTimeChange={this.handleScroll}
          // visibleTimeStart={moment().startOf('day').unix()}
          // visibleTimeEnd={moment().endOf('day').unix()}
        />
    </div>
  )
}


//implement timeline here


// class Board extends React.Component {
//   constructor(props) {
//     super(props)
//     this.state = {
//       id: 0,
//       times: [],
//       sleepWake: "Sleep",
//       timer: 0,
//     }
//     this.handleClick = this.handleClick.bind(this)
//     this.handleScroll = this.handleScroll.bind(this)
//   }
//   getID() {
//     id++
//     return id
//   }
//   handleClick(e) {
//     let label = e.target.name
//     console.log("Label: ", label)
//     let time = Date.now()
//     if (label === "Sleep") {
//       this.setState({
//         timer: time,
//         sleepWake: "Wake"
//       })
//     } else if (label === "Wake") {
//       this.setState({
//         times: [...this.state.times,{
//           id: this.getID(),
//           group: 1,
//           start_time: this.state.timer,
//           end_time: time,
//           canMove: false,
//           canResize: false
          
//         }],
//         sleepWake: "Sleep"
//       })
//     } else {
//       this.setState({
//         times: [...this.state.times,{
//           id: this.getID(),
//           group: 2,
//           start_time: time,
//           end_time: time + 900
//         }]
//       })
//     }
//   }

//   handleScroll(visibleTimeStart, visibleTimeEnd, updateScrollCanvas) {
//     if (visibleTimeStart < minTime && visibleTimeEnd > maxTime) {
//       updateScrollCanvas(minTime, maxTime)
//     } else if (visibleTimeStart < minTime) {
//       updateScrollCanvas(minTime, minTime + (visibleTimeEnd - visibleTimeStart))
//     } else if (visibleTimeEnd > maxTime) {
//       updateScrollCanvas(maxTime - (visibleTimeEnd - visibleTimeStart), maxTime)
//     } else {
//       updateScrollCanvas(visibleTimeStart, visibleTimeEnd)
//     }
//   }

//   render() {
//     console.log("Times state: ", this.state.times)
//     return (
//       <div className="container">
//         <div>
//           <SleepButton handleClick = {this.handleClick} sleepWake={this.state.sleepWake}/>
//           <EatButton handleClick = {this.handleClick}/>
//         </div>
//           <Timeline 
//             groups={groups}
//             items={this.state.times}
//             defaultTimeStart={moment().add(-12, 'hour')}
//             defaultTimeEnd={moment().add(12, 'hour')}
//             minZoom={60*1000}
//             maxZoom={60*60*24*1000}
//             // onTimeChange={this.handleScroll}
//             // visibleTimeStart={moment().startOf('day').unix()}
//             // visibleTimeEnd={moment().endOf('day').unix()}
//           />
//       </div>
//     )
//   }
// }



// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

export default BoardHooks;
