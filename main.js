let maxTemp = 0;
let minTemp = 0;
let weatherDays = null;

const graphData = document.querySelector(".graph-data");
const dayInfoTabs = document.querySelector(".day-info-tabs");

const tempPlusUl = document.createElement("ul");
const tempMinusUl = document.createElement("ul");
const timeBlock = document.createElement("ul");
const waterLine = document.createElement("div");
const windBlock = document.createElement("ul");
const popBlock = document.createElement("ul");

tempPlusUl.classList.add("temp-plus");
tempMinusUl.classList.add("temp-minus");
timeBlock.classList.add("time-block");
waterLine.classList.add("water-line");
windBlock.classList.add("wind-block");
popBlock.classList.add("pop-block");

getWeatherData();

dayInfoTabs.addEventListener("click", (e) => {
  let target = e.target;
  if (target.tagName === "UL") return;

  onActiveTabs(target);
});

async function getWeatherData() {
  let response = await fetch("./forecast-v1.json");
  if (response.ok) {
    let json = await response.json();
    const { list } = json;
    weatherDays = sortDataByDays(list);
    console.log(weatherDays);
    showGraphDataTemp(weatherDays[0]);
    showCurrentDate(weatherDays[0]);
  } else {
    console.log("Помилка HTTP: " + response.status);
  }
}

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
  graphData.innerHTML = "";
  tempMinusUl.innerHTML = "";
  tempPlusUl.innerHTML = "";
  timeBlock.innerHTML = "";

  weatherDay.forEach(({ main: { temp }, dt_txt }) => {
    const h = calculateTheColumnHeight(temp);
    temp = transformKelvinInCelsius(temp);
    const showTempPlus = temp > 0 ? true : "";
    const showTempMinus = temp < 0 ? true : "";
    const time = returnHour(dt_txt);

    const plus = h > 0 ? h : 0;
    const minus = h < 0 ? -h : 0;

    tempPlusUl.innerHTML += `
      <li style="height:${plus}px;">${
      showTempPlus && `<span class="data-temp-plus">${temp}</span>`
    }</li>
      `;

    tempMinusUl.innerHTML += `
      <li style="height:${minus}px;">${
      showTempMinus && `<span class="data-temp-minus">${temp}</span>`
    }
    </li>
    `;

    timeBlock.innerHTML += `
      <li>${time}</li>
    `;
  });

  graphData.append(tempPlusUl);
  graphData.append(waterLine);
  graphData.append(tempMinusUl);
  graphData.append(timeBlock);
}

function showGraphDataWind(weatherDay) {
  graphData.innerHTML = "";
  windBlock.innerHTML = "";

  weatherDay.forEach((data) => {
    const {
      wind: { speed, deg },
      dt_txt,
    } = data;

    const time = returnHour(dt_txt);

    windBlock.innerHTML += `
      <li>
        <span>${speed}</span>
        <img src="./images/arrow-up_icon-icons.com_72374.svg" alt="" style="transform: rotate(${deg}deg);" />
        <span>${time}</span>
      </li>
    `;
  });

  graphData.append(windBlock);
}

function showGraphDataPop(weatherDay) {
  graphData.innerHTML = "";
  popBlock.innerHTML = "";

  weatherDay.forEach((data) => {
    const { pop, dt_txt } = data;
    let height = pop ? pop * 100 : 0;
    let size = pop ? "%" : "";
    popData = pop ? pop * 100 : 0;
    let time = returnHour(dt_txt);

    popBlock.innerHTML += `
      <li style="height: ${height}px">
        <span>${popData} ${size}</span>
        <span>${time}</span>
      </li>
    `;
  });

  graphData.append(popBlock);
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

function removeActiveTabs() {
  for (const li of dayInfoTabs.children) {
    li.classList.remove("tabs-active");
  }
}

function onActiveTabs(target) {
  if (!target.classList.contains("tabs-active")) {
    removeActiveTabs();
    target.classList.add("tabs-active");

    let targetId = target.id;

    switch (targetId) {
      case "temp":
        showGraphDataTemp(weatherDays[0]);
        break;
      case "pop":
        showGraphDataPop(weatherDays[3]);
        break;
      case "wind":
        showGraphDataWind(weatherDays[0]);
        break;
    }
  }
}

function returnHour(time) {
  return time.slice(10, 16);
}

function showCurrentDate(currentDate) {
  console.log(currentDate);
}
