# React-with-Chart.js
The aim of this project is to visualize the data in react.js. The Chart.js library of javaScript have great support in react. 

---
You can find the detail in my Medium article published in "The Startup"

https://medium.com/swlh/data-visualization-with-react-chart-js-be5e238bc302

### React 
is an open-source JavaScript library, maintained by Facebook for building user interfaces or UI components.
### Chart.js
is a free open-source JavaScript library for data visualization, which supports 8 chart types: bar, line, area, pie, bubble, radar, polar, & scatter.


### Pre-requisites
Before starting, make sure you have installed the node.js, otherwise you can installed from official site of Node.js

### Setting up
Lets create the React project by using the npm package. Open the command prompt/terminal and run the following command:

    npx create-react-app visualization
    
Once your command executed successfully then test if the web server is running fine :

for this, first change directory to project folder

    cd visualization
    
and run 

    npm start
    
Now next we need to install and add ECharts in the project by execute the following commands:

    npm install --save react-chartjs-2 chart.js
    
Again run the 

    npm start
    
Now you can see the Bar, Doughnut and Line chart on the browser.

