const pptr = require('puppeteer')
const fs = require('fs')
require("dotenv").config()
const puppeteer = require('puppeteer');

const scrapUserLoc = (async (username = 'the_lost_travellers') => {
    const browser = await puppeteer.launch({
        args: [
            "--incognito"
        ],
        headless: false
        // timeout:60000sa

    });

    // create browser session
    const page = await browser.newPage();
    await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle0' });

    // input credentials
    await page.type('input[name=username]', process.env.INS_USERNAME)
    await page.type("input[name=password]", process.env.INS_PASSWORD)
    await page.click("button[type=submit]", { delay: 30 })
    await page.waitForNavigation()
    console.log('login succeeded!');


    // save login info page
    let buttonArray = await page.$$('button[type=button]')
    if (buttonArray)
        await buttonArray[0].click();
    else
        console.log("no button proceed");
    await page.waitForNavigation()
    console.log('save info page skipped!');

    // turn off/on notification page :: could be skipped by going to user profile
    await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: 'networkidle0' });
    await page.click("article>div>div>div>div", { delay: 10 })
    await page.waitForSelector(`span>a[href*='${username}'][tabindex='0']`)

    let userData = {
        username,
        url: `https://www.instagram.com/${username}/`,
        locations: []
    }

    let arch, loc, url, parsedLoc;
    let last = false;
    let count = 0;
    // loop through user's post
    while (!last) {

        // bottle neck setup
        // if (count >= 100)
        //     break

        // skip if no location info
        try {
            arch = await page.$$("a[href*='locations']")
            loc = await page.evaluateHandle(e => e.innerText, arch[1])
            url = page.url()
            // page.waitFor()
            parsedLoc = loc['_remoteObject']['value']

            // count += 1
            let i, exists = false;

            // format scrapped data 
            for (i in userData.locations) {
                if (userData.locations[i].location === parsedLoc) {
                    exists = true;
                    break
                }
            }
            if (exists)
                userData.locations[i].posts.push(url)
            else {
                let obj = {
                    location: parsedLoc,
                    posts: [url,]
                }
                userData.locations.push(obj)
            }
            console.log(i, ">>", exists);
        }
        catch (e) {
            console.log(e)
            console.log("no location in post :: skipping!!");
        }
        console.log(loc['_remoteObject']['value'], " >> ", url);

        // end at last post
        try {
            await page.click("svg[aria-label='Next']")
            // page.waitForNavigation()
            await page.waitForSelector(`span>a[href*='${username}'][tabindex='0']`)

            console.log("next >>", userData.locations.length);
        }
        catch (err) {
            console.log(err);
            last = true
        }
    }

    console.log(userData.locations, userData.locations.length)
    let fileName = `./data/${Date.now().toString()}_username_${username}.json`

    // write scrapped json data to file
    fs.writeFile(fileName, JSON.stringify(userData), (err, file) => {
        if (err) {
            console.log(err);
        }
    })
});
module.exports = scrapUserLoc