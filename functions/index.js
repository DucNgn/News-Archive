const functions = require('firebase-functions');
const puppeteer = require('puppeteer');

// Initialize for Firestore
const admin = require('firebase-admin');
admin.initializeApp();

let db = admin.firestore();

// ================================================================

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

// ================================================================

// Schedule cloud function (PubSub) - FOR INITING SCRAPPING HEADLINES AND SCREENSHOT EVERY 15MINS
exports.scheduledFunction = functions.pubsub.schedule('*/15 * * * *').onRun((context) => {
    console.log('This function will be run every 15 minutes!');
    
    // TRYME: Uncomment for to get data from cnn collection in Firestore
    // getCNNData();
    
    let headlines, screenshot;
    
    // TRYME: Uncomment to add data with websrapping
    // try {
    //     headlines, screenshot = getHeadlines();
    // } catch (err) {
    //     console.log("Error when scrapping");
    // }
    // console.log("Headlines are being scraped");

    // TRYME: Uncomment the variable below to test the scheduled function
    headlines = [
        "This is newly added Headline 1",
        "This is newly added Headline 2"
    ];

    headlines.forEach(value => addCNNData(value));  // Adding data to Firestore
});

// ================================================================

// Firestore Implementation - ONLY USED FOR STORING HEADLINES

// Get data - USED FOR FRONT END DEV
function getCNNData() {
    // CHECKME: This function can be used for front-end for retrieving data from 'foxnews' collection in Firestore
    db.collection('cnn').get()
        // eslint-disable-next-line promise/always-return
        .then((snapshot) => {
            snapshot.docs.forEach(doc => {
                console.log(doc.id); 
                console.log(doc.data().headline);
                console.log(doc.data().timestamp);
            })
        })
        .catch(error => console.log('Error getting documents from Firestore', error));
}

function getFoxNewsData() {
    // CHECKME: This function can be used for front-end for retrieving data from 'foxnews' collection in Firestore
    db.collection('foxnews').get()
        // eslint-disable-next-line promise/always-return
        .then((snapshot) => {
            snapshot.docs.forEach(doc => {
                console.log(doc.id); 
                console.log(doc.data().headline);
                console.log(doc.data().timestamp);
            })
        })
        .catch(error => console.log('Error getting documents from Firestore', error));
}

// Add data - USED FOR SCHEDULED JOB
function addCNNData(headline) {
    // CHECKME: This function is for adding new documents into 'cnn' collections in Firestore 
    const data = {
        headline: headline,
        timestamp: admin.firestore.Timestamp.fromDate(new Date())
    };

    db.collection('cnn').add(data);
}

function addFoxNewsData(headline) {
    // CHECKME: This function is for adding new documents into 'foxnews' collections in Firestore 
    const data = {
        headline: headline,
        timestamp: admin.firestore.Timestamp.fromDate(new Date())
    };

    db.collection('foxnews').add(data);
}

// ================================================================

// Cloud Storage Implementation - ONLY USED FOR STORING SCREENSHOTS