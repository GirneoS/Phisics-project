const chartM = makeNewChart("Масса","Время","chartM");
const chartU = makeNewChart("Скорость","Время","chartU");
const chartX = makeNewChart("Х","Время","chartX");
const chartA = makeNewChart("Ускорение","Время","chartA");


function m(t,m0){
    chart = chartM;
    chart.data.datasets[0].data.push({x:t,y:m0});
    chart.update();
}

function u(t,a){
    chart = chartU;
    chart.data.datasets[0].data.push({x:t,y:a*t});
    chart.update();
}

function x(t,xn){
    chart = chartX;
    chart.data.datasets[0].data.push({x:t,y:xn});
    chart.update();
}

function a(t,F,m){
    chart =  chartA;
    chart.data.datasets[0].data.push({x:t,y:F/m});
    chart.update();
    return F/m;
}
function clear(){
    chartM.data.datasets[0].data = [];
    chartM.update();
    chartA.data.datasets[0].data = [];
    chartA.update();
    chartX.data.datasets[0].data = [];
    chartX.update();
    chartU.data.datasets[0].data = [];
    chartU.update();
}
function makeNewChart(yName,xName,chartN){ 
    const ctx = document.getElementById(chartN);
     
       let t = new Chart(ctx, {
         type: 'line',
         data: {
           datasets: [{
             label: '',
             data: [],
             borderWidth: 0.1,
             borderColor: '#FF6384',
             backgroundColor: '#FFB1C1',
             
           }]
         },
         options: {
           scales: {
             y: {
               beginAtZero: true,
               title:{
                 text:yName,
                 display:true
               }
             },
             x:{
               type:"linear",
               offset:false,
               grid:{
                   offset:false    
               },
               beginAtZero:true,
               title:{
                 text:xName,
                 display:true
               }
             }
           }
         }
       });
    return t;
   }

