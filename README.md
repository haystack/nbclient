# NB document annotator plugin

## Prerequisites
- Have `node` and `npm` installed: https://www.npmjs.com/get-npm
- Have `webpack` installed: Run `npm install -g webpack` after `npm` is installed

## Installation
```
git clone https://github.com/alisaono/nbdemo.git
cd nbdemo
npm install
npm install -g webpack
```

## Usage
- All JS/Vue source code is under `src/` (things you'd be making change to most of the time)
- Exception is the CSS files which are under `public/style`
- To compile the JS/Vue source code:
```
cd nbdemo
webpack
```
- You'll find the compiled code (`bundle.js`) under `public/js`

## Optional (Recommended)

### Hosting files locally
You can host the plugin files locally, which is useful for embedding and testing them locally. To do so:
```
cd nbdemo
npm run start
```
You will then find the files hosted at `localhost:3001` (e.g. `localhost:3001/js/bundle.js`)

Note: Since we're using a self generated certificate for development, the browser will alert that you are running an insecure server. Got to this URL `localhost:3001/js/bundle.js` in Chrome then type: thisisunsafe. (note: there is no text box to type this in, you have to type it on yout keyboard to get through). You can also press the advanced button then press continue to site.

### Code documentation
To see a nice webpage version of the in-file code documentation as, do:
```
cd nbdemo
./node_modules/.bin/jsdoc -r src/ -c jsdoc.json
```
You will then find `out/index.html` which you can view in your browser.


Currently the in-file code documentation follows the `jsdoc` (https://github.com/jsdoc/jsdoc) format and it's highly recommended to continue following this documentation format or another standard format if you choose something else.
