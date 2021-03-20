const { Page, Key } = require("../../page")
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
  let str = ""

  this.timeout(50000)
  const page = new Page()

  beforeEach(async () => {
    await page.open(url)
  })

  after(async () => {
    await page.close()
  })
  

  it("Title", async () => {
    str = await (await page.driver).getTitle()
    strictEqual(str, "Google", "Check 1 - Title not matching.")
  })

  it("Searching: aesmerio.eu", async () => {
    const consentIFrameXPath = "//iframe[contains(@src, 'consent.google.com')]"
    const consentIFrame = await page.findBy.xpath(consentIFrameXPath, {mustFind: false, message: "iFrame Consent not found"})
    await page.switchToFrame.element(consentIFrame)
    await (await page.findBy.id("introAgreeButton", "Button 'I Agree' not found")).click()
    const inputSearchCss = "input[title='Search']"
    await (await page.findBy.css(inputSearchCss, "Input Search not found")).sendKeys("aesmerio.eu")
    await (await page.findBy.css(inputSearchCss, "Input Search not found")).sendKeys(Key.ENTER)
    const results = await page.findAllBy.css("#search .g", "Individual results not found")
    str = await results[0].getAttribute("innerText")
    strictEqual(str.includes("aesmerio.eu"), true, "Check 1 - First result should be aesmerio.eu")
    str = await results[1].getAttribute("innerText")
    strictEqual(str.includes("ie.linkedin.com › airton-esmerio"), true, "Check 2 - Second result should be LinkedIn profile")
  })


  it("Searching: selenium-page", async () => {
   const consentIFrameXPath = "//iframe[contains(@src, 'consent.google.com')]"
    const consentIFrame = await page.findBy.xpath(consentIFrameXPath,  {mustFind: false, message: "iFrame Consent not found"})
    if (consentIFrame) {
      await page.switchToFrame.element(consentIFrame)
      await (await page.findBy.id("introAgreeButton", "Button 'I Agree' not found")).click()
    }
    const inputSearchCss = "input[title='Search']"
    await (await page.findBy.css(inputSearchCss, "Input Search not found")).sendKeys("npm selenium-page")
    await (await page.findBy.css(inputSearchCss, "Input Search not found")).sendKeys(Key.ENTER)
    const results = await page.findAllBy.css("#search .g", "Individual results not found")
    let found = false
    for (const result of results) {
      str = await result.getAttribute("innerText")
      found = str.includes("www.npmjs.com › package › selenium-page")
      if (found) break
    }
    strictEqual(found, true, "selenium-page not found in results")
  })

})