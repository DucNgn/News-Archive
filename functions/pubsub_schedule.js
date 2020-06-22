const functions = require('firebase-functions');
const puppeteer = require('puppeteer');


// Cloud Function(s)
exports.archive = functions.https.onRequest ((req, res) => {  
        // Web Scrapping
        let headlines;

        try {
            headlines = getCNNHeadlines();  // Get CNN headlines
        } catch(err) {
            console.log("Error when scraping: " + err);
        }

        console.log("Got the headlines");
        console.log(headlines.toString())

        // console.log("News archived");
    });


// Puppeteer Browser Promise
let browserPromise = puppeteer.launch({
    args: [
        '--no-sandbox',
    ]
});


// Local function(s)
const getCNNHeadlines = async (req, res) => {
    const url = 'https://www.cnn.com/';
    const browser = await browserPromise;
    console.info(browser);

    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();

    await page.goto(url, {waitUntil: 'networkidle2'});

   /* const image = await page.screenshot();*/
   /* const headlines = await page.evaluate(() => document.querySelector('cd__headline-text').innerText); */
    const element = await page.$("cd__headline-text");
    const headlines = await page.evaluate(element => element.textContent, element);

    await context.close();
    await browser.close();

    return headlines;
};

   
// run firebase deploy --only functions:archive