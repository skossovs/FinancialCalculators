const AllRates ='[{"Rank":"Treasury","6m":5.07,"1y":4.78,"2y":4.17,"3y":3.89,"5y":3.66,"7y":3.62,"10y":3.57,"20y":3.9,"30y":3.78}' +
                ',{"Rank":"Aaa",     "6m":5.57,"1y":5.28,"2y":4.67,"3y":4.39,"5y":4.35,"7y":4.54,"10y":4.49,"20y":4.82,"30y":4.7}' +
                ',{"Rank":"Aa1",     "6m":5.68,"1y":5.39,"2y":4.78,"3y":4.5,"5y":4.53,"7y":4.6,"10y":4.55,"20y":4.88,"30y":4.76}' +
                ',{"Rank":"Aa2",     "6m":5.67,"1y":5.38,"2y":4.77,"3y":4.49,"5y":4.53,"7y":4.69,"10y":4.64,"20y":4.97,"30y":4.85}' +
                ',{"Rank":"Aa3",     "6m":5.75,"1y":5.46,"2y":4.85,"3y":4.57,"5y":4.86,"7y":5.1,"10y":5.05,"20y":5.38,"30y":5.26}' +
                ',{"Rank":"A1",      "6m":6.05,"1y":5.76,"2y":5.15,"3y":4.87,"5y":4.9,"7y":5.16,"10y":5.11,"20y":5.44,"30y":5.32}' +
                ',{"Rank":"A2",      "6m":5.93,"1y":5.64,"2y":5.03,"3y":4.75,"5y":4.97,"7y":5.23,"10y":5.18,"20y":5.51,"30y":5.39}' +
                ',{"Rank":"A3",      "6m":6.06,"1y":5.77,"2y":5.16,"3y":4.88,"5y":5.2,"7y":5.26,"10y":5.21,"20y":5.54,"30y":5.42}' +
                ',{"Rank":"Baa1",    "6m":7.05,"1y":6.76,"2y":6.15,"3y":5.87,"5y":6.08,"7y":6.61,"10y":6.56,"20y":6.89,"30y":6.77}' +
                ',{"Rank":"Baa2",    "6m":7.7,"1y":7.41,"2y":6.8,"3y":6.52,"5y":5.93,"7y":5.89,"10y":5.84,"20y":6.17,"30y":6.05}' +
                ',{"Rank":"Baa3",    "6m":8.33,"1y":8.04,"2y":7.43,"3y":7.15,"5y":6.92,"7y":6.88,"10y":6.83,"20y":7.16,"30y":7.04}' +
                ',{"Rank":"Baa3",    "6M":8.33,"1Y":8.04,"2Y":7.43,"3Y":7.15,"5Y":6.92,"7Y":6.88,"10Y":6.83,"20Y":7.16,"30Y":7.04}' +
                ',{"Rank":"Ba1",      "6m":6.05,"1y":5.76,"2y":3.96,"3y":3.7,"5y":3.51,"7y":3.48,"10y":3.45,"20y":3.8,"30y":3.69}' +
                ',{"Rank":"Ba2",      "6m":6.15,"1y":5.86,"2y":3.96,"3y":3.7,"5y":3.51,"7y":3.48,"10y":3.45,"20y":3.8,"30y":3.69}' +
                ',{"Rank":"Ba3",      "6m":6.25,"1y":5.96,"2y":3.96,"3y":3.7,"5y":3.51,"7y":3.48,"10y":3.45,"20y":3.8,"30y":3.69}' +
                ',{"Rank":"B1",       "6m":6.35,"1y":6.06,"2y":3.96,"3y":3.7,"5y":3.51,"7y":3.48,"10y":3.45,"20y":3.8,"30y":3.69}' +
                ',{"Rank":"B2",       "6m":6.45,"1y":6.16,"2y":3.96,"3y":3.7,"5y":3.51,"7y":3.48,"10y":3.45,"20y":3.8,"30y":3.69}' +
                ',{"Rank":"B3",       "6m":6.55,"1y":6.26,"2y":3.96,"3y":3.7,"5y":3.51,"7y":3.48,"10y":3.45,"20y":3.8,"30y":3.69}' +
                ',{"Rank":"Caa1",     "6m":6.65,"1y":6.36,"2y":3.96,"3y":3.7,"5y":3.51,"7y":3.48,"10y":3.45,"20y":3.8,"30y":3.69}' +
                ']';

const chkYieldOption = document.getElementById("yield-option");
const chkPriceOption = document.getElementById("price-option");
const txtPriceInput = document.getElementById("price-input");
const txtYieldInput = document.getElementById("yield-input");
const txtMaturity = document.getElementById("maturity-input");
const tabRates = document.getElementById("rate-table");
const txtCoupon = document.getElementById("coupon-input");
const txtFaceValue = document.getElementById("face-value-input");
const txtDuration = document.getElementById("duration");

var PV = 0.0;
var IY = 0.0;
var yearlyRates  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var halfYearRate = 0;

chkYieldOption.addEventListener("click", pickYieldOption)
chkPriceOption.addEventListener("click", pickPriceOption)

// *******************************************************************************************************************************************************
// ** Switching logic ** 
function pickYieldOption(){
    console.info("Yield");
    chkPriceOption.checked = false;
    txtPriceInput.disabled = !chkPriceOption.checked;

    chkYieldOption.checked = !chkPriceOption.checked;
    txtYieldInput.disabled = chkPriceOption.checked;
}

function pickPriceOption(){
    console.info("Price");
    chkYieldOption.checked = false;
    txtYieldInput.disabled = !chkYieldOption.checked;

    chkPriceOption.checked = !chkYieldOption.checked;
    txtPriceInput.disabled = chkYieldOption.checked;
}

function onLoad(){
    var rates = getTreasuryCurveAndMoodys();
    displayRates(rates);
    console.info(rates);
}

// GET Treasury curve
// https://www.ustreasuryyieldcurve.com/api/v1/yield_curve_snapshot?date=2023-04-13&offset=0
function getTreasuryCurveAndMoodys(){
    var url = "https://www.ustreasuryyieldcurve.com/api/v1/yield_curve_snapshot?date=2023-04-13&offset=0";
    // fetch("https://www.ustreasuryyieldcurve.com/api/v1/yield_curve_snapshot?date=2023-04-13&offset=0"
    // , { mode: 'no-cors'})
    // .then(data => {
    //     console.info(data);
    //     return data;
    // })
    // .catch(e => {
    //     console.log(e);
    //     return e;
    // });
    //var jsonRates = '[{"treasury_datum_id":0,"yield_curve_date":"2023-04-13","yield_1m":4.08,"yield_2m":4.96,"yield_3m":5.1,"yield_4m":5.1,"yield_6m":4.95,"yield_1y":4.66,"yield_2y":3.96,"yield_3y":3.7,"yield_5y":3.51,"yield_7y":3.48,"yield_10y":3.45,"yield_20y":3.8,"yield_30y":3.69,"id":null}]';
    var jsonRates = '{"Rank":"Treasury", "6m":4.95,"1y":4.66,"2y":3.96,"3y":3.7,"5y":3.51,"7y":3.48,"10y":3.45,"20y":3.8,"30y":3.69}';
    var objRates = JSON.parse(AllRates);
    return objRates;
}
function displayRates(rates){
    var tabNode = document.createElement("table");
    var tbodyNode = document.createElement("tbody");
    var theadNode = document.createElement("thead");
    var headersRowNode = document.createElement("tr");
    var valuesRowNode = document.createElement("tr");
    
    for (var key in rates[0]) {
            var headerNode = document.createElement("th");
            var cleanHeader = key;
            headerNode.innerHTML = cleanHeader;
            headersRowNode.appendChild(headerNode);

    }
    theadNode.appendChild(headersRowNode);
    tabNode.appendChild(theadNode);

    tabNode.appendChild(tbodyNode);
    for(let i=1; i < rates.length; i++)
    {
        var valuesRowNode = document.createElement("tr");
        for (var key in rates[i]) {
                var valueNode = document.createElement("td");
                valueNode.innerHTML = rates[i][key];
                valuesRowNode.appendChild(valueNode);
        }
        tbodyNode.appendChild(valuesRowNode);
    }
    tabNode.appendChild(tbodyNode);
    tabRates.appendChild(tabNode);
}

function ratingChange(){
    var rankValue = document.getElementById("rating-input").value;
    var objAllRates = JSON.parse(AllRates);
    var smapRatesValues = JSON.stringify(objAllRates.find(element => element["Rank"] == rankValue));
    let mapRatesValues  = JSON.parse(smapRatesValues);
    halfYearRate = mapRatesValues["6m"];

    Object.entries(mapRatesValues).forEach((entry) => {
        const [key, value] = entry;
        if(key == "6m" || key=="Rank")
            return;

        var i = Number(key.slice(0,-1));
        yearlyRates[i] = value;
      });

    // fill gaps
    var prevVal = yearlyRates[1];
    for(let i = 2; i < yearlyRates.length; i++){
        if(yearlyRates[i] == 0){
            yearlyRates[i] = prevVal;
        } else {
            prevVal = yearlyRates[i];
        }
    }
    txtPriceInput.value = '';
    //console.log(yearlyRates);
}


// CALCULATIONS *************************************************************************************
function calculate(){
    
    var objYearAndDays = calcInterval(txtMaturity.value);
    let listOfHalfInterests = buildHalfYearsList(objYearAndDays);


    if(chkPriceOption.checked == true) {
        // Direct calculation
        PV = calcPVwith6MCoupon(listOfHalfInterests);
        if(txtPriceInput.value == '') {
            txtPriceInput.value = PV.toFixed(2);
            txtYieldInput.value = calcYieldToMaturity(listOfHalfInterests, PV).toFixed(2);
        }
        else {
            PV = txtPriceInput.value;
            // Calc Yiedl to maturity
            txtYieldInput.value = calcYieldToMaturity(listOfHalfInterests, PV).toFixed(2);
        }
    }
    else {
        PV = calcPVwith6MCouponWithOneYield(listOfHalfInterests, txtYieldInput.value);
        txtPriceInput.value = PV.toFixed(2);
    }
    
    txtDuration.value = Number(CalcDuration(listOfHalfInterests)).toFixed(2);

    // console.info(objYearAndDays);
    // console.info(PV);
}

function calcPVwith6MCoupon(listOfInterests){
    let _pv = 0.0;
    let faceValue = Number(txtFaceValue.value);
    let coupon = 0.01 * Number(txtCoupon.value) / 2; // half year - half interest
    let last_index = listOfInterests.length - 1;

    for(let h = 0; h < last_index; h++) 
    {
        let rate = 0.01 * listOfInterests[h] / 2; // half year - half interest
        _pv = _pv + (faceValue * coupon) / Math.pow (1.0 + rate, h+1);
    }

    let rate = 0.01 * listOfInterests[last_index] / 2; // half year - half interest
    _pv = _pv + (faceValue *(1 + coupon)) / Math.pow (1.0 + rate, last_index);

    return _pv;
}


function calcPVwith6MCouponWithOneYield(listOfInterests, yeildToMaturity){
    let _pv = 0.0;
    let faceValue = Number(txtFaceValue.value);
    let coupon = 0.01 * Number(txtCoupon.value) / 2; // half year - half interest
    let last_index = listOfInterests.length - 1;

    for(let h = 0; h < last_index; h++) 
    {
        let rate = 0.01 * yeildToMaturity / 2; // half year - half interest
        _pv = _pv + (faceValue * coupon) / Math.pow (1.0 + rate, h+1);
    }

    let rate = 0.01 * yeildToMaturity / 2; // half year - half interest
    _pv = _pv + (faceValue *(1 + coupon)) / Math.pow (1.0 + rate, last_index);

    return _pv;
}


function calcInterval(maturity){
    var y = maturity.substring(0, 4);
    var m = maturity.substring(5, 7);
    var d = maturity.substring(8, 10);
    
    var dmaturity = new Date(y,m-1,d);
    var dnow      = new Date(Date.now());
    
    console.info(dnow);
    console.info(dmaturity);
    
    var years = dmaturity.getUTCFullYear() - dnow.getUTCFullYear();
    var days  = Math.floor((dmaturity - dnow)/(24*3600*1000)) + 1 - 365 * years;
    var halfYears = 365/2 > days ? 2 : 1;
    halfYears = halfYears + years * 2;

    return { years, days, halfYears };
}

function buildHalfYearsList(yearAndDays) {
    var listOfInterests = [];
    let halves = yearAndDays.halfYears;

    listOfInterests.push(halfYearRate);
    let y = 1; // starting year
    let parityFlag = false;

    while(halves > 0){
        listOfInterests.push(yearlyRates[y]);
        if (parityFlag == true)
            y++;
        parityFlag = !parityFlag;
        halves--;
    }

    console.info(listOfInterests);
    return listOfInterests;
}


function calcYieldToMaturity (listOfHalfInterests, pv){
    let counter = 1000;
    let higherRate   = 20;
    let lowerRate    = 0;
    let medium       = (higherRate - lowerRate) / 2

    let currentBranch = { low: 0, medium: 10, high: 20, half: 10 };
    let leftBranch = { 
        low:    currentBranch.low, 
        medium: currentBranch.low + 0.5 * currentBranch.half, 
        high:   currentBranch.medium,
        half:   0.5 * currentBranch.half};
    
    let rightBranch = { 
        low:    currentBranch.medium, 
        medium: currentBranch.medium + 0.5 * currentBranch.half, 
        high:   currentBranch.high,
        half:   0.5 * currentBranch.half};

    let diffLow  = 0;
    let diffHigh = 0;
    let errorDelta = 0.05;

    do {
        // calc PV for lowerMedium
        let pvLow = calcPVwith6MCouponWithOneYield(listOfHalfInterests, leftBranch.medium);
        // calc PV for higherMedium
        let pvHigh = calcPVwith6MCouponWithOneYield(listOfHalfInterests, rightBranch.medium);
        diffLow = Math.abs(pv - pvLow);
        diffHigh = Math.abs(pv - pvHigh);
    
        if(diffLow < diffHigh){
            currentBranch = {
                low: leftBranch.low, medium: leftBranch.medium, high: leftBranch.high, half: leftBranch.half
            };
        } else {
            currentBranch = {
                low: rightBranch.low, medium: rightBranch.medium, high: rightBranch.high, half: rightBranch.half
            };
        }

        leftBranch = { 
            low:    currentBranch.low, 
            medium: currentBranch.low + 0.5 * currentBranch.half, 
            high:   currentBranch.medium,
            half:   0.5 * currentBranch.half};
        
        rightBranch = { 
            low:    currentBranch.medium, 
            medium: currentBranch.medium + 0.5 * currentBranch.half, 
            high:   currentBranch.high,
            half:   0.5 * currentBranch.half};

        console.info(">>> PV_Low:" + pvLow +  " - " + "PV_High:" + pvHigh);
        console.info("Low:" + leftBranch.medium +  " - " + "High:" + rightBranch.medium);
        counter--;
    }
    while(diffHigh > errorDelta && diffLow > errorDelta && counter > 0);

    if(diffLow < errorDelta)
        return leftBranch.medium;

    if(diffHigh < errorDelta)
        return rightBranch.medium;

    if(counter == 0) {
        console.error("Didn't reach delta in 2000 steps, provide the closest one");
        if(diffLow < diffHigh)
            return leftBranch.medium;
        else
            return rightBranch.medium;
    }
}

function CalcDuration(listOfInterests){
    let _duration = 0.0;
    let pv = Number(txtPriceInput.value);
    let m = 2;
    let yeildToMaturity = Number(txtYieldInput.value);
    let faceValue = Number(txtFaceValue.value);
    let coupon = 0.01 * Number(txtCoupon.value); // year coupon
    let last_index = listOfInterests.length - 1;

    for(let h = 0; h <= last_index; h++) 
    {
        let t = (1 + h)/m;
        let rate = 0.01 * yeildToMaturity / m; // half year - half interest
        _duration = _duration + (t * faceValue * coupon) /((m * pv) * Math.pow (1.0 + rate, m*t));
    }

    let t = (1 + last_index)/m;
    let rate = 0.01 * yeildToMaturity / m; // half year - half interest
    _duration = _duration + (t * faceValue) /(pv * Math.pow (1.0 + rate, m*t));

    return _duration;
}