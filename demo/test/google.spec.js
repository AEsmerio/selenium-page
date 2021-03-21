const { GooglePage, strictEqual, PageDefs } = require("./page/google")



for (const browser of Object.values(PageDefs.browsers)) {

  describe(`Google on ${browser}`, async function () {
    this.timeout(30001)

    let str = ""
    const googlePage = new GooglePage({ browser, resolution: PageDefs.resolutions.maximize, findConfig: { screenshot: `${__dirname}/screenshot/` } })

    beforeEach(async () => {
      await googlePage.open()
    })

    after(async () => {
      await googlePage.close()
    })

    it("Title", async () => {
      str = await (await googlePage.driver).getTitle()
      strictEqual(str, "Google", "Check 1 - Title not matching.")
    })

    it("Searching: aesmerio.eu", async () => {
      await googlePage.clickAgreePrivacyDialog()
      const results = await googlePage.searchFor("aesmerio.eu")
      str = await results[0].getAttribute("innerText")
      strictEqual(str.includes("aesmerio.eu"), true, "Check 1 - First result should be aesmerio.eu")
      str = await results[1].getAttribute("innerText")
      strictEqual(str.includes("ie.linkedin.com › airton-esmerio"), true, "Check 2 - Second result should be LinkedIn profile")
    })

    it("Searching: selenium-page", async () => {
      await googlePage.clickAgreePrivacyDialog()
      const results = await googlePage.searchFor("npm selenium-page")
      let found = false
      for (const result of results) {
        str = await result.getAttribute("innerText")
        found = str.includes("www.npmjs.com › package › selenium-page")
        if (found) break
      }
      strictEqual(found, true, "selenium-page not found in results")
    })


    it("Fail and get screen shot", async () => {
      const screenshotFileName = Date.now()
      const screenshotFilePath = `${__dirname}/screenshot/${screenshotFileName}.png`
      const cssSelector = ".Anything#thatMakeIt.Fail"
      try {
        await googlePage.findBy.css(cssSelector, { screenshotName: screenshotFileName })
      } catch (error) {
        strictEqual(error.message.includes(cssSelector), true, `Error message does not contain the Selector: "${cssSelector}"`)
        strictEqual(error.message.includes(`/screenshot/${screenshotFileName}.png`), true, `Error message does not contain the screenshotFileName: "${screenshotFileName}"`)
      }
      strictEqual(require('fs').existsSync(screenshotFilePath), true, "Screenshot file not found")
      await googlePage.waitDisappearBy.css(cssSelector, "cssSelector was misread and somehow it was found")
    })


  })
}