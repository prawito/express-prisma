import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const app = express();
const PORT = 5000;
const prisma = new PrismaClient();

app.use(express.json())

// REGISTER
app.use('/register', async (req, res) => {
    const {name, email, password} = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await prisma.users.create({
        data: {
            name,
            email,
            password: hashedPassword,
        }
    })

    res.json({
        message: 'user created'
    })
})

// LOGIN
app.use('/login', async (req, res) => {
    const {email, password} = req.body;

    const user = await prisma.users.findUnique({
        where: {
            email: email
        }
    })

    if(!user) {
        return res.status(404).json({
            message: 'User not found'
        })
    }

    if(!user.password) {
        return res.status(404).json({
            message: 'Password not set'
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if(isPasswordValid){
        return res.json({
            data: {
                id: user.id,
                name: user.name,
                address: user.address
            }
        })
    } else {
        return res.status(403).json({
            message: 'Wrong password'
        })
    }
})

// CREATE
app.post('/users', async (req, res, next) => {
    const {name, email, address} = req.body;

    const result = await prisma.users.create({
        data: {
            name: name,
            email: email,
            address: address
        }
    }) 
    res.json({
        data: result,
        message: `User created`
    })
})

// READ
app.get('/users', async (req, res) => {
    const result = await prisma.users.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            address: true,
        }
    });
    res.json({
        data: result,
        message: 'User list'
    })
})

// UPDATE
app.patch('/users/:id', async (req, res) => {
    const {id} = req.params
    const {name, email, address} = req.body
    
    const result = await prisma.users.update({
        data: {
            name: name,
            email: email,
            address: address,
        },
        where: {
            id: Number(id)
        }
    })
    res.json({
        data: result,
        message: `User ${id} updated`
    })
})

// DELETE
app.delete('/users/:id', async (req, res) => {
    const {id} = req.params;

    const result = await prisma.users.delete({
        where: {
            id: Number(id)
        }
    })
    res.json({
        message: `User ${id} deleted`
    })
})

app.listen(PORT, () => {
    console.log(`Server running in PORT: ${PORT}`);
})