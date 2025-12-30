import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Veri dosyasının yolu
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'messages.json');

// Yardımcı Fonksiyon: Verileri Oku
function getMessages() {
    if (!fs.existsSync(DATA_FILE)) {
        return [];
    }
    const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
    try {
        return JSON.parse(fileContent);
    } catch (error) {
        return [];
    }
}

// Yardımcı Fonksiyon: Verileri Yaz
function saveMessages(messages: any[]) {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2));
}

// GET: Mesajları Getir
export async function GET() {
    const messages = getMessages();
    return NextResponse.json(messages);
}

// POST: Yeni Mesaj Ekle
export async function POST(request: Request) {
    const body = await request.json();
    const messages = getMessages();

    const newMessage = {
        id: Date.now(),
        ...body,
        date: new Date().toLocaleDateString("tr-TR"),
    };

    const updatedMessages = [newMessage, ...messages];
    saveMessages(updatedMessages);

    return NextResponse.json(newMessage);
}

// DELETE: Mesaj Sil
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const messages = getMessages();
    const updatedMessages = messages.filter((msg: any) => msg.id !== Number(id));
    saveMessages(updatedMessages);

    return NextResponse.json({ success: true });
}

// PUT: Mesaj Güncelle (Like işlemi için)
export async function PUT(request: Request) {
    const body = await request.json();
    const { id, isLiked } = body;

    const messages = getMessages();
    const updatedMessages = messages.map((msg: any) =>
        msg.id === id ? { ...msg, isLiked } : msg
    );
    saveMessages(updatedMessages);

    return NextResponse.json({ success: true });
}
