Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}


const nLines = 11;
const selCallPut = document.getElementById("call-put-select");
const txtExpiration = document.getElementById("expiration-input");
const txtInterest = document.getElementById("interest-input");
const txtDaysToExpiration = document.getElementById("days-to-expiration-input");
const txtVolatility = document.getElementById("volatility-input");
const txtStrike = document.getElementById("strike-input");
const txtSpot = document.getElementById("spot-input");
const txtOptionPrice = document.getElementById("option-price-input");
const txtProjectedPrice = document.getElementById("projected-input");
const txtProjectedPricePercenatage = document.getElementById("projected-percentage-input");
const txtDelta = document.getElementById("option-delta-input");
const txtTheta = document.getElementById("option-theta-input");

txtExpiration.addEventListener("input", updateExpirationDays);
txtProjectedPrice.addEventListener("input", updateProjectedPricePercenatage);

const colorsArray = ["rgb(241,42,7)", "rgb(241,42,7,0.8)", "rgb(241,42,7,0.6)", "rgb(241,42,7,0.4)", "rgb(241,42,7,0.2)", "rgb(11,7,243)", "rgb(21,151,4,0.2)", "rgb(21,151,4,0.4)", "rgb(21,151,4,0.6)", "rgb(21,151,4,0.8)", "rgb(21,151,4)" ];


function updateProjectedPricePercenatage(){
  let calPutMult = selCallPut.value;
  txtProjectedPricePercenatage.value = (calPutMult * 100 * (txtProjectedPrice.value - txtSpot.value)/txtSpot.value).toFixed(2);
}

function updateExpirationDays(){
    let maturity = txtExpiration.value;
    var dmaturity = Date.parse(maturity);
    let dnow  = new Date(Date.now());

    let diffTime = Math.abs(dmaturity - dnow);
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    txtDaysToExpiration.value = diffDays;
}

function openSeries(evt, tabName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

var chartStocks;
var chartOptions;
var chartOptionPnLs;
// ------------- CALCULATIONS -----------------------------------------------------------------------------------------
function render(){
    // clean off
    if(chartStocks != null)
      chartStocks.destroy();
    if(chartOptions != null)
      chartOptions.destroy();
    if(chartOptionPnLs != null)
      chartOptionPnLs.destroy();

    let T = txtDaysToExpiration.value/365;
    let S = txtStrike.value;
    let K = txtSpot.value;
    let r = txtInterest.value / 100;
    let sigma = txtVolatility.value / 100;

    let optionMetricsStr = calcOptionMetrics(S,K,sigma,T,r);
    let optionMetrics    = JSON.parse(optionMetricsStr);
    if(selCallPut.value == "-1")
    {
      txtOptionPrice.value = optionMetrics.P.toFixed(2);
      txtDelta.value       = optionMetrics.Dp.toFixed(4);
      txtTheta.value       = optionMetrics.ThetaP.toFixed(4);
    }
    else
    {
      txtOptionPrice.value = optionMetrics.C.toFixed(2);
      txtDelta.value       = optionMetrics.Dc.toFixed(4);
      txtTheta.value       = optionMetrics.ThetaC.toFixed(4);
    }
      

    // ************ THIS IF is FOR DEBUGGING PURPOSES ONLY *******************************
    if(txtSpot.value != txtProjectedPrice.value){
      // Display graphs
      let LC = GenerateLabelsAndColors();

      // Stock Series
      let stockSeries = GenerateStockSeries();
      let ctx = document.getElementById('StockSeriesChart');
      const labels = stockSeries.X;
      let cfg = CreateConfig();
      AddLabels(cfg, labels);
      for(i = 0; i<stockSeries.Y.length; i++){
        AddData(cfg, stockSeries.Y[i], LC.Colors[i], LC.Labels[i]);
      }
      chartStocks = new Chart(ctx,cfg);
      
      // Option Series
      let optionSeries = GenerateOptionSeries(stockSeries);
      let ctxOption = document.getElementById('OptionSeriesChart');
      let cfgOption = CreateConfig();
      AddLabels(cfgOption, labels);
      for(i = 0; i<optionSeries.Y.length; i++){
        AddData(cfgOption, optionSeries.Y[i], LC.Colors[i], LC.Labels[i]);
      }
      chartOptions = new Chart(ctxOption,cfgOption);

      // Option PnLSeries
      let optionPnLSeries = GenerateOptionPnLSeries(optionSeries);
      let ctxOptionPnl = document.getElementById('OptionPnLSeriesChart');
      let cfgOptionPnl = CreateConfig();
      AddLabels(cfgOptionPnl, labels);
      for(i = 0; i<optionPnLSeries.Y.length; i++){
        AddData(cfgOptionPnl, optionPnLSeries.Y[i], LC.Colors[i], LC.Labels[i]);
      }
      chartOptionPnLs = new Chart(ctxOptionPnl,cfgOptionPnl);

      // Cross Table
      GenerateCrossTable(stockSeries, optionSeries, openSeries);
    }
}

function GenerateLabelsAndColors(){
  let labels = [null,null,null,null,null,null,null,null,null,null,null];
  const iterator = GeneratePathPercentages();

  let i = 0;
  let isDone = false;
  while(isDone == false && i < 11){
    let val = iterator.next();
    let percentage = val.value * 100;
    isDone = val.done;
    let labelValue = parseFloat(percentage).toFixed(2) + '%';
    labels[i] = labelValue;
    i++;
  }
  return {Labels: labels, Colors: colorsArray};
}

function GenerateAxisForTable(){
  let P0 = txtSpot.value;
  let daysToExpiration = txtDaysToExpiration.value;
  let Series = { X : [], Y : [null, null, null, null, null, null, null, null, null, null, null]};
  
  //kx + C = y
  // k = P0 * perc / Days,   C = (1 - perc) * P0
  for(x = 0; x <= daysToExpiration; x++) {
    Series.X.push(x);
  }
  
  const iterator = GeneratePathPercentages();
  let i = 0;
  let isDone = false;
  while(isDone == false && i < 11){
    let val = iterator.next();
    let price = (1 + val.value) * P0;
    isDone = val.done;
    Series.Y[i] = price.toFixed(2);
    i++;
  }

  return Series;
}

// https://mathjs.org/docs/reference/functions/erf.html - all math
// formulas: https://www.macroption.com/black-scholes-excel/
function calcOptionMetrics(S,K,sigma,T,r){
  let q = 0; // dividend yield
  let sqrt2 = Math.sqrt(2);
  let d1 = (Math.log(K/S) + T * (r - q + (sigma*sigma)/2))/(sigma*Math.sqrt(T));
  let d2 = d1 - sigma * Math.sqrt(T);

  // ************ THIS IF is FOR DEBUGGING PURPOSES ONLY *******************************
  if(txtSpot.value == txtProjectedPrice.value){
    console.info("d1,d2");
    console.info(d1);console.info(d2);
  }

  let Nd1_derivative = (1/Math.sqrt(2*Math.PI)) * Math.exp(-d1*d1/2);
  let Nd1       = 0.5 + 0.5 * math.erf(d1/sqrt2);
  let Nd2       = 0.5 + 0.5 * math.erf(d2/sqrt2);

  // ************ THIS IF is FOR DEBUGGING PURPOSES ONLY *******************************
  if(txtSpot.value == txtProjectedPrice.value){
   console.info("Nd1,Nd2");
   console.info(Nd1); console.info(Nd2);
  }
  let Nd1_minus = 0.5 + 0.5 * math.erf(-d1/sqrt2);
  let Nd2_minus = 0.5 + 0.5 * math.erf(-d2/sqrt2);
    
  // ************ THIS IF is FOR DEBUGGING PURPOSES ONLY *******************************
  if(txtSpot.value == txtProjectedPrice.value){

    console.info("-Nd1,-Nd2");
    console.info(Nd1_minus); console.info(Nd2_minus);
    console.info("Exponents  e-rt, ke-rt, e-qt");
    console.info(Math.exp(-r * T));
    console.info(S * Math.exp(-r * T));
    console.info(Math.exp(-q * T));
    console.info("Exponents  Se-qt");
    console.info(K*Math.exp(-q * T));
  }

  let C  = K * Math.exp(-q * T) * Nd1       - S * Math.exp(-r * T) * Nd2;
  let P  = S * Math.exp(-r * T) * Nd2_minus - K * Math.exp(-q * T) * Nd1_minus;
  //https://www.macroption.com/black-scholes-formula/#delta
  let expQT =  Math.exp(-q * T);
  let expRT =  Math.exp(-r * T);
  let Dc = expQT * Nd1;
  let Dp = expQT * Nd1_minus;
  // Theta
  let ThetaC = (-0.5*S*sigma*expQT*Nd1_derivative/Math.sqrt(T) - r*K*expRT*Nd2 + q*S*expQT*Nd1)/365;
  let ThetaP = (-0.5*S*sigma*expQT*Nd1_derivative/Math.sqrt(T) + r*K*expRT*Nd2_minus - q*S*expQT*Nd1_minus)/365;
  return JSON.stringify({C, P, Dc, Dp, ThetaC, ThetaP});
}

// ------------------------------------   GRAPHs ----------------------------------------
function onUnLoad(){
  // https://www.w3schools.com/js/js_cookies.asp
  // var date = new Date();
  // let cookieExpirationDate = date.addDays(30);
  // // var WinNetwork = new ActiveXObject("WScript.Network");
  // // alert(WinNetwork.UserName);
  // document.cookie = "username=John Doe; expires=" + cookieExpirationDate;
}
function onLoad(){

}

function CreateConfig(){
  const data = {
    labels: null,
    datasets: []
  };
  let config = {
    type: 'line',
    data: data,
    options: {
      scales: {
        x: {
          reverse: true
        }
      }
    }
  }
  return config;
}
function AddLabels(c, x){
  c.data.labels = x;
}
function AddData(c, y){
  var r = Math.floor(Math.random() * 255);
  var g = Math.floor(Math.random() * 255);
  var b = Math.floor(Math.random() * 255);
  var colr = "rgb(" + r + "," + g + "," + b + ")";
  
  // calculate label
  let borderColorIndex = c.data.datasets.length;
  let percentageMax  = Math.round(txtProjectedPricePercenatage.value);
  let percentageStep = Math.round(txtProjectedPricePercenatage.value / 5);
  let labelValue = Math.round(percentageMax - percentageStep * borderColorIndex) + '%';
  AddData(c,y,colr,labelValue);
}
function AddData(c, y,colr,labelValue){
  let datasetItem = {
    label: labelValue,
    data:  y,
    fill:  false,
    borderColor: colr,
    tension: 0.1
  };
  c.data.datasets.push(datasetItem);
}
//---------------------------------------------------------------------------------------------
function* GeneratePathPercentages()
{
  let maxPercentage    = txtProjectedPricePercenatage.value / 100;
  let minPercentage    = - maxPercentage;
  let percentageStep   = 2 * maxPercentage/(nLines - 1);
  let middleIndex      = (nLines - 1)/2;

  for(let i=0; i<nLines; i++){
    if(i == middleIndex)
      yield 0;
    else
      yield minPercentage + percentageStep * i;
  }
}

function GenerateStockSeries()
{
  const iterator = GeneratePathPercentages();
  let daysToExpiration = txtDaysToExpiration.value;
  let P0               = txtSpot.value;
  let percentage = 0;
  let Series = { X : [], Y : [null, null, null, null, null, null, null, null, null, null, null]};
  
  //kx + C = y
  // k = P0 * perc / Days,   C = (1 - perc) * P0
  for(x = 0; x <= daysToExpiration; x++) {
    Series.X.push(x);
  }

  let i = 0;
  while(true){
    let val = iterator.next();
    percentage = val.value;
    if(val.done == true)
      break;
    C = (1 + percentage) * P0;
    K =  - P0 * percentage/daysToExpiration;
    let littleSeries = [];
    for(x = 0; x <= daysToExpiration; x++) {
      let P = K * x + C;
      if(P<0)
        P = 0.01; // Can't have negative price for stock
      littleSeries.push(P);
    }
    Series.Y[i] = littleSeries;
    i++;
  }

  return Series;
}

function GenerateOptionSeries(stockSeries){
  let daysToExpiration = txtDaysToExpiration.value;
  let S = txtStrike.value;
  let r = txtInterest.value / 100;
  let sigma = txtVolatility.value / 100;
  let calPutMult = selCallPut.value;

  let Series = { X : [], Y : [null, null, null, null, null, null, null, null, null, null, null]};
  for(x = 0; x <= daysToExpiration; x++) {
    Series.X.push(x);
  }

  for(let i = 0; i < nLines; i++){
    let littleSeries = [];
    for(x = 0; x <= daysToExpiration; x++) {
      let K = stockSeries.Y[i][x];
      let calcResultString = calcOptionMetrics(S,K,sigma,x/365,r);
      let objResult        = JSON.parse(calcResultString);
      
      let P = objResult.C;
      if(calPutMult == "-1")
        P = objResult.P;  
      
      littleSeries.push(P);
    }
    Series.Y[i] = littleSeries;
  }

  return Series;
}

function GenerateOptionPnLSeries(optionSeries) {

  let S = txtStrike.value;
  let K = txtSpot.value;
  let r = txtInterest.value / 100;
  let sigma = txtVolatility.value / 100;
  let T = txtDaysToExpiration.value;
  let calPutMult = selCallPut.value;

  let Series = { X : [], Y : [null, null, null, null, null, null, null, null, null, null, null]};
  for(x = 0; x <= T; x++) {
    Series.X.push(x);
  }

  // current option price
  let calcResultString = calcOptionMetrics(S,K,sigma,T/365,r);
  let objResult        = JSON.parse(calcResultString);
  let Price = objResult.C;
  if(calPutMult == "-1")
    Price = objResult.P;

  for(let i = 0; i < nLines; i++){
    let littleSeries = [];
    for(x = 0; x <= T; x++) {
      let pnl =  (optionSeries.Y[i][x] - Price);
      littleSeries.push(pnl);
    }
    Series.Y[i] = littleSeries;
  }

  return Series;  
}

getMethods = (obj) => Object.getOwnPropertyNames(obj).filter(item => typeof obj[item] === 'function')

function GenerateCrossTable(stockSeries, optionSeries, optionPnLSeries) {

  let S = txtStrike.value;
  let r = txtInterest.value / 100;
  let sigma = txtVolatility.value / 100;
  let calPutMult = selCallPut.value;

  const crossTable = document.getElementById("cross-table");
  // clear old data
  crossTable.innerHTML = "";
  let axisSeries = GenerateAxisForTable();

  let header = crossTable.createTHead();
  let row = header.insertRow(0);

  // Y - price, X - days
  // columns is being populated with stock prices
  axisSeries.Y.forEach( item => {
    let cell = row.insertCell(0);
    cell.innerHTML = item;
  });

  // rows is being populated with days
  axisSeries.X.forEach(days => {
    row = crossTable.insertRow(-1);
    // row header
    let cell = row.insertCell(0);
    cell.innerHTML = days;

    axisSeries.Y.forEach( spot => {
      let calcResultString = calcOptionMetrics(S, spot, sigma, days/365, r);
      let objResult        = JSON.parse(calcResultString);
      
      let P = objResult.C;
      if(calPutMult == "-1")
        P = objResult.P;  

      cell           = row.insertCell(0);
      cell.innerHTML = P.toFixed(2);
    });
  });
}