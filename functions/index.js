const functions = require('firebase-functions');
const puppeteer = require('puppeteer');

// Test cloud function
exports.helloWorld = functions.https.onRequest((req, res) => {
    res.send("Hello");
});

// Test cloud function
exports.randomNumber = functions.https.onRequest((request, response) => {
    const number = Math.round(Math.random() * 100);
    console.log(number)
    response.send(number.toString());
});

exports.updateCNNHeadlines = functions.https.onRequest((req, res) => {
    let headlines;
    try {
        headlines, screenshot = getHeadlines();
    } catch (err) {
        console.log("Error when scraping");
    }
    console.log("Headlines are being scraped");
    res.send(headlines);
});

let browserPromise = puppeteer.launch({
    args: [
        '--no-sandbox',
    ]
}).catch(err => console.log("Error with launching puppeteer browser: " + err));  // Handle rejected promise

const getHeadlines = async (req, res) => {
    const url = 'https://www.cnn.com/';
    const browser = await browserPromise;
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });

    const screenshot = await page.screenshot();

    selectorTags = ['#homepage1-zone-1', '#homepage2-zone-1', '#homepage3-zone-1', '#homepage4-zone-1', '#homepage5-zone-1'];
    selectorTags = selectorTags.map(e => e.concat(" > div > div > div > ul > li > article > div > div > h3 > a > span.cd__headline-text"));

    const headlines = await page.evaluate((selectors) => {
        let headlinesTotal = [];
        for (let i = 0; i < selectors.length; i++) {
            const nodeList = document.querySelectorAll(selectors[i]);
            const headlinesNode = [...nodeList];
            headlinesTotal = headlinesTotal.concat(headlinesNode.map(each => each.textContent.trim()));
        }       
        return headlinesTotal;
    }, selectorTags);
    
    await context.close();
    await browser.close();
    console.log(headlines);
    return headlines, screenshot;
};


// Schedule cloud function (PubSub)
exports.scheduledFunction = functions.pubsub.schedule('*/15 * * * *').onRun((context) => {
    console.log('This will be run every 15 minutes!');
});
