import React from 'react';
import {Bar} from 'react-chartjs-2';

const data = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'My First dataset',
      backgroundColor: 'rgba(255,99,132,0.2)',
      borderColor: 'rgba(255,99,132,1)',
      borderWidth: 1,
      hoverBackgroundColor: 'rgba(255,99,132,0.4)',
      hoverBorderColor: 'rgba(255,99,132,1)',
      data: [65, 59, 80, 81, 56, 55, 40]
    }
  ]
};

const option = {
  maintainAspectRatio:false,
  onClick:function(evnt,element){
    let indx =  element[0]._index;
    console.log('Clicked on Bar element '+indx);
    console.log(data.datasets[0]);
    // data.datasets[0].data.splice(indx,1);
    // DataTransfer.label.splice(indx,1);
  }
}


function App(props) {
  return (
    <div>
        <h2>Bar Chart</h2>
        <Bar
          data={props.data}
          options={ 
            {
            maintainAspectRatio:false,
            onClick:props.onClickBar
            }
          }
        />
    </div>
  );
}

export default App;