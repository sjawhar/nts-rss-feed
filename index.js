const fs = require('fs');
const request = require('request-promise-native');
const xml2js = require('xml2js');

const REMAP = {
  '1be80a38-11c2-4809-9b12-ebf839c97864': 'http://snrp.utsa.edu/Media/Dudman_podcast.mp3',
  '1915f408-abe9-4eb9-ab58-f8efe595ad3d': 'http://snrp.utsa.edu/POD_html/Media/Charles%20Gerfen.mp3',
  'adec0fc9-a6b2-4173-9dbc-9560a2ff47f2': 'http://snrp.utsa.edu/Media/Future%20Frameworks%20part%202.mp3',
  'e831e7dd-1389-49fa-b438-6de59a30d39f': 'http://snrp.utsa.edu/Media/Future%20Frameworks%20Worshop%20pt%20I.mp3',
  '162da953-7c8b-4e24-b542-58e4e191b8ad': 'http://snrp.utsa.edu/Media/Suzanne%20Haber.mp3',
};
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

const transformFeed = feed => {
  feed.rss.channel[0].item.forEach(item => {
    const guid = item.guid[0]._;
    const url = REMAP[guid];
    if (!url) {
      return;
    }
    Object.assign(item.enclosure[0].$, { url });
  });
};

const writeFeed = (feed, file) => {
  const xml = builder.buildObject(feed);
  fs.writeFileSync(file, xml);
}

const main = async () => {
  const feed = await getFeed('http://snrp.utsa.edu/Podcast/rss.xml')
  transformFeed(feed);
  writeFeed(feed, 'rss.xml');
};

main().catch(error => console.error(error));