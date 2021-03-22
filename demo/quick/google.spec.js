const { Page, Key, PageDefs } = require("selenium-page")
const url = "https://google.com"

/**
 *  Place holder compare function. Try "Assert" or "Chai" Libraries instead.
 * @param {Boolean} result The class name to search for.
 * @param {String} failedMessage The class name to search for.
 */
function strictEqual(found, expected, failedMessage) {
  if (found !== expected) {
    throw new Error(`
      Found: "${found}"
      Expected: "${expected}"
      ${failedMessage ? failedMessage : ""}
    `)
  }
}

describe('Google', async function () {

  this.timeout(50000)
  const page = new Page()

  beforeEach(async () => {
    await page.open(url)
  })

  after(async () => {
    await page.close()
  })


  it("Title", async () => {
    await testTitle(page)
  })

  it("Searching: aesmerio.eu", async () => {
    await search1(page)
  })

  it("Searching: selenium-page", async () => {
    await search2(page)
  })

})

describe('Google - webdriverOverride', async function () {

  const { Builder } = require("selenium-webdriver")
  //create the driver for Safari
  const driver = new Builder().forBrowser(PageDefs.browsers.browserSafari).build()

  this.timeout(50000)
  //Create the Page for Chrome, but it's expected the "Browser" parameter be ignored
  const page = new Page({ webdriverOverride: driver, browser: PageDefs.browsers.browserChrome })

  beforeEach(async () => {
    await page.open(url)
    const caps = await page.driver.getCapabilities()
    const browserName = caps.getBrowserName()
    strictEqual(browserName.toLowerCase(), PageDefs.browsers.browserSafari, "webdriverOverride did not overwrite the Browser")
  })

  after(async () => {
    await page.close()
  })


  it("Title", async () => {
    await testTitle(page)
  })

  it("Searching: aesmerio.eu", async () => {
    await search1(page)
  })

  it("Searching: selenium-page", async () => {
    await search2(page)
  })

})

/** @param {Page} page */
async function testTitle(page) {
  const str = await (await page.driver).getTitle()
  strictEqual(str, "Google", "Check 1 - Title not matching.")
}

/** @param {Page} page */
async function search1(page) {
  let str = ""
  const consentIFrameXPath = "//iframe[contains(@src,'consent.google.com')]"
  const consentIFrame = await page.findBy.xpath(consentIFrameXPath, { mustFind: false, message: "iFrame Consent not found" })
  if (consentIFrame) {
    await page.switchToFrame.element(consentIFrame)
    await (await page.findBy.id("introAgreeButton", { message: "Button 'I Agree' not found", timeoutMs: 4000 })).click()
    await page.waitDisappearBy.xpath(consentIFrameXPath)
    await page.switchToFrame.toDefault()
  }
  const inputSearchCss = "input[title='Search']"
  await (await page.findBy.css(inputSearchCss, "Input Search not found")).sendKeys("aesmerio.eu")
  await (await page.findBy.css(inputSearchCss, "Input Search not found")).sendKeys(Key.ENTER)
  const results = await page.findAllBy.css("#search .g", "Individual results not found")
  str = await results[0].getAttribute("innerText")
  strictEqual(str.includes("aesmerio.eu"), true, "Check 1 - First result should be aesmerio.eu")
  str = await results[1].getAttribute("innerText")
  strictEqual(str.includes("ie.linkedin.com › airton-esmerio"), true, "Check 2 - Second result should be LinkedIn profile")
}

/** @param {Page} page */
async function search2(page) {
  const consentIFrameXPath = "//iframe[contains(@src,'consent.google.com')]"
  const consentIFrame = await page.findBy.xpath(consentIFrameXPath, { mustFind: false, message: "iFrame Consent not found" })
  if (consentIFrame) {
    await page.switchToFrame.element(consentIFrame)
    await (await page.findBy.id("introAgreeButton", { message: "Button 'I Agree' not found", timeoutMs: 4000 })).click()
    await page.waitDisappearBy.xpath(consentIFrameXPath)
    await page.switchToFrame.toDefault()
  }
  const inputSearchCss = "input[title='Search']"
  await (await page.findBy.css(inputSearchCss, "Input Search not found")).sendKeys("npm selenium-page")
  await (await page.findBy.css(inputSearchCss, "Input Search not found")).sendKeys(Key.ENTER)
  const results = await page.findAllBy.css("#search .g", "Individual results not found")
  let found = false
  for (const result of results) {
    const str = await result.getAttribute("innerText")
    found = str.includes("www.npmjs.com › package › selenium-page")
    if (found) break
  }
  strictEqual(found, true, "selenium-page not found in results")
}