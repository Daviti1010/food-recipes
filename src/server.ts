import express from "express";
import bodyParser from "body-parser";
import axios from 'axios';
import pg from 'pg';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
})

const upload = multer({ 
  storage: storage
});


const app = express();
const port = 3000;

const user_id = 1;

const db = new pg.Client({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: Number(process.env.PORT),
});
db.connect();

app.set("view engine", "ejs");
app.use(bodyParser.json())
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use('/dist', express.static('dist'));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/instructions/:food", (req, res) => {
  res.render("instructions.ejs");
});

app.get("/favourites", (req, res) => {
  res.render("favourites.ejs");
});

app.get("/add-your-recipe", (req, res) => {
  res.render("add-user-recipe.ejs")
});

app.get("/my-recipes", (req, res) => {
  res.render("my-recipes.ejs");
})

app.get("/api-info/search/:food", async (req, res) => {

  const food = req.params.food;

  try {
    const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${food}`)
    res.json(response.data);

  } catch (err) {
    console.log(err);
  }

});

app.get("/api-info/lookup/:id", async (req, res) => {

  const id = req.params.id;

    try {
    const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
    res.json(response.data);

  } catch (err) {
    console.log(err);
  }

});


app.get("/favourites-send", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM favourite_recipes");
    res.json(result.rows);
    // console.log(result.rows);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error retrieving favorite meals' });
  }

});


app.post("/favourites-send", async (req, res) => {
  const mealId = req.body.meal_id;

  try {
    console.log(mealId);
    
    await db.query('INSERT INTO favourite_recipes (user_id, meal_id) VALUES ($1, $2)', [user_id, mealId]);
    res.status(200).json({ message: 'Meal added to favorites' });
    

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error adding meal to favorites' });
  }
});


app.delete("/remove-food/:id", async (req, res) => {

  const mealId = req.params.id;

  try {
    await db.query(
      "DELETE FROM favourite_recipes WHERE user_id = $1 AND meal_id = $2",
      [user_id, mealId]
    )

    console.log(`Food N-${mealId} Successfully removed`);
    res.json({ success: true });

  } catch (err) {
    console.log(err);
  }

})



app.post('/user-recipe/upload', upload.single('image'), async (req, res) => {
    const { name, origin, ingredients, video, instructions } = req.body;
    
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
    }

    try {
      const imageUrl = '/uploads/' + req.file.filename;
      
      await db.query(
          'INSERT INTO user_recipes (user_id, name, origin, ingredients, video, instructions, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [user_id, name, origin, ingredients, video, instructions, imageUrl]
      );
      
      res.json({ success: true });
      console.log("Recipe successfully added to database!")

  } catch (err) {
    console.log(err)
  }
  });



app.get("/my-recipes-send", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM user_recipes");
    res.json(result.rows);
    // console.log(result.rows);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error retrieving user meals' });
  }
})



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

