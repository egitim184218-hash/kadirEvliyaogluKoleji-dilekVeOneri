import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';

// GET: Mesajları Getir
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .order('id', { ascending: false });

        if (error) {
            console.error('Supabase GET Hatası:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST: Yeni Mesaj Ekle
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Ensure property names match what Supabase expects (lowercase columns)
        const insertData = {
            name: body.name || "İsimsiz",
            grade: body.grade || "",
            type: body.type || "dilek",
            text: body.text || "",
            date: new Date().toLocaleString("tr-TR"),
        };

        const { data, error } = await supabase
            .from('messages')
            .insert([insertData])
            .select()
            .single();

        if (error) {
            console.error('Supabase POST Hatası:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE: Mesaj Sil
export async function DELETE(request: Request) {
    try {
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
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// PUT: Mesaj Güncelle (Like işlemi için)
export async function PUT(request: Request) {
    try {
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
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
