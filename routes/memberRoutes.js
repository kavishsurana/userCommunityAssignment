const express = require('express');
const router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const {Snowflake} = require('@theinternetfolks/snowflake');

const auth = require('../middleware/auth');

router.use(auth);

router.post('/member', async(req,res) => {
    try {
        const {community, user, role} = req.body;
        const userId = req.user.userId;

        const isAdmin = await prisma.community.findFirst({
            where: {
                id: community,
                owner: userId
            }
        })

        if(!isAdmin){
            return res.status(403).json({ status: false, error: 'NOT_ALLOWED_ACCESS' });
        }

        const newMember = await prisma.member.create({
            data: {
                id: Snowflake.generate(),
                community: community, 
                user: user,
                role: role,
                created_at: new Date()
            }
        });

        res.json({status: 'success', content: {data: newMember}})
    } catch (error) {
        console.error('Error adding member:', error);
        res.status(500).json({ status: false, error: 'Failed to add member' });
    }
})

router.delete('/member/:id', async (req,res) => {


    try {

        const memberId = req.params.id;
        const userId = req.user.userId;

        console.log(userId)
        console.log(memberId)

        const member = await prisma.member.findFirst({
            where: {
              id: memberId,
            }
          });
          console.log("member")
          console.log(member)

          if (!member) {
            return res.status(403).json({ status: false, error: 'NOT_ALLOWED_ACCESS' });
          }

          const deletedMember = await prisma.member.delete({
            where: {
              id: memberId,
            },
          });

          return res.status(200).json({ status: true });
        
    } catch (error) {
        console.log('Error deleting member:', error);
        res.status(500).json({ status: false, error: 'Failed to remove member' });
    }

    
})

module.exports = router;


