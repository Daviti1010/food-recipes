# Recipes in Web
A full-stack recipe web application where users can search thousands of recipes, save favourites and create their own.

🌐 Live Demo: https://recipes-online.up.railway.app

## Features

• Search Recipes — Search thousands of recipes from around the world

• Quick Categories — Browse by Pasta, Chicken, Seafood, Vegetarian, Cake, Beef and more

• Favourites — Save your favourite recipes to revisit later

• My Recipes — Add, edit and delete your own personal recipes

• Authentication — Register and login with email/password or Google OAuth

• Email Verification — OTP verification via email for registration and password reset

• Image Uploads — Upload photos for your recipes via Cloudinary

• Rate Recipes — Rate online recipes and view community ratings



## Tech Stack
### Frontend

• HTML, CSS, TypeScript

• EJS (templating engine)


### Backend

• Node.js + Express.js

• TypeScript

• Passport.js (Local + Google OAuth2)

• Bcrypt (password hashing)

• Nodemailer (email OTP)

• Multer + Cloudinary (image uploads)


### Database

• PostgreSQL (hosted on Neon)


### Deployment

• Railway (full-stack hosting)

• Cloudinary (image storage)

• Neon (database hosting)


## Installation & Setup

### Prerequisites

◦ Node.js v18+

◦ PostgreSQL (local) or Neon account

◦ Cloudinary account

◦ Google OAuth credentials

### Steps
1. Clone the repository

   ◦ git clone https://github.com/Daviti1010/food-recipes.git
   
   ◦ cd recipes-in-web
 
2. Install dependencies

   ◦ npm install

3. Set up environment variables

   ◦ Create a .env file in the root directory (see Environment Variables below)

4. Run the development server

   ◦ npm run dev

5. Open in browser
   
   ◦ http://localhost:3000
   
## Environment Variables

### Database

• DATABASE_URL=postgresql://username:password@host/dbname?sslmode=verify-full

### Server

• NODE_ENV=development

• SECRET_KEY=your_session_secret

• BASE_URL=http://localhost:3000

### Google OAuth

• GOOGLE_CLIENT_ID=your_google_client_id

• GOOGLE_CLIENT_SECRET=your_google_client_secret

### Cloudinary

• CLOUDINARY_CLOUD_NAME=your_cloud_name

• CLOUDINARY_API_KEY=your_api_key

• CLOUDINARY_API_SECRET=your_api_secret

### Nodemailer

• EMAIL_USER=your_email@gmail.com

• EMAIL_PASS=your_email_app_password

## 🚀 Deployment

This project is deployed on Railway.

## Steps to Deploy

1. Push your code to GitHub
   
2. Create a new project on Railway

3. Connect your GitHub repository
  
4. Add all environment variables in Railway → Variables
  
5. Set the following commands:

   • Build Command: npm install && npx tsc
   
   • Start Command: node dist/server.js


6. Railway will automatically deploy on every git push

## 📁 Project Structure
recipes-in-web/
  
├── src/                 # Source Typescript files

├── views/               # EJS templates

├── public/              # Static files (CSS, IMG, Uploads)

├── dist/                # Compiled TypeScript 

├── .env                 # Environment variables 

├── tsconfig.json

└── package.json

## Screenshots

![image alt](https://github.com/Daviti1010/food-recipes/blob/ba2d7e985afce0d08dbfed88e2972c0bbb4e0581/public/uploads/screenshot1.png)