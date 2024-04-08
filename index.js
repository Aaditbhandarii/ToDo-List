import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "",
  port: 5432,
});
db.connect();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items =[];

async function getItems() {
  try {
    const result = await db.query("SELECT * FROM items ORDER BY id ASC");
    items = result.rows;
  } catch (err) {
    console.log(err);
  }
}

app.get("/", async (req, res) => {
  await getItems();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  try {
    await db.query("INSERT INTO items (title) VALUES ($1)", [item]);    
  }catch(err){
    console.log(err);
  }
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const id = req.body.updatedItemId;
  const title = req.body.updatedItemTitle;
  try{
    await db.query("UPDATE items SET title = $1 WHERE id = $2", [title, id]);
    res.redirect("/");
  }
  catch(err){
    console.log(err);
  }
});

app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;
  try{
    await db.query("DELETE FROM items WHERE id = $1", [id]);
    res.redirect("/");
  }catch(err){
    console.log(err);
  }
  console.log(id);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
