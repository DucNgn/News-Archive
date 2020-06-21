import * as functions from 'firebase-functions';



exports.archive = functions.pubsub
    .topic('news')
    .onPublish(async (message, context) => {
        console.log('The function was triggered at ', context.timestamp);
        console.log('The unique ID for the event is ', context.eventId);
        console.log('The name of message is ', message.attributes.name);
        
        // const news = await [puppeteer function];

        console.log("News archived");
    });

 
   
// run firebase deploy --only functions