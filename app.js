const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dates = require("date-fns");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  } catch (er) {
    console.log(`DB Error : ${er.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// API 1
app.get("/todos/", async (request, response) => {
  const { priority, status, category, search_q } = request.query;
  // SENARIO 1
  if (
    status !== undefined &&
    priority === undefined &&
    category === undefined &&
    search_q === undefined
  ) {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      let query1 = `SELECT id , todo,priority,status,category,due_date AS dueDate 
                            FROM todo WHERE status = '${status}'; `;
      let dbResponse = await db.all(query1);
      response.send(dbResponse);
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  }

  // SENARIO 2
  if (
    status === undefined &&
    priority !== undefined &&
    category === undefined &&
    search_q === undefined
  ) {
    if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
      let query1 = `SELECT id , todo,priority,status,category,due_date AS dueDate 
                            FROM todo WHERE priority = '${priority}';`;
      let dbResponse = await db.all(query1);
      response.send(dbResponse);
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  }
  // SENARIO 3
  if (
    status !== undefined &&
    priority !== undefined &&
    category === undefined &&
    search_q === undefined
  ) {
    if (
      (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") &&
      (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW")
    ) {
      let query1 = `SELECT id , todo,priority,status,category,due_date AS dueDate 
                            FROM todo WHERE status = '${status}' AND priority = '${priority}' ;`;
      let dbResponse = await db.all(query1);
      response.send(dbResponse);
    } else {
      if (status !== "TO DO" && status !== "IN PROGRESS" && status !== "DONE") {
        response.status(400);
        response.send("Invalid Todo Status");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
    }
  }

  // SENARIO 4
  if (
    status === undefined &&
    priority === undefined &&
    category === undefined &&
    search_q !== undefined
  ) {
    let query1 = `SELECT id , todo,priority,status,category,due_date AS dueDate 
                        FROM todo WHERE todo LIKE '%${search_q}%';`;
    let dbResponse = await db.all(query1);
    response.send(dbResponse);
  }

  // SENARIO 5
  if (
    status !== undefined &&
    priority === undefined &&
    category !== undefined &&
    search_q === undefined
  ) {
    if (
      (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") &&
      (category === "WORK" || category === "HOME" || category === "LEARNING")
    ) {
      let query1 = `SELECT id , todo,priority,status,category,due_date AS dueDate  
                            FROM todo WHERE status = '${status}' AND category = '${category}';`;
      let dbResponse = await db.all(query1);
      response.send(dbResponse);
    } else {
      if (status !== "TO DO" && status !== "IN PROGRESS" && status !== "DONE") {
        response.status(400);
        response.send("Invalid Todo Status");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    }
  }
  // SENARIO 6
  if (
    status === undefined &&
    priority === undefined &&
    category !== undefined &&
    search_q === undefined
  ) {
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
      let query1 = `SELECT id , todo,priority,status,category,due_date AS dueDate  
                            FROM todo WHERE category = '${category}';`;
      let dbResponse = await db.all(query1);
      response.send(dbResponse);
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  }
  // SENARIO 7
  if (
    status === undefined &&
    priority !== undefined &&
    category !== undefined &&
    search_q === undefined
  ) {
    if (
      (category === "WORK" || category === "HOME" || category === "LEARNING") &&
      (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW")
    ) {
      let query1 = `SELECT id , todo,priority,status,category,due_date AS dueDate  
                            FROM todo WHERE category = '${category}' AND priority = '${priority}';`;
      let dbResponse = await db.all(query1);
      response.send(dbResponse);
    } else {
      if (
        category !== "WORK" &&
        category !== "HOME" &&
        category !== "LEARNING"
      ) {
        response.status(400);
        response.send("Invalid Todo Category");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
    }
  }
});

// API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const query2 = `SELECT id , todo,priority,status,category,due_date AS dueDate  
                      FROM todo WHERE id = ${todoId};`;
  let dbResponse = await db.get(query2);
  response.send(dbResponse);
});

// API 3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const { format, isValid } = dates;
  const dateFormatting = format(new Date(date), "yyyy-MM-dd");

  const query3 = `SELECT id , todo,priority,status,category,due_date AS dueDate  
                FROM todo WHERE due_date = "${dateFormatting}";`;
  const dbResponse = await db.all(query3);
  response.send(dbResponse);
});

// API 4
app.post("/todos/", async (request, response) => {
  const details = request.body;
  let query4;
  const { id, priority, status, todo, dueDate, category } = details;
  if (priority !== "HIGH" && priority !== "MEDIUM" && priority !== "LOW") {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
  if (status !== "TO DO" && status !== "IN PROGRESS" && status !== "DONE") {
    response.status(400);
    response.send("Invalid Todo Status");
  }
  if (category !== "WORK" && category !== "HOME" && category !== "LEARNING") {
    response.status(400);
    response.send("Invalid Todo Category");
  } else {
    query4 = `INSERT INTO todo(id,todo,priority,status,category,due_date)
            VALUES
            (${id} , '${todo}' , '${priority}' , '${status}' , '${category}', '${dueDate}');`;
  }
  const dbresponse10 = await db.run(query4);
  response.send("Todo Successfully Added");
});
// API 5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const details = request.body;
  const { status, todo, priority, dueDate, category } = details;

  // SENARIO 1
  if (
    status !== undefined &&
    todo === undefined &&
    priority === undefined &&
    dueDate === undefined &&
    category === undefined
  ) {
    if (status !== "TO DO" && status !== "IN PROGRESS" && status !== "DONE") {
      response.status(400);
      response.send("Invalid Todo Status");
    } else {
      let query5 = `UPDATE todo 
                            SET status = '${status}'
                            WHERE id = ${todoId};`;
      let dbResponse = await db.run(query5);
      response.send("Status Updated");
    }
  }

  // SENARIO 2
  if (
    status === undefined &&
    todo === undefined &&
    priority !== undefined &&
    dueDate === undefined &&
    category === undefined
  ) {
    if (priority !== "HIGH" && priority !== "MEDIUM" && priority !== "LOW") {
      response.status(400);
      response.send("Invalid Todo Priority");
    } else {
      let query5 = `UPDATE todo 
                              SET priority = '${priority}'
                              WHERE id = ${todoId};`;
      let dbResponse42 = await db.run(query5);
      response.send("Priority Updated");
    }
  }

  // SENARIO 3
  if (
    status === undefined &&
    todo !== undefined &&
    priority === undefined &&
    dueDate === undefined &&
    category === undefined
  ) {
    const query5 = `UPDATE todo SET todo = '${todo}'
                      WHERE id = ${todoId};`;
    const dbResponse43 = await db.run(query5);
    response.send("Todo Updated");
  }

  // SENARIO 4
  if (
    status === undefined &&
    todo === undefined &&
    priority === undefined &&
    dueDate === undefined &&
    category !== undefined
  ) {
    if (category !== "WORK" && category !== "HOME" && category !== "LEARNING") {
      response.status(400);
      response.send("Invalid Todo Category");
    } else {
      let query4 = `UPDATE todo SET category = '${category}'
            WHERE id = ${todoId};`;
      let dbResponse44 = await db.run(query4);
      response.send("Category Updated");
    }
  }

  // SENARIO 5
  if (
    status === undefined &&
    todo === undefined &&
    priority === undefined &&
    dueDate !== undefined &&
    category === undefined
  ) {
    const { isValid, format } = dates;

    const validation = isValid(dueDate);
    if (validation) {
      response.status(400);
      response.send("Invalid Due Date");
    } else {
      let query5 = `UPDATE todo SET due_date = '${dueDate}'
            WHERE id = ${todoId};`;
      let dbResponse45 = await db.run(query5);
      response.send("Due Date Updated");
    }
  }
});

// API 6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query6 = `DELETE FROM todo WHERE id = ${todoId};`;
  const dbResponse = await db.run(query6);
  response.send("Todo Deleted");
});
module.exports = app;
