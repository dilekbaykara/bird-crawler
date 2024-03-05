# eBird Crawler

Command Line tool for birdwatchers who use the [eBird App](https://www.ebird.org/home) built with Node.js, Puppeteer, and TypeScript. eBird crawler crawls the Cornell database and iterates through checklist pages. Map data is then extracted and concatenated into a single large map using a Library (Leaflet) on an HTML page.

View map page with data from my account [HERE](https://dilekbaykara.github.io/bird-crawler/)

## Prerequisites
Obtain Node.js and npm from [nodejs.org](https://nodejs.org/en/download)

## User Guide
1. Clone the Repo
2. `cd bird-crawler`
3. `npm install`
4. `npm start`
5. You will be prompted for your eBird username and password
6. If your credentials are correct you should see the following in your terminal window:
![carbon (1)](https://github.com/dilekbaykara/bird-crawler/assets/73802910/7c30a7e9-135b-4000-925a-04d782a7bbd3)
7. To open the display map enter the following command: `open "My eBird Map.html"` NB! please include quotation marks
<img width="1178" alt="Screenshot 2024-03-04 at 7 21 54 PM" src="https://github.com/dilekbaykara/bird-crawler/assets/73802910/11976a06-e419-4f54-9401-bb260fb7634e">
