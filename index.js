require('dotenv').config();
const http = require("http");
const fs = require("fs");
const requests = require("requests");

const homeFile = fs.readFileSync("Home.html", "utf-8");

const replaceVal = (tempVal, orgVal) => {
  let temperature = tempVal.replace("{%tempval%}", orgVal.main.temp);
  temperature = temperature.replace("{%tempmin%}", orgVal.main.temp_min);
  temperature = temperature.replace("{%tempmax%}", orgVal.main.temp_max);
  temperature = temperature.replace("{%location%}", orgVal.name);
  temperature = temperature.replace("{%country%}", orgVal.sys.country);
  temperature = temperature.replace("{%tempstatus%}", orgVal.weather[0].main);

  return temperature;
};

const server = http.createServer((req, res) => {
  if (req.url == "/") {
    requests(
      `http://api.openweathermap.org/data/2.5/weather?q=Warangal&units=metric&appid=f83647896c307224dbcf1dfed5d8f5a5`
    )
      .on("data", (chunk) => {
        const objdata = JSON.parse(chunk);

        // Ensure the API response has the expected structure
        if (objdata.main && objdata.sys && objdata.weather) {
          const arrData = [objdata];
          const realTimeData = arrData.map((val) => replaceVal(homeFile, val)).join("");
          res.write(realTimeData);
        } else {
          res.write("Error: Invalid API response");
        }
      })
      .on("end", (err) => {
        if (err) return console.log("connection closed due to errors", err);
        res.end();
      });
  } else {
    res.end("File not found");
  }
});
const port = process.env.PORT || 3000;
server.listen(port, ()=>{console.log(`Server is running on port ${port}`)});
