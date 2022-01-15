/* eslint-disable no-unused-vars */
const { Pool, Client } = require("pg");

// eslint-disable-next-line max-len

const pool = new Pool({
  user: "prithjaganathan",
  host: "localhost",
  database: "qadb",
  password: "password",
  port: 5432,
});

const getQuestions = (request, response) => {
  let { product_id, page, count } = request.query;
  page = page || 1;
  count = count || 5;

  let resultsObject = {
    product_id: product_id,
    results: "",
  };

  const queryString = `SELECT (json_agg(
    json_build_object(
        'question_id', q.question_id,
        'question_body', q.question_body,
        'question_date', q.question_date,
        'asker_name', q.asker_name,
        'question_helpfulness', q.question_helpfulness,
        'reported', q.reported
      )
    )
  ) FROM questions q WHERE q.product_id = ${product_id} LIMIT ${count};`;

  pool.query(queryString, (err, results) => {
    if (err) {
      console.log(err);
      response.send(err);
    }
    // resultsObject.results = results.rows[0]["json_agg"];
    console.log(results.rows[0]["json_agg"]);
    response.status(200).send(results.rows[0]["json_agg"]);
  });
};

const getAnswers = (request, response) => {
  const { question_id } = request.params;
  let { page, count } = request.query;
  page = page || 1;
  count = count || 5;

  let responseObject = {
    question: question_id,
    page: page,
    count: count,
    results: "",
  };

  //alter table ALTER TABLE tableName ADD INDEX nameofIndex (nameofCol)

  const queryString = `SELECT (json_agg(
    json_build_object(
      'answer_id', a.answers_id,
      'body', a.body,
      'date', a.date,
      'answerer_name', a.answerer_name,
      'helpfulness', a.helpfulness,
      'photos', ''
      )
    )
  ) FROM answers a WHERE a.id_questions = ${question_id} AND a.reported = FALSE LIMIT ${count};`;

  pool.query(queryString, (err, results) => {
    if (err) {
      console.log(err);
      response.send(err);
    }
    responseObject.results = results.rows[0]["json_agg"];
    // response.status(200).json(responseObject.results);
    let promiseArray = [];
    responseObject.results.forEach(function (ans) {
      promiseArray.push(
        new Promise((resolve, reject) => {
          pool.query(
            `SELECT * FROM photos WHERE id_answers = ${ans.answer_id}`,
            (err, results2) => {
              if (err) {
                console.log(err);
                response.send(err);
              }
              ans.photos = results2.rows;
              resolve();
              // console.log(ans);
              console.log(responseObject.results);
            }
          );
        })
      );
    });
    Promise.all(promiseArray).then(() => {
      response.json(responseObject.results);
    });
    // response.json(responseObject.results);
  });
};

const postQuestion = (req, res) => {
  const { body, name, email, product_id } = req.body;
  const currentDate = Date.now();
  const helpfulness = 0;
  const reported = false;
  pool.query(
    `INSERT INTO questions (question_id, product_id, question_body, question_date, asker_name, asker_email, question_helpfulness, reported)
     VALUES ((SELECT MAX(question_id) + 1 FROM questions), $1, $2, $3, $4, $5, $6, $7)`,
    [product_id, body, currentDate, name, email, helpfulness, reported],
    (err) => {
      if (err) {
        console.log(err);
        res.send(err);
      }
      console.log("Successfully added question to database");
      res.send("Successfully added question to database");
    }
  );
};

pool.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`connected to database`);
  }
});

module.exports = {
  getQuestions,
  getAnswers,
  postQuestion,
};
