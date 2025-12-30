import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';

// GET: Mesajları Getir
export async function GET() {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

// POST: Yeni Mesaj Ekle
export async function POST(request: Request) {
    const body = await request.json();

    const { data, error } = await supabase
        .from('messages')
        .insert([
            {
                name: body.name || "İsimsiz",
                grade: body.grade,
                type: body.type,
                text: body.text,
                date: new Date().toLocaleDateString("tr-TR"),
            }
        ])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

// DELETE: Mesaj Sil
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

// PUT: Mesaj Güncelle (Like işlemi için)
export async function PUT(request: Request) {
    const body = await request.json();
    const { id, isLiked } = body;

    const { error } = await supabase
        .from('messages')
        .update({ isLiked })
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
