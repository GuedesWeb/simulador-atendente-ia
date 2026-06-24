import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { getDb } from '@/lib/db';

// GET: Buscar configurações globais (apenas admin)
export async function GET(request: NextRequest) {
  if (!getAuthFromRequest(request)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const db = getDb();
  const { data, error } = await db
    .from('settings')
    .select('*')
    .order('key');

  if (error) {
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar configurações.' },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

// PUT: Atualizar configurações globais (apenas admin)
export async function PUT(request: NextRequest) {
  if (!getAuthFromRequest(request)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { global_rules } = body;

    if (global_rules === undefined) {
      return NextResponse.json(
        { error: 'O campo global_rules é obrigatório.' },
        { status: 400 }
      );
    }

    const db = getDb();

    const { data, error } = await db
      .from('settings')
      .upsert({
        key: 'global_rules',
        value: global_rules,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar configurações:', error);
      return NextResponse.json(
        { error: 'Erro ao salvar configurações.' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    return NextResponse.json(
      { error: 'Erro interno ao atualizar configurações.' },
      { status: 500 }
    );
  }
}
