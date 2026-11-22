import { NextResponse } from 'next/server';
import { deleteFromR2, isR2Url } from '@/lib/r2';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image URL provided' },
        { status: 400 }
      );
    }

    if (!isR2Url(imageUrl)) {
      return NextResponse.json(
        { error: 'Invalid R2 image URL' },
        { status: 400 }
      );
    }

    await deleteFromR2(imageUrl);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    );
  }
}
