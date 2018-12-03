const puppeteer = require('puppeteer-core');
const cheerio = require('cheerio');
const fs = require('fs');

(async () => {
	const browser = await puppeteer.launch({executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe", headless: false});
	const page = await browser.newPage();
	await page.setViewport({ width: 675, height: 600 });
	await page.goto('https://www.obozrevatel.com/moyashkola/zno/11klass/anglijskij/1188/');
	let content = await page.content()
	let $ = cheerio.load(content)

	const linksToTestsAndAnswer = [];
	$('ul.accordion li div h3 a').each(function(i, el) {
		linksToTestsAndAnswer[i] = $(this).attr('href');
	})

	const linksToSingleTests = [];

	for (let linkToTestsAndAnswer of linksToTestsAndAnswer) {
		await page.goto(linkToTestsAndAnswer);
		let content = await page.content()
		let $ = cheerio.load(content)
		$('div.tasks__wrap a').each(function(i, el) {
			linksToSingleTests.push($(this).attr('href'));
		})
	}

	for (let linkToSingleTests of linksToSingleTests) {
		await page.goto(linkToSingleTests);
		content = await page.content()
		$ = cheerio.load(content)
		let downloadUrl = $('div.viewer__wrap-img img').attr('src');
		let viewSource = await page.goto(downloadUrl);
		let splitedURL = downloadUrl.split('/');
		let imageFileName = splitedURL[splitedURL.length - 1];

		fs.writeFile(imageFileName, await viewSource.buffer(), function(err) {
				if(err) {
						return console.log(err);
				}
				console.log(`The ${imageFileName} was saved!`);
		});
		await page.waitFor(4000);
	}

	await browser.close();
})();
