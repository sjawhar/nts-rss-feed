const fs = require("fs");
const request = require("request-promise-native");
const xml2js = require("xml2js");

const fixedLinks = require("./fixed-links.json");
const builder = new xml2js.Builder();

const getFeed = async url => {
  const xml = await request({ url });
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(result);
    });
  });
};

const decodeItem = item => {
  const { url } =
    (item.enclosure && item.enclosure[0] && item.enclosure[0].$) || {};
  const { _: guid } = (item.guid && item.guid[0]) || {};
  const [title] = item.title || [];
  return { url, guid, title };
};

const transformFeed = feed => {
  feed.rss.channel[0].item.forEach(item => {
    const { guid, title } = decodeItem(item);
    const url = fixedLinks[guid];
    if (!url) {
      return;
    }
    if (!item.enclosure) {
      Object.assign(item, { enclosure: [{ $: {} }] });
    }
    Object.assign(item.enclosure[0].$, typeof url === "string" ? { url } : url);
  });
};

const writeFeed = (feed, file) => {
  const xml = builder.buildObject(feed);
  fs.writeFileSync(file, xml);
};

const checkFeed = async feed => {
  const method = "HEAD";
  const brokenLinks = (await Promise.all(
    feed.rss.channel[0].item.map(async item => {
      const { url, guid, title } = decodeItem(item);
      try {
        const response = await request({ method, url });
        if (!response["content-length"]) {
          throw new Error("empty file");
        }
      } catch (error) {
        return { guid, title, url };
      }
    })
  ))
    .filter(broken => !!broken)
    .sort((a, b) => a.guid.localeCompare(b.guid));

  if (brokenLinks.length) {
    console.log(JSON.stringify(brokenLinks, null, 2));
    throw new Error("Broken links");
  }
};

const main = async () => {
  const feed = await getFeed("http://snrp.utsa.edu/Podcast/rss.xml");
  transformFeed(feed);
  await checkFeed(feed);
  writeFeed(feed, "feed.xml");
};

main()
  .then(() => console.log("Feed updated"))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
