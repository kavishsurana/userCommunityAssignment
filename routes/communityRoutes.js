const express = require('express');
const router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const {Snowflake} = require('@theinternetfolks/snowflake');

const auth = require('../middleware/auth');

router.use(auth);

router.post('/community', async (req,res) => {
    try {
        const { name } = req.body;
        console.log(req.user)
        const userId = req.user.userId;

        const slug = name.toLowerCase().replace(/ /g, '-');

        // Create the community
        const community = await prisma.community.create({
            data: {
                id: Snowflake.generate(),
                name,
                slug,
                owner: userId,
                created_at: new Date(),
                updated_at: new Date()
            }
        });

        // Return the response
        res.json({
            status: true,
            content: { data: community }
        });
    } catch (error) {
        console.error('Error creating community:', error);
        res.status(500).json({ status: false, error: 'Failed to create community' });
    }
})


router.get('/community', async (req,res) => {

    try {
        const perPage = 10;
        const page = parseInt(req.query.page) || 1;

        const skip = (page - 1) * perPage;

        const totalCommunities = await prisma.community.count();

        const totalPage = Math.ceil(totalCommunities / perPage);

        const communities = await prisma.community.findMany({
            skip,
            take: perPage,
        });
        
        res.json({
            status: true,
            content: {
                meta: {
                    total: totalCommunities,
                    pages: totalPage,
                    page: page
                },
                data: communities
            }
        });
        
    } catch (error) {
        console.error('Error fetching communities:', error);
        res.status(500).json({ status: false, error: 'Failed to fetch communities' });
    }
})

router.get('/community/me/owner', async (req,res) => {
    try {
        const perPage = 10;
        const page = parseInt(req.query.page) || 1;

        const userId = req.user.userId;

        const skip = (page - 1) * perPage;

        const totalCommunities = await prisma.community.count({
            where: {
                owner: userId
            }
        })

        const totalPages = Math.ceil(totalCommunities / perPage);
        
        const communities = await prisma.community.findMany({
            where: {
                owner: userId
            },
            skip,
            take: perPage
        })

        res.json({
            status: true,
            content: {
                data: communities,
                meta: {
                    total: totalCommunities,
                    pages: totalPages,
                    page: page
                }
            }
        })
    } catch (error) {
        console.log('Error fetching communities:', error);
        res.status(500).json({ status: false, error: 'Failed to fetch owned communities' });
    }
    
})


module.exports = router;