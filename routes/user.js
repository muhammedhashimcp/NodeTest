const express = require("express");
const session = require("express-session");
const Config = require("../Config/configMongo");
const adminController = require("../Controllers/adminController");
const userController = require("../Controllers/userController");
const router = express.Router();
const signup = require("../Controllers/userController");
const login = require("../Controllers/userController");
const mongoose = require("mongoose");

/*Verify Login Function*/
const verifyLogin = (req, res, next) => {  
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

/* GET home page. */ 
router.get("/", async function (req, res, next) {
  let user = req.session.user;
  adminController.getAllProducts().then((products) => { 
    adminController.getCategory().then((catg) => {  
        adminController.getCategoryDropdown().then((categories) => {
        res.render("index", {
          products,
          user,     
          catg,
          categories,
        });
      });
    }); 
    console.log(user); 
  });
}); 


router.get("/product-categories/:id", async (req, res) => {
  let user = req.session.user;
  let productCategories = await adminController.getCategoryProducts(
    req.params.id
  );
  res.render("user/product-categories", { user, productCategories });
});

/*SignUp Page*/
router.get("/signup", (req, res) => {
  res.render("user/signup");
});

// Signup
router.post("/signup", signup.doUserSignup);

/*Login Page*/
router.get("/login", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/");
  } else if (req.session.admin) {
    res.render("admin", { admin: true, admin });
  } else {
    res.render("user/login", { loginErr: req.session.loginErr });
    req.session.loginErr = false;
  }
});

//   Login 
router.post("/login", (req, res) => {
  res.header(
    "Cache-control",
    "no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
  login.doUserLogin(req.body).then((response) => {  
    if (response.user) {  
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect("/");
    } else if (response.admin) {
      req.session.loggedIn = true;  
      req.session.admin = response.admin;
      res.redirect("/admin");
    } else {
      req.session.loginErr = true;
      res.redirect("/login"); 
    }
  });
});

/*Logout Page*/
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

/* View Product Details */
router.get("/view-product-details/:id", async (req, res) => {
  let user = req.session.user;
  if (req.session.user) {
    let product_details = await adminController.getProductDetails(req.params.id);
    res.render("user/view-product-details", { product_details, user });
  } else {
    let product_details = await adminController.getProductDetails(req.params.id);
    res.render("user/view-product-details", { product_details });
  }
});

/* Search */
router.post("/search", async (req, res) => {
  let searchByText = req.body["Search"];
  try {
    let user = req.session.user;
    let getProductSearch = await adminController.getAllProducts();
    let categories = await adminController.getCategoryDropdown();
    if (searchByText) {
      let products = getProductSearch.filter((p) =>
        p.prdName.includes(searchByText)
      );
      res.render("index", { products, user, categories});
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;