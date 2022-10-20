const db=require('../Config/configMongo')
const Product=require('../Model/productSchema')
const Category=require('../Model/categorySchema')
const User=require('../Model/userSchema')
const multer=require('multer')

const storage= multer.diskStorage({
    destination:(req,file,cb)=>{
        
        cb(null,'./public/ProductImages')
    },
    
    filename:function(req,file,cb){

       cb(null,Date.now()+'--'+file.originalname)
    }
  });
  const upload= multer({storage:storage})

/*Add Product*/
const addProduct=(adminProduct,mainImage,nextImage)=>{
    return new Promise(async(resolve,reject)=>{
        const categories= await Category.findOne({Categoryname:adminProduct.Categoryname})
        let main_i=mainImage
        let next_i=nextImage
        const product=await new Product({
           
            prdName:adminProduct.prdName,
            Categoryname:categories._id,
            Description:adminProduct.Description,
            Price:adminProduct.Price,
            allImages:[main_i,next_i]
            
            
        })
        await product.save().then((data)=>{
            console.log(data);
            resolve(data)
        })
    })
}

const getAllProducts = ()=>{
    return new Promise(async(resolve,reject)=>{

        let products=await Product.find().lean().populate('Categoryname')
        resolve(products)
        
    })
}

const getProductPagination = (req,res)=>{
    return new Promise(async(resolve,reject)=>{
        let perPage = 5
        let page = req?.params?.pageNum || 1 
        // let page = 1
        
        let products=await Product
        .find({})
        .lean()
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .populate('Categoryname')
           
        let prdcount=await Product.count()
        let pagesCount=Math.ceil(prdcount / perPage)
        let pages=[]
        for(let i=1; i<=pagesCount;i++) {
            pages.push({pageNum:i})
        }
        
        resolve({products,pages,page,prdcount})
        
    })
}

/*Get Product Details*/
const getProductDetails = (proId) => {
    return new Promise((resolve, reject) => {
        const getproductdetails=Product.findOne({_id:proId}).lean().populate('Categoryname')
            resolve(getproductdetails)
        })
}


/* Update Product*/
const updateProduct=(proId,details,mainImage,nextImage)=>{
    return new Promise(async(resolve,reject)=>{
        let main_i=mainImage       
        let next_i=nextImage
        const categories= await Category.findOne({Categoryname:details.Categoryname})
        Product.updateOne({_id:proId},{
        $set:{
            prdName:details.prdName,
            Categoryname:categories._id,
            Description:details.Description,
            Price:details.Price,
            allImages:[main_i,next_i]
        }
      }).then((response)=>{
        resolve()
      })
    })
}

// Delete Product
const deleteProduct = (proId)=>{
    return new Promise((resolve,reject)=>{
        Product.deleteOne({_id:proId}).then(()=>{
            resolve()
        })
    })
}


/*Add Category*/
const addCategory = async (req, res) => {
    try {

        const category_data = await Category.find()
        if (category_data.length > 0) {
            let checking = false;
            for (let i = 0; i <category_data.length; i++) {
                if (category_data[i]['Categoryname'].toLowerCase() === req.body.Categoryname.toLowerCase()) {
                    checking = true;
                    break;
                }
            }
            if (checking == false) {
                const category = new Category({
                    Categoryname: req.body.Categoryname
                })
                console.log(category)
                const category_data = await category.save()
                console.log(category_data)
                res.redirect('/admin/add_category')
            }
            else{
                res.status(200).send({success:true,message:"This Category ("+req.body.Category+") is already exists" })
            }
        }
        else{
            const category = new Category({
                Categoryname: req.body.Categoryname
            })
            const category_data = await category.save()
            console.log(category_data)
            res.redirect('/admin/add_category')
        }
    }
    catch (error) {
        res.status(400).send({ success: false, message: error.message })

    }
}

/*Get Category*/
const getCategory=()=>{
    return new Promise((resolve,reject)=>{
        Category.find().lean().then((category_data)=>{
            resolve(category_data)
            console.log(category_data)
        })
    })
}

const getSingleCategory=(categoryId)=>{
    console.log(categoryId,'categoryId');
    return new Promise((resolve,reject)=>{
        Category.findOne({_id:categoryId}).lean().then((category_data)=>{
            resolve(category_data)
            console.log(category_data)
        })
    })
}

// Category Dropdown
const getCategoryDropdown = (categoryId)=>{
    return new Promise(async(resolve,reject)=>{
        const displayCatagoryDropdown=await Category.find().lean().populate('Categoryname')
        resolve(displayCatagoryDropdown)
    })
}

// Get category based Products
const getCategoryProducts = (categoryId)=>{
    return new Promise(async(resolve,reject)=>{
        Product.find({Categoryname:categoryId}).lean().populate('Categoryname').then((prod_det)=>{
            resolve(prod_det)
            console.log('helloooooo'+ prod_det);
        })
        
    })
}

// Delete Category
const deleteCategory = (categoryId)=>{
    return new Promise((resolve,reject)=>{
        Category.deleteOne({_id:categoryId}).then(()=>{
            resolve()
        })
    })
}

// Update Category
const updateCategory=(categoryId,categoryDetails)=>{
    return new Promise(async(resolve,reject)=>{
        Category.updateOne({_id:categoryId},{
            $set:{Categoryname:categoryDetails.Categoryname}
      }).then((response)=>{
        resolve()
      })
    })
}

module.exports = {
    addProduct,
    getAllProducts,
    getProductPagination,
    getProductDetails,
    updateProduct,
    deleteProduct,
    addCategory,
    getCategory,
    getSingleCategory,
    getCategoryDropdown,
    getCategoryProducts,
    deleteCategory,
    updateCategory,
    upload,
}

