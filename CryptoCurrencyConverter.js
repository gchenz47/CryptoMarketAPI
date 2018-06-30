
const url_limit10 = 'https://api.coinmarketcap.com/v2/ticker/?limit=10';
const url_limit100 = 'https://api.coinmarketcap.com/v2/ticker/?limit=100';
const url_historialBase = 'https://api.coindesk.com/v1/bpi/historical/close.json?';

const converter = document.querySelector('.converter');
const cryptoinfo = document.querySelector('.cryptocurrencyInfo');
const cryptoField = document.querySelector('[name="crypto"]');
const fiatField = document.querySelector('[name="fiat"]');
const submit_button = document.querySelector('.convert');
const dropDownCrypto = document.querySelector('.cryptocurrencyDropdown');
const dropDownFiat = document.querySelector('.fiatcurrencyDropdown');
const zoom_selection = document.querySelector('.zoom');
const startDateInput = document.querySelector('[name="startDate"]');
const endDateInput = document.querySelector('[name="endDate"]');
const chartPeriod_date = document.querySelector('.chartPeriod_date');

let startDate;
let endDate;
let historicalDataPeriod;
let url_historial = url_historialBase;
let data_limit100;
let price_USD;
let selectedCrypto;
let date = new Date();

const dateFormated = function(d){
  d = date;
  let dd = (d.getDate() < 10 ? '0' : '') + d.getDate();
  let mm = ((d.getMonth()+1) < 10 ? '0' : '') + (d.getMonth() + 1);
  let yyyy = d.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
}
//converter function
const cryptoConvert = function(url){
  fetch(url_limit100)
    .then(function(response) {
      return response.json();
    }).then(function(myJSON){
      dataJSON = JSON.stringify(myJSON.data);
      data_limit100 = JSON.parse(dataJSON);

      const keysByID = Object.keys(data_limit100);
      dataSorted = keysByID.map(key => {
        return data_limit100[key];
      }).sort((a,b) => {
        return a.rank - b.rank;
      });

      const option_html = dataSorted.map(data => {
        name = data.name;
        return `
        <option value="${name}">${name}</option>`;
      }).join('');
      const cryptoName = dataSorted.map(data => data.name);
      const marketCap = dataSorted.map(data => data.quotes.USD.market_cap);
      dropDownCrypto.innerHTML = option_html;
      dropDownFiat.innerHTML = `<option value="USD">USD</option>`;
      cryptoField.addEventListener('change', e => {
        if(cryptoField.value){
          price_USD = dataSorted[dropDownCrypto.selectedIndex].quotes.USD.price;
          fiatField.value = (cryptoField.value * price_USD).toPrecision(8);
        }else {
          fiatField.value = 0;
        }
      });
      dropDownCrypto.addEventListener('change', e => {
        if(cryptoField.value){
          price_USD = dataSorted[dropDownCrypto.selectedIndex].quotes.USD.price;
          fiatField.value = (cryptoField.value * price_USD).toPrecision(8);
        }else {
          fiatField.value = 0;
        }
      });
      fiatField.addEventListener('change', e => {
        price_USD = dataSorted[dropDownCrypto.selectedIndex].quotes.USD.price;
        cryptoField.value = (fiatField.value / price_USD).toPrecision(8);
      });
      submit_button.addEventListener('click', e =>{
        price_USD = dataSorted[dropDownCrypto.selectedIndex].quotes.USD.price;
        if(cryptoField.value){
          console.log(cryptoField.value);
          fiatField.value = (cryptoField.value * price_USD).toPrecision(8);
        } else if(fiatField.value){
          cryptoField.value = (fiatField.value / price_USD).toPrecision(8);
        }else {
          alert("There is nothing to convert...");
        }
      });
    }).catch(function(err){
        console.log("error while fetching" + err);
    });
};


//fetching historical data and display in chart
const loadChart = function(url){
  fetch(url)
    .then(function(response){
    return response.json();
  }).then(function(data){
    dates = Object.keys(data.bpi);
    historicalData = dates.map(date => data.bpi[date]);
    var ctx = document.getElementById("myChart");
    var myChart = new Chart(ctx, {
          type: 'line',
          data: {
              labels: dates,
              datasets:
              [{
                  label: 'Bitcoin Index',
                  data: historicalData,
                  borderColor: ['rgba(63, 63, 191, 1)'],
                  borderWidth: 1,
                  pointRadius: 1,
              }
            ]
          },
          options: {

            tooltips: {
              mode: 'index'
          },
              scales: {
                  yAxes: [{
                      ticks: {
                          beginAtZero: false
                      }
                  }]
              }
          }
      });

  });
}

const updateDateForm = function(){
  startDateInput.value = startDate;
  endDateInput.value = endDate;
  date = new Date(); //reset date to current date
}

const dateInitializing = function(){
  endDateInput.max = dateFormated();
  date.setDate(date.getDate()-1);
  startDateInput.max = dateFormated();
  date = new Date();
  endDate = dateFormated();
  date.setDate(date.getMonth()-1);
  startDate = dateFormated();
}

dateInitializing();
updateDateForm();
cryptoConvert(url_limit100); //fetching cryptocurrency data for the currency converter
loadChart(url_historial); //fetching 1 month historical bitcoin index data for the chart

zoom_selection.addEventListener('click', event => {
  const selection = event.target;
  switch(selection.className){
    case "chartPeriod_Day":
      endDate = dateFormated();
      date.setDate(date.getDate()-2);
      startDate = dateFormated();
      historicalDataPeriod = `start=${startDate}&end=${endDate}`;
      url_historial = `${url_historialBase}${historicalDataPeriod}`;
      loadChart(url_historial);
      updateDateForm();
      break;
    case "chartPeriod_7Days":
      endDate = dateFormated();
      date.setDate(date.getDate()-7);
      startDate = dateFormated();
      historicalDataPeriod = `start=${startDate}&end=${endDate}`;
      url_historial = `${url_historialBase}${historicalDataPeriod}`;
      console.log();
      loadChart(url_historial);
      updateDateForm();
      break;
    case "chartPeriod_Month":
      endDate = dateFormated();
      date.setMonth(date.getMonth()-1);
      startDate = dateFormated();
      historicalDataPeriod = `start=${startDate}&end=${endDate}`;
      url_historial = `${url_historialBase}${historicalDataPeriod}`;
      loadChart(url_historial);
      updateDateForm();
      break;
    case "chartPeriod_3Months":
      endDate = dateFormated();
      date.setMonth(date.getMonth()-3);
      startDate = dateFormated();
      historicalDataPeriod = `start=${startDate}&end=${endDate}`;
      url_historial = `${url_historialBase}${historicalDataPeriod}`;
      console.log();
      loadChart(url_historial);
      updateDateForm();
      break;
    case "chartPeriod_6Months":
      endDate = dateFormated();
      date.setMonth(date.getMonth()-6);
      startDate = dateFormated();
      historicalDataPeriod = `start=${startDate}&end=${endDate}`;
      url_historial = `${url_historialBase}${historicalDataPeriod}`;
      console.log();
      loadChart(url_historial);
      updateDateForm();
      break;
    case "chartPeriod_1Year":
      endDate = dateFormated();
      date.setMonth(date.getMonth()-12);
      startDate = dateFormated();
      historicalDataPeriod = `start=${startDate}&end=${endDate}`;
      url_historial = `${url_historialBase}${historicalDataPeriod}`;
      console.log();
      loadChart(url_historial);
      updateDateForm();
      break;
    case "chartPeriod_YTD":
        endDate = dateFormated();
        date = new Date(date.getFullYear(),0,1);
        console.log(date);
        startDate = dateFormated();
        historicalDataPeriod = `start=${startDate}&end=${endDate}`;
        url_historial = `${url_historialBase}${historicalDataPeriod}`;
        console.log();
        loadChart(url_historial);
        updateDateForm();
        break;
    case "chartPeriod_All":
        endDate = dateFormated();
        date = new Date(2012,0,1);
        console.log(date);
        startDate = dateFormated();
        historicalDataPeriod = `start=${startDate}&end=${endDate}`;
        url_historial = `${url_historialBase}${historicalDataPeriod}`;
        console.log();
        loadChart(url_historial);
        updateDateForm();
        break;

  }
})

chartPeriod_date.addEventListener('keyup', event =>{

  if(event.key === "Enter"){
    if (startDateInput.value >= endDateInput.value) return console.log('not changed');
    if(endDateInput.value < endDateInput.min){
      endDateInput.value = endDateInput.min;
      endDate = endDateInput.min;
    }else if(endDateInput.value > endDateInput.max){
      endDateInput.value = endDateInput.max;
      endDate = endDateInput.max;
    }else {
      endDate = endDateInput.value;
    }
    if(startDateInput.value < startDateInput.min){
      startDateInput.value = startDateInput.min
      startDate = startDateInput.min;
    }else if(startDateInput.value > startDateInput.max){
      startDateInput.value = startDateInput.max;
      startDate = startDateInput.max;
    }else {
      startDate = startDateInput.value;
    }
    historicalDataPeriod = `start=${startDate}&end=${endDate}`;
    url_historial = `${url_historialBase}${historicalDataPeriod}`;
    console.log(startDate);
    loadChart(url_historial);
  }

})
