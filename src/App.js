import React from 'react';
import './App.css';
import Bar from './Bar';
import Line from './Line';
import jsonData from './data.json';
import priceData from './dummData.json';
import DatePicker from "react-datepicker";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";
import "./styles.css";

import ReactHighcharts from 'react-highcharts/ReactHighstock.src';

import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'


const timezoneOffset = 60 * -2;

var data = [
  [1496872800000, 17.24, 1.07],
  [1496959200000, 17.25, 1.28],
  [1497045600000, 17.27, 5.46],
  [1497132000000, 0.00, 0.00]
];

data.forEach((item) => (item[0] -= timezoneOffset * 60 * 1000));

const chartType = [
  {
    id:'bar-type','label':'Bar Chart'
  },{
    id:'line-type','label':'Line Chat'
  }
]

class App extends React.Component {
  
  constructor(props){
    super(props);
    this.state={
      allRecords:[],
      allGroupRecords:[],
      lineStateData:{},
      barStateData:{},
      startDate:new Date(),
      endDate:new Date(),
      selectedUser:1095,
      selectOptionArr:[],
      recordsHolder:[],
      xcategoriesData:[],
      barGraphData:[],
      selectedChart:'line-type'
    }
  }

  componentDidMount(){
    const {records} = jsonData;
   
   // const dateFormated = records.map(mp=>({...mp,start_time:moment(mp.start_time).format("DD/MM/YYYY")}))
    const newFormArr =  records.map(v => ({...v, diffMins:this.getMinutesDifference(v),startDate:this.formatDateTime(v,'start_time'),stopDate:this.formatDateTime(v,'stop_time')})).sort((recA,recB)=> new Date(recB.start_time) - new Date(recA.stop_time))
    // const newFormArr = records.map(v => ({...v, diffMins:this.getAdditionalMinutesDifference(v),startDate:this.getSingleStartDateFromObject(v)}))
    const recordsWithAdditionalMin = this.getRecordsWithAdditionalMinPerDay(newFormArr);
    const resArr = [...new Map(newFormArr.map(item => [item['user_id'], item])).values()];
    const optionArr = resArr.map((res) => ({ id: res.user_id, value: res.first_name +' '+res.last_name }));
    
    const groupRecords = this.groupArrayOfObjects(newFormArr,"user_id");

    // get the records fo particular user

    const userRecords = recordsWithAdditionalMin.filter(rec=>rec.user_id === this.state.selectedUser)

    //const recordsByUserIdStartDate =  this.convertArrayToObject(newFormArr,"user_id",'startDate');
    //const arrayOfKeys = this.getArrayOfkeys(recordsByUserIdStartDate);
    // get user from records object based on selected user
    //const  userRecords  = groupRecords[this.state.selectedUser] ; 
    // const sortedActivities  = userRecords.sort((a, b) => b.startDate - a.startDate)
    //const dataHoleder = userRecords.map(usr=> ([usr.startDate,usr.diffMins]));
    const dataHoleder =  userRecords.map(usr=> ([new Date(usr.start_time).getTime(),usr.diffMins]));
    
    const lineDataHolder = userRecords.map(rk=> ([rk.startDate,rk.diffMins])); 
    //User for chart Bar chart data 
    // const xAxisData = userRecords.map(act=> moment(act.startDate).format("DD-MM-YYYY")) 
    const xAxisData = userRecords.map(act=> act.startDate) 
   
    // const result = newFormArr.reduce(function (x, cur) {
    //   let item = cur.first_name +' '+cur.last_name;
    //       if (!x[item]) x[item] = 0;
    //       x[item] = x[item] + 1
    //       return x
    //     }, {})

    const allMinutesValueByUser =  this.getAllMinutesByUserName(recordsWithAdditionalMin,'diffMins')
    
    this.setState({selectOptionArr:optionArr,allRecords:recordsWithAdditionalMin,allGroupRecords:groupRecords,recordsHolder:dataHoleder,xcategoriesData:xAxisData,barGraphData:allMinutesValueByUser});
    const enteries = Object.entries(allMinutesValueByUser);

    const barDataState = {
      labels: enteries.map(ent=>ent[0]),// records.map((rec)=>rec.first_name+' '+ rec.last_name),
      datasets: [
        {
          label: 'Min Total',
          data: enteries.map(ent=>ent[1]),//[65, 59, 80, 45, 56, 55, 90,80,70,90]
           backgroundColor: '#2a71d0',
          // borderColor: 'rgba(255,99,132,1)',
          // borderWidth: 1,
          // hoverBackgroundColor: 'rgba(255,99,132,0.4)',
          // hoverBorderColor: 'rgba(255,99,132,1)',
         
          
        }
      ]
    };
   
    const lineDataState = {
      labels: lineDataHolder.map((rec)=>rec[0]),//['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          label: 'Usage Details ',
          fill: false,
          lineTension: 0.1,
          backgroundColor: 'rgba(75,192,192,0.4)',
          borderColor: 'rgba(75,192,192,1)',
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'rgba(75,192,192,1)',
          pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgba(75,192,192,1)',
          pointHoverBorderColor: 'rgba(220,220,220,1)',
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data:lineDataHolder.map((rec)=>rec[1])
        }
      ]
    }

    this.setState({barStateData:barDataState,lineStateData:lineDataState})
  }

   millisToMinutesAndSeconds(millis) {
    let minutes = Math.floor(millis / 60000);
    let seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
  }
  
  handleChangeStart = (startDate) => this.setState({ startDate });
    
  handleChangeEnd = (endDate) => this.setState({ endDate });

  handleSelectChange = (selectedUse)=>{
    this.setState({selectedUser:selectedUse.target.value},()=>this.getUserDetailsOnGraph())
  }

  getUserDetailsOnGraph(){
   const {selectedUser,allRecords,barStateData,lineStateData} =  this.state; 
   const dataHoleder = allRecords.filter(rec=> rec.user_id == selectedUser).sort((a,b)=> b.startDate - a.startDate);
   const formatedTimeAndMin =  dataHoleder.map(usr=> ([new Date(usr.start_time).getTime(),usr.diffMins]))   
   const xAxisData = dataHoleder.map(act=> act.startDate);
   const modifiedDataHolder = dataHoleder.map(rk=> ([rk.startDate,rk.diffMins]));
   let dataForBarState =  barStateData, dataForLineState = lineStateData;
    
    lineStateData.labels = modifiedDataHolder.map(mp=>mp[0]);
    lineStateData.datasets[0].data = modifiedDataHolder.map(mp=>mp[1])

  //  dataForLineState.   
  
   
   
   //newLineStateData.labels = newLineStateData.map((mp)=>mp[0]);
   
   
  //  const userRecords  = allGroupRecords[selectedUser] ; 
   //const sortedActivities  = userRecords.sort((a, b) => b.startDate - a.startDate);
  // const dataHoleder = sortedActivities.map(usr=> ([usr.startDate,usr.diffMins]));
   this.setState({recordsHolder:formatedTimeAndMin,xcategoriesData:xAxisData,barStateData:dataForBarState,lineStateData:dataForLineState});
  }

  groupArrayOfObjects(list, key) {
    return list.reduce(function(rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };
  

  convertArrayToObject = (array,param1,param2) =>{
    const initialValue = {};
    return array.reduce((iVal,item)=>{   
      let key =  item[param1] + '-'+ item[param2] 
      if(iVal[key]){
        iVal[key]  += this.getMinutesDifference(item); 
        }else{
          iVal[key]  = this.getMinutesDifference(item)  
        }
        return iVal
    
    },initialValue)
  }

  getMinutesDifference(param){
    let startTime = new Date(param.start_time);
    let stopTime = new Date(param.stop_time);
    let diffMs = (stopTime - startTime);
    return Math.round((diffMs/1000)/60); 
    
  }
  

  getSingleStartDateFromObject(param){
    return new Date(param.start_time).getTime();
  }

  formatDateTime(param,keyName){
    return moment(param[keyName]).format("DD/MM/YYYY") //new Date(param.start_time).getTime();
  }

  getArrayOfkeys(paramObj){
   const outputArr = [];
    for(let key in paramObj){

      let keyName = key.split('-')[0];
      outputArr.push(keyName); 
      
    }
    return outputArr;
  }


  getAllMinutesByUserName(array,addKeyName){
     return array.reduce(function (x, cur) {
      let item = cur.first_name +' '+cur.last_name;
      let min =  cur[addKeyName];
          if (!x[item]){
            x[item] = min;
          }else{
            x[item] = x[item] + min
          }
          return x
        }, {})
  }

  getRecordsWithAdditionalMinPerDay(array){
      const finalArrayOut = [];
      const changeObjKey = 'diffMins';
      for(let i= 0;i < array.length;i++){
        let usrObj = array[i];
        //let isObjectIncluedInArray = this.contains(finalArrayOut,findByKeyName1,usrObj[findByKeyName1],findByKeyName2,usrObj[findByKeyName2]);
        let indexOfVal = finalArrayOut.findIndex(ar=>ar.user_id === usrObj.user_id && ar.startDate === usrObj.startDate && ar.endDate === usrObj.endDate);
      if(indexOfVal >= 0){
        
        let userData = finalArrayOut[indexOfVal];
        if(userData){
          userData[changeObjKey] += usrObj.diffMins;
        }
      }else{
        finalArrayOut.push(usrObj);
      }
     
    }
    return finalArrayOut;
}

  arrayIncludesInObj = (arr, key1, valueToCheck1, key2,valueToCheck2) => {
    return arr.some(value => value[key1] === valueToCheck1 && value[key2] === valueToCheck2);
  }

  showSlectedChartType = (selectedEvt) => {
    this.setState({selectedChart:selectedEvt.target.value})
  }


  handleOnSelectBar = (evt,ele)=>{
    const {barStateData,selectOptionArr} =  this.state;
    const indx = ele[0]._index;
    const selectedVal = barStateData.labels[indx];
    const selectedUser =  selectOptionArr.filter(sel=>sel.value===selectedVal).pop();
    this.setState({selectedUser:selectedUser.id+'',selectedChart:'line-type'},()=>this.getUserDetailsOnGraph())
            //   let indx =  element[0]._index;
            //   console.log('Clicked on Bar element '+indx);
            //   console.log(data.datasets[0]);
              // data.datasets[0].data.splice(indx,1);
              // DataTransfer.label.splice(indx,1);
  }

  render(){

    const options = {style: 'currency', currency: 'INR'};
    const numberFormat = new Intl.NumberFormat('en-US', options);
    const configPrice = {
      
      yAxis: [{
        offset: 20,
        type: 'datetime',
        labels: {
          // formatter: function () {
          //   return numberFormat.format(this.value) 
          // }
          format: '{value:%Y-%m-%d}',
          x: -15,
          style: {
            "color": "#000", "position": "absolute"

          },
          align: 'left'
        },
      },
        
      ],
      tooltip: {
        shared: true,
        formatter: function () {
          return numberFormat.format(this.y, 0) +  '</b><br/>' + moment(this.x).format('MMMM Do YYYY, h:mm')
        }
      },
      plotOptions: {
        series: {
          showInNavigator: true,
          gapSize: 6,

        }
      },
      rangeSelector: {
        selected: 1
      },
      title: {
        text: `Usage Details`
      },
      chart: {
        height: 600,
      },
  
      credits: {
        enabled: false
      },
  
      legend: {
        enabled: true
      },
      xAxis: {
        //type: 'date',
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      },
      rangeSelector: {
        buttons: [{
          type: 'day',
          count: 1,
          text: '1d',
        }, {
          type: 'day',
          count: 7,
          text: '7d'
        }, {
          type: 'month',
          count: 1,
          text: '1m'
        }, {
          type: 'month',
          count: 3,
          text: '3m'
        },
          {
          type: 'all',
          text: 'All'
        }],
        selected: 4
      },
      series: [{
        // name: 'Price',
        // type: 'spline',
  
        // data: priceData,
        // tooltip: {
        //   valueDecimals: 2
        // },
          data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]
  
      }
      ]
    };

    
    const configData = {
      
      tooltip: {
        shared: true,
        formatter: function () {
          return this.y+' minutes' +  '</b><br/>' + moment(this.x).format('MMMM Do YYYY, h:mm')
        }
      },
      plotOptions: {
        series: {
          showInNavigator: true,
          gapSize: 6,

        }
      },
      rangeSelector: {
        selected: 1
      },
      title: {
        text: `Usage Details`
      },
      chart: {
        height: 600,
      },
  
      credits: {
        enabled: false
      },
  
      legend: {
        enabled: true
      },
      plotOptions: {
        series: {
          showInNavigator: true,
          gapSize: 6,

        }
      },
      xAxis: {

      
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      },
      yAxis: {
        labels: {
          formatter: function () {
            return moment.duration(this.value, 'minutes').humanize()
          }
            }
          },
          series: [{
            name: "Tokyo",
            data: this.state.recordsHolder
          }
      ], rangeSelector: {
            buttons: [{
              type: 'day',
              count: 1,
              text: '1d',
            }, {
              type: 'day',
              count: 7,
              text: '7d'
            }, {
              type: 'month',
              count: 1,
              text: '1m'
            }, {
              type: 'month',
              count: 3,
              text: '3m'
            },
              {
              type: 'all',
              text: 'All'
            }],
            selected: 4
      }

    }


    const newConfigData = {
        chart: {
          zoomType: 'x',
          type: 'spline',
        },
        yAxis: [{
          offset: 20,
          type: 'datetime',
          labels: {
            formatter: function () {
               return moment.duration(this.value, 'minutes').humanize()
            },
            format: '{value:%Y-%m-%d}',
            x: -15,
            style: {
              "color": "#000", "position": "absolute"
  
            },
            align: 'left'
          },
        },
          
        ],
        tooltip: {
          shared: true,
          formatter: function () {
            return this.y+' minutes' +  '</b><br/>' + moment(this.x).format('MMMM Do YYYY')
          }
        },
        plotOptions: {
          series: {
            showInNavigator: false,
            // gapSize: 6,
  
          }
        },
        // rangeSelector: {
        //   selected: 1
        // },
        
        title: {
          text: `Usage Details`
        },
        chart: {
          height: 600,
        },
    
        credits: {
          enabled: false
        },
    
        legend: {
          enabled: false
        },
        xAxis: {
          ordinal: false,
            title: {
              text: '',
              align: 'high',
              style: {
                color: '#6D869F',
                fontSize: '20px'
              }
            },
            dateTimeLabelFormats: {
              // second: '%H:%M:%S',
              // minute: '%H:%M',
              // hour: '%H:%M',
              day: '%b. %e',
              // week: '%b. %e',
              month: '%b. %y',
              year: '%Y'
            }   
        },
        rangeSelector: {
          buttons: [{
            type: 'day',
            count: 1,
            text: '1d',
          }, {
            type: 'day',
            count: 7,
            text: '7d'
          }, {
            type: 'month',
            count: 1,
            text: '1m'
          }, {
            type: 'month',
            count: 3,
            text: '3m'
          },
            {
            type: 'all',
            text: 'All'
          }],
          selected: 4
        },
        series: [{
            name: "Data Usage Summary",
            data: this.state.recordsHolder
          }
        ]
    }
    
    
    return (
      <div className="App">
        <div className='name-date-conatiner'>
          <div> 
            <div>
                <label>Pick User:</label>
              </div>
                <select className='pick-user-cls' value={this.state.selectedUser} onChange={this.handleSelectChange}>
                {this.state.selectOptionArr.map((x)=>
                  <option value={x.id} key={x.id}>{x.value}</option>
                )}</select>
            </div>
          <div className='sDate'>
            <span>From date:</span>
            <DatePicker
              className="myDatePicker"
              selected={this.state.startDate}
              onChange={(date)=>this.handleChangeStartDate(date)}
              selectsStart
              maxDate={new Date()}
              dateFormat={"dd/mm/yyyy"}
              popperPlacement="bottom"
            />
          </div>
          <div className='eDate'>
          <span>To date:</span>
            <DatePicker
              className="myDatePicker"
              selected={this.state.endDate}
              onChange={(date)=>this.handleChangeEndDate(date)}
              selectsStart
              maxDate={new Date()}
              dateFormat={"dd/mm/yyyy"}
              popperPlacement="bottom"
            />
          </div>
          <div className='chart-selecter-cls'>
                <label>Data Vizulization Type:</label>
                <select className='pick-chart-cls' value={this.state.selectedChart} onChange={this.showSlectedChartType}>
                {chartType.map((ch)=>
                  <option value={ch.id} key={ch.id}>{ch.label}</option>
                )}</select>  
          </div>
          
        </div>
        <div className='canvas-container'>
            {/* <Line data={this.state.lineStateData} /> */}
           {/* <ReactHighcharts config={newConfigData}></ReactHighcharts>  */}
          {/* <HighchartsReact highcharts={Highcharts} options={configData}/> */}
            {
              this.state.selectedChart === 'line-type' ? 
               <Line data={this.state.lineStateData} /> :
               <Bar data={this.state.barStateData}  onClickBar={this.handleOnSelectBar} /> 
            }      

        </div>
            {/* <div className='canvas-container'>
              <Bar data={this.state.barStateData} />
            </div> */}
          {/* <div className='canvas-container'>
            <Line data={this.state.lineStateData} />
          </div> */}
      </div>
    )
  }
}

export default App;



