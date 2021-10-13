const Translations = require('./models/Translations');
const SheetsORM = require('./SheetsORM');

function prettyJ(json) {
  if (typeof json !== 'string') {
    json = JSON.stringify(json, undefined, 2);
  }
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, 
    function (match) {
      let cls = "\x1b[36m";
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "\x1b[34m";
        } else {
          cls = "\x1b[32m";
        }
      } else if (/true|false/.test(match)) {
        cls = "\x1b[35m"; 
      } else if (/null/.test(match)) {
        cls = "\x1b[31m";
      }
      return cls + match + "\x1b[0m";
    }
  );
}

async function init() {    
  // CREATE
  // const Phrase = 'Good Morning';
  // const Phrase = 'My name is Yusuf';
  // const sourceLang = 'EN';
  // const translations = [{
  //   lang: 'French',
  //   code: 'FR'
  // }, {
  //   lang: 'Spanish',
  //   code: 'ES'
  // }, {
  //   lang: 'Russian',
  //   code: 'RU'
  // }, {
  //   lang: 'Arabic',
  //   code: 'AR'
  // }, {
  //   lang: 'Italian',
  //   code: 'IT'
  // }];
  // const response = await Translations.create(
  //   translations.map(row => {
  //     return {    
  //       Phrase,
  //       Language: row.lang,
  //       Code: row.code,
  //       Translated: `=GOOGLETRANSLATE(INDIRECT("B"&ROW()), "${ sourceLang }", INDIRECT("D"&ROW()))`,
  //       CreatedAt: new Date(),
  //       UpdateCount: 0
  //     }
  //   })
  // );    
  // return response;

  // FIND
  // const response = await Translations.find({
  //   select: ['*'],
  //   where: {
  //     Language: 'Italian',
  //     Phrase: 'Good Morning',      
  //   }
  // });
  // return prettyJ(response);

  // DESTROY
  // const response = await Translations.destroy('ubleucc8');
  // return response;  

  // UPDATE
  const response = await Translations.update('eubcs908', {
    Phrase: 'Hello World',
    Language: 'Turkish',
    Code: 'TR'
  });
  return response;  
}

init().then(console.log).catch(console.error);