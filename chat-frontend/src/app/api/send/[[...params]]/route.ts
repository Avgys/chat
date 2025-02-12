import { NextRequest, NextResponse } from 'next/server';
import URLS from '@/urls'
import { Match, ProxyToBackend } from '@/lib/ProxyToBackend';
import { Kafka, logLevel, Producer, ProducerRecord } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'nextjs-app',
    brokers: ['localhost:29092'],
    logLevel: logLevel.ERROR,
})

async function sendMessageToBroker(record: ProducerRecord) {
    const producer = kafka.producer();
    await producer.connect();
    await producer!.send(record);
    await producer.disconnect();
}

async function handler(request: NextRequest) {
    const response = ProxyToBackend(request, match)

    console.log(request.url.toString(), request.method, request.mode, JSON.stringify(request.body), request.credentials);
    const value = { bearer: request.headers.get('Authorization'), body: JSON.stringify(await request.json()) };
    //const value = { bearer: 'beareer', body: JSON.stringify(request.body) };

    console.log("Message to kafka: " + JSON.stringify(value))

    try {
        await sendMessageToBroker({
            topic: "messages",
            messages: [{ value: JSON.stringify(value) }]
        })
    }
    catch {
        return new Response(null, {
            status: 500
        })
    }

    return new Response(null, {
        status: 200
    });
}

const match: Match = { path: '/api/chats', redirectUrl: URLS.BACKEND_URL };

// process.on('SIGINT', stop);
// process.on('SIGTERM', stop);

export { handler as GET, handler as POST }