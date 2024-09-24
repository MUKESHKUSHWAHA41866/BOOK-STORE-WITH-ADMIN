const router = require("express").Router();
const {authenticateToken} = require("./userAuth");
const Book = require("../models/book");
const Order = require("../models/order");
const User = require("../models/user");

// place order
router.post("/place-order", authenticateToken, async (req,res) => {
    try {
        const {id} = req.headers;
        const {order} = req.body;

        for (const orderData of order) {
            const newOrder = new Order({ user: id, book: orderData._id});
            const orderDataFromDb = await newOrder.save();

            //  saving order in user model
            await User.findByIdAndUpdate(id, {$push: { orders: orderDataFromDb._id},});

            // clearing cart
            await User.findByIdAndUpdate(id, {
                $pull: { cart: orderData._id
            },});
    }
             return res.json({
                Status: "Success",
                message: "Order placed Successfully",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "An error occurred"});
        }
    });

    // get order history of particular user
    router.get("/get-order-history", authenticateToken, async (req,res) => {
        try {
            const {id} = req.headers;
            const userData = await User.findById(id).populate({
                path: "orders",
                populate: {path: "book"},
            });

            const ordersData = userData.orders.reverse();
            return res.json({
                status: "Success",
                data: ordersData,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message:  error });
            
        }
    });

    // router.get("/get-order-history", authenticateToken, async (req, res) => {
    //     try {
    //         // Extract id from headers
    //         const { id } = req.headers;
    
    //         if (!id) {
    //             return res.status(400).json({ message: "User ID is required in headers" });
    //         }
    
    //         // Fetch user data and populate the orders along with the related books
    //         const userData = await User.findById(id).populate({
    //             path: "orders",
    //             populate: { path: "book" }, // Ensure 'book' is correctly referenced in your schema
    //         });
    
    //         if (!userData) {
    //             return res.status(404).json({ message: "User not found" });
    //         }
    
    //         // Reverse the order of the user's orders for display
    //         const ordersData = userData.orders ? userData.orders.reverse() : [];
    
    //         // Send the success response
    //         return res.json({
    //             status: "Success",
    //             data: ordersData,
    //         });
    //     } catch (error) {
    //         console.error("Error retrieving order history:", error);
    //         return res.status(500).json({ message: "An error occurred" });
    //     }
    // });
    

    // get-all-orders ---admin
    router.get("/get-all-orders", authenticateToken, async (req,res) => {
        try {
            const userData = await Order.find()
            .populate({
                path: "book",
            })
            .populate({
                path: "user",
            })
            .sort({ createdAt: -1});
            return res.json({
                status: "Success",
                data: userData,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "An error occurred"});
        }
    });

    // update order --admin
    router.put("/update-status/:id", authenticateToken, async (req, res) => {
        try {
            const {id} = req.params;
            await Order.findByIdAndUpdate(id, { status: req.body.status });
            return res.json({
                status: "Success",
                message: "Status Updated Successfully",
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({message: "An error occurred"});
        }
    });
    
    module.exports = router;