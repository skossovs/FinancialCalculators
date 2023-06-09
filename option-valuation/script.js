Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

const nLines = 11;
const selCallPut = document.getElementById("call-put-select");
const selBuySell = document.getElementById("buy-sell-select");
const txtHoldingPeriod = document.getElementById("holding-period-input");
const txtExpiration = document.getElementById("expiration-input");
const txtInterest = document.getElementById("interest-input");
const txtTicker = document.getElementById("ticker-input");
const txtDaysToExpiration = document.getElementById("days-to-expiration-input");
const txtVolatility = document.getElementById("volatility-input");
const txtStrike = document.getElementById("strike-input");
const txtSpot = document.getElementById("spot-input");
const txtOptionPrice = document.getElementById("option-price-input");
const txtProjectedPrice = document.getElementById("projected-input");
const txtProjectedPricePercenatage = document.getElementById("projected-percentage-input");
const txtDelta = document.getElementById("option-delta-input");
const txtTheta = document.getElementById("option-theta-input");
// second leg fields
const chkSecondLeg = document.getElementById("second-leg");
const selCallPut2 = document.getElementById("call-put-select-2");
const selBuySell2 = document.getElementById("buy-sell-select-2");
const txtDaysToExpiration2 = document.getElementById("days-to-expiration-input-2");
const txtExpiration2 = document.getElementById("expiration-input-2");
const txtVolatility2 = document.getElementById("volatility-input-2");
const txtStrike2 = document.getElementById("strike-input-2");

txtExpiration.addEventListener("input", updateExpirationDays);
txtExpiration2.addEventListener("input", updateExpirationDays2);
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

function updateExpirationDays2(){
  let maturity = txtExpiration2.value;
  let dmaturity = Date.parse(maturity);
  let dnow  = new Date(Date.now());
  let diffTime = Math.abs(dmaturity - dnow);
  let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  txtDaysToExpiration2.value = diffDays;
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
// ------------- CLASSES  -----------------------------------------------------------------------------------------
class OptionsViewModel {
  interest_rate;
  dividends;
  holdingPeriod;
  spot;
  secondLeg;
  strike;
  strike2;
  buySell;
  buySell2;
  sigma;
  sigma2;
  daysToExpiration;
  daysToExpiration2;
  calPutMult;
  calPutMult2;
  expirationLeftOver;
  expirationLeftOver2;

  
  constructor(){
    this.interest_rate      = Number(txtInterest.value) / 100; // r
    this.dividends          = 0;     // q
    this.holdingPeriod      = Number(txtHoldingPeriod.value);
    this.spot               = Number(txtSpot.value); // K
    this.secondLeg          = chkSecondLeg.checked;
    this.strike             = Number(txtStrike.value);
    this.strike2            = Number(txtStrike2.value);
    this.buySell            = selBuySell.value;
    this.buySell2           = selBuySell2.value;
    this.sigma              = Number(txtVolatility.value) / 100;
    this.sigma2             = Number(txtVolatility2.value) / 100;
    this.daysToExpiration   = Number(txtDaysToExpiration.value); // T
    this.daysToExpiration2  = Number(txtDaysToExpiration2.value);
    this.calPutMult         = selCallPut.value;
    this.calPutMult2        = selCallPut2.value;
    this.expirationLeftOver = this.daysToExpiration - this.holdingPeriod;
    this.expirationLeftOver2 = this.daysToExpiration2 - this.holdingPeriod;
  }
  
  CalcInitialOptionMetrics() {
    return this.CalcOptionMetrics(this.spot, this.holdingPeriod);
  }

  CalcOptionMetrics(K,t,advancedK,advancedK2){
    
    let calcResultString = "";
    if((t+this.expirationLeftOver) > 0)
      calcResultString = calcOptionMetrics(this.strike,K,this.sigma,(t+this.expirationLeftOver)/365,this.interest_rate,this.dividends,this.buySell);
    else
      calcResultString = calcOptionMetrics(this.strike,advancedK,this.sigma,0,this.interest_rate,this.dividends,this.buySell);
    let objResult      = JSON.parse(calcResultString);
    
    let Price = objResult.C;
    let Delta = objResult.Dc;
    let Theta = objResult.ThetaC;
    
    if(this.calPutMult == "-1") {
      Price = objResult.P;
      Delta = objResult.Dp;
      Theta = objResult.ThetaP;
    }

    if(this.secondLeg) {
      if((t+this.expirationLeftOver2) > 0)
        calcResultString = calcOptionMetrics(this.strike2,K,this.sigma2,(t+this.expirationLeftOver2)/365,this.interest_rate,this.dividends,this.buySell2);
      else
        calcResultString = calcOptionMetrics(this.strike2,advancedK2,this.sigma2,0,this.interest_rate,this.dividends,this.buySell2);
      objResult          = JSON.parse(calcResultString);

      let Price2 = objResult.C;
      let Delta2 = objResult.Dc;
      let Theta2 = objResult.ThetaC;
  
      if(this.calPutMult2 == "-1") {
          Price2 = objResult.P;
          Delta2 = objResult.Dp;
          Theta2 = objResult.ThetaP;
      }
      Price = Price + Price2;
      Delta = Delta + Delta2;
      Theta = Theta + Theta2;
    }
  
    Price = Price.toFixed(2);
    Delta = Delta.toFixed(4);
    Theta = Theta; // TODO: wierd can't toFixed()

    return { price: Price, delta: Delta, theta: Theta };
  }
}

// ------------- CALCULATIONS -----------------------------------------------------------------------------------------
function render(){
  const optionsViewModel = new OptionsViewModel();

  if(Number(txtHoldingPeriod.value) > Number(txtDaysToExpiration.value) || (Number(txtHoldingPeriod.value) > Number(txtDaysToExpiration2.value) && chkSecondLeg.checked)) {
    window.alert("Holding period is greater than days to option expiration. This case is useful only for calendar spread.");
  }
  // clean off
  if(chartStocks != null)
    chartStocks.destroy();
  if(chartOptions != null)
    chartOptions.destroy();
  if(chartOptionPnLs != null)
    chartOptionPnLs.destroy();
  
  // initial point option metrics calculation
  let InitialMetrics = optionsViewModel.CalcInitialOptionMetrics();
  txtOptionPrice.value = InitialMetrics.price;
  txtDelta.value       = InitialMetrics.delta;
  txtTheta.value       = InitialMetrics.theta;

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
  let optionSeries = GenerateOptionSeries(optionsViewModel, stockSeries);
  let ctxOption = document.getElementById('OptionSeriesChart');
  let cfgOption = CreateConfig();
  AddLabels(cfgOption, labels);
  for(i = 0; i<optionSeries.Y.length; i++){
    AddData(cfgOption, optionSeries.Y[i], LC.Colors[i], LC.Labels[i]);
  }
  chartOptions = new Chart(ctxOption,cfgOption);

  // Option PnL Series
  let optionPnLSeries = GenerateOptionPnLSeries(optionsViewModel, optionSeries);
  let ctxOptionPnl = document.getElementById('OptionPnLSeriesChart');
  let cfgOptionPnl = CreateConfig();
  AddLabels(cfgOptionPnl, labels);
  for(i = 0; i<optionPnLSeries.Y.length; i++){
    AddData(cfgOptionPnl, optionPnLSeries.Y[i], LC.Colors[i], LC.Labels[i]);
  }
  chartOptionPnLs = new Chart(ctxOptionPnl,cfgOptionPnl);

  // Cross Table
  GenerateCrossTable(optionsViewModel);
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
  let holdingPeriod    = Number(txtHoldingPeriod.value);
  let Series = { X : [], Y : [null, null, null, null, null, null, null, null, null, null, null]};
  
  //kx + C = y
  // k = P0 * perc / Days,   C = (1 - perc) * P0
  for(x = 0; x <= holdingPeriod; x++) {
    Series.X.push(x);
  }

  const iterator = GeneratePathPercentages();
  let i = 0;
  let isDone = false;
  while(isDone == false && i < 11){
    let val = iterator.next();
    let price = (1 + val.value) * P0;
    if(price < 0)
      price = 0.01;
    isDone = val.done;
    Series.Y[i] = price.toFixed(2);
    i++;
  }

  return Series;
}

// https://mathjs.org/docs/reference/functions/erf.html - all math
// formulas: https://www.macroption.com/black-scholes-excel/
function calcOptionMetrics(S,K,sigma,T,r,q,bs){
  q = 0; // dividend yield
  let sqrt2 = Math.sqrt(2);
  let d1 = (Math.log(K/S) + T * (r - q + (sigma*sigma)/2))/(sigma*Math.sqrt(T));
  let d2 = d1 - sigma * Math.sqrt(T);
  let Nd1_derivative = (1/Math.sqrt(2*Math.PI)) * Math.exp(-d1*d1/2);
  let Nd1            = 0.5 + 0.5 * math.erf(d1/sqrt2);
  let Nd2            = 0.5 + 0.5 * math.erf(d2/sqrt2);
  let Nd1_minus      = 0.5 + 0.5 * math.erf(-d1/sqrt2);
  let Nd2_minus      = 0.5 + 0.5 * math.erf(-d2/sqrt2);
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
  // Buy Or Sell 1 or -1
  if(bs == -1){
    C = -C; P = -P;
    Dc = -Dc; Dp = -Dp;
    ThetaC = -ThetaC; ThetaP = -ThetaP;
  }
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
  txtVolatility2.value = txtVolatility.value;
  txtStrike2.value     = txtStrike.value;
  let val = "";
  // get the parameters
  assignConsistent(getParameterByName("ir"), txtInterest);       // Interest Rate
  assignConsistent(getParameterByName('tkr'), txtTicker);        // TICKER
  assignConsistent(getParameterByName('pr'), txtProjectedPrice); // PROJECTED PRICE
  assignConsistent(getParameterByName('hp'), txtHoldingPeriod);  // Holding Period
  assignConsistent(getParameterByName('exp'), txtExpiration);    // EXPIRATION
  assignConsistent(getParameterByName("sp"), txtSpot);           // SPOT
  assignConsistent(getParameterByName("bs"), selBuySell);        // BUY SELL
  assignConsistent(getParameterByName("cp"), selCallPut);        // CALL PUT
  updateProjectedPricePercenatage();
  updateExpirationDays();
  assignConsistent(getParameterByName("v"), txtVolatility);      // VOLATILITY
  assignConsistent(getParameterByName("s"), txtStrike);          // strike
  val  = getParameterByName("sl");
  if(val != null && val.trim() != ""){
    chkSecondLeg.checked = getParameterByName("sl");             //second leg true/false
    onSecondLegChecked();
  }
  assignConsistent(getParameterByName("bs2"), selBuySell2);      // BUY SELL SECOND LEG
  assignConsistent(getParameterByName("cp2"), selCallPut2);      // CALL PUT SECOND LEG
  assignConsistent(getParameterByName("v2"), txtVolatility2);    // VOLATILITY
  assignConsistent(getParameterByName("s2"), txtStrike2);        // strike SECOND LEG
  
  val            = getParameterByName('exp2');                   // EXPIRATION SECOND LEG
  if(val != null && val.trim() != ""){
    txtExpiration2.value = val;
    updateExpirationDays2();
  }
}

function assignConsistent(val, assignee) {
  if(val != null && val.trim() != "") 
    assignee.value = val;
}

function onSecondLegChecked(){
  let secondLegDiv = document.getElementById("second-leg-container");

  if (chkSecondLeg.checked == true) {
    selCallPut2.disabled = false;
    selCallPut2.value = selCallPut.value;
    selBuySell2.disabled = false;
    
    selBuySell2.value = (selBuySell.value == "1" ? "-1" : "1");
    txtExpiration2.disabled = false;
    txtExpiration2.value = txtExpiration.value;
    txtDaysToExpiration2.value = txtDaysToExpiration.value;
    txtVolatility2.disabled = false;
    txtVolatility2.value = txtVolatility.value;
    txtStrike2.disabled = false;
    txtStrike2.value = txtStrike.value;

    let autoHeight = secondLegDiv.scrollHeight + "px";
    secondLegDiv.style.height = autoHeight;
  } else {
    selCallPut2.disabled = true;
    selBuySell2.disabled = true;
    txtExpiration2.disabled = true;
    txtVolatility2.disabled = true;
    txtStrike2.disabled = true;
    secondLegDiv.style.height = "0px";
  }
}

function getParameterByName(name) {
  const url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(url);

  if (!results) return null;
  if (!results[2]) return '';

  return decodeURIComponent(results[2].replace(/\+/g, ' '));
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
  let holdingPeriod    = Number(txtHoldingPeriod.value);
  let P0               = txtSpot.value;
  let percentage = 0;
  let Series = { X : [], Y : [null, null, null, null, null, null, null, null, null, null, null]};
  
  for(x = 0; x <= holdingPeriod; x++) {
    Series.X.push(x);
  }

  let i = 0;
  while(true){
    let val = iterator.next();
    percentage = val.value;
    if(val.done == true)
      break;
    C = (1 + percentage) * P0;
    K =  - P0 * percentage/holdingPeriod;
    let littleSeries = [];
    for(x = 0; x <= holdingPeriod; x++) {
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

function GenerateOptionSeries(optionsViewModel, stockSeries){
  let holdingPeriod    = Number(txtHoldingPeriod.value);

  let Series = { X : [], Y : [null, null, null, null, null, null, null, null, null, null, null]};
  for(x = 0; x <= holdingPeriod; x++) {
    Series.X.push(x);
  }
  for(let i = 0; i < nLines; i++){
    let littleSeries = [];
    
    // need to take care of case when expiration date < holding date, get the spot price in advance
    let advancedK = 0;
    if(optionsViewModel.expirationLeftOver < 0)
      advancedK  = stockSeries.Y[i][-optionsViewModel.expirationLeftOver];
    let advancedK2 = 0;
    if(optionsViewModel.expirationLeftOver2 < 0 && chkSecondLeg.checked == true)
      advancedK2 = stockSeries.Y[i][-optionsViewModel.expirationLeftOver2];

    for(x = 0; x <= holdingPeriod; x++) {
      let K = stockSeries.Y[i][x];
      let optMetrics = optionsViewModel.CalcOptionMetrics(K,x,advancedK,advancedK2);
      littleSeries.push(optMetrics.price);
      }
    Series.Y[i] = littleSeries;
  }

  return Series;
}

function GenerateOptionPnLSeries(optionsViewModel, optionSeries) {
  let holdingPeriod    = Number(txtHoldingPeriod.value);

  let Series = { X : [], Y : [null, null, null, null, null, null, null, null, null, null, null]};
  for(x = 0; x <= holdingPeriod; x++) {
    Series.X.push(x);
  }

  // current option price
  let priceObject = optionsViewModel.CalcInitialOptionMetrics();
  let Price = priceObject.price;
  for(let i = 0; i < nLines; i++){
    let littleSeries = [];
    for(x = 0; x <= holdingPeriod; x++) {
      let pnl =  (optionSeries.Y[i][x] - Price);
      littleSeries.push(pnl);
    }
    Series.Y[i] = littleSeries;
  }
  
  return Series;  
}

getMethods = (obj) => Object.getOwnPropertyNames(obj).filter(item => typeof obj[item] === 'function')

function GenerateCrossTable(optionsViewModel) {
  let Spot0 = txtSpot.value;
  const crossTable = document.getElementById("cross-table");
  // clear old data
  crossTable.innerHTML = "";
  let axisSeries = GenerateAxisForTable();
  let optObject = optionsViewModel.CalcInitialOptionMetrics();
  let InitialOptionPrice = optObject.price;  // initial option price
  let header = crossTable.createTHead();
  let row = header.insertRow(0);
  // Y - price, X - days
  // columns is being populated with stock prices
  axisSeries.Y.forEach( item => {
    let cell = row.insertCell(0);
    cell.classList.add('t-vertical');
    cell.innerHTML = item;
  });

  let isCellDark0 = false;
  // rows is being populated with days
  axisSeries.X.forEach(days => {
    row = crossTable.insertRow(-1);
    // row header
    let cell = row.insertCell(0);
    cell.classList.add('t-horizontal'); // row headers are styled here
    cell.innerHTML = days;
    let isCellDark = false;
    let advancedK = 0;
    let advancedK2 = 0;

    axisSeries.Y.forEach( spot => {
      if(spot < 0)
        spot = 0.01;

      let t = days;
       if(optionsViewModel.expirationLeftOver < 0 && days <= optionsViewModel.daysToExpiration){
         advancedK  = spot;
         t = 0;
      }
      
       if(optionsViewModel.expirationLeftOver2 < 0 && days <= optionsViewModel.daysToExpiration2 && chkSecondLeg.checked) {
          advancedK2 = spot;
          t = 0;
      }

      let objResult = optionsViewModel.CalcOptionMetrics(spot, t, advancedK, advancedK2);
      let P = objResult.price;
      let Delta = objResult.delta;

      cell           = row.insertCell(0);
      let cell_table = document.createElement("table");
      let cell_row0  = cell_table.insertRow(-1);
      let innerCell0 = cell_row0.insertCell(0);
      innerCell0.innerHTML = (P - InitialOptionPrice).toFixed(2); // Option PnL
      if (P - InitialOptionPrice<0)
        innerCell0.classList.add("t-cell-negative-pnl");
      let innerCell1 = cell_row0.insertCell(0);
      innerCell1.innerHTML = P;
      let cell_row1  = cell_table.insertRow(-1);
      let innerCell2 = cell_row1.insertCell(0);
      innerCell2.innerHTML = (spot - Spot0).toFixed(2);
      let innerCell3 = cell_row1.insertCell(0);
      innerCell3.innerHTML = Delta;

      cell.innerHTML = cell_table.outerHTML;
      if(isCellDark){
        if(isCellDark0)
          cell.classList.add('t-cell-dark');
        else
          cell.classList.add('t-cell-dark-light');
      }
      else if(isCellDark0)
        cell.classList.add('t-cell-dark-light');

      isCellDark = !isCellDark;
    });

    isCellDark0 = !isCellDark0;
  });
}