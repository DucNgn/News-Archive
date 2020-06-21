const functions = require('firebase-functions');
const puppeteer = require('puppeteer');
let browserPromise = puppeteer.launch({
    args: [
        '--no-sandbox',
    ]
});

exports.helloWorld = functions.https.onRequest((req, res) => {
 res.send("Hello");
 
});

exports.updateCNNScreenShot = async (req, res) => {
    const url = 'https://www.cnn.com/';
    const browser = await browserPromise;
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();

    await page.goto(url);

    const image = await page.screenshot();

    res.setHeader('Content-type', 'image/png');
    res.send(image);
};
