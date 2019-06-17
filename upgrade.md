# TO add new Pixel

- integrate new event into `addBlocking` function from file `src/event.js`

- define new `reqType` into `newRequest` function from file `src/Panel/dsPanel.js`

- in same `newRequest` function add condition such as `if ((reqType == 'classic') || (reqType == 'universal') || (reqType == 'dc_js') || (reqType == 'sitecatalyst') || (reqType == 'tr'))`

- add parse$$TagName$$ function such as `parseFacebook` and specify in switch case default the url param contained in `v` object and define `v.utmac = '$$TagName$$';`

- add reqType condition inserting new parse$$TagName$$ function into `tagHTML` function from file `src/Panel/dsPanel.js`