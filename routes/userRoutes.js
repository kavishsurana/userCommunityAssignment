const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {Snowflake} = require('@theinternetfolks/snowflake');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/signup', async (req,res) => {
    try {
        const {name, email, password} = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('Hashed password', hashedPassword)

        const newUser = await prisma.user.create({
            data: {
                id: Snowflake.generate(),
                name,
                email,
                password: hashedPassword,
                created_at: new Date(),
            }
        })

        console.log('New user:', newUser)



        const accessToken = jwt.sign({userId: newUser.id}, process.env.JWT_SECRET)

        delete newUser.password;

        console.log("1")
        console.log('New user:', newUser)
        console.log("2")
        res.json({status: 'success', content: {data: newUser, meta: {access_token: accessToken}}});
        
    } catch (error) {
        console.error('Error signing up user:', error);
        res.status(500).json({ status: false, error: 'Failed to signup user' });
    }
})

router.post('/login', async (req,res) => {
    try {
        const {email, password} = req.body;

        const user = await prisma.user.findUnique({
            where: {
                email,
            }
        })

        if(!user || !await bcrypt.compare(password, user.password)){
            return res.status(401).json({status: false, error: 'Invalid credentials'});
        }

        const accessToken = jwt.sign({userId: user.id}, process.env.JWT_SECRET)

        delete user.password;

        console.log('Logged in user:', user)

        res.json({status: 'success', content: {data: user, meta: {access_token: accessToken}}});
        
    } catch (error) {
        console.error('Error signing in user:', error);
        res.status(500).json({ status: false, error: 'Failed to signin user' });
    }
})


router.get('/me', async (req,res) => {
    try {
        const token = req.headers.authorization

        console.log("11")
        console.log('Token:', token)

        jwt.verify(token, process.env.JWT_SECRET, async (err,decoded) => {
            if(err){
                return res.status(401).json({ status: false, error: 'Unauthorized' });
            }else{
                console.log('Decoded:', decoded);
                const userId = decoded.userId;

                const userDoc = await prisma.user.findUnique({
                    where: {
                        id: userId
                    }
                });

                if (userDoc) {
                    return res.json({ status: true, content: { data: userDoc } });
                } else {
                    return res.status(404).json({ status: false, error: 'User not found' });
                }
            }

        })
    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ status: false, error: 'Failed to fetch user' });
    }
})




module.exports = router;
