import express from "express";
import bodyParser from "body-parser";
import axios from 'axios';
import pg from 'pg';
import dotenv from 'dotenv';
import multer from 'multer';
import bcrypt from "bcrypt";
import session from "express-session";

dotenv.config();

const salt_rounds = 10;

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}


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

app.use(session({
  secret: process.env.SECRET_KEY!,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
  }
}));

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/instructions/:food", (req, res) => {
  res.render("instructions.ejs");
});

app.get("/favourites", (req, res) => {
  const userId = req.session.userId;
  if (userId) {
    res.render("favourites.ejs");
  } else {
    res.send("You must log in or register to access favourite recipes!")
  }
});

app.get("/add-your-recipe", (req, res) => {
  const userId = req.session.userId;
  if (userId) {
    res.render("add-user-recipe.ejs")
  } else {
    res.send("You must log in or register to access this page!")
  }
});

app.get("/my-recipes", (req, res) => {
  const userId = req.session.userId;
  if (userId) {
    res.render("my-recipes.ejs");
  } else {
    res.send("You must log in or register to access your recipes!")
  }
})

app.get("/register", (req, res) => {
  res.render("register.ejs")
})

app.get("/login", (req, res) => {
  res.render("login.ejs")
})

app.get("/api/current-user", (req, res) => {
  if (req.session.userId) {
    res.json({userId: req.session.userId})
  } else {
    res.json({userId: null})
  }
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
  const userId = req.session.userId;

  try {
    const result = await db.query("SELECT * FROM app_favourite_recipes WHERE user_id = $1",
      [userId]
    );
    res.json(result.rows);
    // console.log(result.rows);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error retrieving favorite meals' });
  }

});


app.post("/favourites-send", async (req, res) => {
  const mealId = req.body.meal_id;
  const userId = req.session.userId;

  try {
    // console.log(mealId);
    
    await db.query('INSERT INTO app_favourite_recipes (user_id, meal_id) VALUES ($1, $2)', [userId, mealId]);
    res.status(200).json({ message: 'Meal added to favorites' });
    

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error adding meal to favorites' });
  }
});


app.delete("/remove-food/:id", async (req, res) => {

  const mealId = req.params.id;
  const userId = req.session.userId;

  try {
    await db.query(
      "DELETE FROM app_favourite_recipes WHERE user_id = $1 AND meal_id = $2",
      [userId, mealId]
    )

    console.log(`Food N-${mealId} Successfully removed`);
    res.json({ success: true });

  } catch (err) {
    console.log(err);
  }

})



app.post('/user-recipe/upload', upload.single('image'), async (req, res) => {
    const { name, origin, ingredients, video, instructions } = req.body;
    const userId = req.session.userId;
    
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
    }

    try {
      const imageUrl = '/uploads/' + req.file.filename;
      
      await db.query(
          'INSERT INTO app_user_recipes (user_id, name, origin, ingredients, video, instructions, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [userId, name, origin, ingredients, video, instructions, imageUrl]
      );
      
      res.json({ success: true });
      console.log("Recipe successfully added to database!")

  } catch (err) {
    console.log(err)
  }
  });


app.get("/my-recipes-send", async (req, res) => {
  const userId = req.session.userId;

  try {
    const result = await db.query("SELECT * FROM app_user_recipes WHERE user_id = $1",
      [userId]
    );
    res.json(result.rows);
    // console.log(result.rows);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error retrieving user meals' });
  }
})

app.post("/register", async (req, res) => {

    const email = req.body.email;
    const password = req.body.password1;

    try {
      console.log(email)
      console.log(password)

    const checkResult = await db.query(
      "SELECT * FROM user_info WHERE email = $1", 
      [email]
    );
    
    if (checkResult.rows.length > 0) {
      return res.send("Email already exists. Try logging in.");
    }

    const hash = await bcrypt.hash(password, salt_rounds);

    console.log("Hashed Password:", hash);

    const result = await db.query(
      "INSERT INTO user_info (email, password) VALUES ($1, $2) RETURNING user_id",
      [email, hash]
    );

      const newUserId = result.rows[0].user_id;
      req.session.userId = newUserId;
      
      console.log(`User registered with ID: ${newUserId}`);

      res.redirect("/");

    } catch (err) {
      console.log(err);
    }
})


app.post("/login", async (req, res) => {

  const email = req.body.email;
  const loginPassword = req.body.password;

  try {
    const result = await db.query("SELECT * FROM user_info WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.send("User not found");
    }

    const user = result.rows[0];
    const storedHashedPassword = user.password;

    // console.log(email);
    const isMatch = await bcrypt.compare(loginPassword, storedHashedPassword);

    if (isMatch) {
      req.session.userId = user.user_id;
      
      console.log("Login successful, user ID:", req.session.userId);
      
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).send("Login error");
        }
        res.redirect("/");
      });
    } else {
      res.send("Incorrect Password");
    }
    

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Server error");
  }
})

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to logout' });
        }
        
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Logged out successfully' });
    });
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

