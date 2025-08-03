import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { connect } from '@/dbConfig/dbConfig';
import Chat from '@/models/chatModel';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connect();
    
    const chats = await Chat.find({ userId: session.user.id })
      .sort({ updatedAt: -1 })
      .limit(10);
    
    return NextResponse.json(chats);
  } catch (error) {
    console.error('Failed to fetch chat history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages, model, title } = await request.json();
    
    await connect();
    
    const chat = new Chat({
      userId: session.user.id,
      title: title || messages[0]?.content?.substring(0, 50) || 'New Chat',
      messages,
      model,
    });

    await chat.save();
    return NextResponse.json(chat);
  } catch (error) {
    console.error('Failed to create chat:', error);
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatId, messages, model, title } = await request.json();
    
    await connect();
    
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { 
        messages,
        model,
        title: title || messages[0]?.content?.substring(0, 50) || 'Updated Chat',
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedChat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json(updatedChat);
  } catch (error) {
    console.error('Failed to update chat:', error);
    return NextResponse.json(
      { error: 'Failed to update chat' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Chat ID required' }, { status: 400 });
    }

    await connect();
    await Chat.findByIdAndDelete(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete chat:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat' },
      { status: 500 }
    );
  }
}