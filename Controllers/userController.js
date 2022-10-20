const mongoose = require('mongoose')
const db = require('../Config/configMongo')
const bcrypt = require('bcrypt')
require('dotenv').config({debug:true})

const User = require('../Model/userSchema')
const Admin = require('../Model/adminSchema')
const Product = require('../Model/productSchema')


// Secure Password
const securePassword = async (Password) => {
    try {
        const passwordHash = await bcrypt.hash(Password, 10)
        return passwordHash
    } catch (err) {
        console.log(err.message);
    }
}

// User SignUp
const doUserSignup = async (req, res) => {
    console.log(req.body)
    try {
        const userPassword = await securePassword((req.body.Password))
        const user = await new User({
            Name: req.body.Name,
            Phone: req.body.Phone,
            Email: req.body.Email,
            Password: userPassword
        })
        console.log(user);
        user.save()
        if (user) {
            res.render('user/login', {
                message: "Registration Completed"
            })
        } else {
            res.render('user/signup', {
                message: "Registration Failed"
            })
        }

    } catch (err) {
        console.log(err);
    }
}

// User Login
const doUserLogin= (userData) => {
    return new Promise(async (resolve, reject) => {
        let loginStatus = false
        let response = {}
        // console.log(userData)
        let admin = await Admin.findOne({
            Email: userData.Email
        })
        let user = await User.findOne({
            Email: userData.Email
        })
        if (user) {
            bcrypt.compare(userData.Password, user.Password).then((status) => {
                if (status) {
                    console.log('Login sucess');
                    response.user = user
                    // console.log(useremail)
                    response.status = true
                    resolve(response)
                } else {
                    console.log('User Login failed');
                    resolve({
                        status: false
                    })
                }
            })
        } else if (admin) {
            if (userData.Password == admin.Password) {
                console.log("Admin LoggedIn");
                response.admin = admin
                response.status = true
                resolve(response)
            } else {
                console.log("Admin Login Failed");
                resolve({
                    status: false
                })
            }

        } else {
            console.log('Invalid UserId or Password');
            resolve({
                status: false
            })
        }
    })
}

module.exports = {
    doUserSignup,
    doUserLogin,
}
