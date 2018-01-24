const fetch = require('isomorphic-fetch');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

function checkStatus(response) {
  if (response.status >= 200 && response.status <= 304) {
    return response
  } else {
    var error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

const url = 'https://oddity.catalex.nz/render';

const render  = (values) => fetch(url, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
    })



app.use(express.static('public'));
app.use(bodyParser.json()); // support json encoded bodies

app.post('/api/render', function (req, res) {
    render(req.body)
        .then(checkStatus)
        .then((_response) => {
            response = _response;
            res.set('Content-Type', response.headers.get('Content-Type'));
            res.set('Content-Disposition', response.headers.get('Content-Disposition'));
            response.body
              .on('data', function (chunk) {
                res.write(chunk);
              })
              .on('end', function () {
                res.end();
              });
        })
        .catch(e => {
            res
                .status(500)
                .send({ error: e})
        })
})

app.listen(3452, () => console.log('App Started'));