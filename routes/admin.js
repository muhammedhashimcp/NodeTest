const express = require("express");

const adminController = require("../Controllers/adminController");
const router = express.Router();

const userController = require("../Controllers/userController");
const Product = require("../Model/productSchema");

/*Verify Login Function*/
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

// Admin Home
router.get("/", verifyLogin, function (req, res, next) {
  res.render("admin/admin-home", { admin: true });
});

// Get all products
router.get("/view_products/:pageNum", verifyLogin, function (req, res) {
  adminController.getProductPagination(req).then(({products,pages,page,prdcount}) => {
    res.render("admin/view_products", { admin: true, products,pages,page,prdcount});
  });
});
 
// Add Products
router.get("/add-products", verifyLogin, async (req, res) => {
  admin = req.session.admin;
  const catg = await adminController.getCategory();
  console.log(catg + "Greewish");
  res.render("admin/add-products", { catg, admin: true });
});

router.post(
  "/add-products",
  adminController.upload.fields([
    { name: "Image", maxCount: 1 },
    { name: "Images", maxCount: 1 },
  ]),
  (req, res) => {
    console.log(req.files, "files");
    console.log(req.body, "body");
    let mainImage = req.files.Image[0].filename;
    let nextImage = req.files.Images[0].filename;

    console.log(req.body);
    adminController.addProduct(req.body, mainImage, nextImage).then((id) => {
      res.redirect("/admin");
    });
  }
);

// Delete product
router.get("/delete-product/:id", verifyLogin, (req, res) => {
  let proId = req.params.id;
  console.log(proId);
  adminController.deleteProduct(proId).then((response) => {
    res.redirect("/admin/view_products");
  });
});

// Edit Product
router.get("/edit-product/:id", verifyLogin, async (req, res) => {
  let product = await adminController.getProductDetails(req.params.id);
  console.log(product);
  const catdetails = await adminController.getCategory();
  res.render("admin/edit-product", {
    admin: true,
    product,
    catdetails,
  });
});

router.post(
  "/edit-product/:id",
  adminController.upload.fields([
    { name: "Image", maxCount: 1 },
    { name: "Images", maxCount: 1 },
  ]),
  async (req, res) => {
    const id = req.params.id;
    let productDetails = await Product.findById(id).lean();
    let mainImage = req.files.Image
      ? req.files.Image[0].filename
      : productDetails.allImages[0].mainImage;
    let nextImage = req.files.Images
      ? req.files.Images[0].filename
      : productDetails.allImages[0].nextImage;

      adminController
      .updateProduct(req.params.id, req.body, mainImage, nextImage)
      .then(() => {
        res.redirect("/admin/view_products");
      });
  }
);


// Add Category
router.get("/add_category", verifyLogin, function (req, res) {
  res.render("admin/add_category", { admin: true });
});

router.post("/add_category", adminController.addCategory);

// category list
router.get("/category-list", verifyLogin, function (req, res) {
  adminController.getCategory().then((category_data) => {
    res.render("admin/category-list", { admin: true, category_data });
  });
});

// Delete Category
router.get("/delete-category/:id", verifyLogin, (req, res) => {
  let categoryId = req.params.id;
  console.log(categoryId);
  adminController.deleteCategory(categoryId).then((response) => {
    res.redirect("/admin/category-list");
  });
});

// Edit Category
router.get("/edit-category/:id", verifyLogin, async (req, res) => {
  console.log(req.params.id,'sjkcgksjgcksjgacsjkb')
  const singleCategoryDetails = await adminController.getSingleCategory(req.params.id);
  res.render("admin/edit-category", {
    admin: true,
    singleCategoryDetails,
  });
});

router.post(
  "/edit-category/:id",
   (req, res) => {
    console.log(req.params);
      adminController
      .updateCategory(req.params.id, req.body)
      .then((response) => {
        res.redirect("/admin/category-list");
      });
  }
);

module.exports = router;