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

const groups = [{ id: 1, title: 'Sleep'}, { id: 2, title: 'Eat'}]
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

///create a button that toggles between sleep and wake
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

///create a button to indicate eating
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

/// need integers for the dropdowns
function generateIntegers() {
  let arr = []
  for (let i=0; i<61; i++) {
    arr.push(i)
  }
  return arr
}

/// create a way to manually enter times
function ManualEntry(props) {
  const [entryVal, setEntryVal] = useState({
    startHour: 4,
    startMinute: 20,
    endHour: 16,
    endMinute: 20
  })
  const [timeVal, setTimeVal] = useState({
    startHour: 4,
    startMinute: 20,
    endHour: 16,
    endMinute: 20
  })

  function handleChange(e) {
    console.log("time: ", e.target.value)
    setEntryVal({...entryVal, [e.target.name]: e.target.value})
    setTimeVal({...timeVal,[e.target.name]: e.target.value})
      }


  ///pass the data back up to the parent component
  function submitEntry(e) {
    e.preventDefault()
    props.handleSubmit(entryVal);
  }

  return(
    <form onSubmit={submitEntry}>
      <div>
      <label>
        Sleep Start Time: 
        <select name="startHour" value={timeVal.startHour} onChange={handleChange}>
          {generateIntegers().slice(0,24).map((item) =>  {
              return <option value={item}>{item}</option>
          })}
        </select>
        <select name="startMinute" value={timeVal.startMinute} onChange={handleChange}>
        {generateIntegers().slice(0,60).map((item) =>  {
              return <option value={item}>{item}</option>
          })}
        </select>
      </label>
      </div>
      <div>
      <label>
        Sleep End Time: 
        <select name="endHour" value={timeVal.endHour} onChange={handleChange}>
          {generateIntegers().slice(0,24).map((item) =>  {
              return <option value={item}>{item}</option>
          })}
        </select>
        <select name="endMinute" value={timeVal.endMinute} onChange={handleChange}>
        {generateIntegers().slice(0,60).map((item) =>  {
              return <option value={item}>{item}</option>
          })}
        </select>
      </label>
      </div>
      <input type="submit" value="Submit Sleep"/>
    </form>
  )
}

function ManualEntryEat(props) {
  const [entryVal, setEntryVal] = useState({
    action: "eat",
    hour: 4,
    minute: 20
  })

  function submitEntry(e) {
    e.preventDefault()
    props.handleSubmit(entryVal);
  }

  function handleChange(e) {
    console.log("time: ", e.target.value)
    setEntryVal({...entryVal, [e.target.name]: e.target.value})
  }

  return (
    <form onSubmit = {submitEntry}>
      <div>
      <label>
        Eating Time: 
        <select name="hour" value={entryVal.hour} onChange={handleChange}>
          {generateIntegers().slice(0,24).map((item) =>  {
              return <option value={item}>{item}</option>
          })}
        </select>
        <select name="minute" value={entryVal.minute} onChange={handleChange}>
        {generateIntegers().slice(0,60).map((item) =>  {
              return <option value={item}>{item}</option>
          })}
        </select>
      </label>
      </div>
      <input type="submit" value="Submit Eat"/>
    </form>
  )
}

function BoardHooks(props) {
  const [times, setTimes] = useState(
    JSON.parse(localStorage.getItem('Times')) || []
  );
  const [status, setStatus] = useState(
    localStorage.getItem("Status") || "Sleep"
  );

  ///need a "timer" to store sleep start
  const [timer, setTimer] = useState(
    parseInt(localStorage.getItem("timer")) || 0
  );

  ///need an id 
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

  const handleSubmit = entryVal=> {
    console.log("Submitting: ", entryVal)
    if (entryVal.action) {
      let time = moment().hour(entryVal.hour).minute(entryVal.minute)
      setTimes([...times, {
        id: getID(),
          group: 2,
          start_time: time,
          end_time: time.add(900, 'milliseconds'),
          canMove: false,
          canResize: false
      }])
    } else {
    setTimes([...times, {
      id: getID(),
        group: 1,
        start_time: moment().hour(entryVal.startHour).minute(entryVal.startMinute),
        end_time: moment().hour(entryVal.endHour).minute(entryVal.endMinute),
        canMove: false,
        canResize: false
    }])
  }
  }

  useEffect(() => {
    localStorage.setItem('Times', JSON.stringify(times))
  });

  useEffect(() => {
    localStorage.setItem("ID",'' + id)
    console.log(id)
  })

  return (
    <div className="container">
      <h1>Welcome to the Audrey Sleep and Eat Tracker</h1>
      <div style={{"padding-top": "10px"}}>
        <h3>Realtime Entry of Data</h3>
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
        />
        <div>
          <h3 style={{"padding-top": "10px"}}>Manual Entry of Data</h3>
          <ManualEntry handleSubmit = {handleSubmit}/>
        </div>
        <div>
          <ManualEntryEat handleSubmit = {handleSubmit}/>
        </div>
    </div>
  )
}
export default BoardHooks;
