const { Page, Key, PageDefs } = require("../../../page")
const googleUrl = "https://google.com"

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

class GooglePage extends Page {

  async open(url = googleUrl) {
    await super.open(url)
    await this.driver.sleep(500) //this sleep helps to ensure Google is fully ready
  }

  async clickAgreePrivacyDialog (){
    const consentIFrameXPath = "//iframe[contains(@src, 'consent.google.com')]"
    const consentIFrame = await this.findBy.xpath(consentIFrameXPath, {mustFind: false, message: "iFrame Consent not found"})
    if (consentIFrame) {
      await this.switchToFrame.element(consentIFrame)
      await this.waitDisappearBy.xpath(consentIFrameXPath)
      await (await this.findBy.id("introAgreeButton", "Button 'I Agree' not found")).click()
      await this.switchToFrame.toDefault()
    }
  }

  async searchFor(searchingText) {
    const inputSearchCss = "input[title='Search']"
    await (await this.findBy.css(inputSearchCss, "Input Search not found")).sendKeys(searchingText)
    await (await this.findBy.css(inputSearchCss, "Input Search not found")).sendKeys(Key.ENTER)
    await this.findAllBy.css("#search .g", "Individual results not found")
    return await this.findAllBy.css("#search .g", "Individual results not found")
  }
}

module.exports = { GooglePage, Key, strictEqual, PageDefs} 