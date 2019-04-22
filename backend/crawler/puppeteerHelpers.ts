import * as jsonFile from 'jsonfile';
import * as fs from 'fs';
import * as admin from 'firebase-admin';
import * as path from 'path';
import puppeteer, {Browser, ElementHandle, Page} from 'puppeteer';

export async function setupBrowser(headless: boolean = true, slowMo: number = 0): Promise<[Browser, Page]> {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox'], headless, slowMo});
  const page = await browser.newPage();
  return [browser, page];
}

export async function saveCookies(page: puppeteer.Page, cookiePath: string) {
  const cookiesObject = await page.cookies();
  jsonFile.writeFile(cookiePath, cookiesObject, {spaces: 2}, function(err) {
    if (err) console.log('The file could not be written.', err);
    console.log('Session has been successfully saved');
  });
}

export async function loadCookies(page: puppeteer.Page, cookiePath: string) {
  const previousSession = fs.existsSync(cookiePath);
  if (previousSession) {
    const cookiesArr = require(cookiePath);
    if (cookiesArr.length !== 0) {
      for (let cookie of cookiesArr) {
        await page.setCookie(cookie);
      }
      console.log('Session has been loaded in the browser');
      return true;
    }
  }
}

export async function selectOptionAtIndex(
  page: puppeteer.Page,
  selector: string,
  index: number
): Promise<string | null> {
  const element = await page.$(selector);
  const childCount = await page.evaluate(element => element.childElementCount, element);

  if (index > childCount - 1) {
    throw new Error('Index out of range in select!');
  }

  return await page.evaluate(
    (selector, index) => {
      const element: HTMLSelectElement | null = document.querySelector(selector);
      if (element) {
        element.selectedIndex = index;
        if (element.onchange) element.onchange(new Event(''));
        return element.childNodes[index].textContent;
      }

      return '';
    },
    selector,
    index
  );
}

export async function getProperty(
  page: puppeteer.Page,
  property: string,
  selector: string,
  handle?: ElementHandle
): Promise<string> {
  if (handle) {
    return await (await (await handle.$(selector))!.getProperty(property)).jsonValue();
  } else {
    return await (await (await page.$(selector))!.getProperty(property)).jsonValue();
  }
}

export async function uploadScreenshot(page: puppeteer.Page, message: string = '') {
  try {
    const screenshotPath = path.join(__dirname, `!${new Date().getTime()}-${removeIllegalPathChars(message)}.png`);
    await page.screenshot({path: screenshotPath});
    await admin
      .storage()
      .bucket()
      .upload(screenshotPath, {gzip: true});
  } catch (e) {}
}

export async function click(page: puppeteer.Page, selector: string, awaitNavigation: boolean = true) {
  if (!awaitNavigation) {
    await page.click(selector);
  } else {
    await Promise.all([page.click(selector), page.waitForNavigation({timeout: 60000})]);
  }
}

export async function clickLinkWithText(
  page: puppeteer.Page,
  text: string,
  awaitNavigation: boolean = true,
  position: number = 0,
  timeout = 60000
) {
  if (!awaitNavigation) {
    await (await page.$x(`//a[contains(text(), '${text}')]`))[position].click();
  } else {
    const elements = await page.$x(`//a[contains(text(), '${text}')]`);
    if (elements.length == 0) throw new Error(`No element with text ${text} found!`);
    await Promise.all([elements[position].click(), page.waitForNavigation({timeout})]);
  }
}

export async function clickButtonWithText(
  page: puppeteer.Page,
  text: string,
  awaitNavigation: boolean = true,
  timeout = 60000
) {
  if (!awaitNavigation) {
    await (await page.$x(`//input[contains(@value, '${text}')]`))[0].click();
  } else {
    const elements = await page.$x(`//input[contains(@value, '${text}')]`);
    if (elements.length == 0) throw new Error(`No element with text ${text} found!`);
    await Promise.all([elements[0].click(), page.waitForNavigation({timeout})]);
  }
}

export async function containsElementWithText(page: puppeteer.Page, tag: string, text: string): Promise<boolean> {
  const element: puppeteer.ElementHandle[] = await page.$x(`//${tag}[text() = '${text}']`);
  return element != null && element.length > 0;
}

export async function buttonWithTextVisible(page: puppeteer.Page, text: string): Promise<boolean> {
  const elements = await page.$x(`//input[contains(@value, '${text}')]`);
  return await page.evaluate(element => getComputedStyle(element).visibility !== 'hidden', elements[0]);
}

export async function navigateToPage(page: puppeteer.Page, url: string) {
  await Promise.all([page.goto(url, {timeout: 60000}), page.waitForNavigation({timeout: 60000})]);
}

export async function setAttributeOfElementWithText(
  page: puppeteer.Page,
  element: string,
  text: string,
  attribute: string,
  attributeValue: string
) {
  await page.evaluate(
    (element, attribute, attributeValue) => {
      element.setAttribute(attribute, attributeValue);
    },
    (await page.$x(`//${element}[text() = '${text}']`))[0],
    attribute,
    attributeValue
  );
}

export function removeIllegalPathChars(path: string): string {
  return path.replace(/[/\\?%@*:|"<>\s]/g, '');
}
