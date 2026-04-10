import express from "express";
import bodyParser from "body-parser";
import axios from 'axios';
import pg from 'pg';
import dotenv from 'dotenv';
import multer from 'multer';
import bcrypt from "bcrypt";
import session from "express-session";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from "passport";
import nodemailer from "nodemailer";

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL;

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

app.use(passport.initialize());
app.use(passport.session());

const otpStore: Record<string, { code: number; expiresAt: number }> = {};

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify()
  .then(() => console.log("Mailer ready"))
  .catch(console.error);

async function sendMail(email: string, code: number) {
  await transporter.sendMail({
    from: `"Recipes" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your password reset code",
    html: `<p>Your reset code:</p>
           <h2 style="letter-spacing:8px;font-family:monospace">${code}</h2>
           <p>Expires in <strong>10 minutes</strong>.</p>`,
  });
}

app.post("/send-email", async (req, res) => {
  const { email } = req.body;
  const code = Math.floor(100000 + Math.random() * 900000);

  otpStore[email] = { code, expiresAt: Date.now() + 10 * 60 * 1000 };

  try {
    await sendMail(email, code);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});


app.post("/find-user", async (req, res) => {
  const email = req.body.email;

  try {
    const result = await db.query("SELECT * FROM user_info WHERE email = $1",
    [email]
    );

    if (result.rows.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: result.rows[0] });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  } 

});

app.post("/verify-otp", async (req, res) => {
  const { email, code } = req.body;
  const record = otpStore[email];

  if (!record) {
    return res.json({ success: false, message: "No code found." });
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.json({ success: false, message: "Code expired." });
  }

  if (record.code !== parseInt(code)) {
    return res.json({ success: false, message: "Incorrect code." });
  }

  delete otpStore[email];
  res.json({ success: true });
});

app.get("/", (req, res) => {
  res.render("search.ejs");
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

app.get("/edit-recipe", (req, res) => {
  const userId = req.session.userId;
  if (userId) {
    res.render("edit-recipe.ejs")
  } else {
    res.send("You must log in or register to access this page!")
  }
})

app.get("/register", (req, res) => {
  if (req.session.userId) {
    return res.redirect('/');
  }
  res.render('register.ejs');
})

app.get("/login", (req, res) => {
  if (req.session.userId) {
    return res.redirect('/');
  }
  res.render('login.ejs');
});

app.get("/new-password", (req, res) => {
  res.render('forgot-password.ejs');
})

app.get("/api/current-user", async (req, res) => {
  if (req.session.userId) {
    // res.json({userId: req.session.userId})
    try {
     const result = await db.query('SELECT user_id, email FROM user_info WHERE user_id = $1',
        [req.session.userId]);

      const user = result.rows[0];
      // console.log(user);

      res.json({
        userId: user.user_id,
        email: user.email
      })

    } catch (err) {
      console.log(err);
    }
  } else {
    res.json({userId: null})
  }
})

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account"
  })
);

app.get(
  "/auth/google/recipes",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    if (!req.user) {
        return res.redirect("/login");
    }

    const user = req.user as any;
    req.session.userId = user.user_id;

    req.session.save(() => {
        res.redirect("/");
    });
  }
);


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
    // res.json(result.rows);
    res.json({ success: true, recipes: result.rows });
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
    res.status(200).json({ 
      success: true,
      message: 'Meal added to favorites'
    });
    

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error adding meal to favorites' });
  }
});


app.get("/display-ratings", async (req, res) => {

  try {
    const result = await db.query("SELECT * FROM ratings");
    res.json(result.rows);
    // console.log(result.rows);  

  } catch (err) {
    console.log(err);
  }

});




app.get("/show-user-rating", async (req, res) => {
  const userId = req.session.userId;

  try {
      const result = await db.query("SELECT * FROM ratings WHERE user_id = $1",
      [userId]
    );
    res.json(result.rows);

  } catch (err) {
    console.log(err);
  } 
});

app.post("/submit-rating", async (req, res) => {
  const mealId = req.body.mealId;
  const userId = req.session.userId; 
  const rating = req.body.rating;

  try { 
    console.log("Meal Id: " + mealId)
    console.log("User Id: " + userId)
    console.log("Rating: " + rating)

    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    await db.query(
      'INSERT INTO ratings (user_id, meal_id, meal_rating) VALUES ($1, $2, $3)',
      [userId, mealId, rating]
    );

    res.json({ success: true });

  } catch (err) {
    console.log(err);
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

});

app.delete("/remove-my-recipe/:id", async (req, res) => {

  const mealId = req.params.id;
  const userId = req.session.userId;

  try {
    await db.query(
      "DELETE FROM app_user_recipes WHERE user_id = $1 AND meal_id = $2",
      [userId, mealId]
    )

    // console.log(`Food N-${mealId} Successfully removed`);
    res.json({ success: true });

  } catch (err) {
    console.log(err);
  }

});


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
})


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

app.get("/api/recipes/:id", async (req, res) => {
  const userId = req.session.userId;
  const mealId = req.params.id;

  try {
      const check = await db.query(
          'SELECT * FROM app_user_recipes WHERE user_id = $1 AND meal_id = $2',
          [userId, mealId]
      );
      
      if (check.rows.length === 0) {
          return res.status(403).json({ success: false, error: 'Not authorized' });
      }
    res.json(check.rows);
    console.log(check.rows[0]);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error retrieving user meals' });
  }
})

app.put('/api/recipes/:id', upload.single('image'), async (req, res) => {
    const { name, origin, ingredients, video, instructions } = req.body;
    const userId = req.session.userId;
    const mealId = req.params.id;
  
    try {
      let imageUrl;

      if (req.file) {
          imageUrl = `/uploads/${req.file.filename}`;
      } else if (req.body.image_url) {
          imageUrl = req.body.image_url;
      } else {
          return res.status(400).json({ error: 'No image provided' });
      }

        const check = await db.query(
            'SELECT * FROM app_user_recipes WHERE user_id = $1 AND meal_id = $2',
            [userId, mealId]
        );
        
        if (check.rows.length === 0) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        const result = await db.query(
            'UPDATE app_user_recipes SET name = $1, origin = $2, ingredients = $3, video = $4, instructions = $5, image_url = $6 WHERE user_id = $7 AND meal_id = $8 RETURNING *',
            [name, origin, ingredients, video, instructions, imageUrl, userId, mealId]
        );
        
        res.json({ success: true, recipe: result.rows[0] });

  } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: 'Update failed' });
  }
});

app.post("/register", async (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    // console.log("TEST: " + email);
    // console.log("TEST: " + password)

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

      res.json({ 
          success: true, 
          // user: result.rows[0] 
      });

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

app.post("/new-password", async (req, res) => {
  const { password, email } = req.body;

  if (!password || !email) {
    return res.status(400).json({ success: false, message: "Missing fields." });
  }

  try {
    const hashed = await bcrypt.hash(password, salt_rounds);
    await db.query(
      "UPDATE user_info SET password = $1 WHERE email = $2",
      [hashed, email]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to logout' });
        }
        
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Logged out successfully' });
    });
});


passport.use(
  "google",
    new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID!,
    clientSecret: GOOGLE_CLIENT_SECRET!,
    callbackURL: CALLBACK_URL!,
    }, async (accessToken: any, refreshToken: any, profile: any, cb: any) => {
      console.log(profile);
      
      const email = profile.emails[0].value;

      try {
          const result = await db.query(
            "SELECT * FROM user_info WHERE email = $1",
            [email]
          );

        if (result.rows.length === 0) {
          const newUser = await db.query(
            "INSERT INTO user_info (email, password) VALUES ($1, $2) RETURNING *",
            [email, "google"]
          );
          return cb(null, newUser.rows[0]);
        } else {
          return cb(null, result.rows[0]);
        }
      } catch (err) {
        cb(err);
      }
    }
));

passport.serializeUser((user: any, done) => {
  done(null, user.user_id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await db.query("SELECT * FROM user_info WHERE user_id = $1", [id]);
    done(null, user.rows[0]);
  } catch (err) {
    done(err, null);
  }
});



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

