const graphData = document.querySelector(".graph-data");
const tempPlusUl = document.createElement("ul");
const tempMinusUl = document.createElement("ul");
const waterLine = document.createElement("div");

tempPlusUl.classList.add("temp-plus");
tempMinusUl.classList.add("temp-minus");
waterLine.classList.add("water-line");

let maxTemp = 0;
let minTemp = 0;

fetch("./forecast.json")
  .then((res) => res.json())
  .then((data) => {
    const { list } = data;
    console.log(list);
    const weatherDays = sortDataByDays(list);
    maxMinTempPerDay(weatherDays[0]);
    showGraphDataTemp(weatherDays[0]);
    console.log(["weatherDays"], weatherDays);
  });

function sortDataByDays(dataWeather) {
  const sortDays = [];
  let dateEl = new Date(dataWeather[0].dt_txt).getDate();
  const day = [];

  dataWeather.forEach((dataDay) => {
    if (dateEl === new Date(dataDay.dt_txt).getDate()) {
      day.push(dataDay);
    } else {
      sortDays.push(day.slice());
      day.length = 0;
      day.push(dataDay);
      dateEl = new Date(dataDay.dt_txt).getDate();
    }
  });

  sortDays.push(day.slice());

  if (sortDays[0].length < 8) {
    sortDays[0].push(...sortDays[1].slice(0, 8 - sortDays[0].length));
  }

  if (sortDays[sortDays.length - 1].length < 8) {
    sortDays[sortDays.length - 1].unshift(
      ...sortDays[sortDays.length - 2].slice(
        -(8 - sortDays[sortDays.length - 1].length)
      )
    );
  }

  return sortDays;
}

function showGraphDataTemp(weatherDay) {
  weatherDay.forEach(({ main: { temp } }) => {
    console.log(calculateTheColumnHeight(temp));
    const h = calculateTheColumnHeight(temp);

    const plus = h > 0 ? h : 0;
    const minus = h < 0 ? -h : 0;

    console.log(["minus"], minus);

    tempPlusUl.innerHTML += `
      <li style="height:${plus}px;"></li>
      `;

    tempMinusUl.innerHTML += `
      <li style="height:${minus}px;"></li>
    `;
  });

  graphData.innerHTML = ``;

  graphData.append(tempPlusUl);
  graphData.append(waterLine);
  graphData.append(tempMinusUl);
}

function maxMinTempPerDay(weatherDay) {
  const {
    main: { temp },
  } = weatherDay[0];

  maxTemp = temp;
  minTemp = temp;

  weatherDay.forEach(({ main: { temp } }) => {
    maxTemp = temp > maxTemp ? temp : maxTemp;
    minTemp = temp < minTemp ? temp : minTemp;
  });

  maxTemp = transformKelvinInCelsius(maxTemp);
  minTemp = transformKelvinInCelsius(minTemp);

  console.log(["maxTemp"], maxTemp);
  console.log(["minTemp"], minTemp);
}

function transformKelvinInCelsius(k) {
  return Math.round(k - 273.15);
}

function calculateTheColumnHeight(temp) {
  return (transformKelvinInCelsius(temp) / 50) * 100 * 2;
}