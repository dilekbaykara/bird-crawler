import puppeteer, { Page } from "puppeteer";
import { EBird } from "./ebird";
import fs from "fs";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({ input, output });

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
  const E_BIRD_USERNAME = await rl.question("What is your username? ");
  const E_BIRD_PASSWORD = await rl.question("What is your password? ");
  rl.close();

  if (typeof E_BIRD_USERNAME != "string") {
    throw new Error("Username is required");
  }

  if (typeof E_BIRD_PASSWORD != "string") {
    throw new Error("E_BIRD_PASSWORD is required");
  }
  // get the browser and page object (puppeteer stuff)
  // -- browser is only used to get the page
  // -- page is used to interact with the page, select elements, etc.
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await EBird.goToEBirdHomePage(page);
  await delay(1000);
  await EBird.logInToEBird(page, E_BIRD_USERNAME, E_BIRD_PASSWORD);
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
    <link rel="stylesheet" href="https://use.typekit.net/lhb4sbg.css" />
    <style>
      body {
        margin: 0;
        background-color: #f8f8f8;
        display: flex;
        height: 100%;
        flex-direction: column;
      }
      #map {
        flex-grow: 1;
        margin-bottom: 2rem;
        margin-left: 2rem;
        margin-right: 2rem;
        border-radius: 15px;
        filter: drop-shadow(6px 6px 5px grey);
      }
      #title {
        display: flex;
        font-family: "program", sans-serif;
        font-weight: 700;
        font-style: normal;
        font-size: 39px;
        align-items: center;
        justify-content: center;
        margin: 1rem;
        color: #0070b3;
      }
    </style>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
    crossorigin=""></script>
    
  </head>
  <body>
    <div id="title">My eBird Map</div>
    <div id="map"></div>
    <script>
      const map = L.map('map').setView([39.952583, -75.165222], 7.5);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);
      const mapPins = ${JSON.stringify(mapPins)};
      const markers = [];
      for (const mapPin of mapPins) {
        const lat = mapPin.lat;
        const long = mapPin.long;
        const marker = L.marker([lat, long]).addTo(map);
        markers.push(marker);
        const species = mapPin.species;
        marker.bindPopup("<b>Species observed</b><br>" + species.join("<br>"));
      }
      const markerGroup = new L.featureGroup(markers);
      map.fitBounds(markerGroup.getBounds());
    
    </script>
    
  </body>
  </html>
  `;
  fs.writeFileSync("My eBird Map" + ".html", html);
  await browser.close();
}

main();
