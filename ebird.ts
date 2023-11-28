import { Page } from "puppeteer";
import pluralize from "pluralize";


pluralize.addPluralRule(/goose$/i, "Geese");

const E_BIRD_LANDING = "https://ebird.org/home";


async function delay(time: number) {
  await new Promise((resolve) => setTimeout(resolve, time));
}

export class EBird {
  static async goToEBirdHomePage(page: Page) {
    // this pattern will be used throughout; we use Promise.all
    // to navigate or click somewhere, and waitForNavigation to
    // ensure the browser has loaded the next page
    await Promise.all([
      page.goto(E_BIRD_LANDING), // go to eBird landing page
      page.waitForNavigation(),
    ]);
  }

  // class that is basically just a namespace for static methods
  // relating to eBird login
  static async logInToEBird(page: Page, E_BIRD_USERNAME : string, E_BIRD_PASSWORD : string) {
   
    // the HTML selector that gets the sign up button
    const signUpSelector = ".HeaderEbird-menu-tools ul li:nth-child(2)";
    await page.waitForSelector(signUpSelector);
    await page.click(signUpSelector);

    // select the username input and type in the username
    const usernameInputSelector = "#input-user-name";
    await page.waitForSelector(usernameInputSelector);
    await page.type(usernameInputSelector, E_BIRD_USERNAME);
    await delay(1000);
    // select the password input and type in the password
    const passwordInputSelector = "#input-password";
    await page.waitForSelector(passwordInputSelector);
    await page.type(passwordInputSelector, E_BIRD_PASSWORD);

    // submit the login form
    await Promise.all([page.click("#form-submit"), page.waitForNavigation()]);
  }

  static async goToMyEBirdPage(page: Page) {
    const selector = "a.HeaderEbird-link[href='/myebird']";
    await page.waitForSelector(selector);
    await Promise.all([page.click(selector), page.waitForNavigation()]);
  }

  static async goToMyCheckLists(page: Page) {
    await page.goto("https://ebird.org/mychecklists");
  }

  static async getMyListLinks(page: Page) {
    const selector = "div.ResultsStats-title > h3 > a";
    const hrefs = await page.$$eval(selector, (list) =>
      list.map((elm) => elm.href)
    );
    return hrefs;
  }

  static async goToMyLinkPage(page: Page, href: string) {
    await page.goto(href);
  }

  static async getMyListTitle(page: Page) {
    const titleSelector = "div.SectionHeading.u-margin-none>div>time";
    let element = await page.$(titleSelector);
    let value = await page.evaluate((title) => title?.textContent, element);
    // await page.waitForSelector(title);
    return value?.replace(/\t/g, "");
  }

  static async getMySpeciesNames(page: Page) {
    const speciesSelector = "#list > section > ol > li > section > div > h3";
    let species = await page.$$eval(speciesSelector, (names) =>
      names.map((name) => name.innerText)
    );
    const numberObserved =
      "section > div.Observation-numberObserved > span > span:nth-child(2)";
    let numberList = await page.$$eval(numberObserved, (numbers) =>
      numbers.map((number) => number.innerText)
    );
    return numberList.map(
      (number, index) =>
        number + " " + pluralize(species[index], parseInt(number))
    );
  }

  static async getMyListLatLong(page: Page) {
    const locationSelector = 'a[title="View with Google Maps"]';
    let element = await page.$(locationSelector);
    let value = await page.evaluate(
      (location) => location?.getAttribute("href"),
      element
    );
    if (!value) {
      return;
    }
    const current_url = new URL(value);

    const query = current_url.searchParams.get("query");
    if (!query) {
      return;
    }
    return query.split(",").map((x) => parseFloat(x));
  }
}
