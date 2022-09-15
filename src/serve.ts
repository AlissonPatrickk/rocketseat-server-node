import express, { response } from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client';
import { convertHours } from './utils/convert-hours-string';
import { convertHoursStringInHours } from './utils/convert-hours-string-in-hours'

const app = express()
const prisma = new PrismaClient()
app.use(express.json)
app.use(cors())

app.get('/games', async (request, response) => {
    const games = await prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true,
                }
            }
        }
    })

    return response.json([games]);
});

app.post('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id;
    const body = request.body
    const ad = await prisma.ad.create({
        data: {
            gameId,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekDays: body.weekDays.join(','),
            hoursStart: convertHours(body.hoursStart),
            hoursEnd: convertHours(body.hoursEnd),
            useVoiceChannel: body.useVoiceChannel
        }
    })
    return response.status(201).json(ad);
})

app.get('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id
    const ads: any = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            weekDays: true,
            useVoiceChannel: true,
            yearsPlaying: true,
            hoursStart: true,
            hoursEnd: true
        },
        where: {
            gameId: gameId
        },
        orderBy: {
            createdAt: 'desc',
        }
    })

    return response.json(ads.map((ad: any ) => {
        return {
            ...ad,
            weekDays: ad.weekDays.split(','),
            hoursStart: convertHoursStringInHours(ad.hoursStart),
            hoursEnd: convertHoursStringInHours(ad.hoursEnd),

        }
    }))
})

app.get('/ads/:id/discord', async (request, response) => {
    const adId = request.params.id;
    const ad = await prisma.ad.findUniqueOrThrow({
        select: {
            discord: true
        },
        where: {
            id: adId,
        }
    })
    return response.json({
        discord: ad.discord,
    })
})
app.listen(3333)