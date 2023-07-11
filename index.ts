import puppeteer, { Page } from "puppeteer";
import { EBird } from "./ebird";
import fs from "fs";

async function delay(time: number) {
  await new Promise((resolve) => setTimeout(resolve, time));
}

interface MapPin {
  lat: number;
  long: number;
  species: string[];
}

async function main() {
  console.log(process.argv[2]);

  // get the browser and page object (puppeteer stuff)
  // -- browser is only used to get the page
  // -- page is used to interact with the page, select elements, etc.
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await EBird.goToEBirdHomePage(page);
  await delay(1000);
  await EBird.logInToEBird(page);
  await delay(1000);
  await EBird.goToMyEBirdPage(page);
  await delay(1000);
  await EBird.goToMyCheckLists(page);
  await delay(1000);
  const hrefs = await EBird.getMyListLinks(page);
  console.log(hrefs);
  // adding map pin lat long and species
  const mapPins: MapPin[] = [];

  for (const href of hrefs) {
    console.log(href);
    await EBird.goToMyLinkPage(page, href);
    await delay(1000);
    const title = await EBird.getMyListTitle(page);
    console.log(title);
    await delay(1000);

    const speciesList = await EBird.getMySpeciesNames(page);
    console.log(speciesList);
    await delay(1000);

    const location = await EBird.getMyListLatLong(page);
    if (location) {
      const [lat, long] = location;
      console.log("lat is", lat);

      const species: string[] = speciesList;
      console.log("long is", long);

      const newMapPin: MapPin = {
        lat,
        long,
        species,
      };
      mapPins.push(newMapPin);
    }

    await delay(1000);
  }

  console.log(mapPins);

  let html = `
  <html>
  <head> 
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    crossorigin=""/>

    <style>
      body {margin: 0;}
      #map { height: 100%; } 
    </style>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
    crossorigin=""></script>
    
  </head>
  <body>

    <div id="map"></div>
    <script>
    const map = L.map('map').setView([40.7536729, -73.9832322], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    const mapPins = ${JSON.stringify(mapPins)};
    const lat = mapPins[0].lat;
    const long = mapPins[0].long;
    const marker = L.marker([lat, long]).addTo(map);
    </script>
    
  </body>
  </html>
  `;
  fs.writeFileSync("My eBird Map" + ".html", html);
  await browser.close();
}

main();
