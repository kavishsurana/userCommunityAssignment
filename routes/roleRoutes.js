const express = require('express');
const router = express.Router();
const {Snowflake} = require('@theinternetfolks/snowflake');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/role', async (req,res) => {
    try {
        const { name } = req.body; 
        const newRole = await prisma.role.create({
            data: {
                id: Snowflake.generate(),
                name,
                created_at: new Date(),
                updated_at: new Date(),
            },
        });
    
        res.json({status: 'success',content: {data: newRole}});
    } catch (error) {
        console.error('Error creating role:', error);
        res.status(500).json({ status: false, error: 'Failed to create role' });
    }
})

router.get('/role', async (req,res) => {
    try {
        const perPage = 10;
        const page = parseInt(req.query.page) || 1;

        const skip = (page - 1) * perPage;

        const totalRoles = await prisma.role.count();

        const totalPage = Math.ceil(totalRoles / perPage);

        const roles = await prisma.role.findMany({
            skip,
            take: perPage,
        });

        const meta = {
            total: totalRoles,
            pages: totalPage,
            page,
        }

        res.json({status: 'success', content: {data: roles, meta}});

    } catch (error) {

        console.error('Error fetching roles:', error);
        res.status(500).json({ status: false, error: 'Failed to fetch roles' });
        
    }
})

module.exports = router;
