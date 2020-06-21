const functions = require('firebase-functions');
const puppeteer = require('puppeteer');

exports.helloWorld = functions.https.onRequest((req, res) => {
 res.send("Hello");
});

// Test cloud function
exports.randomNumber = functions.https.onRequest((request, response) => {
    const number = Math.round(Math.random() * 100);
    console.log(number)
    response.send(number.toString());
});

exports.updateCNNScreenShot = functions.https.onRequest ((req, res) => {
    let headlines;
    try {
        headlines = getCNNImg();
    } catch(err) {
        console.log("Error when scraping");
    }
    console.log("Got the headlines");
    console.log(headlines.toString())
   // res.send(headlines.toString());
});



let browserPromise = puppeteer.launch({
    args: [
        '--no-sandbox',
    ]
});

const getCNNImg = async (req, res) => {
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