const express = require('express');
const app = express();
const port = 3000;
const aws = require('aws-sdk');
const multer = require('multer');
require('dotenv').config();

app.use(express.json({ extended: false }));

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('./public'));

const upload = multer();

aws.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION,
});

const docClient = new aws.DynamoDB.DocumentClient();

const TableName = 'Paper';
app.get('/', (req, res) => {
  const params = { TableName };
  docClient.scan(params, (err, data) => {
    return res.render('index', { papers: data.Items });
  });
});

app.post('/', upload.fields([]), (req, res) => {
  const { paper_id, paper_title, paper_author, paper_isbn, paper_number, paper_publish_year } = req.body;
  const params = {
    TableName,
    Item: {
      paper_id,
      paper_title,
      paper_author,
      paper_isbn,
      paper_number,
      paper_publish_year,
    },
  };
  docClient.put(params, (err, data) => {
    if (err) {
      throw err;
    }
    return res.redirect('/');
  });
});

app.post('/update', upload.fields([]), (req, res) => {
  const { paper_id, paper_title, paper_author, paper_isbn, paper_number, paper_publish_year } = req.body;
  if (!paper_id) {
    return res.redirect('/');
  }
  const params = {
    TableName,
    Key: { paper_id },
    UpdateExpression:
      'set paper_title=:paper_title, paper_author=:paper_author, paper_isbn=:paper_isbn, paper_number=:paper_number, paper_publish_year=:paper_publish_year',
    ExpressionAttributeValues: {
      ':paper_title': paper_title,
      ':paper_author': paper_author,
      ':paper_isbn': paper_isbn,
      ':paper_number': paper_number,
      ':paper_publish_year': paper_publish_year,
    },
    ReturnValues: 'UPDATE_NEW',
  };
  docClient.update(params, (err, data) => {
    if (err) {
      throw err;
    }
    return res.redirect('/');
  });
});

app.post('/delete', upload.fields([]), (req, res) => {
  const { paper_id } = req.body;
  const params = { TableName, Key: { paper_id } };
  docClient.delete(params, (err, data) => {
    if (err) {
      throw err;
    }
    return res.redirect('/');
  });
});

app.listen(port, () => {
  console.log(`Server listen on port: ${port}`);
});
