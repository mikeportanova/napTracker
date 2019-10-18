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

function ManualEntry(props) {
  const [entryVal, setEntryVal] = useState({
    eventName: "Sleep",
    hour: 4,
    minute: 20
  })
  const [actionVal, setActionVal] = useState("Sleep")
  const [timeVal, setTimeVal] = useState([4,20])

  function handleChange(e) {
    console.log("time: ", e.target.value)
    if (e.target.name === "hour") {
      setTimeVal([e.target.value,timeVal[1]])
      setEntryVal({
        eventName: entryVal.eventName,
        hour: e.target.value,
        minute: entryVal.minute
      })
    } else if (e.target.name === "minute") {
      setTimeVal([timeVal[0],e.target.value])
      setEntryVal({
        eventName: entryVal.eventName,
        hour: entryVal.hour,
        minute: e.target.value
      })
    } else {
      setActionVal(e.target.value)
      setEntryVal({
        eventName: e.target.value,
        hour: entryVal.hour,
        minute: entryVal.minute
      })
    }
  }
  function generateIntegers() {
    let arr = []
    for (let i=0; i<61; i++) {
      arr.push(i)
    }
    return arr
  }

  function submitEntry(e) {
    e.preventDefault()
    props.handleSubmit(entryVal);
  }

  return(
    <form onSubmit={submitEntry}>
      <label>
        Manual event:
        <select name="event" value={actionVal} onChange={handleChange}>
          <option value="Sleep">Sleep</option>
          <option value="Wake">Wake</option>
        </select>
      </label>
      <label>
        Manual time:
        <select name="hour" value={timeVal[0]} onChange={handleChange}>
          {generateIntegers().slice(0,24).map((item) =>  {
              return <option value={item}>{item}</option>
          })}
        </select>
        <select name="minute" value={timeVal[1]} onChange={handleChange}>
        {generateIntegers().slice(0,60).map((item) =>  {
              return <option value={item}>{item}</option>
          })}
        </select>
      </label>
      <input type="submit" value="Submit"/>

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



  const handleSubmit = entryVal=> {
    console.log("Submitting: ", entryVal)
    if (entryVal.eventName === "Sleep") {
      setTimer(moment().hour(entryVal.hour).minute(entryVal.minute))
    } else if (entryVal.eventName === "Wake") {
      setTimes([...times,{
        id: getID(),
        group: 1,
        start_time: timer,
        end_time: moment().hour(entryVal.hour).minute(entryVal.minute),
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
        <div>
          <ManualEntry handleSubmit = {handleSubmit}/>
        </div>
    </div>
  )
}
export default BoardHooks;
