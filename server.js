const express = require('express');
const { Client } = require('pg');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');

require('dotenv').config()

const app = express();

const mustache = mustacheExpress();
mustache.cache = null;
app.engine('mustache', mustache);
app.set('view engine', 'mustache');

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {

  const data = {};

  const client = new Client();
  client.connect()
    .then(() => {
      return client.query('SELECT * FROM person WHERE age > 20')
    })
    .then((results) => {
      //console.log('results #1', results.rows);
      data.regularSelectData = results.rows;
      return client.query('SELECT * FROM person ORDER BY first_name DESC')
    })
    .then((results) => {
      //console.log('results #2', results.rows);
      data.orderedSelectData = results.rows;
      res.render('index', data);
      client.end();
    });

});

app.get('/entry', (req, res) => {
  res.render('entry');
});

app.post('/entry', (req, res) => {
  console.log('request body', req.body);

  const client = new Client();
  client.connect()
    .then(() => {
      const sql = 'INSERT INTO person (first_name, last_name, age) VALUES ($1, $2, $3)';
      const params = [req.body.firstName, req.body.lastName, req.body.age];

      return client.query(sql, params);
    })
    .then((result) => {
      console.log('result?', result);
      client.end();
      res.redirect('/entry');
    });

});

app.get('/one-on-ones', (req, res) => {

  const theStudents = ['Hagen', 'Becky', 'Blaine', 'Stef', 'Jeff', 'Austin', 'CAAAAAAAsey'];

  const randomed = [];
  while (theStudents.length > 0) {
    const randomIndex = Math.floor(Math.random() * theStudents.length);
    randomed.push(theStudents.splice(randomIndex, 1)[0]);
  }

  res.render('one-on-ones', { youguys: randomed });

});

app.post('/destroy/:id', (req, res) => {
  console.log('req params', req.params);

  const client = new Client();
  client.connect()
    .then(() => {
      const sql = 'DELETE FROM person WHERE person_id = $1';
      const params = [req.params.id];

      return client.query(sql, params);
    })
    .then((result) => {
      console.log('result?', result);
      res.redirect('/');
    });

});

app.get('/edit/:id', (req, res) => {

  const client = new Client();
  client.connect()
    .then(() => {
      const sql = 'SELECT * FROM person WHERE person_id = $1';
      const params = [req.params.id];
      return client.query(sql, params);
    })
    .then((result) => {
      console.log(result.rows);
      //TODO: what if no one is returned?
      res.render('edit', result.rows[0]);
    });



});



app.listen(process.env.PORT, function() {
  console.log(`Listening on port ${process.env.PORT}.`);
});
